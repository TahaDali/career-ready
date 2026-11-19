'use strict';
// Shared subject glyphs for the Axios AI Fellow course, so every lesson draws the same objects:
// a newsletter issue, an agenda packet and its page of numbered items, a strip of tokens, a model,
// the one-page brief, an API pipe between an app and a model, and a meaning-map point.
// Colours come from tokens and type from roles; every solid registers through S.actor and every word
// through S.text, so the frame audit, type floors, edge guard and word budget see all of them.
// No real brand: the issue has a plain ink masthead band, never a logo or Axios colours.
const {T,clamp,lerp,role}=require('./design.cjs');
const TAU=Math.PI*2;

// A newsletter issue: ink masthead band, a bold headline bar, a short lede, then body lines.
// lead (0..1) inks the headline bar; dim (0..1) greys the body. Returns its box.
function issue(S,id,x,y,w,h,{owner=null,lead=1,lines=6,title=null,titleRole='label',fill=T.paperHi,band=T.ink}={}) {
  S.actor(id,{x,y,w,h},g=>{g.lineJoin='round';g.beginPath();g.rect(x,y,w,h);g.fillStyle=fill;g.fill();g.strokeStyle=T.ink;g.lineWidth=2.5;g.stroke();
    g.fillStyle=band;g.fillRect(x,y,w,Math.max(14,h*.11));
    const top=y+Math.max(14,h*.11)+14;
    if(!title){g.fillStyle=lead>0?T.ink:T.wash;g.globalAlpha*=lerp(.25,1,clamp(lead));g.fillRect(x+14,top,(w-28)*.82,Math.max(8,h*.07));g.globalAlpha/=lerp(.25,1,clamp(lead));}
    const body=title?top+34:top+Math.max(8,h*.07)+16,gap=(y+h-12-body)/Math.max(1,lines);
    g.fillStyle=T.wash;for(let i=0;i<lines;i++)g.fillRect(x+14,body+i*gap,(w-28)*(i%3===2?.55:.9),Math.max(3,Math.min(7,gap*.34)));},owner);
  if(title)S.text(id+'-t',title,x+14,y+Math.max(14,h*.11)+30,{role:titleRole,owner:id});
  return {x,y,w,h};
}

// An agenda packet: a short stack of pages with a binder clip. The front page carries `title`
// (a real word, set at label size) and numbered item rows drawn as rules. Returns its box.
function packet(S,id,x,y,w,h,{owner=null,title='Agenda',pages=3,rows=5,fill=T.paperHi}={}) {
  const off=8;
  S.actor(id,{x,y:y-6,w:w+off*(pages-1),h:h+off*(pages-1)+6},g=>{g.lineJoin='round';
    for(let i=pages-1;i>=0;i--){const px=x+i*off,py=y+i*off;g.beginPath();g.rect(px,py,w,h);g.fillStyle=fill;g.fill();g.strokeStyle=i?T.inkSoft:T.ink;g.lineWidth=i?1.6:2.5;g.stroke();}
    // binder clip
    g.fillStyle=T.ink;g.fillRect(x+w/2-22,y-6,44,14);g.strokeStyle=T.ink;g.lineWidth=2.5;g.beginPath();g.arc(x+w/2,y-6,12,Math.PI,0);g.stroke();
    const top=y+62,gap=(h-80)/rows;
    for(let r=0;r<rows;r++){const ry=top+r*gap;g.fillStyle=T.inkSoft;g.fillRect(x+14,ry,14,6);g.fillStyle=T.wash;g.fillRect(x+38,ry,(w-56)*(r%2?.7:.9),6);}},owner);
  if(title)S.text(id+'-t',title,x+14,y+36,{role:'label',owner:id});
  return {x,y,w,h};
}

