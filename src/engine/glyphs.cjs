'use strict';
// Generic glyphs (first written for an earlier course; reused here as a neutral vocabulary): a college campus, community centre,
// ballot box, speech bubble, megaphone, envelope, inbox row, phone post, poster, calendar, meeting
// table, spreadsheet, sign-up form, class tile, coin, map pin, ID card, sun and moon. Colours come
// from tokens and type from roles; every solid registers through S.actor and every word through
// S.text, so the frame audit, type floors, edge guard and word budget see all of them.
const {T,clamp,lerp}=require('./design.cjs');
const TAU=Math.PI*2;

// A college campus building: a long block with a glass entrance, window bands and a blank sign band
// (never a real logo). Returns its box.
function campus(S,id,x,y,w,h,{owner=null,label=null,labelRole='label',fill=T.paperHi,glow=0}={}) {
  S.actor(id,{x:x-8,y,w:w+16,h},g=>{g.lineJoin='round';g.strokeStyle=T.ink;g.lineWidth=2.5;
    g.fillStyle=fill;g.beginPath();g.rect(x,y+14,w,h-14);g.fill();g.stroke();
    g.fillStyle=T.paperLo;g.beginPath();g.rect(x-8,y,w+16,16);g.fill();g.stroke();
    const ew=Math.min(90,w*.28),ex=x+w*.5-ew/2,eh=h*.42;
    g.fillStyle=glow>0?T.goldSoft:T.blueSoft;g.beginPath();g.rect(ex,y+h-eh,ew,eh);g.fill();g.stroke();
    g.beginPath();g.moveTo(ex+ew/2,y+h-eh);g.lineTo(ex+ew/2,y+h);g.stroke();
    const rows=Math.max(1,Math.floor((h-eh-40)/34)),cols=Math.max(2,Math.floor(w/52));
    for(let r=0;r<rows+1;r++)for(let c=0;c<cols;c++){const wx=x+14+c*(w-28)/cols,wy=y+30+r*34;
      if(wy+20>y+h-eh-6&&Math.abs(wx+(w-28)/cols/2-(x+w/2))<ew/2+14)continue;if(wy+20>y+h-6)continue;
      g.fillStyle=glow>0&&(r+c)%3===0?T.goldSoft:T.wash;g.fillRect(wx,wy,(w-28)/cols-12,20);}
    g.lineWidth=3;g.beginPath();g.moveTo(x-16,y+h);g.lineTo(x+w+16,y+h);g.stroke();},owner);
  if(label)S.text(id+'-l',label,x+w/2,y+h+34,{role:labelRole,align:'center'});
  return {x,y,w,h};
}

// A small community centre: a pitched-roof hall with a door and two windows.
function hall(S,id,cx,base,s=1,{owner=null,fill=T.paperHi}={}) {
  const w=110*s,h=70*s,x=cx-w/2,y=base-h;
  S.actor(id,{x:x-8*s,y:y-38*s,w:w+16*s,h:h+38*s},g=>{g.lineJoin='round';g.strokeStyle=T.ink;g.lineWidth=2.5;g.fillStyle=fill;
    g.beginPath();g.moveTo(x-8*s,y);g.lineTo(cx,y-36*s);g.lineTo(x+w+8*s,y);g.closePath();g.fill();g.stroke();
    g.beginPath();g.rect(x,y,w,h);g.fill();g.stroke();
    g.fillStyle=T.blueSoft;g.beginPath();g.rect(cx-13*s,base-38*s,26*s,38*s);g.fill();g.stroke();
    g.fillStyle=T.wash;g.fillRect(x+12*s,y+16*s,22*s,18*s);g.fillRect(x+w-34*s,y+16*s,22*s,18*s);},owner);
  return {x:x-8*s,y:y-36*s,w:w+16*s,h:h+36*s};
}

// A map pin (solid) with a white centre.
function pin(S,id,cx,tip,s=1,{color=T.ink,owner=null}={}) {
  const r=16*s,cy=tip-34*s;
  S.actor(id,{x:cx-r-2,y:cy-r-2,w:2*r+4,h:tip-cy+r+4},g=>{g.fillStyle=color;g.strokeStyle=T.ink;g.lineWidth=2;
    g.beginPath();g.arc(cx,cy,r,Math.PI*.8,Math.PI*.2);g.lineTo(cx,tip);g.closePath();g.fill();g.stroke();
    g.fillStyle=T.paperHi;g.beginPath();g.arc(cx,cy,r*.42,0,TAU);g.fill();},owner);
}

