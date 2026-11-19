'use strict';
// Career Ready (Nov 19 2026): practice() hangs a two-line prompt below its kicker; coin shows $ (glyphs.cjs).
// Course kit: subject glyphs and staging helpers shared by every lesson. Colours come from tokens,
// type from roles; every solid registers through S.actor and every word through S.text, so the
// geometry audit, type floors, edge guard and word budget apply to everything drawn here.
const {T,E,seg,clamp,lerp,role,talking,focusOf}=require('./design.cjs');
const {cast}=require('./illustrations.cjs');
const glyphs=require('./glyphs.cjs');
const ai=require('./ai.cjs');

const TAU=Math.PI*2;
const fin=(t,a,d=.4)=>seg(t,a,d);
// A pop like a chip: the fade reaches full only once the pop has grown past full size.
function pop(S,t,at,cx,cy,fn,{d=.55}={}) {
  const p=seg(t,at,d,E.linear);if(p<=0)return 0;const k=E.outBack(p);
  S.fade(clamp(p*2.3),()=>{const g=S.g;g.save();g.translate(cx,cy);g.scale(k,k);g.translate(-cx,-cy);try{fn();}finally{g.restore();}});
  return p;
}
// Slide-and-fade entrance for a group (dx, dy in px), complete after d seconds.
function enter(S,t,at,fn,{dx=0,dy=18,d=.5}={}) {
  const p=seg(t,at,d,E.outExpo);if(p<=0)return 0;
  S.fade(clamp(p*1.6),()=>{const g=S.g;g.save();g.translate((1-p)*dx,(1-p)*dy);try{fn();}finally{g.restore();}});
  return p;
}
const stagger=(s,from,step=.09)=>String(s).split(/\s+/).filter(Boolean).map((_,i)=>from+i*step);

// World-space section head: a heavy rule and a headline that slides in after `at` (display text,
// a short stagger), and fades at `until`. Keep scene content below y 196 while it is up.
function head(S,t,X,text,{at,until=Infinity,id='hd',x=80,y=146,width=1120,role:r='headline'}={}) {
  const a=at??X.t0+.2,show=(1-seg(t,until,.35,E.in));
  if(show<=0||t<a-.45)return;
  S.fade(show,()=>{S.rule(x,x+width,100,seg(t,a-.4,.6,E.inOut),{weight:6});
    S.sentence(id,text,x,y,{t,times:stagger(text,a),reveal:'slide',dur:.45,role:r,maxWidth:width});});
}
// Kicker label (small caps) for a column or an object.
const kicker=(S,id,str,x,y,o={})=>S.text(id,str,x,y,{role:'kicker',color:o.color??(S.night?T.white:T.inkSoft),align:o.align||'left',owner:o.owner||null});