// One page of an agenda with numbered items. items: [{n:'7', h:<px height>, label?:string}]. Each
// item is a block with its number in a margin box and body rules; returns {x,y,w,h,items:[{n,x,y,w,h}]}.
// A label (≤ 4 words) is set at label size inside the block when the page is large enough.
function agendaPage(S,id,x,y,w,h,{owner=null,items=[],page=null,fill=T.paperHi,pad=16}={}) {
  const boxes=[];let cy=y+pad+(page?34:0);
  for(const it of items){boxes.push({n:it.n,x:x+pad,y:cy,w:w-pad*2,h:it.h});cy+=it.h+10;}
  S.actor(id,{x,y,w,h},g=>{g.lineJoin='round';g.beginPath();g.rect(x,y,w,h);g.fillStyle=fill;g.fill();g.strokeStyle=T.ink;g.lineWidth=2.5;g.stroke();
    for(const b of boxes){g.strokeStyle=T.rule;g.lineWidth=1.5;g.beginPath();g.moveTo(b.x,b.y+b.h+5);g.lineTo(b.x+b.w,b.y+b.h+5);g.stroke();
      const top=b.y+(items.find(i=>i.n===b.n).label?50:14),gap=18;g.fillStyle=T.wash;
      for(let yy=top,k=0;yy<b.y+b.h-6;yy+=gap,k++)g.fillRect(b.x+58,yy,(b.w-70)*(k%3===2?.55:.92),6);}},owner);
  if(page)S.text(id+'-pg',page,x+w-pad,y+28,{role:'monoSm',align:'right',color:T.inkSoft,owner:id});
  for(const b of boxes){const it=items.find(i=>i.n===b.n);
    S.text(`${id}-n${b.n}`,b.n,b.x+18,b.y+24,{role:'mono',align:'center',owner:id});
    if(it.label)S.text(`${id}-l${b.n}`,it.label,b.x+58,b.y+24,{role:'label',owner:id});}
  return {x,y,w,h,items:boxes};
}

// A strip of token tiles. pieces: strings (a leading space is shown as a dot). p (0..1) reveals
// tiles left to right; hl: index set taking the highlighter. Returns {x,y,w,h,tiles}.
function tokens(S,id,x,y,pieces,{owner=null,p=1,h=46,gap=8,state=null,dim=0}={}) {
  const tiles=[];let cx=x;const mono=role('mono');
  for(const s of pieces){const label=s.replace(/^ /,'·');const tw=Math.max(34,S.measure(label,mono)+22);
    tiles.push({s:label,x:cx,y,w:tw,h});cx+=tw+gap;}
  const n=Math.ceil(clamp(p)*tiles.length);
  tiles.slice(0,n).forEach((b,i)=>{S.fade(1-.6*dim,()=>{
    if(state)S.stateBox(`${id}-${i}`,state,b.x,b.y,b.w,b.h,{dash:false,weight:2,owner});
    else S.actor(`${id}-${i}`,b,gg=>{gg.beginPath();gg.roundRect(b.x,b.y,b.w,b.h,7);gg.fillStyle=T.paperHi;gg.fill();gg.strokeStyle=T.ink;gg.lineWidth=2;gg.stroke();},owner);
    S.text(`${id}-${i}-t`,b.s,b.x+b.w/2,b.y+b.h/2+1,{role:'mono',align:'center',owner:`${id}-${i}`,color:state?T.white:T.ink});});});
  return {x,y,w:cx-gap-x,h,tiles};
}

// A model: a rounded block with a small layered network inside (no brand). label is set under it.
function model(S,id,cx,cy,s=1,{owner=null,label=null,glow=0,fill=T.paperHi}={}) {
  const w=150*s,h=120*s,x=cx-w/2,y=cy-h/2;
  S.actor(id,{x,y,w,h},g=>{g.lineJoin='round';g.beginPath();g.roundRect(x,y,w,h,18*s);g.fillStyle=fill;g.fill();g.strokeStyle=T.ink;g.lineWidth=3;g.stroke();
    const cols=[3,4,3],nodes=cols.map((n,c)=>Array.from({length:n},(_,r)=>[x+w*(.24+.26*c),y+h*(.5+(r-(n-1)/2)*.2)]));
    g.strokeStyle=T.rule;g.lineWidth=1.4;for(let c=0;c<2;c++)for(const a of nodes[c])for(const b of nodes[c+1]){g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.stroke();}
    for(const col of nodes)for(const [nx,ny] of col){g.beginPath();g.arc(nx,ny,7*s,0,TAU);g.fillStyle=glow>0?T.cobalt:T.ink;g.fill();}},owner);
  if(label)S.text(id+'-l',label,cx,y+h+32,{role:'label',align:'center'});
  return {x,y,w,h};
}