// A ballot box with a slot; paper (0..1) drops a folded paper through the slot.
function ballot(S,id,cx,cy,s=1,{paper=0,owner=null,label=null}={}) {
  const w=150*s,h=120*s,x=cx-w/2,y=cy-h/2;
  S.actor(id,{x:x-6,y:y-70*s,w:w+12,h:h+70*s},g=>{g.lineJoin='round';g.strokeStyle=T.ink;g.lineWidth=2.5;
    if(paper>0&&paper<1){const py=lerp(y-64*s,y+10*s,clamp(paper));g.save();g.beginPath();g.rect(x-20,y-80*s,w+40,80*s+2);g.clip();
      g.fillStyle=T.paperHi;g.beginPath();g.rect(cx-26*s,py,52*s,40*s);g.fill();g.stroke();g.fillStyle=T.wash;g.fillRect(cx-16*s,py+10*s,32*s,5*s);g.fillRect(cx-16*s,py+21*s,24*s,5*s);g.restore();}
    g.fillStyle=T.paperLo;g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y);g.lineTo(x+w,y+h);g.lineTo(x,y+h);g.closePath();g.fill();g.stroke();
    g.fillStyle=T.paperHi;g.beginPath();g.moveTo(x-6,y-12*s);g.lineTo(x+w+6,y-12*s);g.lineTo(x+w,y);g.lineTo(x,y);g.closePath();g.fill();g.stroke();
    g.fillStyle=T.ink;g.fillRect(cx-34*s,y-8*s,68*s,6*s);
    g.fillStyle=T.wash;g.fillRect(x+18*s,y+h*.45,w-36*s,h*.22);},owner);
  if(label)S.text(id+'-l',label,cx,y+h+30*s,{role:'label',align:'center'});
  return {x,y,w,h};
}

// A speech bubble; tail 'left' | 'right' | 'down' | 'none'. Returns its box (without the tail).
function bubble(S,id,x,y,w,h,{tail='left',fill=T.paperHi,stroke=T.ink,dash=null,owner=null,weight=2.5,tx=null}={}) {
  const r=Math.min(22,h/2);
  S.actor(id,{x:tail==='left'?x-22:x,y,w:w+(tail==='left'||tail==='right'?22:0),h:h+(tail==='down'?22:0)},g=>{g.lineJoin='round';
    g.beginPath();g.roundRect(x,y,w,h,r);
    if(tail==='left'){g.moveTo(x+2,y+h*.55);g.lineTo(x-22,y+h*.85);g.lineTo(x+14,y+h*.78);}
    if(tail==='right'){g.moveTo(x+w-2,y+h*.55);g.lineTo(x+w+22,y+h*.85);g.lineTo(x+w-14,y+h*.78);}
    if(tail==='down'){const bx=tx??x+w*.3;g.moveTo(bx,y+h-2);g.lineTo(bx-6,y+h+22);g.lineTo(bx+22,y+h-2);}
    g.fillStyle=fill;g.fill();g.strokeStyle=stroke;g.lineWidth=weight;if(dash)g.setLineDash(dash);g.stroke();g.setLineDash([]);
    g.beginPath();g.roundRect(x+1.5,y+1.5,w-3,h-3,r);g.fillStyle=fill;g.fill();},owner);
  return {x,y,w,h};
}