// ---------------------------------------------------------------- documents and containers
// A page with a folded corner; body lines are drawn as rules (never tiny letters).
function doc(S,id,x,y,w,h,{lines=5,fill=T.paperHi,stroke=T.ink,title=null,titleRole='label',band=null,owner=null,lineColor=T.wash,weight=2.5}={}) {
  const f=Math.min(26,w*.18);
  S.actor(id,{x,y,w,h},g=>{g.beginPath();g.moveTo(x,y);g.lineTo(x+w-f,y);g.lineTo(x+w,y+f);g.lineTo(x+w,y+h);g.lineTo(x,y+h);g.closePath();
    g.fillStyle=fill;g.fill();g.strokeStyle=stroke;g.lineWidth=weight;g.lineJoin='round';g.stroke();
    g.beginPath();g.moveTo(x+w-f,y);g.lineTo(x+w-f,y+f);g.lineTo(x+w,y+f);g.stroke();
    if(band){g.fillStyle=band;g.fillRect(x+10,y+12,w-f-22,10);}
    const top=title?y+h*.42:y+(band?34:22),gap=(y+h-14-top)/Math.max(1,lines);
    g.fillStyle=lineColor;for(let i=0;i<lines;i++)g.fillRect(x+12,top+i*gap,(w-24)*(i%3===2?.6:.92),Math.max(3,Math.min(8,gap*.32)));},owner);
  if(title)S.text(id+'-t',title,x+14,y+28,{role:titleRole,owner:id});
  return {x,y,w,h};
}
// A folder with a tab; open (0..1) lifts its front flap.
function folder(S,id,x,y,w,h,{label=null,open=0,owner=null}={}) {
  S.actor(id,{x,y:y-22,w,h:h+22},g=>{g.lineJoin='round';g.lineWidth=2.5;g.strokeStyle=T.ink;
    g.fillStyle=T.paperLo;g.beginPath();g.moveTo(x,y);g.lineTo(x+w*.36,y);g.lineTo(x+w*.42,y-22);g.lineTo(x+w,y-22);g.lineTo(x+w,y+h);g.lineTo(x,y+h);g.closePath();g.fill();g.stroke();
    const lift=open*h*.32;g.fillStyle=T.paperHi;g.beginPath();g.moveTo(x,y+14+lift*.2);g.lineTo(x+w,y+14+lift*.2);g.lineTo(x+w-lift*.25,y+h);g.lineTo(x+lift*.25,y+h);g.closePath();g.fill();g.stroke();},owner);
  if(label)S.text(id+'-l',label,x+w/2,y+h*.62,{role:'mono',align:'center',owner:id});
}
// A tiny file mark for streams and grids (decor, unregistered): kind tints the corner.
function fileMark(S,x,y,sz,{tint=T.wash,alpha=1,stroke=T.inkSoft}={}) {
  S.decor(()=>{const g=S.g;g.save();g.globalAlpha*=alpha;const w=sz*.78,h=sz,f=sz*.26;
    g.beginPath();g.moveTo(x,y);g.lineTo(x+w-f,y);g.lineTo(x+w,y+f);g.lineTo(x+w,y+h);g.lineTo(x,y+h);g.closePath();g.fillStyle=T.paperHi;g.fill();
    g.strokeStyle=stroke;g.lineWidth=1.4;g.stroke();g.fillStyle=tint;g.fillRect(x+2,y+h*.45,w-4,h*.16);g.restore();});
}
// A card with an optional kicker; returns its box.
function card(S,id,x,y,w,h,{fill=T.paperHi,stroke=T.ink,weight=2.5,radius=12,dash=null,owner=null,alpha=1}={}) {
  S.actor(id,{x,y,w,h},g=>{g.globalAlpha*=alpha;g.beginPath();g.roundRect(x,y,w,h,radius);g.fillStyle=fill;g.fill();
    if(stroke){g.strokeStyle=stroke;g.lineWidth=weight;if(dash)g.setLineDash(dash);g.stroke();g.setLineDash([]);}},owner);
  return {x,y,w,h};
}
// Ticks and crosses: green only for correct/conserved, red only for wrong/blocked; ink otherwise.
function tick(S,x,y,p,{color=T.good,s=1,width=5}={}){S.partial([[x-12*s,y],[x-3*s,y+10*s],[x+14*s,y-12*s]],p,{color,width});}
function cross(S,x,y,p,{color=T.wrong,s=1,width=5}={}){S.partial([[x-11*s,y-11*s],[x+11*s,y+11*s]],clamp(p*2),{color,width});S.partial([[x+11*s,y-11*s],[x-11*s,y+11*s]],clamp(p*2-1),{color,width});}

