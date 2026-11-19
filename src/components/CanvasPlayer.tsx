"use client";
// The canvas player: draws the engine's world for a lesson at time t, in step with the narration.
// Default voice: a Microsoft Edge neural voice (as in our courses), fetched per scene with Microsoft's
// word timings. While a clip plays the clock IS the audio (t = speechStart + currentTime / speed), so
// highlights land on the spoken word. Without a clip (voice service down, or "Browser voice"), the
// browser's own speech is used with estimated spans: the clock holds before a scene ends until the
// voice finishes, and catches up at double speed if the voice finished early.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CastMember, Lesson } from "@/lib/types";
import { captionAt, timeLesson, type TimedLesson, type VoiceClip } from "@/lib/timing";
import { EDGE_VOICES, useEdgeVoice } from "@/lib/useEdgeVoice";
import styles from "./CanvasPlayer.module.css";

type Engine = typeof import("@/engine/browser");

const HOLD_BEFORE_END = 0.35;
const MAX_HOLD = 9;
const BROWSER = "browser";
const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=";

function rankVoice(v: SpeechSynthesisVoice): number {
  const n = v.name;
  if (!/^en(-|_|$)/i.test(v.lang)) return -1;
  let s = 0;
  if (/Online \(Natural\)/i.test(n)) s += 50;
  if (/Ava|Andrew|Emma|Brian|Jenny|Guy|Aria/i.test(n)) s += 10;
  if (/en-US/i.test(v.lang)) s += 5;
  if (/Samantha|Daniel|Karen|Moira/i.test(n)) s += 20;
  if (/Google/i.test(n)) s -= 30;
  if (v.localService) s += 2;
  return s;
}

export interface CanvasPlayerProps {
  lesson: Lesson;
  cast: CastMember[];
  autoPlay?: boolean;
  onEnd?: () => void;
  onSceneChange?: (index: number) => void;
  seekTo?: { scene: number; nonce: number } | null;
  freezeAt?: number | null; // dev: draw this time and nothing else
}