// A megaphone pointing in `facing` direction with sound arcs (arcs are decor, p 0..1).
function megaphone(S,id,cx,cy,s=1,{facing=1,owner=null,p=1}={}) {
  const f=facing<0?-1:1;
  S.actor(id,{x:cx-(f>0?50:70)*s,y:cy-48*s,w:120*s,h:96*s},g=>{g.lineJoin='round';g.strokeStyle=T.ink;g.lineWidth=2.5;
    g.fillStyle=T.accentSoft;g.beginPath();g.moveTo(cx-40*f*s,cy-14*s);g.lineTo(cx+40*f*s,cy-44*s);g.lineTo(cx+40*f*s,cy+44*s);g.lineTo(cx-40*f*s,cy+14*s);g.closePath();g.fill();g.stroke();
    g.fillStyle=T.paperHi;g.beginPath();g.rect(Math.min(cx-50*f*s,cx-40*f*s),cy-14*s,10*s,28*s);g.fill();g.stroke();
    g.fillStyle=T.ink;g.beginPath();g.rect(cx-30*f*s-(f<0?0:6*s),cy+12*s,8*s,26*s);g.fill();},owner);
  if(p>0)S.decor(()=>{const g=S.g;g.save();g.strokeStyle=T.accent;g.lineWidth=3.5;g.lineCap='round';
    for(let i=0;i<3;i++){const a=clamp(p*3-i);if(a<=0)continue;g.beginPath();g.arc(cx+44*f*s,cy,(22+i*14)*s,f>0?-.6:Math.PI-.6,f>0?.6:Math.PI+.6);g.stroke();}g.restore();});
}

// An envelope; open (0..1) lifts the flap.
function envelope(S,id,cx,cy,s=1,{open=0,owner=null,fill=T.paperHi}={}) {
  const w=90*s,h=60*s,x=cx-w/2,y=cy-h/2;
  S.actor(id,{x,y:y-open*30*s,w,h:h+open*30*s},g=>{g.lineJoin='round';g.strokeStyle=T.ink;g.lineWidth=2.5;g.fillStyle=fill;
    g.beginPath();g.rect(x,y,w,h);g.fill();g.stroke();
    g.beginPath();g.moveTo(x,y);g.lineTo(cx,y+(open>0?-open*30*s:h*.55));g.lineTo(x+w,y);g.stroke();
    g.beginPath();g.moveTo(x,y+h);g.lineTo(cx-8*s,y+h*.5);g.moveTo(x+w,y+h);g.lineTo(cx+8*s,y+h*.5);g.stroke();},owner);
}

// One inbox row: an initial disc, a sender and a subject. state puts a swatch at the right.
function inboxRow(S,id,x,y,w,{from,subject,time=null,owner=null,fill=T.paperHi,initial=null,disc=T.tealSoft,flag=null,h=78}={}) {
  S.actor(id,{x,y,w,h},g=>{g.beginPath();g.roundRect(x,y,w,h,10);g.fillStyle=fill;g.fill();g.strokeStyle=T.ink;g.lineWidth=2;g.stroke();
    g.fillStyle=disc;g.beginPath();g.arc(x+40,y+h/2,24,0,TAU);g.fill();g.strokeStyle=T.ink;g.lineWidth=2;g.stroke();
    if(flag){g.fillStyle=flag;g.fillRect(x,y+8,7,h-16);}},owner);
  if(initial)S.text(id+'-i',initial,x+40,y+h/2+1,{role:'key',align:'center',owner:id});
  S.text(id+'-s',subject,x+82,y+h/2+1,{role:'label',owner:id});
  if(time)S.text(id+'-tm',time,x+w-18,y+h/2+1,{role:'monoSm',align:'right',color:T.inkSoft,owner:id});
  return {x,y,w,h};
}

// A phone showing one post: a header bar, an image block, then a caption line.
function phonePost(S,id,x,y,w,h,{caption=null,owner=null,image=T.accentSoft,likes=null,captionRole='label'}={}) {
  S.actor(id,{x,y,w,h},g=>{g.lineJoin='round';g.fillStyle=T.ink;g.beginPath();g.roundRect(x,y,w,h,26);g.fill();
    g.fillStyle=T.paperHi;g.beginPath();g.roundRect(x+10,y+30,w-20,h-52,10);g.fill();
    g.fillStyle=T.inkSoft;g.beginPath();g.roundRect(x+w/2-26,y+12,52,7,4);g.fill();
    g.fillStyle=T.tealSoft;g.beginPath();g.arc(x+34,y+56,13,0,TAU);g.fill();g.fillStyle=T.wash;g.fillRect(x+54,y+50,w*.4,10);
    g.fillStyle=image;g.fillRect(x+10,y+80,w-20,(h-52)*.5);},owner);
  if(caption)S.text(id+'-c',caption,x+w/2,(y+80+(h-52)*.5+y+h-22)/2+1,{role:captionRole,align:'center',owner:id});
  return {x,y,w,h};
}