// ---------------------------------------------------------------- places and objects
// A building is drawn as a block with windows.
function building(S,id,x,y,w,h,{owner=null,kind='agency',rows=3,fill=T.paperHi}={}) {
  S.actor(id,{x,y:kind==='capitol'?y-h*.45:y-12,w,h:kind==='capitol'?h*1.45:h+12},g=>{g.lineJoin='round';g.strokeStyle=T.ink;g.lineWidth=2.5;g.fillStyle=fill;
    if(kind==='capitol'){g.beginPath();g.ellipse(x+w/2,y,w*.22,h*.4,0,Math.PI,TAU);g.fill();g.stroke();g.fillRect(x+w/2-3,y-h*.45,6,h*.08);}
    else{g.beginPath();g.moveTo(x-6,y);g.lineTo(x+w/2,y-12);g.lineTo(x+w+6,y);g.closePath();g.fill();g.stroke();}
    g.beginPath();g.rect(x,y,w,h);g.fill();g.stroke();
    const cols=Math.max(3,Math.round(w/44));for(let c=0;c<cols;c++){const cx=x+(c+.5)*w/cols;g.strokeStyle=T.inkSoft;g.lineWidth=2;
      if(kind==='capitol'||kind==='house'){g.beginPath();g.moveTo(cx,y+8);g.lineTo(cx,y+h-8);g.stroke();}
      else for(let r=0;r<rows;r++){g.fillStyle=T.wash;g.fillRect(cx-9,y+12+r*(h-20)/rows,18,(h-20)/rows*.55);}}
    g.strokeStyle=T.ink;g.lineWidth=3;g.beginPath();g.moveTo(x-10,y+h);g.lineTo(x+w+10,y+h);g.stroke();},owner);
  return {x,y,w,h};
}
// A clock face with hour and minute hands (hours as a real number, 0–24).
function clock(S,id,cx,cy,r,hours,{owner=null,ring=T.ink,face=T.paperHi}={}) {
  S.actor(id,{x:cx-r,y:cy-r,w:2*r,h:2*r},g=>{g.beginPath();g.arc(cx,cy,r,0,TAU);g.fillStyle=face;g.fill();g.strokeStyle=ring;g.lineWidth=3;g.stroke();
    for(let i=0;i<12;i++){const a=i/12*TAU;g.lineWidth=i%3?1.5:3;g.beginPath();g.moveTo(cx+Math.sin(a)*r*.82,cy-Math.cos(a)*r*.82);g.lineTo(cx+Math.sin(a)*r*.92,cy-Math.cos(a)*r*.92);g.stroke();}
    const hA=(hours%12)/12*TAU,mA=(hours%1)*TAU;g.lineCap='round';
    g.lineWidth=5;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.sin(hA)*r*.5,cy-Math.cos(hA)*r*.5);g.stroke();
    g.lineWidth=3;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.sin(mA)*r*.76,cy-Math.cos(mA)*r*.76);g.stroke();
    g.fillStyle=ring;g.beginPath();g.arc(cx,cy,4,0,TAU);g.fill();},owner);
}
// A gate: two posts and a bar that lifts as `open` goes 0 -> 1; `blocked` flashes the bar red.
function gate(S,id,x,y,h,{open=0,blocked=0,owner=null,width=110}={}) {
  S.actor(id,{x:x-12,y:y-12,w:width+24,h:h+14},g=>{g.fillStyle=T.ink;g.fillRect(x-6,y,12,h);g.fillRect(x+width-6,y,12,h);
    const a=-open*Math.PI*.42;g.save();g.translate(x,y+h*.35);g.rotate(a);g.fillStyle=blocked>0?T.wrong:T.paperHi;g.strokeStyle=T.ink;g.lineWidth=2.5;
    g.beginPath();g.rect(0,-9,width,18);g.fill();g.stroke();g.fillStyle=blocked>0?T.wrongSoft:T.ink;for(let k=1;k<4;k++)g.fillRect(k*width/4-6,-9,12,18);g.restore();},owner);
}
// A magnifier and a lock (generic signs).
function magnifier(S,id,cx,cy,r,{owner=null}={}) {
  S.actor(id,{x:cx-r,y:cy-r,w:r*2.6,h:r*2.6},g=>{g.lineWidth=4;g.strokeStyle=T.ink;g.fillStyle=T.blueSoft;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();g.stroke();
    g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(cx+r*.75,cy+r*.75);g.lineTo(cx+r*1.55,cy+r*1.55);g.stroke();},owner);
}
function lock(S,id,cx,cy,s=1,{open=0,owner=null}={}) {
  S.actor(id,{x:cx-22*s,y:cy-34*s,w:44*s,h:62*s},g=>{g.lineWidth=5*s;g.strokeStyle=T.ink;g.beginPath();g.arc(cx,cy-8*s-open*10*s,14*s,Math.PI,0);g.stroke();
    g.fillStyle=T.ink;g.beginPath();g.roundRect(cx-22*s,cy-6*s,44*s,34*s,6*s);g.fill();g.fillStyle=T.paperHi;g.fillRect(cx-3*s,cy+4*s,6*s,12*s);},owner);
}

// ---------------------------------------------------------------- people
// A cast member who walks in from `dx` and speaks between `say` times; focus dims earlier speakers.
function person(S,t,id,key,x,feet,{at,s=.78,dx=-60,pose='stand',arms,facing=1,say=null,alpha=1,label='below',prop,role:showRole}={}) {
  const p=seg(t,at,.6,E.outExpo);if(p<=0||alpha<=.002)return null;let out=null;
  S.fade(clamp(p*1.6)*alpha,()=>{out=cast(S,id,key,x+(1-p)*dx,feet,{s,pose,arms,facing,label,prop,
    speaking:say?talking(t,say[0],say[1]):0,phase:t,...(showRole===false?{role:false}:{})});});
  return out;
}

