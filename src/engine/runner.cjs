'use strict';
// Lesson runner: lays a lesson's scenes out as regions of one world canvas and drives the camera,
// the motivated transitions (pan, iris, wipe, carry), the night practice ground, the progress rail
// and the fiction badge. Each scene draws in its own 1280×720 local frame; every time it uses comes
// from its scene span and narration cues, so measured narration re-times the world without edits.
const {E,seg,clamp,lerp,cameraAt,orderKeys,planner,createDesignStage}=require('./design.cjs');
const tpl=require('./templates.cjs');
require('./career-setup.cjs');

const GAPX=1700,GAPY=1100;

// spec: {scenes:[{id, in, at, push, cam, night, fiction, irisAt, prep, draw}], rail:{steps, scenes}, badge(P)}
//   in:     'none' (first), 'pan' (default), 'iris', 'wipe', 'carry' (same region, no transition)
//   at:     [col, row] grid position of the region (default: right of the previous region)
//   push:   slow-push zoom across the scene (default 1.02); cam(X) returns local camera keys instead
//   prep(X): scene-local cue times, computed once per lesson object (narration re-timing rebuilds it)
//   draw(S, t, X): draws the scene in local coordinates
function lessonWorld(spec) {
  const planFor=planner(({lesson,cue,sc})=>{
    if(spec.scenes.length!==lesson.scenes.length||spec.scenes.some((d,i)=>d.id!==lesson.scenes[i].id))
      throw new Error(`Lesson ${lesson.id}: world scenes ${spec.scenes.map(d=>d.id)} differ from narration scenes ${lesson.scenes.map(s=>s.id)}`);
    const scenes=spec.scenes.map((d,i)=>({...d,i,s:sc[d.id],in:i===0?'none':(d.in||'pan')}));
    scenes.forEach((d,i)=>{
      if(d.at)d.region={x:d.at[0]*GAPX,y:d.at[1]*GAPY};
      else if(i===0)d.region={x:0,y:0};
      else if(d.in==='carry')d.region=scenes[i-1].region;
      else d.region={x:scenes[i-1].region.x+GAPX,y:scenes[i-1].region.y};
      d.win=i&&d.in!=='carry'?[d.s.start-.3,d.s.start+.7]:[d.s.start,d.s.start];
    });
    // The time each scene stops drawing: when the next transition has finished.
    scenes.forEach((d,i)=>{const n=scenes[i+1];d.leave=n?(n.in==='carry'?n.s.start:n.win[1]):Infinity;d.exit=n?n.win[0]:Infinity;});
    const ctx={lesson,cue,sc,scenes};
    scenes.forEach(d=>{
      const X=context(ctx,d);
      d.p=d.prep?d.prep(X)||{}:{};
      X.p=d.p;d.X=X;
      const ox=d.region.x,oy=d.region.y,z=d.push??1.02;
      const local=d.cam?d.cam(X):[{t:d.s.start,x:640,y:340,zoom:1},{t:d.s.end,x:640,y:340,zoom:z}];
      d.keys=orderKeys(local.map(k=>({...k,x:k.x+ox,y:k.y+oy})));
    });
    const rail=spec.rail?{steps:spec.rail.steps,at:spec.rail.scenes.map(id=>{const s=sc[id];if(!s)throw new Error('Rail scene missing: '+id);return s.start;})}:null;
    const nightWins=scenes.filter(d=>d.night).map(d=>[d.win[0],Infinity]);
    const firstNight=nightWins.length?nightWins[0][0]:Infinity;
    const badge=spec.badge?spec.badge(ctx):mergeWindows(scenes.filter(d=>d.fiction).map(d=>
      typeof d.fiction==='function'?d.fiction(d.X):[[d.in==='none'||d.in==='carry'?d.s.start:d.win[0]+.3,d.s.end]]).flat());
    return {...ctx,rail,badge,firstNight,openerEnd:scenes[0].s.end};
  });

  function draw(g,lesson,t,course) {
    const P=planFor(lesson),sc=P.scenes;
    let k=sc.findIndex((d,i)=>t<(sc[i+1]?sc[i+1].s.start:Infinity));if(k<0)k=sc.length-1;
    const cur=sc[k],nxt=sc[k+1];
    // The incoming scene's transition starts in the closing pause of the current one.
    const inWin=d=>d&&d.in!=='carry'&&d.in!=='none'&&t>=d.win[0]&&t<d.win[1];
    const T=inWin(nxt)?nxt:inWin(cur)?cur:null,prev=T?sc[T.i-1]:null;
    const nightNow=(T?(T.night&&T.in!=='wipe'?true:prev.night):cur.night)||false;
    const S=createDesignStage(g,course,{background:nightNow?'night':'paper'});
    const run=(d,tt)=>{S.g.save();S.g.translate(d.region.x,d.region.y);try{d.draw(S,tt,d.X);}finally{S.g.restore();}};
    if(T) {
      const a=prev,b=T,p=seg(t,b.win[0],b.win[1]-b.win[0],E.linear);
      if(b.in==='pan') {
        const A=cameraAt(b.win[0],a.keys),B=cameraAt(b.win[1],b.keys),e=E.inOut(p),h=1/240;
        const e2=E.inOut(clamp(p+h/(b.win[1]-b.win[0]))),speed=Math.hypot(B.x-A.x,B.y-A.y)*(e2-e)/h;
        const cam={x:lerp(A.x,B.x,e),y:lerp(A.y,B.y,e),zoom:lerp(A.zoom,B.zoom,e)};
        S.view(cam,()=>S.transition(()=>{run(a,t);run(b,t);}),{blur:Math.min(3,speed/700)});
      } else {
        const A=cameraAt(b.win[0],a.keys),B=cameraAt(t,b.keys);
        S.view(A,()=>S.transition(()=>run(a,t)));
        if(b.in==='iris') {
          const pt=b.irisAt?b.irisAt(b.X):[640,340],sx=640+(pt[0]+a.region.x-A.x)*A.zoom,sy=340+(pt[1]+a.region.y-A.y)*A.zoom;
          S.transition(()=>S.unclipped(()=>S.iris(sx,sy,p,()=>S.view(B,()=>run(b,t)),{mode:b.night?'night':'paper'})));
        } else S.transition(()=>S.unclipped(()=>S.wipe(p,()=>S.view(B,()=>run(b,t)),{mode:b.night?'night':'paper'})));
      }
    } else {
      // Carry: the previous scene keeps drawing until the carried scene starts, in the same region.
      S.view(cameraAt(t,cur.keys),()=>run(cur,t));
    }
    if(P.rail)tpl.progressRail(S,t,{steps:P.rail.steps,at:P.rail.at,from:P.openerEnd-.6,until:P.firstNight-.2});
    if(P.badge.length)tpl.fictionBadge(S,t,{windows:P.badge});
    return S.finish();
  }
  return {draw,planFor};
}