// A poster pinned to a board: a coloured band, a title and rule lines.
function poster(S,id,x,y,w,h,{title=null,band=T.slate,owner=null,titleRole='label',titleColor=T.ink}={}) {
  S.actor(id,{x,y:y-10,w,h:h+10},g=>{g.fillStyle=T.paperHi;g.strokeStyle=T.ink;g.lineWidth=2.5;g.beginPath();g.rect(x,y,w,h);g.fill();g.stroke();
    g.fillStyle=band;g.fillRect(x+12,y+14,w-24,h*.28);
    g.fillStyle=T.wash;for(let i=0;i<3;i++)g.fillRect(x+16,y+h*.62+i*16,(w-32)*(i===2?.55:.9),7);
    g.fillStyle=T.accent;g.beginPath();g.arc(x+w/2,y-2,8,0,TAU);g.fill();g.strokeStyle=T.ink;g.lineWidth=2;g.stroke();},owner);
  if(title)S.text(id+'-t',title,x+w/2,y+h*.5,{role:titleRole,align:'center',owner:id,color:titleColor});
  return {x,y,w,h};
}

// A month calendar: header band with the month, a 7-column grid of `days` cells, marks [{day, fill}]
// fill cells; `today` rings a cell. Cell numbers are drawn only when numbers=true (tertiary type).
function calendar(S,id,x,y,w,h,{month=null,days=30,start=0,marks=[],owner=null,numbers=false,headRole='label'}={}) {
  const rows=Math.ceil((days+start)/7),cw=w/7,top=y+48,ch=(h-48)/rows;
  S.actor(id,{x,y,w,h},g=>{g.lineJoin='round';g.fillStyle=T.paperHi;g.strokeStyle=T.ink;g.lineWidth=2.5;g.beginPath();g.roundRect(x,y,w,h,10);g.fill();g.stroke();
    g.fillStyle=T.paperLo;g.beginPath();g.roundRect(x,y,w,48,[10,10,0,0]);g.fill();g.stroke();
    for(const m of marks){const i=m.day-1+start,c=i%7,r=Math.floor(i/7);g.fillStyle=m.fill;g.globalAlpha*=m.alpha??1;g.fillRect(x+c*cw+3,top+r*ch+3,cw-6,ch-6);g.globalAlpha=1;}
    g.strokeStyle=T.rule;g.lineWidth=1.5;for(let c=1;c<7;c++){g.beginPath();g.moveTo(x+c*cw,top);g.lineTo(x+c*cw,y+h);g.stroke();}
    for(let r=1;r<rows;r++){g.beginPath();g.moveTo(x,top+r*ch);g.lineTo(x+w,top+r*ch);g.stroke();}},owner);
  if(month)S.text(id+'-m',month,x+w/2,y+25,{role:headRole,align:'center',owner:id});
  if(numbers)for(let d=1;d<=days;d++){const i=d-1+start;S.text(id+'-d'+d,String(d),x+(i%7)*cw+cw/2,top+Math.floor(i/7)*ch+ch/2,{role:'small',align:'center',owner:id,color:T.inkSoft});}
  return {x,y,w,h,cell:(d)=>{const i=d-1+start;return {x:x+(i%7)*cw,y:top+Math.floor(i/7)*ch,w:cw,h:ch};}};
}

// A meeting table seen from the front: a long top and legs; people stand or sit behind it.
function table(S,id,cx,y,w,{owner=null}={}) {
  S.actor(id,{x:cx-w/2,y,w,h:70},g=>{g.lineJoin='round';g.strokeStyle=T.ink;g.lineWidth=2.5;g.fillStyle=T.paperLo;
    g.beginPath();g.rect(cx-w/2,y,w,18);g.fill();g.stroke();g.fillStyle=T.ink;g.fillRect(cx-w/2+20,y+18,10,52);g.fillRect(cx+w/2-30,y+18,10,52);},owner);
}