// The one-page brief: an ink title band with `title`, then heads (≤ 3 words each, label size) with
// rules beneath. shown (0..n) reveals heads in order; mark: index whose head takes the highlighter.
function brief(S,id,x,y,w,h,{owner=null,title='Monday brief',heads=[],shown=heads.length,mark=-1,markP=0,lineRows=1}={}) {
  const top=y+64,row=(h-78)/Math.max(1,heads.length);
  S.actor(id,{x,y,w,h},g=>{g.lineJoin='round';g.beginPath();g.rect(x,y,w,h);g.fillStyle=T.paperHi;g.fill();g.strokeStyle=T.ink;g.lineWidth=2.5;g.stroke();
    g.fillStyle=T.ink;g.fillRect(x,y,w,48);
    for(let i=0;i<heads.length;i++){const ry=top+i*row;g.fillStyle=T.wash;
      for(let k=0;k<lineRows;k++)g.fillRect(x+20,ry+42+k*16,(w-40)*(k%2?.6:.86)*(i<shown?1:.5),6);}},owner);
  S.text(id+'-t',title,x+18,y+25,{role:'key',color:T.white,owner:id});
  heads.forEach((hd,i)=>{if(i>=shown)return;const ry=top+i*row+14;
    if(i===mark)S.markText(`${id}-h${i}`,hd,x+20,ry,{role:'key',p:markP,owner:id,pad:6});
    else S.text(`${id}-h${i}`,hd,x+20,ry,{role:'key',owner:id});});
  return {x,y,w,h};
}

// An API pipe from an app box to a model: two parallel rails; a packet travels along it at q (0..1)
// in direction dir (1 = to the model, -1 = back). Unregistered decor except the packet.
function pipe(S,id,x1,y,x2,{q=null,dir=1,state=null,packetW=46,label=null,labelAt=null}={}) {
  S.decor(()=>{const g=S.g;g.strokeStyle=T.ink;g.lineWidth=2.5;g.beginPath();g.moveTo(x1,y-14);g.lineTo(x2,y-14);g.moveTo(x1,y+14);g.lineTo(x2,y+14);g.stroke();});
  if(q!=null&&q>0&&q<1){const px=dir>0?lerp(x1,x2-packetW,q):lerp(x2-packetW,x1,q);
    if(state)S.stateBox(id+'-pk',state,px,y-10,packetW,20,{dash:false,weight:1.6});
    else S.actor(id+'-pk',{x:px,y:y-10,w:packetW,h:20},g=>{g.beginPath();g.roundRect(px,y-10,packetW,20,5);g.fillStyle=T.ink;g.fill();});}
  if(label)S.text(id+'-l',label,labelAt??(x1+x2)/2,y-36,{role:'kicker',align:'center',color:T.inkSoft});
}

// A point on the meaning map: a dot with an optional label to its right (or left with side:-1).
function point(S,id,cx,cy,{label=null,r=9,fill=T.ink,side=1,role:rl='label',owner=null,ring=0}={}) {
  S.actor(id,{x:cx-r,y:cy-r,w:r*2,h:r*2},g=>{g.beginPath();g.arc(cx,cy,r,0,TAU);g.fillStyle=fill;g.fill();
    if(ring>0){g.strokeStyle=T.ink;g.lineWidth=2;g.beginPath();g.arc(cx,cy,r+6,0,TAU*clamp(ring));g.stroke();}},owner);
  if(label)S.text(id+'-l',label,cx+side*(r+12),cy+1,{role:rl,align:side>0?'left':'right'});
}

module.exports={issue,packet,agendaPage,tokens,model,brief,pipe,point};