function mergeWindows(list) {
  const w=list.filter(Boolean).map(x=>[...x]).sort((a,b)=>a[0]-b[0]),out=[];
  for(const x of w){const l=out.at(-1);if(l&&x[0]<=l[1]+.05)l[1]=Math.max(l[1],x[1]);else out.push(x);}
  return out;
}

// Per-scene helpers: cues default to this scene; the scene's span, enter/exit times and the lesson plan.
function context(ctx,d) {
  const {cue}=ctx,id=d.id;
  const X={id,scene:d.s,t0:d.s.start,t1:d.s.end,enter:d.win[0],get exit(){return d.exit;},get leave(){return d.leave;},
    night:!!d.night,lesson:ctx.lesson,sc:ctx.sc,
    cue:(w,n)=>cue(id,w,n),end:(w,n)=>cue.end(id,w,n),count:w=>cue.count(id,w),
    phrase:(s,o)=>cue.phrase(id,s,o),cueIn:(sid,w,n)=>cue(sid,w,n),endIn:(sid,w,n)=>cue.end(sid,w,n),
    // Sentence i (0-based) of the scene: its first word's onset and its last word's end.
    sentence:i=>sentenceSpan(ctx.lesson,d.s,i)};
  return X;
}
function sentenceSpan(lesson,scene,i) {
  const W=scene.wordTimings;if(!Array.isArray(W)||!W.length)return null;
  // Sentences end at a word whose text ends in . ? ! (closing quotes allowed).
  const ends=[];W.forEach((w,j)=>{const after=String(scene.narration).slice(w.charEnd??0,(w.charEnd??0)+3);if(w.charEnd!=null&&/^["”’)]*[.?!]/.test(after))ends.push(j);});
  const a=i===0?0:(ends[i-1]??-1)+1,b=ends[i]??W.length-1;
  return W[a]&&W[b]?{start:W[a].start,end:W[b].end}:null;
}

module.exports={lessonWorld,mergeWindows,GAPX,GAPY};