// A spreadsheet: column widths, a header row of kickers, then rows of cells. rows: [{cells:[...], fill, alpha}]
// Cell text uses `cellRole` (label by default). Returns the grid geometry.
function sheet(S,id,x,y,cols,{header=[],rows=[],rowH=54,headH=46,owner=null,cellRole='label',headRole='kicker',fill=T.paperHi,title=null}={}) {
  const w=cols.reduce((a,b)=>a+b,0),h=headH+rows.length*rowH,xs=[x];cols.forEach((c,i)=>xs.push(xs[i]+c));
  S.actor(id,{x,y,w,h},g=>{g.fillStyle=fill;g.strokeStyle=T.ink;g.lineWidth=2.5;g.beginPath();g.rect(x,y,w,h);g.fill();
    g.fillStyle=T.paperLo;g.fillRect(x,y,w,headH);
    rows.forEach((r,i)=>{if(r.fill){g.save();g.globalAlpha*=r.fillAlpha??1;g.fillStyle=r.fill;g.fillRect(x,y+headH+i*rowH,w,rowH);g.restore();}});
    g.strokeStyle=T.rule;g.lineWidth=1.5;for(let i=1;i<cols.length;i++){g.beginPath();g.moveTo(xs[i],y);g.lineTo(xs[i],y+h);g.stroke();}
    for(let r=0;r<rows.length;r++){g.beginPath();g.moveTo(x,y+headH+r*rowH);g.lineTo(x+w,y+headH+r*rowH);g.stroke();}
    g.strokeStyle=T.ink;g.lineWidth=2.5;g.beginPath();g.rect(x,y,w,h);g.stroke();},owner);
  header.forEach((t,i)=>{if(t)S.text(`${id}-h${i}`,t,xs[i]+14,y+headH/2+1,{role:headRole,owner:id});});
  rows.forEach((r,ri)=>r.cells.forEach((c,ci)=>{if(c==null||c==='')return;const a=r.alpha??1;if(a<=0)return;
    S.fade(a,()=>S.text(`${id}-r${ri}c${ci}`,c,xs[ci]+14,y+headH+ri*rowH+rowH/2+1,{role:r.role||cellRole,owner:id,color:r.color||T.ink}));}));
  return {x,y,w,h,xs,rowY:i=>y+headH+i*rowH,rowH,headH};
}

// A sign-up form: a title strip and labelled field boxes. fields: [{label, value, p}] (value appears with p).
function form(S,id,x,y,w,{title=null,fields=[],fieldH=44,gap=78,owner=null}={}) {
  const h=70+fields.length*gap;
  S.actor(id,{x,y,w,h},g=>{g.fillStyle=T.paperHi;g.strokeStyle=T.ink;g.lineWidth=2.5;g.beginPath();g.roundRect(x,y,w,h,12);g.fill();g.stroke();
    g.fillStyle=T.ink;g.beginPath();g.roundRect(x,y,w,12,[12,12,0,0]);g.fill();
    fields.forEach((f,i)=>{const fy=y+70+i*gap+gap-fieldH-8;g.fillStyle=f.fill||T.paper;g.strokeStyle=f.stroke||T.inkSoft;g.lineWidth=2;g.beginPath();g.roundRect(x+20,fy,w-40,fieldH,6);g.fill();g.stroke();});},owner);
  if(title)S.text(id+'-t',title,x+20,y+38,{role:'label',owner:id});
  fields.forEach((f,i)=>{const fy=y+70+i*gap+gap-fieldH-8;
    S.text(`${id}-f${i}`,f.label,x+22,fy-20,{role:'small',owner:id,color:T.inkSoft});
    if(f.value&&(f.p??1)>0)S.fade(f.p??1,()=>S.text(`${id}-v${i}`,f.value,x+34,fy+fieldH/2+1,{role:f.role||'label',owner:id}));});
  return {x,y,w,h,field:i=>({x:x+20,y:y+70+i*gap+gap-fieldH-8,w:w-40,h:fieldH})};
}

