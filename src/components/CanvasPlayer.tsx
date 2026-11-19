"use client";
// The canvas player: draws the engine's world for a lesson at time t and keeps it in step with the
// browser's own voice (the speech clock, docs/methodology/05 §3). Scene spans are estimated; when
// the voice is slower the clock holds just before the scene ends until the voice finishes, and when
// the voice is faster the clock catches up at double speed.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CastMember, Lesson } from "@/lib/types";
import { captionAt, timeLesson, type TimedLesson } from "@/lib/timing";
import styles from "./CanvasPlayer.module.css";

type Engine = typeof import("@/engine/browser");

const HOLD_BEFORE_END = 0.35;
const MAX_HOLD = 9;

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
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState<string>("");
  const [time, setTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const timed: TimedLesson = useMemo(() => timeLesson(lesson, speed), [lesson, speed]);
  const tRef = useRef(0);
  const playingRef = useRef(false);
  const spokenScene = useRef(-1);
  const speechDone = useRef<Record<number, boolean>>({});
  const speechStarted = useRef<Record<number, boolean>>({});
  const speakAt = useRef(0);
  const holdSince = useRef<number | null>(null);
  const lastScene = useRef(-1);
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

  // Load the engine and fonts once.
  useEffect(() => {
    let alive = true;
    import("@/engine/browser").then(async (m) => {
      await m.loadEngine();
      if (!alive) return;
      engineRef.current = m;
      setLoaded(true);
    }).catch((e) => setError(String(e?.message || e)));
    return () => { alive = false; };
  }, []);

  // Voices load asynchronously in every browser.
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) { setVoiceOn(false); return; }
    const pick = () => {
      const list = window.speechSynthesis.getVoices().filter((v) => rankVoice(v) >= 0).sort((a, b) => rankVoice(b) - rankVoice(a));
      setVoices(list);
      if (list.length && !voiceRef.current) { voiceRef.current = list[0]; setVoiceName(list[0].name); }
    };
    pick();
    window.speechSynthesis.addEventListener("voiceschanged", pick);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", pick);
  }, []);
  useEffect(() => { voiceRef.current = voices.find((v) => v.name === voiceName) ?? voiceRef.current; }, [voiceName, voices]);

  const draw = useCallback((t: number) => {
    const c = canvasRef.current, m = engineRef.current;
    if (!c || !m) return;
    const g = c.getContext("2d");
    if (!g) return;
    try { m.drawFrame(g, lesson, timed, cast, t); }
    catch (e) { console.warn("frame failed", e); }
  }, [lesson, timed, cast]);

  const speak = useCallback((i: number) => {
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

  const stopVoice = () => { if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel(); };

  const seek = useCallback((t: number) => {
    stopVoice();
    tRef.current = Math.max(0, Math.min(t, timed.duration - 0.01));
    lastScene.current = -1; spokenScene.current = -1; holdSince.current = null;
    setTime(tRef.current);
    draw(tRef.current);
  }, [timed, draw]);

  // The clock.
  useEffect(() => {
    if (!loaded) return;
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (playingRef.current) {
        let t = tRef.current;
        const k = sceneAt(t), sc = timed.scenes[k];
        if (k !== lastScene.current) {
          lastScene.current = k; holdSince.current = null;
          onSceneChange?.(k);
          if (spokenScene.current !== k) speak(k);
        }
        // A voice that never starts (blocked or missing) must not stall the video.
        if (speechDone.current[k] === false && !speechStarted.current[k] && now - speakAt.current > 2000) speechDone.current[k] = true;
        const done = speechDone.current[k] !== false;
        const holdAt = sc.end - HOLD_BEFORE_END;
        let rate = 1;
        // The voice finished early: catch up, but only after a voice really spoke this scene.
        if (done && voiceOnRef.current && speechStarted.current[k] && t < holdAt - 1 && t > sc.speechStart + 1) rate = 2;
        t += dt * rate;
        if (!done && t >= holdAt) {
          holdSince.current ??= now;
          if ((now - holdSince.current) / 1000 < MAX_HOLD) t = holdAt;
        }
        if (t >= timed.duration) {
          t = timed.duration - 0.001; playingRef.current = false; setPlaying(false); stopVoice(); onEnd?.();
        }
        tRef.current = t;
        setTime(t);
      }
      // Before the first play, show a poster frame (the opener's title) instead of a blank page.
      const poster = !playingRef.current && tRef.current < 0.05 ? Math.min(3.4, timed.scenes[0].end - 0.6) : null;
      draw(freezeRef.current ?? poster ?? tRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loaded, timed, sceneAt, draw, speak, onEnd, onSceneChange]);

  const play = useCallback(() => {
    if (tRef.current >= timed.duration - 0.05) seek(0);
    playingRef.current = true; setPlaying(true);
    if (typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.paused) window.speechSynthesis.resume();
  }, [timed, seek]);
  const pause = useCallback(() => {
    playingRef.current = false; setPlaying(false);
    // Pausing restarts the scene's sentence on resume: browsers resume speech unreliably.
    stopVoice(); spokenScene.current = -1; lastScene.current = -1;
    const k = sceneAt(tRef.current); tRef.current = timed.scenes[k].start + 0.01; setTime(tRef.current);
  }, [sceneAt, timed]);
  const toggle = useCallback(() => (playingRef.current ? pause() : play()), [play, pause]);

  const goScene = useCallback((i: number) => {
    const s = timed.scenes[Math.max(0, Math.min(timed.scenes.length - 1, i))];
    seek(s.start + 0.01);
  }, [timed, seek]);

  useEffect(() => { if (loaded && autoPlay) play(); }, [loaded]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (seekTo && loaded) { goScene(seekTo.scene); } }, [seekTo, loaded]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (loaded) draw(freezeAt ?? (tRef.current < 0.05 ? Math.min(3.4, timed.scenes[0].end - 0.6) : tRef.current)); }, [loaded, freezeAt, draw, timed]);
  useEffect(() => () => stopVoice(), []);
  // Changing the lesson restarts the clock.
  useEffect(() => { seek(0); playingRef.current = false; setPlaying(false); }, [lesson]); // eslint-disable-line react-hooks/exhaustive-deps

  const k = sceneAt(time), scene = timed.scenes[k];
  const caption = scene ? captionAt(scene, time) : "";

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "k") { e.preventDefault(); toggle(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); goScene(k + 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); goScene(k - 1); }
    else if (e.key === "c" || e.key === "C") setCaptions((x) => !x);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className={styles.player} tabIndex={0} onKeyDown={onKey} aria-label={`Video player: ${lesson.title}`} role="region">
      <div className={styles.stage}>
        <canvas ref={canvasRef} width={1280} height={720} className={styles.canvas} onClick={toggle}
          aria-label={`Animated scene: ${scene?.headline ?? ""}`} role="img" />
        {!loaded && !error && <div className={styles.overlay}>Loading the animation engine…</div>}
        {error && <div className={styles.overlay}>Could not load the engine: {error}</div>}
        {loaded && !playing && time < 0.05 && (
          <button className={styles.bigPlay} onClick={play} aria-label="Play">▶ Play</button>
        )}
        {captions && scene && time > 0.05 && <div className={styles.caption} aria-live="off">{caption}</div>}
      </div>
      <div className={styles.controls}>
        <button onClick={toggle} className={styles.btn} aria-label={playing ? "Pause" : "Play"}>{playing ? "❚❚ Pause" : "▶ Play"}</button>
        <button onClick={() => goScene(k - 1)} className={styles.btn} aria-label="Previous scene">‹ Prev</button>
        <button onClick={() => goScene(k + 1)} className={styles.btn} aria-label="Next scene">Next ›</button>
        <div className={styles.progress} aria-hidden>
          {timed.scenes.map((s, i) => (
            <button key={s.id} className={styles.seg} style={{ flexGrow: s.end - s.start }} onClick={() => goScene(i)} title={s.headline}>
              <span style={{ width: `${Math.max(0, Math.min(1, (time - s.start) / (s.end - s.start))) * 100}%` }} />
            </button>
          ))}
        </div>
        <span className={styles.time}>{fmt(time)} / {fmt(timed.duration)}</span>
        <label className={styles.small}>
          Speed
          <select value={speed} onChange={(e) => { setSpeed(Number(e.target.value)); }}>
            <option value={0.9}>0.9×</option><option value={1}>1×</option><option value={1.15}>1.15×</option>
          </select>
        </label>
        <button onClick={() => { setVoiceOn((v) => !v); stopVoice(); }} className={styles.btn} aria-pressed={voiceOn}>{voiceOn ? "Voice on" : "Voice off"}</button>
        <button onClick={() => setCaptions((c) => !c)} className={styles.btn} aria-pressed={captions}>CC</button>
        {voices.length > 1 && (
          <label className={styles.small}>
            Voice
            <select value={voiceName} onChange={(e) => setVoiceName(e.target.value)}>
              {voices.slice(0, 12).map((v) => <option key={v.name} value={v.name}>{v.name.replace(/^Microsoft /, "").replace(/ Online \(Natural\).*/, " (Natural)")}</option>)}
            </select>
          </label>
        )}
      </div>
    </div>
  );
}
