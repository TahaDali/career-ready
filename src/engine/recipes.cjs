'use strict';
// Career Ready recipe library (written at BAU Innovate 2026, Nov 19). The AI never writes drawing
// code: it picks a recipe per scene and fills its data. Each recipe here turns that data into a
// runner.lessonWorld scene built from the existing engine (design stage, templates, kit, glyphs,
// illustrated people). Everything that comes from AI text is defended: cue words that are not in the
// narration fall back to an even spread, labels are shortened, and any error inside a scene draws a
// fallback scene instead of a blank canvas.
const {T,E,seg,clamp,lerp,role,talking}=require('./design.cjs');
const tpl=require('./templates.cjs');
const K=require('./kit.cjs');
const {figure,HAIR_STYLES,TOPS,LOOK}=require('./illustrations.cjs');
const {lessonWorld}=require('./runner.cjs');

const TAU=Math.PI*2;
const words=s=>String(s||'').split(/\s+/).filter(Boolean);
const STOP=new Set(['the','and','for','with','that','this','from','into','your','their','they','them','what','when','who','how','are','was','were','has','have','its','our','you','not','but','all','can','will','one','two','of','to','in','on','at','a','an','or','by','as','is','be','it']);
const norm=w=>String(w).normalize('NFC').toLowerCase().replace(/[’'ʼ]/g,'').replace(/[^\p{L}\p{M}\p{N}$%]/gu,'');
// Shorten a label to n words (with an ellipsis), so AI text can never overflow a layout.
const short=(s,n)=>{const w=words(s);return w.length<=n?w.join(' '):w.slice(0,n).join(' ')+'…';};
const fitText=(S,str,r,maxW)=>{let s=String(str||'');const R=role(r);if(S.measure(s,R)<=maxW)return s;
  const w=words(s);while(w.length>1){w.pop();s=w.join(' ')+'…';if(S.measure(s,R)<=maxW)return s;}return s;};

// ---------------------------------------------------------------- safe cues
// The first time after `after` that a meaningful word of `text` is spoken in this scene, or null.
function spokenAt(X,text,after=-Infinity) {
  for(const raw of words(text)) {
    const w=norm(raw);if(w.length<3||STOP.has(w))continue;
    let n=0;try{n=X.count(w);}catch{n=0;}
    for(let k=1;k<=n;k++){let at;try{at=X.cue(w,k);}catch{continue;}if(at>=after-.05)return at;}
  }
  return null;
}
// One onset per label: spoken cue when found (in order), otherwise an even spread over [a, b] of the span.
function cueList(X,labels,{a=.15,b=.8,gap=.25}={}) {
  const span=X.t1-X.t0,n=labels.length,out=[];let prev=X.t0+.2;
  labels.forEach((l,i)=>{const fallback=X.t0+span*(n>1?lerp(a,b,i/(n-1)):a);
    let at=spokenAt(X,l,prev);if(at==null||at>X.t1-.6)at=Math.max(fallback,prev);
    at=Math.max(at,prev);out.push(at);prev=at+gap;});
  return out;
}
// Word onsets for on-screen text that repeats the narration (cue.phrase), else a stagger from `from`.
function phraseTimes(X,text,from,step=.18) {
  try{return X.phrase(text);}catch{return words(text).map((_,i)=>from+i*step);}
}

// ---------------------------------------------------------------- glyphs
// One vocabulary of meaning-carrying objects, drawn in a size × size box centred on (cx, cy).
const GLYPHS=['doc','folder','card','building','campus','hall','clock','calendar','gate','magnifier','lock','envelope','megaphone',
  'bubble','pin','ballot','table','sheet','form','coin','idCard','person','phonePost','poster','ai'];
const GENERIC={skin:'skin3',hair:'hairDark',style:'short',top:'shirt',topColor:'slate',inner:'white',bottom:'charcoal'};
function glyph(S,id,name,cx,cy,s,{t=0,p=1}={}) {
  const n=GLYPHS.includes(name)?name:'doc';
  switch(n) {
    case 'doc':return K.doc(S,id,cx-s*.36,cy-s*.48,s*.72,s*.96,{lines:6});
    case 'folder':return K.folder(S,id,cx-s*.5,cy-s*.26,s,s*.62,{open:.3});
    case 'card':{const b=K.card(S,id,cx-s*.5,cy-s*.32,s,s*.64);S.decor(()=>{const g=S.g;g.fillStyle=T.ink;g.fillRect(cx-s*.5+2,cy-s*.32+2,s-4,s*.14);
      g.fillStyle=T.wash;for(let i=0;i<3;i++)g.fillRect(cx-s*.4,cy-s*.06+i*s*.1,s*(i===2?.45:.8),s*.045);});return b;}
    case 'building':return K.building(S,id,cx-s*.4,cy-s*.32,s*.8,s*.72,{rows:3});
    case 'campus':return K.campus(S,id,cx-s*.6,cy-s*.3,s*1.2,s*.6);
    case 'hall':return K.hall(S,id,cx,cy+s*.4,s/150);
    case 'clock':return K.clock(S,id,cx,cy,s*.42,10.1+t*.02);
    case 'calendar':return K.calendar(S,id,cx-s*.5,cy-s*.42,s,s*.84,{days:30,marks:[{day:12,fill:T.cobaltSoft},{day:19,fill:T.cobaltSoft}]});
    case 'gate':return K.gate(S,id,cx-s*.4,cy-s*.35,s*.75,{width:s*.8,open:p*.0});
    case 'magnifier':return K.magnifier(S,id,cx-s*.08,cy-s*.08,s*.3);
    case 'lock':return K.lock(S,id,cx,cy,s/110);
    case 'envelope':return K.envelope(S,id,cx,cy,s/130);
    case 'megaphone':return K.megaphone(S,id,cx,cy,s/130,{p});
    case 'bubble':return K.bubble(S,id,cx-s*.5,cy-s*.36,s,s*.58,{tail:'down'});
    case 'pin':return K.pin(S,id,cx,cy+s*.42,s/90);
    case 'ballot':return K.ballot(S,id,cx,cy,s/130);
    case 'table':return K.table(S,id,cx,cy,s);
    case 'sheet':{const c=s*.98/3;return K.sheet(S,id,cx-s*.49,cy-s*.4,[c,c,c],{rows:[{cells:['','','']},{cells:['','','']},{cells:['','','']}],rowH:s*.18,headH:s*.16});}
    case 'form':return K.doc(S,id,cx-s*.36,cy-s*.48,s*.72,s*.96,{lines:4,band:T.cobalt});
    case 'coin':return K.coin(S,id,cx,cy,s*.32);
    case 'idCard':return K.idCard(S,id,cx,cy,s/150);
    case 'person':return figure(S,id,cx,cy+s*.5,{...GENERIC,s:s/310,name:null,role:null,label:'none'});
    case 'phonePost':return K.phonePost(S,id,cx-s*.3,cy-s*.5,s*.6,s);
    case 'poster':return K.poster(S,id,cx-s*.36,cy-s*.48,s*.72,s*.96);
    case 'ai':return K.model(S,id,cx,cy,s/150);
  }
}

// ---------------------------------------------------------------- people
// The AI's cast, with every look field checked against the engine's enums (bad values become defaults).
const SKINS=['skin1','skin2','skin3','skin4','skin5'],HAIRS=Object.keys(LOOK).filter(k=>/^hair[A-Z]/.test(k)),
  WARD=Object.keys(LOOK).filter(k=>!SKINS.includes(k)&&!HAIRS.includes(k));
const pick=(v,list,d)=>list.includes(v)?v:d;
function lookOf(m,i) {
  return {skin:pick(m?.skin,SKINS,SKINS[(i*2+1)%5]),hair:pick(m?.hair,HAIRS,HAIRS[i%HAIRS.length]),style:pick(m?.style,HAIR_STYLES,HAIR_STYLES[(i*3)%HAIR_STYLES.length]),
    top:pick(m?.top,TOPS,TOPS[i%TOPS.length]),topColor:pick(m?.topColor,WARD,['navy','sage','olive','denim'][i%4]),inner:pick(m?.inner,WARD,'white'),
    bottom:pick(m?.bottom,WARD,'charcoal'),lower:m?.lower==='skirt'?'skirt':'trousers',glasses:m?.glasses===true};
}
function castTable(cast) {
  const out={};(cast||[]).forEach((m,i)=>{if(!m?.key)return;const r=m.role?String(m.role).replace(/\s*\((fictional|invented)\)\s*/ig,' ').trim():'';out[m.key]={...lookOf(m,i),name:m.name?short(m.name,3):null,role:r?short(r,3):null};});
  return out;
}

// ---------------------------------------------------------------- shared scene parts
const head=(S,t,X,text,o={})=>K.head(S,t,X,short(text,6),{at:X.t0+.15,until:X.leave-.6,...o});
// Highlight a label while it is being spoken: from its cue until the next item's cue.
const markP=(t,a,b)=>seg(t,a,.4,E.inOut)*(1-seg(t,b,.4,E.inOut));

// The part's roman numeral wherever it appears ("Part VI · Growth", "VI · Growth"), else Part I.
const partOf=p=>{const m=/\b(VI|IV|V|III|II|I)\b/.exec(String(p||''));return m&&tpl.PARTS[m[1]]?'Part '+m[1]:'Part I';};
// opener {kicker, title, subtitle, glyph}
function opener(scene,lesson) {
  const d=scene.data||{},title=short(d.title||scene.headline||lesson.title,8),sub=short(d.subtitle||lesson.goal||'',9);
  return {draw(S,t,X){
    const tt=words(title).map((_,i)=>X.t0+.35+i*.2),at=words(sub).map((_,i)=>tt.at(-1)+.6+i*.2);
    tpl.partOpener(S,t,{part:partOf(lesson.part),kicker:short(d.kicker||'The role in one minute',5),title,accent:sub||null,start:X.t0,end:X.t1,
      at:{title:tt,accent:at},markWords:Math.min(2,words(sub).length),scene:X,exitAt:X.t1-.3,
      hero:(S,box,tt2)=>{const s=Math.min(box.w,box.h)*.62,p=seg(tt2,X.t0+.5,.8,E.outExpo);
        if(p>0)S.fade(clamp(p*1.8),()=>{const g=S.g,cx=box.x+box.w/2,cy=box.y+box.h/2;g.save();g.translate(0,(1-clamp(p))*28);
          glyph(S,'hero',d.glyph,cx,cy,s,{t:tt2,p});g.restore();});}});
  }};
}

// statement {text, emphasis}
function statement(scene) {
  const d=scene.data||{},text=short(d.text||scene.headline,14),ws=words(text);
  let emph=String(d.emphasis||'').replace(/[^\w$%]/g,'');
  if(!ws.some(w=>w.replace(/[^\w$%]/g,'')===emph))emph=ws.map(w=>w.replace(/[^\w$%]/g,'')).sort((a,b)=>b.length-a.length)[0]||'';
  return {draw(S,t,X){
    const times=phraseTimes(X,text,X.t0+.35,.22);
    S.fade(seg(t,X.t0,.4),()=>K.kicker(S,'st-k',short(scene.headline,5),640,196,{align:'center'}));
    tpl.statement(S,t,{x:640,y:360,scene:X.scene,text,emphasis:emph,start:X.t0,end:X.t1,times});
  }};
}

// org {center:{label, glyph}, around:[{label, relation, glyph}]}
function org(scene) {
  const d=scene.data||{},c=d.center||{label:'The organization',glyph:'building'},
    around=(Array.isArray(d.around)?d.around:[]).slice(0,5).map(a=>({label:short(a.label,3),relation:short(a.relation,4),glyph:a.glyph}));
  const n=around.length,left=Math.ceil(n/2),right=n-left;
  const pos=around.map((_,i)=>{const L=i<left,k=L?i:i-left,m=L?left:right,y=m===1?395:lerp(270,520,k/Math.max(1,m-1));return {x:L?220:1060,y,L};});
  return {draw(S,t,X){
    head(S,t,X,scene.headline);
    const [ca,...ats]=cueList(X,[c.label,...around.map(a=>a.label)],{a:.1,b:.78});
    const cx=640,cy=395,cp=seg(t,ca-.2,.6,E.outBack);
    if(cp>0)S.fade(clamp(cp*2),()=>{glyph(S,'org-c',c.glyph||'building',cx,cy-20,150,{t});
      S.markText('org-cl',fitText(S,short(c.label,4),'label',300),cx,cy+90,{role:'label',align:'center',p:markP(t,ca,ats[0]??X.t1)});});
    around.forEach((a,i)=>{const q=pos[i],at=ats[i],next=ats[i+1]??X.t1,p=seg(t,at,.5,E.outExpo);if(p<=0)return;
      const tx0=q.L?q.x-20:q.x+20,lw=Math.max(S.measure(fitText(S,a.label,'label',290),role('label')),a.relation?S.measure(fitText(S,a.relation,'small',300),role('small')):0);
      const ex=q.L?tx0+lw+18:tx0-lw-18,sx=q.L?cx-95:cx+95;
      if(q.L?ex<sx-10:ex>sx+10)S.partial([[sx,cy-10],[ex,q.y+4]],seg(t,at-.15,.6,E.inOut),{color:T.ink,width:2.5,dash:[2,7]});
      S.fade(clamp(p*1.6),()=>{const g=S.g;g.save();g.translate((1-p)*(q.L?-30:30),0);
        glyph(S,`org-g${i}`,a.glyph||'person',q.L?q.x-75:q.x+75,q.y-6,70,{t});
        const tx=q.L?q.x-20:q.x+20,al=q.L?'left':'right';
        S.markText(`org-l${i}`,fitText(S,a.label,'label',290),q.L?tx+0:tx,q.y-14,{role:'label',align:al,p:markP(t,at,next)});
        if(a.relation)S.text(`org-r${i}`,fitText(S,a.relation,'small',300),tx,q.y+22,{role:'small',color:T.inkSoft,align:al});
        g.restore();});});
  }};
}

// flow {steps:[{label, glyph}], active}
function flow(scene) {
  const d=scene.data||{},steps=(Array.isArray(d.steps)?d.steps:[]).slice(0,5).map(s=>({label:short(s.label,3),glyph:s.glyph}));
  if(steps.length<2)steps.push({label:'Deliver',glyph:'doc'},{label:'Review',glyph:'magnifier'});
  const n=steps.length,active=Math.max(0,Math.min(n-1,Number.isInteger(d.active)?d.active:n-1));
  const gap=30,w=Math.min(270,(1160-gap*(n-1))/n),x0=640-(n*w+(n-1)*gap)/2,cy=395,h=240;
  return {draw(S,t,X){
    head(S,t,X,scene.headline);
    const ats=cueList(X,steps.map(s=>s.label),{a:.12,b:.7}),focus=Math.max(ats.at(-1)+.9,X.t0+(X.t1-X.t0)*.78);
    steps.forEach((s,i)=>{const x=x0+i*(w+gap),at=ats[i],p=seg(t,at,.55,E.linear);if(p<=0)return;
      const on=i===active,dim=on?1:1-.55*seg(t,focus,.6,E.inOut);
      S.fade(dim,()=>{const k=E.outBack(p),g=S.g;g.save();g.translate(x+w/2,cy);g.scale(k,k);g.translate(-(x+w/2),-cy);
        S.fade(clamp(p*2.3),()=>{K.card(S,`fl-c${i}`,x,cy-h/2,w,h,{weight:on&&t>=focus?4:2.5});
          S.text(`fl-n${i}`,String(i+1).padStart(2,'0'),x+18,cy-h/2+30,{role:'kicker',color:T.inkSoft,owner:`fl-c${i}`});
          const LL=S.layout(s.label,{role:'label',maxWidth:w-28}),two=LL.lines>1,mp=markP(t,at,ats[i+1]??focus);
          glyph(S,`fl-g${i}`,s.glyph,x+w/2,two?cy-30:cy-12,Math.min(two?80:96,w*.5),{t});
          S.sentence(`fl-l${i}`,s.label,x+w/2,cy+h/2-(two?48:34),{t,times:[],reveal:'none',role:'label',maxWidth:w-28,align:'center',owner:`fl-c${i}`,
            styles:Object.fromEntries(words(s.label).map((_,j)=>[j,{mark:{p:mp}}]))});});
        g.restore();});
      if(i<n-1)S.arrow([x+w+4,cy],[x+w+gap-4,cy],seg(t,ats[i+1]-.3,.4,E.inOut),{bend:0,width:2.5,head:9});});
    // Where this role sits: an ink tag drops onto the active step when the focus lands.
    const fp=seg(t,focus,.5,E.outBack);
    if(fp>0){const x=x0+active*(w+gap)+w/2;S.chip('fl-role','This role',x,cy-h/2-36,{p:fp,role:'kicker',fill:T.ink,color:T.white});}
  }};
}

// record {header, title, rows:[{field, value}], state}
function record(scene,lesson,people) {
  const d=scene.data||{},rows=(Array.isArray(d.rows)?d.rows:[]).slice(0,4).map(r=>({field:short(r.field,3),value:short(r.value,4)}));
  const state=['proposed','confirmed','decided'].includes(d.state)?d.state:'proposed',who=Object.keys(people)[0];
  return {draw(S,t,X){
    head(S,t,X,scene.headline);
    const x=430,y=206,w=720,rowH=Math.min(74,290/Math.max(1,rows.length)),hb=58,h=hb+64+rows.length*rowH+16;
    const ats=cueList(X,rows.map(r=>r.value||r.field),{a:.25,b:.75}),cp=seg(t,X.t0+.4,.6,E.outExpo);
    if(who){const P=people[who];S.fade(seg(t,X.t0+.2,.6),()=>figure(S,'rc-p',230,468,{...P,s:.74,pose:t>ats[0]?'present':'stand',facing:1,
      speaking:talking(t,X.t0+.3,X.t1-.4)*.8,phase:t,label:'below'}));}
    if(cp<=0)return;
    S.fade(cp,()=>{const g=S.g;g.save();g.translate(0,(1-cp)*24);
      S.actor('rc-card',{x,y,w,h},()=>{g.shadowColor='rgba(13,15,19,.14)';g.shadowBlur=24;g.shadowOffsetY=8;g.fillStyle=T.paperHi;g.fillRect(x,y,w,h);g.shadowColor='transparent';
        g.strokeStyle=T.ink;g.lineWidth=2.5;g.strokeRect(x,y,w,h);g.fillStyle=T.ink;g.fillRect(x,y,w,hb);});
      const lab=state==='proposed'?'Proposed':state==='confirmed'?'Confirmed':'Decided',sw=S.measure(lab.toUpperCase(),role('kicker'))+44;
      S.text('rc-h',fitText(S,short(d.header||'Record',4),'kicker',w-sw-70),x+24,y+hb/2,{role:'kicker',color:T.white,owner:'rc-card'});
      S.text('rc-t',fitText(S,short(d.title||scene.headline,6),'title',w-48),x+24,y+hb+36,{role:'title',owner:'rc-card'});
      rows.forEach((r,i)=>{const ry=y+hb+64+i*rowH+rowH/2,p=seg(t,ats[i],.45);
        S.rule(x+24,x+w-24,ry-rowH/2+4,1,{weight:1.2,color:T.rule});
        S.text(`rc-f${i}`,fitText(S,r.field,'kicker',250),x+24,ry,{role:'kicker',color:T.inkSoft,owner:'rc-card'});
        if(p>0)S.fade(p,()=>S.markText(`rc-v${i}`,fitText(S,r.value,'label',380),x+300,ry,{role:'label',p:markP(t,ats[i],ats[i+1]??X.t1-.8),owner:'rc-card'}));
        else S.stateBox(null,'proposed',x+300,ry-14,180,28,{register:false,alpha:.6});});
      // The record's state, stamped into the header band once every field is filled.
      const sp=seg(t,ats.at(-1)+.7,.5,E.outBack);
      if(sp>0)S.fade(clamp(sp*2),()=>{S.stateBox('rc-s',state,x+w-sw-14,y+9,sw,hb-18,{p:sp,owner:'rc-card',outline:T.white});
        S.text('rc-sl',lab,x+w-sw-14+sw/2,y+hb/2,{role:'kicker',align:'center',color:T.white,owner:'rc-s'});});
      g.restore();});
  }};
}

// cast {people:[key], line:{who, text}, prop}
function castScene(scene,lesson,people) {
  const d=scene.data||{},all=(Array.isArray(d.people)?d.people:[]).filter(k=>people[k]);
  if(!all.length)all.push(...Object.keys(people).slice(0,2));
  // Two people at most: the speaker on the left facing the listener, the bubble in the space between,
  // so it never covers anyone. A third person would crowd the frame.
  const who=people[d.line?.who]?d.line.who:all[0],other=all.find(k=>k!==who)??Object.keys(people).find(k=>k!==who);
  const keys=[who,other].filter(Boolean),n=keys.length,line=short(d.line?.text||'',14);
  const xs=n===1?[330]:[300,980],FEET=462;
  return {draw(S,t,X){
    head(S,t,X,scene.headline);
    const span=X.t1-X.t0,quote=line?spokenAt(X,line,X.t0+.3):null,la=quote!=null&&quote<X.t1-1.5?quote-.2:X.t0+span*.3;
    keys.forEach((k,i)=>{const P=people[k],speaker=k===who,p=seg(t,X.t0+.25+i*.35,.7,E.outExpo);if(p<=0)return;
      const dim=speaker?1:1-.35*seg(t,la,.5,E.inOut);
      S.fade(clamp(p*1.6)*dim,()=>figure(S,`cs-p${i}`,xs[i]+(1-p)*(i===0?-50:50),FEET,{...P,s:.78,facing:i===0?1:-1,
        pose:speaker&&t>la?'present':i?'hold':'stand',speaking:speaker?talking(t,la,X.t1-.5):0,phase:t,label:'below',ground:null}));});
    if(line){const bx=n===1?470:420,bw=n===1?700:440,L=S.layout(line,{role:'body',maxWidth:bw-56}),bh=L.height+44,by=Math.max(212,300-bh/2);
      const bp=seg(t,la-.2,.5,E.outBack);
      if(bp>0)S.fade(clamp(bp*2),()=>{K.bubble(S,'cs-b',bx,by,bw,bh,{tail:'left'});
        S.sentence('cs-line',line,bx+28,by+bh/2,{t,times:phraseTimes(X,line,la,.2),reveal:'ghost',ghost:.2,dur:.3,role:'body',maxWidth:bw-56,owner:'cs-b'});});}
  }};
}

// compare {title, left:{title, rows[]}, right:{title, rows[]}, takeaway}
function compare(scene) {
  const d=scene.data||{},side=s=>({title:short(s?.title||'',4),rows:(Array.isArray(s?.rows)?s.rows:[]).slice(0,3).map(r=>short(r,4))});
  const L=side(d.left),R=side(d.right),take=short(d.takeaway||'',12);
  return {draw(S,t,X){
    head(S,t,X,d.title||scene.headline);
    const [la,...lr]=cueList(X,[L.title,...L.rows],{a:.1,b:.4}),[ra,...rr]=cueList(X,[R.title,...R.rows],{a:.45,b:.72});
    const focus=ra,dim=1-.6*seg(t,focus,.6,E.inOut),y0=232,cw=520;
    const col=(id,C,x,a,rs,good)=>{const hp=seg(t,a-.1,.5);if(hp<=0)return;
      S.fade(hp,()=>{S.text(`${id}-h`,fitText(S,C.title,'kicker',cw),x,y0,{role:'kicker',color:good?T.ink:T.inkSoft});S.rule(x,x+cw,y0+26,seg(t,a,.6,E.inOut),{weight:good?4:2,color:good?T.ink:T.mute});});
      C.rows.forEach((r,i)=>{const ry=y0+82+i*76,p=seg(t,rs[i],.45);if(p<=0)return;
        S.fade(p,()=>S.text(`${id}-r${i}`,fitText(S,r,'body',cw-70),x+48,ry,{role:'body',color:good?T.ink:T.inkSoft}));
        if(good)K.tick(S,x+16,ry,seg(t,rs[i]+.3,.4,E.inOut));
        else{S.decor(()=>{const g=S.g;g.fillStyle=T.mute;g.beginPath();g.arc(x+16,ry,6,0,TAU);g.fill();});
          S.strike(x+44,x+48+Math.min(cw-70,S.measure(fitText(S,r,'body',cw-70),role('body'))),ry,seg(t,focus+.3+i*.15,.45),{width:3});}});};
    S.fade(dim,()=>col('cl',L,90,la,lr,false));col('cr',R,680,ra,rr,true);
    S.partial([[640,y0-10],[640,y0+290]],seg(t,X.t0+.4,.8,E.inOut),{color:T.rule,width:2,dash:[6,8]});
    if(take){const ta=Math.max(rr.at(-1)??ra,ra)+.8;if(t>ta-.1)S.sentence('cmp-take',take,640,548,{t,times:phraseTimes(X,take,ta,.12),reveal:'blur',role:'accentMd',over:{size:36},align:'center',maxWidth:1100,color:T.teal});}
  }};
}

// stepper {title, steps:[string]}
function stepper(scene) {
  const d=scene.data||{},steps=(Array.isArray(d.steps)?d.steps:[]).slice(0,5).map(s=>short(typeof s==='string'?s:s?.label,6));
  const n=steps.length||1,gapY=n>4?68:Math.min(86,320/Math.max(1,n-1)),y0=n>4?226:252,rx=170; // 5 steps stay clear of the caption band
  return {draw(S,t,X){
    head(S,t,X,d.title||scene.headline);
    const ats=cueList(X,steps,{a:.12,b:.78}),ys=steps.map((_,i)=>y0+i*gapY);
    S.partial([[rx,ys[0]],[rx,ys.at(-1)]],seg(t,X.t0+.5,.7,E.inOut),{color:T.rule,width:3});
    let active=-1;ats.forEach((a,i)=>{if(t>=a)active=i;});
    steps.forEach((s,i)=>{const on=seg(t,ats[i]+.1,.5),done=i<active;
      S.decor(()=>{const g=S.g;g.fillStyle=i<=active?T.ink:T.paperLo;g.strokeStyle=T.ink;g.lineWidth=2;g.beginPath();g.arc(rx,ys[i],13,0,TAU);g.fill();g.stroke();});
      if(done)K.tick(S,rx,ys[i],1,{color:T.white,s:.55,width:3});
      S.fade(.2+.8*on*(done?.6:1),()=>{S.text(`sp-n${i}`,String(i+1).padStart(2,'0'),rx+40,ys[i],{role:'monoSm',color:T.inkSoft});
        S.markText(`sp-s${i}`,fitText(S,s,'title',900),rx+92,ys[i],{role:'title',p:markP(t,ats[i],ats[i+1]??X.t1-.5)});});});
    // The token keeps travelling down the rail as each step is spoken.
    const k=ats.findIndex(a=>t>=a&&t<a+.6),from=k>0?ys[k-1]:ys[Math.max(0,active)],to=ys[Math.max(0,k>=0?k:active)],p=k>0?seg(t,ats[k],.6,E.inOut):1;
    const ty=lerp(from,to,p),pop=seg(t,ats[0]-.3,.5,E.outBack);
    if(pop>0)S.actor('sp-tok',{x:rx-34,y:ty-20,w:20,h:40},g=>{g.fillStyle=T.cobalt;g.beginPath();g.moveTo(rx-38,ty-12*pop);g.lineTo(rx-22,ty);g.lineTo(rx-38,ty+12*pop);g.closePath();g.fill();});
  }};
}

// question {prompt, options[3–4], correct, reason}
function question(scene) {
  const d=scene.data||{},options=(Array.isArray(d.options)?d.options:[]).slice(0,4).map(o=>short(o,6));
  while(options.length<2)options.push('Not sure');
  const correct=Math.max(0,Math.min(options.length-1,Number.isInteger(d.correct)?d.correct:0)),prompt=short(d.prompt||scene.headline,14),reason=short(d.reason||'',14);
  return {night:true,in:'wipe',draw(S,t,X){
    const pt=phraseTimes(X,prompt,X.t0+.8,.14),optAt=cueList(X,options,{a:.35,b:.6}),revealAt=Math.max(optAt.at(-1)+1.2,X.t1-3.2);
    // The reason arrives once the prompt has faded, so the frame stays within the word budget.
    K.practice(S,t,X,{prompt,options,correct,revealAt,reason,reasonAt:revealAt+1,kicker:'Check yourself',kickerAt:X.t0+.2,promptTimes:pt,optAt});
  }};
}

// Fallback: a section head, one glyph and the headline, so a scene never renders blank.
function fallbackDraw(scene) {
  return (S,t,X)=>{K.head(S,t,X,short(scene.headline||'',6),{at:X.t0+.15});
    const p=seg(t,X.t0+.4,.6,E.outBack);if(p>0)S.fade(clamp(p*2),()=>glyph(S,'fb-g',scene.data?.glyph||'doc',640,400,180,{t}));};
}

const RECIPES={opener,statement,org,flow,record,cast:castScene,compare,stepper,question};
const FICTION_IN='iris';

// Build the world for one lesson's content (cached per content object; timing re-plans automatically).
const worlds=new WeakMap();
function buildWorld(lesson,cast) {
  if(worlds.has(lesson))return worlds.get(lesson);
  const people=castTable(cast);
  const scenes=lesson.scenes.map((sc,i)=>{
    let r;try{r=(RECIPES[sc.recipe]||(()=>({draw:fallbackDraw(sc)})))(sc,lesson,people);}catch(e){console.warn('recipe build failed',sc.id,e);r={draw:fallbackDraw(sc)};}
    const prev=lesson.scenes[i-1],fb=fallbackDraw(sc);
    const inT=r.in||(i>0&&sc.fiction&&!prev?.fiction?FICTION_IN:'pan');
    return {id:sc.id,in:inT,night:!!r.night,fiction:!!sc.fiction,irisAt:()=>[640,380],
      draw(S,t,X){try{r.draw(S,t,X);}catch(e){if(!this._warned){console.warn('scene draw failed, using fallback:',sc.id,e);this._warned=true;}
        try{fb(S,t,X);}catch{/* never break the frame */}}}};
  });
  // Rail: up to four middle scenes, labelled by their headline's first two words.
  const mids=lesson.scenes.filter(s=>s.recipe!=='opener'&&s.recipe!=='question');
  const pickN=mids.length<=5?mids:[0,1,2,3,4].map(k=>mids[Math.round(k*(mids.length-1)/4)]);
  const RAIL={org:'The org',flow:'The work',record:'Example',cast:'Example',compare:'The skill',stepper:'The steps',statement:'The point'};
  const seen=new Set(),railScenes=pickN.filter(s=>{const l=RAIL[s.recipe]||'More';if(seen.has(l))return false;seen.add(l);return true;});
  const rail=railScenes.length>=2?{steps:railScenes.map(s=>RAIL[s.recipe]||'More'),scenes:railScenes.map(s=>s.id)}:null;
  const W=lessonWorld({scenes,rail});
  worlds.set(lesson,W);return W;
}

const MIN_SPAN={opener:5,statement:3.5,org:6,flow:6,record:6,cast:5,compare:6.5,stepper:5.5,question:6};
module.exports={buildWorld,glyph,GLYPHS,RECIPES,MIN_SPAN,castTable};