// A class tile: a state box (represented / vacant) with three small heads; a label underneath if given.
function classTile(S,id,x,y,w,h,{state='vacant',p=1,owner=null,label=null,alpha=1,rep=0}={}) {
  S.stateBox(id,state,x,y,w,h,{p,owner,alpha});
  S.decor(()=>{const g=S.g;g.save();g.globalAlpha*=alpha;const cy=y+h*.58;
    for(let i=0;i<3;i++){const hx=x+w*(.28+i*.22);g.fillStyle=state==='represented'&&i===1&&rep>0?T.white:T.paperHi;g.strokeStyle=T.ink;g.lineWidth=1.5;
      g.beginPath();g.arc(hx,cy-h*.14,h*.11,0,TAU);g.fill();g.stroke();g.beginPath();g.arc(hx,cy+h*.2,h*.17,Math.PI,0);g.fill();g.stroke();}
    g.restore();});
  if(label)S.text(id+'-l',label,x+w/2,y+h+22,{role:'small',align:'center',owner});
}

// A coin marked with a pound sign.
function coin(S,id,cx,cy,r=30,{owner=null}={}) {
  S.actor(id,{x:cx-r,y:cy-r,w:2*r,h:2*r},g=>{g.fillStyle=T.goldInk;g.strokeStyle=T.ink;g.lineWidth=2.5;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();g.stroke();
    g.strokeStyle=T.paperHi;g.lineWidth=2;g.beginPath();g.arc(cx,cy,r*.74,0,TAU);g.stroke();},owner);
  S.text(id+'-s','$',cx,cy+2,{role:'key',align:'center',owner:id,color:T.white});
}

// An ID card on a lanyard (PVG, staff pass): photo square, two lines and a clip.
function idCard(S,id,cx,cy,s=1,{owner=null,band=T.teal,label=null}={}) {
  const w=150*s,h=100*s,x=cx-w/2,y=cy-h/2;
  S.actor(id,{x,y:y-60*s,w,h:h+60*s},g=>{g.strokeStyle=T.ink;g.lineWidth=2.5;g.lineJoin='round';
    g.beginPath();g.moveTo(cx-30*s,y-60*s);g.lineTo(cx,y-6*s);g.lineTo(cx+30*s,y-60*s);g.stroke();
    g.fillStyle=T.paperHi;g.beginPath();g.roundRect(x,y,w,h,10*s);g.fill();g.stroke();
    g.fillStyle=band;g.fillRect(x+2,y+2,w-4,18*s);
    g.fillStyle=T.wash;g.fillRect(x+14*s,y+30*s,46*s,56*s);g.fillRect(x+72*s,y+40*s,62*s,9*s);g.fillRect(x+72*s,y+60*s,48*s,9*s);
    g.fillStyle=T.ink;g.fillRect(cx-10*s,y-10*s,20*s,10*s);},owner);
  if(label)S.text(id+'-l',label,cx,y+h+28*s,{role:'label',align:'center'});
  return {x,y,w,h};
}

// Day and evening markers: a sun and a crescent moon.
function sun(S,id,cx,cy,r=22,{owner=null}={}) {
  S.actor(id,{x:cx-r*1.7,y:cy-r*1.7,w:r*3.4,h:r*3.4},g=>{g.fillStyle=T.goldSoft;g.strokeStyle=T.goldInk;g.lineWidth=2.5;g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();g.stroke();
    g.lineCap='round';for(let i=0;i<8;i++){const a=i/8*TAU;g.beginPath();g.moveTo(cx+Math.cos(a)*r*1.3,cy+Math.sin(a)*r*1.3);g.lineTo(cx+Math.cos(a)*r*1.65,cy+Math.sin(a)*r*1.65);g.stroke();}},owner);
}
function moon(S,id,cx,cy,r=22,{owner=null,ground=null}={}) {
  S.actor(id,{x:cx-r,y:cy-r,w:2*r,h:2*r},g=>{g.fillStyle=T.blueSoft;g.strokeStyle=T.blue;g.lineWidth=2.5;
    g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();g.stroke();
    g.fillStyle=ground||(S.night?T.night:T.paper);g.beginPath();g.arc(cx+r*.48,cy-r*.3,r*.86,0,TAU);g.fill();},owner);
}

module.exports={campus,hall,pin,ballot,bubble,megaphone,envelope,inboxRow,phonePost,poster,calendar,table,sheet,form,classTile,coin,idCard,sun,moon};