export default function CanvasPlayer({ lesson, cast, autoPlay = false, onEnd, onSceneChange, seekTo, freezeAt = null }: CanvasPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [voiceOn, setVoiceOn] = useState(true);
  const [captions, setCaptions] = useState(true);
  const [voiceMode, setVoiceMode] = useState<string>(EDGE_VOICES[0].id);
  const [time, setTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { clips: allClips, failed, ready, progress } = useEdgeVoice(lesson, voiceMode === BROWSER ? null : voiceMode);
  const preparing = !ready;
  // A scene the clock entered without its clip keeps the browser voice for this play-through, so a late
  // clip can't re-time a scene that is already playing. Scenes ahead re-time freely as clips arrive.
  const [noClip, setNoClip] = useState<Record<number, true>>({});
  // If Edge can't make even the first scene, the whole video uses the browser voice (never a mix).
  const clips = useMemo(() => { const o: Record<number, VoiceClip | undefined> = {}; if (voiceMode !== BROWSER && failed[0]) return o; for (const [i, c] of Object.entries(allClips)) if (!noClip[+i]) o[+i] = c; return o; }, [allClips, noClip, failed, voiceMode]);
  const timed: TimedLesson = useMemo(() => timeLesson(lesson, speed, clips), [lesson, speed, clips]);
  // While a scene's Edge clip is still on its way, the clock waits for it instead of switching voices.
  const rawClipsRef = useRef(allClips); rawClipsRef.current = allClips;
  const failedRef = useRef(failed); failedRef.current = failed;
  const noClipRef = useRef(noClip); noClipRef.current = noClip;
  const waitSince = useRef<{ scene: number; at: number } | null>(null);
  const [waiting, setWaiting] = useState(false);
  const WAIT_LIMIT = 45_000;
  // The voice for the whole video: Edge, or the browser voice only if Edge can't even make scene 1.
  const edgeDead = voiceMode !== BROWSER && !!failed[0];

  const tRef = useRef(0);
  const playingRef = useRef(false);
  const lastScene = useRef(-1);
  const holdSince = useRef<number | null>(null);
  // Edge audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioScene = useRef(-1);
  const unlocked = useRef(false);
  const clipsRef = useRef<Record<number, VoiceClip | undefined> | null>(null);
  clipsRef.current = clips;
  // Browser speech fallback
  const spokenScene = useRef(-1);
  const speechDone = useRef<Record<number, boolean>>({});
  const speechStarted = useRef<Record<number, boolean>>({});
  const speakAt = useRef(0);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const freezeRef = useRef<number | null>(freezeAt);
  freezeRef.current = freezeAt;
  const voiceOnRef = useRef(voiceOn);
  voiceOnRef.current = voiceOn;

  const sceneAt = useCallback((t: number) => {
    const s = timed.scenes;
    for (let i = s.length - 1; i >= 0; i--) if (t >= s[i].start) return i;
    return 0;
  }, [timed]);

  useEffect(() => {
    let alive = true;
    import("@/engine/browser").then(async (m) => {
      await m.loadEngine();
      if (!alive) return;
      engineRef.current = m;
      setLoaded(true);
    }).catch((e) => setError(String(e?.message || e)));
    try { const v = localStorage.getItem("cr:voice"); if (v) setVoiceMode(v); } catch { /* storage blocked */ }
    audioRef.current = new Audio();
    (window as unknown as { __crAudio?: HTMLAudioElement }).__crAudio = audioRef.current; // for debugging
    return () => { alive = false; audioRef.current?.pause(); };
  }, []);

  // The best browser voice, for the fallback.
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const pick = () => {
      const list = window.speechSynthesis.getVoices().filter((v) => rankVoice(v) >= 0).sort((a, b) => rankVoice(b) - rankVoice(a));
      if (list.length) voiceRef.current = list[0];
    };
    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);

  useEffect(() => { if (audioRef.current) audioRef.current.muted = !voiceOn; }, [voiceOn]);

  const draw = useCallback((t: number) => {
    const c = canvasRef.current, m = engineRef.current;
    if (!c || !m) return;
    const g = c.getContext("2d");
    if (!g) return;
    try { m.drawFrame(g, lesson, timed, cast, t); }
    catch (e) { console.warn("frame failed", e); }
  }, [lesson, timed, cast]);

  const stopSpeech = () => { if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel(); };
  const stopAll = () => { stopSpeech(); audioRef.current?.pause(); audioScene.current = -1; spokenScene.current = -1; };

  const speakBrowser = useCallback((i: number) => {
    if (!voiceOnRef.current || typeof window === "undefined" || !("speechSynthesis" in window)) { speechDone.current[i] = true; return; }
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(timed.scenes[i].narration);
    if (voiceRef.current) { u.voice = voiceRef.current; u.lang = voiceRef.current.lang; }
    u.rate = speed;
    speechDone.current[i] = false;
    speechStarted.current[i] = false;
    u.onstart = () => { speechStarted.current[i] = true; };
    u.onend = () => { speechDone.current[i] = true; };
    u.onerror = () => { speechDone.current[i] = true; };
    spokenScene.current = i;
    speakAt.current = performance.now();
    synth.speak(u);
  }, [timed, speed]);

  const seek = useCallback((t: number) => {
    stopAll();
    tRef.current = Math.max(0, Math.min(t, timed.duration - 0.01));
    lastScene.current = -1; holdSince.current = null;
    setTime(tRef.current);
    draw(tRef.current);
  }, [timed, draw]);

  // The clock.
  useEffect(() => {
    if (!loaded) return;
    let raf = 0, last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (playingRef.current) {
        let t = tRef.current;
        const k = sceneAt(t), sc = timed.scenes[k], clip = clipsRef.current?.[k], a = audioRef.current;
        const pending = (i: number) => voiceMode !== BROWSER && i < timed.scenes.length && !rawClipsRef.current[i] && !failedRef.current[i] && !noClipRef.current[i];
        // Wait at the end of this scene (before the next transition) for the next scene's clip, or at the
        // start of this scene after a seek. After WAIT_LIMIT that scene plays silently with captions.
        const waitFor = pending(k) && t < sc.speechStart ? k : pending(k + 1) && t >= timed.scenes[k + 1].start - HOLD_BEFORE_END ? k + 1 : -1;
        if (waitFor >= 0) {
          if (waitSince.current?.scene !== waitFor) waitSince.current = { scene: waitFor, at: now };
          if (now - waitSince.current.at < WAIT_LIMIT) {
            if (!waiting && now - waitSince.current.at > 400) setWaiting(true);
            if (waitFor !== k) tRef.current = Math.min(t, timed.scenes[waitFor].start - HOLD_BEFORE_END);
            draw(tRef.current);
            return;
          }
          noClipRef.current = { ...noClipRef.current, [waitFor]: true };
          setNoClip((x) => ({ ...x, [waitFor]: true }));
        }
        waitSince.current = null;
        if (waiting) setWaiting(false);
        if (k !== lastScene.current) {
          lastScene.current = k; holdSince.current = null;
          onSceneChange?.(k);
          if (audioScene.current !== k) { a?.pause(); audioScene.current = -1; }
          // Never mix voices: a scene without its Edge clip plays silently (captions stay on), unless
          // the whole video is on the browser voice.
          if (!clip && spokenScene.current !== k && (voiceMode === BROWSER || edgeDead)) speakBrowser(k);
          else if (!clip) { speechDone.current[k] = true; spokenScene.current = k; }
        }
        if (clip && a) {
          // Start this scene's clip at the right offset (also after a pause or a seek).
          if (audioScene.current !== k && t >= sc.speechStart && t < sc.speechEnd - 0.05) {
            audioScene.current = k;
            a.src = clip.url; a.playbackRate = speed; a.muted = !voiceOnRef.current;
            try { a.currentTime = Math.max(0, (t - sc.speechStart) * speed); } catch { /* not seekable yet */ }
            a.play().catch(() => { /* autoplay blocked: the picture runs on silently */ });
          }
          if (audioScene.current === k && !a.paused && !a.ended && a.currentTime > 0) t = sc.speechStart + a.currentTime / speed;
          else t += dt;
        } else {
          if (speechDone.current[k] === false && !speechStarted.current[k] && now - speakAt.current > 2000) speechDone.current[k] = true;
          const done = speechDone.current[k] !== false, holdAt = sc.end - HOLD_BEFORE_END;
          let rate = 1;
          if (done && voiceOnRef.current && speechStarted.current[k] && t < holdAt - 1 && t > sc.speechStart + 1) rate = 2;
          t += dt * rate;
          if (!done && t >= holdAt) {
            holdSince.current ??= now;
            if ((now - holdSince.current) / 1000 < MAX_HOLD) t = holdAt;
          }
        }
        if (t >= timed.duration) {
          t = timed.duration - 0.001; playingRef.current = false; setPlaying(false); stopAll(); onEnd?.();
        }
        tRef.current = t;
        setTime(t);
      }
      const poster = !playingRef.current && tRef.current < 0.05 ? Math.min(3.4, timed.scenes[0].end - 0.6) : null;
      draw(freezeRef.current ?? poster ?? tRef.current);
    };
    const loop = (now: number) => { step(now); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    // A hidden tab gets no animation frames, but the narration keeps playing: keep the clock moving.
    const iv = setInterval(() => { if (document.hidden) step(performance.now()); }, 200);
    return () => { cancelAnimationFrame(raf); clearInterval(iv); };
  }, [loaded, timed, sceneAt, draw, speakBrowser, onEnd, onSceneChange, speed, voiceMode, waiting, edgeDead]);

  const play = useCallback(() => {
    if (preparing) return;
    if (tRef.current >= timed.duration - 0.05) seek(0);
    // Unlock the audio element inside the click (Safari only lets a gesture start playback).
    const a = audioRef.current;
    if (a && !unlocked.current) { unlocked.current = true; a.src = SILENT; a.play().then(() => a.pause()).catch(() => {}); }
    lastScene.current = -1;
    playingRef.current = true; setPlaying(true);
  }, [timed, seek, preparing]);
  const pause = useCallback(() => {
    playingRef.current = false; setPlaying(false);
    audioRef.current?.pause(); audioScene.current = -1;
    // Browser speech can't resume reliably, so a browser-voice scene restarts from its beginning.
    const k = sceneAt(tRef.current);
    if (!clipsRef.current?.[k]) { stopSpeech(); spokenScene.current = -1; tRef.current = timed.scenes[k].start + 0.01; setTime(tRef.current); }
  }, [sceneAt, timed]);
  const toggle = useCallback(() => (playingRef.current ? pause() : play()), [play, pause]);

  const goScene = useCallback((i: number) => {
    const s = timed.scenes[Math.max(0, Math.min(timed.scenes.length - 1, i))];
    seek(s.start + 0.01);
  }, [timed, seek]);

  useEffect(() => { if (loaded && autoPlay && !preparing) play(); }, [loaded, preparing]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (seekTo && loaded) { goScene(seekTo.scene); } }, [seekTo, loaded]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (loaded) draw(freezeAt ?? (tRef.current < 0.05 ? Math.min(3.4, timed.scenes[0].end - 0.6) : tRef.current)); }, [loaded, freezeAt, draw, timed]);
  useEffect(() => () => stopSpeech(), []);
  // A new lesson, voice or speed re-times everything: restart from the beginning.
  useEffect(() => { playingRef.current = false; setPlaying(false); setNoClip({}); seek(0); }, [lesson, voiceMode, speed]); // eslint-disable-line react-hooks/exhaustive-deps

  const k = sceneAt(time), scene = timed.scenes[k];
  const caption = scene ? captionAt(scene, time) : "";

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === "SELECT") return;
    if (e.key === " " || e.key === "k") { e.preventDefault(); toggle(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); goScene(k + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); goScene(k - 1); }
    else if (e.key === "c" || e.key === "C") setCaptions((x) => !x);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const chooseVoice = (v: string) => { setVoiceMode(v); try { localStorage.setItem("cr:voice", v); } catch { /* ignore */ } };

  return (
    <div className={styles.player} tabIndex={0} onKeyDown={onKey} aria-label={`Video player: ${lesson.title}`} role="region">
      <div className={styles.stage}>
        <canvas ref={canvasRef} width={1280} height={720} className={styles.canvas} onClick={toggle}
          aria-label={`Animated scene: ${scene?.headline ?? ""}`} role="img" />
        {!loaded && !error && <div className={styles.overlay}>Loading the animation engine…</div>}
        {error && <div className={styles.overlay}>Could not load the engine: {error}</div>}
        {loaded && !playing && time < 0.05 && (
          <button className={styles.bigPlay} onClick={play} aria-label="Play" disabled={preparing}>
            {preparing ? `Preparing the voice… ${Math.round(progress * 100)}%` : "▶ Play"}
          </button>
        )}
        {captions && scene && time > 0.05 && <div className={styles.caption} aria-live="off">{caption}</div>}
        {playing && waiting && <div className={styles.waiting} role="status">Loading the voice…</div>}
      </div>
      <div className={styles.controls}>
        <button onClick={toggle} className={styles.btn} aria-label={playing ? "Pause" : "Play"} disabled={preparing}>{playing ? "❚❚ Pause" : "▶ Play"}</button>
        <button onClick={() => goScene(k - 1)} className={styles.btn} aria-label="Previous scene">‹ Prev</button>
        <button onClick={() => goScene(k + 1)} className={styles.btn} aria-label="Next scene">Next ›</button>
        <div className={styles.progress} aria-hidden>
          {timed.scenes.map((s, i) => (
            <button key={s.id} className={styles.seg} style={{ flexGrow: s.end - s.start }} onClick={() => goScene(i)} title={s.headline} tabIndex={-1}>
              <span style={{ width: `${Math.max(0, Math.min(1, (time - s.start) / (s.end - s.start))) * 100}%` }} />
            </button>
          ))}
        </div>
        <span className={styles.time}>{fmt(time)} / {fmt(timed.duration)}</span>
        <label className={styles.small}>
          Voice
          <select value={voiceMode} onChange={(e) => chooseVoice(e.target.value)}>
            {EDGE_VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            <option value={BROWSER}>Browser voice</option>
          </select>
        </label>
        <label className={styles.small}>
          Speed
          <select value={speed} onChange={(e) => { setSpeed(Number(e.target.value)); }}>
            <option value={0.9}>0.9×</option><option value={1}>1×</option><option value={1.15}>1.15×</option>
          </select>
        </label>
        <button onClick={() => { setVoiceOn((v) => !v); stopSpeech(); }} className={styles.btn} aria-pressed={voiceOn}>{voiceOn ? "Sound on" : "Sound off"}</button>
        <button onClick={() => setCaptions((c) => !c)} className={styles.btn} aria-pressed={captions}>CC</button>
      </div>
    </div>
  );
}