// ---------------------------------------------------------------- practice panel (night)
// Retrieval practice with text options: a highlighted kicker, a short prompt that fills as it is
// read, a picture of the situation, four option cards visible before the reveal (2×2 grid), then on
// the narrator's answer word the correct card takes the highlighter and the others dim under a red
// strike; the reason replaces the picture. Keep prompt + options within the word budget.
function practice(S,t,X,{prompt,options,correct,revealAt,reason,reasonAt,art=null,kickerAt,promptTimes,optAt,kicker='Check yourself'}) {
  const left=130,kp=seg(t,kickerAt??X.t0+.2,.45);
  // Career Ready: the kicker steps back once the options are up (word budget).
  const kOut=seg(t,(optAt?.[0]??(promptTimes?.at(-1)??X.t0+1)+.3)+.6,.4);
  if(kp>0&&kOut<1)S.fade(clamp(kp*2)*(1-kOut),()=>S.markText('q-kicker',kicker,left,128,{role:'kicker',p:kp,color:T.white,pad:8}));
  const pt=promptTimes||stagger(prompt,(kickerAt??X.t0)+.7,.16),r=seg(t,revealAt,.5,E.linear);
  const PL=S.layout(prompt,{role:'headline',maxWidth:1020}),py=184+(PL.lines-1)*PL.lh/2;
  S.fade(1-.72*seg(t,revealAt+.4,.5),()=>S.sentence('q-prompt',prompt,left,py,{t,times:pt,reveal:'ghost',ghost:.14,dur:.3,role:'headline',maxWidth:1020,color:T.white}));
  const box={x:left,y:232,w:1020,h:128},artOut=seg(t,(reasonAt??revealAt+.5)-.45,.4);
  if(art&&artOut<1)S.fade(1-artOut,()=>art(S,box,t));
  if(reason)S.fade(seg(t,reasonAt??revealAt+.6,.5),()=>S.sentence('q-reason',reason,640,PL.lines>1?318:296,{t,times:stagger(reason,reasonAt??revealAt+.6,.08),reveal:'blur',role:'accentMd',color:T.white,align:'center',maxWidth:1040}));
  // Career Ready: three options stack as full-width rows (room for the whole answer); four use the 2×2 grid.
  const one=options.length<=3,W=one?1020:495,H=one?62:76;
  options.forEach((o,i)=>{const cx=left+(one?0:(i%2)*(W+30)),cy=one?372+i*(H+8):392+Math.floor(i/2)*(H+18),at=optAt?.[i]??pt.at(-1)+.3+i*.25,p=seg(t,at,.55,E.linear);if(p<=0)return;
    const ok=i===correct,id='q-o'+i,k=E.outBack(p);
    S.fade((ok?1:1-.62*r)*clamp(p*2.3),()=>{const g=S.g;g.save();g.translate(cx+W/2,cy+H/2);g.scale(k,k);g.translate(-(cx+W/2),-(cy+H/2));
      S.actor(id,{x:cx,y:cy,w:W,h:H},()=>{S.roundRect(cx,cy,W,H,16);g.fillStyle=T.nightHi;g.fill();g.strokeStyle=T.nightRule;g.lineWidth=2;g.stroke();});
      S.decor(()=>{g.strokeStyle=T.mute;g.lineWidth=3;g.beginPath();g.arc(cx+30,cy+H/2,9,0,Math.PI*2);g.stroke();});
      // Career Ready: a long option drops to the label size, then shortens, so it never leaves its card.
      const room=W-84,fitsAs=rl=>S.measure(o,role(rl))<=room,rl=fitsAs('body')?'body':'label';let ot=String(o);
      if(!fitsAs(rl)){const ws=ot.split(/\s+/);while(ws.length>1&&S.measure(ws.join(' ')+'…',role(rl))>room)ws.pop();ot=ws.join(' ')+'…';}
      S.markText(id+'-t',ot,cx+58,cy+H/2+1,{role:rl,p:ok?r:0,color:T.white,owner:id,pad:10});
      g.restore();});
    if(!ok&&r>0)S.fade(clamp(p*2.3),()=>S.strike(cx+52,cx+W-24,cy+H/2,r,{color:T.wrong,width:5}));
  });
}

module.exports={TAU,fin,pop,enter,stagger,head,kicker,doc,folder,fileMark,card,tick,cross,building,clock,gate,magnifier,lock,person,practice,focusOf,talking,...glyphs,...ai};
