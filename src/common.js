/* ================= BassLab 共用引擎 =================
   音訊合成（貝斯 / 鋼琴音色）、鋼琴鍵盤與貝斯指板元件、播放排程
====================================================== */
"use strict";

/* ---------- 音名工具 ---------- */
const NOTE_NAMES_SHARP = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const NOTE_NAMES_FLAT  = ["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"];
function midiToName(m, flat){ return (flat?NOTE_NAMES_FLAT:NOTE_NAMES_SHARP)[((m%12)+12)%12]; }
function midiToNameOct(m, flat){ return midiToName(m,flat) + (Math.floor(m/12)-1); }
function midiToFreq(m){ return 440 * Math.pow(2,(m-69)/12); }
function nameToPc(name){
  const base={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  let pc = base[name[0]];
  for(let i=1;i<name.length;i++){ if(name[i]==="#")pc++; if(name[i]==="b")pc--; }
  return ((pc%12)+12)%12;
}

/* ---------- 音訊引擎 ---------- */
const AudioEngine = (() => {
  let ctx = null, master = null, silentEl = null;
  /* iOS Safari：Web Audio 預設走「鈴聲」音訊類別，手機切靜音就完全無聲。
     播放一個無聲的 <audio>（媒體類別）可把整頁音訊切到「媒體播放」，
     靜音鍵就不會蓋掉聲音。 */
  const SILENT_WAV="data:audio/wav;base64,UklGRkQDAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YSADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";
  function iosUnlock(){
    try{
      if(!silentEl){
        silentEl=document.createElement("audio");
        silentEl.setAttribute("playsinline","");
        silentEl.loop=true;
        silentEl.src=SILENT_WAV;
      }
      if(silentEl.paused) silentEl.play().catch(()=>{});
    }catch(e){}
  }
  function ensure(){
    if(!ctx){
      ctx = new (window.AudioContext||window.webkitAudioContext)();
      master = ctx.createGain();
      master.gain.value = 0.9;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 6;
      master.connect(comp); comp.connect(ctx.destination);
    }
    iosUnlock();
    if(ctx.state!=="running"){ try{ctx.resume();}catch(e){} }
    return ctx;
  }
  /* iOS：來電、切換 App 或鎖屏後音訊會被中斷，回到頁面／再次觸碰時自動恢復 */
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden && ctx && ctx.state!=="running"){ try{ctx.resume();}catch(e){} }
  });
  ["touchend","click"].forEach(evt=>{
    document.addEventListener(evt,()=>{
      if(ctx){ iosUnlock(); if(ctx.state!=="running"){ try{ctx.resume();}catch(e){} } }
    },{passive:true});
  });
  /* 貝斯撥弦音色：saw+sub sine、低通濾波、快速起音長衰減 */
  function bass(midi, when, dur, vel){
    const c = ensure();
    const t = (when===undefined||when===null)? c.currentTime+0.02 : when;
    dur = dur || 0.9; vel = vel===undefined?1:vel;
    const f = midiToFreq(midi);
    const o1 = c.createOscillator(); o1.type="sawtooth"; o1.frequency.value=f;
    const o2 = c.createOscillator(); o2.type="sine"; o2.frequency.value=f;
    const o3 = c.createOscillator(); o3.type="square"; o3.frequency.value=f*2; // 泛音一點點
    const g1=c.createGain(), g2=c.createGain(), g3=c.createGain();
    g1.gain.value=0.5; g2.gain.value=0.85; g3.gain.value=0.06;
    const filt=c.createBiquadFilter(); filt.type="lowpass"; filt.Q.value=2;
    filt.frequency.setValueAtTime(Math.min(f*9,3200), t);
    filt.frequency.exponentialRampToValueAtTime(Math.max(f*1.6,120), t+Math.min(dur*0.75,0.7));
    const amp=c.createGain();
    const peak=0.5*vel;
    amp.gain.setValueAtTime(0.0001,t);
    amp.gain.exponentialRampToValueAtTime(peak, t+0.012);
    amp.gain.exponentialRampToValueAtTime(peak*0.5, t+Math.min(0.25,dur*0.4));
    amp.gain.exponentialRampToValueAtTime(0.0001, t+dur);
    o1.connect(g1); o2.connect(g2); o3.connect(g3);
    g1.connect(filt); g3.connect(filt); filt.connect(amp); g2.connect(amp);
    amp.connect(master);
    [o1,o2,o3].forEach(o=>{o.start(t); o.stop(t+dur+0.05);});
  }
  /* 鋼琴風音色：多泛音三角波 + 衰減 */
  function piano(midi, when, dur, vel){
    const c = ensure();
    const t = (when===undefined||when===null)? c.currentTime+0.02 : when;
    dur = dur || 1.1; vel = vel===undefined?1:vel;
    const f = midiToFreq(midi);
    const amp=c.createGain();
    const peak=0.30*vel;
    amp.gain.setValueAtTime(0.0001,t);
    amp.gain.exponentialRampToValueAtTime(peak,t+0.008);
    amp.gain.exponentialRampToValueAtTime(peak*0.35,t+Math.min(0.35,dur*0.5));
    amp.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    amp.connect(master);
    const partials=[[1,1],[2,0.4],[3,0.18],[4,0.09],[5,0.05]];
    partials.forEach(([n,g])=>{
      if(f*n>9000)return;
      const o=c.createOscillator();
      o.type = n===1 ? "triangle" : "sine";
      o.frequency.value=f*n;
      const og=c.createGain(); og.gain.value=g;
      o.connect(og); og.connect(amp);
      o.start(t); o.stop(t+dur+0.05);
    });
  }
  /* 節拍器 click */
  function click(when, accent){
    const c = ensure();
    const t = (when===undefined||when===null)? c.currentTime+0.02 : when;
    const o=c.createOscillator(); o.type="square";
    o.frequency.value = accent? 1550: 990;
    const g=c.createGain();
    const pk = accent? 0.4: 0.22;
    g.gain.setValueAtTime(pk,t);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.07);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t+0.09);
  }
  function drum(when, kind){ // kick / snare / hhc(閉合鈸) / hho(開放鈸) 簡易合成
    const c=ensure();
    const t=(when===undefined||when===null)?c.currentTime+0.02:when;
    if(kind==="kick"){
      const o=c.createOscillator(); o.type="sine";
      o.frequency.setValueAtTime(140,t);
      o.frequency.exponentialRampToValueAtTime(45,t+0.12);
      const g=c.createGain();
      g.gain.setValueAtTime(0.9,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.22);
      o.connect(g); g.connect(master); o.start(t); o.stop(t+0.25);
    }else if(kind==="hhc"||kind==="hho"||kind==="hhp"){
      /* hhc=閉合鈸(手) hho=開放鈸 hhp=踩鈸(腳踏, 較悶較短) */
      const dur = kind==="hho"? 0.38 : (kind==="hhp"? 0.045 : 0.06);
      const len=Math.ceil(c.sampleRate*(dur+0.02));
      const buf=c.createBuffer(1,len,c.sampleRate);
      const d=buf.getChannelData(0);
      for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
      const src=c.createBufferSource(); src.buffer=buf;
      const hp=c.createBiquadFilter(); hp.type="highpass";
      hp.frequency.value = kind==="hhp"? 4800 : 7500;
      const g=c.createGain();
      const pk = kind==="hho"? 0.20 : (kind==="hhp"? 0.16 : 0.24);
      g.gain.setValueAtTime(pk,t);
      g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      src.connect(hp); hp.connect(g); g.connect(master);
      src.start(t); src.stop(t+dur+0.02);
    }else{
      const len=c.sampleRate*0.15;
      const buf=c.createBuffer(1,len,c.sampleRate);
      const d=buf.getChannelData(0);
      for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2);
      const src=c.createBufferSource(); src.buffer=buf;
      const bp=c.createBiquadFilter(); bp.type="highpass"; bp.frequency.value=1800;
      const g=c.createGain(); g.gain.value=0.5;
      src.connect(bp); bp.connect(g); g.connect(master); src.start(t);
    }
  }
  function now(){ return ensure().currentTime; }
  return { bass, piano, click, drum, now, ensure };
})();

/* ---------- 排程器：播放序列並同步視覺 ----------
   events: [{time(秒,相對), dur, fn(播放函式), hl(視覺callback)}]
   回傳 stop()                                          */
const Player = (()=>{
  let timers=[]; let active=false;
  function stop(){
    timers.forEach(id=>clearTimeout(id));
    timers=[]; active=false;
    document.querySelectorAll(".is-playing-btn").forEach(b=>b.classList.remove("is-playing-btn"));
  }
  function play(events, onDone){
    stop();
    active=true;
    const t0 = AudioEngine.now()+0.08;
    let end=0;
    events.forEach(ev=>{
      if(ev.fn) ev.fn(t0+ev.time);
      if(ev.hl){
        timers.push(setTimeout(()=>{ if(active) ev.hl(); }, Math.max(0,(ev.time)*1000+80)));
      }
      end=Math.max(end, ev.time+(ev.dur||0.5));
    });
    timers.push(setTimeout(()=>{ active=false; if(onDone)onDone(); }, end*1000+300));
    return stop;
  }
  return {play, stop, isActive:()=>active};
})();

/* ---------- 鋼琴鍵盤元件 ----------
   makePiano(el, opts)
   opts: startMidi(白鍵起點,建議C), octaves, onClick(midi), showLabels("none"|"white"|"all"|"letter")
   回傳 api: highlight(map: midi->{color,label}), clear(), flash(midi), rootStyle
------------------------------------------------- */
function makePiano(el, opts){
  opts=opts||{};
  const octaves=opts.octaves||2;
  const startMidi=opts.startMidi||48; // C3
  const showLabels=opts.showLabels||"white";
  const keyW=opts.keyW||44, keyH=opts.keyH||150;
  const nWhite=octaves*7+1;
  const W=nWhite*keyW+2, H=keyH+34;
  const svgNS="http://www.w3.org/2000/svg";
  const svg=document.createElementNS(svgNS,"svg");
  svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
  svg.setAttribute("width",Math.min(W, 900));
  el.classList.add("instrument");
  el.appendChild(svg);
  const whitePcs=[0,2,4,5,7,9,11];
  const keys=[]; // {midi, rect, label, isBlack, baseFill}
  // 白鍵
  let wi=0;
  const total=octaves*12+1;
  for(let i=0;i<total;i++){
    const midi=startMidi+i;
    if(whitePcs.includes(midi%12)){
      const x=wi*keyW;
      const r=document.createElementNS(svgNS,"rect");
      r.setAttribute("x",x+1);r.setAttribute("y",1);
      r.setAttribute("width",keyW-2);r.setAttribute("height",keyH);
      r.setAttribute("rx",4);
      r.setAttribute("fill","#f2f2f0");r.setAttribute("stroke","#999");
      r.classList.add("clickable");
      svg.appendChild(r);
      const t=document.createElementNS(svgNS,"text");
      t.setAttribute("x",x+keyW/2);t.setAttribute("y",keyH-10);
      t.setAttribute("text-anchor","middle");t.setAttribute("font-size","13");
      t.setAttribute("fill","#555");t.setAttribute("font-weight","600");
      t.textContent=(showLabels==="white"||showLabels==="all")?midiToName(midi):"";
      svg.appendChild(t);
      const sub=document.createElementNS(svgNS,"text");
      sub.setAttribute("x",x+keyW/2);sub.setAttribute("y",keyH+22);
      sub.setAttribute("text-anchor","middle");sub.setAttribute("font-size","12");
      sub.setAttribute("fill","var(--accent)");sub.setAttribute("font-weight","700");
      svg.appendChild(sub);
      keys.push({midi,rect:r,label:t,sub,isBlack:false,baseFill:"#f2f2f0"});
      wi++;
    }
  }
  // 黑鍵
  wi=0;
  for(let i=0;i<total;i++){
    const midi=startMidi+i;
    if(whitePcs.includes(midi%12)){ wi++; continue; }
    const x=wi*keyW - keyW*0.32;
    const r=document.createElementNS(svgNS,"rect");
    r.setAttribute("x",x);r.setAttribute("y",1);
    r.setAttribute("width",keyW*0.64);r.setAttribute("height",keyH*0.62);
    r.setAttribute("rx",3);
    r.setAttribute("fill","#1c1c22");r.setAttribute("stroke","#000");
    r.classList.add("clickable");
    svg.appendChild(r);
    const t=document.createElementNS(svgNS,"text");
    t.setAttribute("x",x+keyW*0.32);t.setAttribute("y",keyH*0.62-8);
    t.setAttribute("text-anchor","middle");t.setAttribute("font-size","10");
    t.setAttribute("fill","#bbb");
    t.textContent=(showLabels==="all")?midiToName(midi):"";
    svg.appendChild(t);
    const sub=document.createElementNS(svgNS,"text");
    sub.setAttribute("x",x+keyW*0.32);sub.setAttribute("y",keyH*0.62-22);
    sub.setAttribute("text-anchor","middle");sub.setAttribute("font-size","11");
    sub.setAttribute("fill","#ffd479");sub.setAttribute("font-weight","700");
    svg.appendChild(sub);
    keys.push({midi,rect:r,label:t,sub,isBlack:true,baseFill:"#1c1c22"});
  }
  const byMidi={}; keys.forEach(k=>byMidi[k.midi]=k);
  function flash(midi,color){
    const k=byMidi[midi]; if(!k)return;
    const prev=k.rect.getAttribute("fill");
    k.rect.setAttribute("fill",color||"#f5a623");
    setTimeout(()=>{ k.rect.setAttribute("fill", k._hold || k.baseFill); },260);
  }
  keys.forEach(k=>{
    k.rect.addEventListener("pointerdown",()=>{
      AudioEngine.piano(k.midi);
      flash(k.midi,"#f5a623");
      if(opts.onClick)opts.onClick(k.midi);
    });
  });
  function clear(){
    keys.forEach(k=>{ k._hold=null; k.rect.setAttribute("fill",k.baseFill); k.sub.textContent=""; });
  }
  function highlight(map){ // {midi: {color,label}}
    clear();
    Object.keys(map).forEach(m=>{
      const k=byMidi[m]; if(!k)return;
      const conf=map[m];
      k._hold=conf.color|| (k.isBlack? "#c07f1a":"#ffd479");
      k.rect.setAttribute("fill",k._hold);
      if(conf.label!==undefined) k.sub.textContent=conf.label;
    });
  }
  return {highlight, clear, flash, keys, byMidi, svg};
}

/* ---------- 貝斯指板元件 ----------
   makeFretboard(el, opts)
   opts: frets, onClick(midi,string,fret), showNames("none"|"natural"|"all"), height
   四弦: 由上而下 G D A E（同 TAB）
   回傳 api: highlight(list:[{string(0=G..3=E)|midi, fret, color, label}]), byPos, clear, flash
------------------------------------------------- */
const OPEN_STRINGS=[31,26,21,16]; // 反過來顯示: G2? -> 實際 bass: E1=28? 標準四弦貝斯 E1(41Hz)=MIDI28, A1=33, D2=38, G2=43
// 由上而下 G D A E:
const BASS_OPEN=[43,38,33,28];
const BASS_STRING_NAMES=["G","D","A","E"];
function makeFretboard(el, opts){
  opts=opts||{};
  const frets=opts.frets||12;
  const showNames=opts.showNames||"none";
  const nutW=46, fretW=opts.fretW||62, rowH=40, padT=26, padB=30, padL=8;
  const W=padL+nutW+frets*fretW+14, H=padT+rowH*3+padB+22;
  const svgNS="http://www.w3.org/2000/svg";
  const svg=document.createElementNS(svgNS,"svg");
  svg.setAttribute("viewBox",`0 0 ${W} ${H}`);
  svg.setAttribute("width",Math.min(W,940));
  el.classList.add("instrument");
  el.appendChild(svg);
  // 指板底
  const board=document.createElementNS(svgNS,"rect");
  board.setAttribute("x",padL+nutW);board.setAttribute("y",padT-14);
  board.setAttribute("width",frets*fretW);board.setAttribute("height",rowH*3+28);
  board.setAttribute("fill","#3a2a1c");board.setAttribute("rx",4);
  svg.appendChild(board);
  // 琴枕
  const nut=document.createElementNS(svgNS,"rect");
  nut.setAttribute("x",padL+nutW-5);nut.setAttribute("y",padT-14);
  nut.setAttribute("width",6);nut.setAttribute("height",rowH*3+28);
  nut.setAttribute("fill","#d8d3c5");
  svg.appendChild(nut);
  // 琴格線
  for(let f=1;f<=frets;f++){
    const x=padL+nutW+f*fretW;
    const l=document.createElementNS(svgNS,"line");
    l.setAttribute("x1",x);l.setAttribute("y1",padT-14);
    l.setAttribute("x2",x);l.setAttribute("y2",padT+rowH*3+14);
    l.setAttribute("stroke","#6e5a41");l.setAttribute("stroke-width",2.5);
    svg.appendChild(l);
    // 格數字
    const t=document.createElementNS(svgNS,"text");
    t.setAttribute("x",x-fretW/2);t.setAttribute("y",H-6);
    t.setAttribute("text-anchor","middle");t.setAttribute("font-size","12");
    t.setAttribute("fill","#8a93a5");
    t.textContent=f;
    svg.appendChild(t);
  }
  // 定位點
  [3,5,7,9].forEach(f=>{
    const c=document.createElementNS(svgNS,"circle");
    c.setAttribute("cx",padL+nutW+(f-0.5)*fretW);
    c.setAttribute("cy",padT+rowH*1.5);
    c.setAttribute("r",5.5);c.setAttribute("fill","#8b775e");
    svg.appendChild(c);
  });
  if(frets>=12){
    [padT+rowH*0.5,padT+rowH*2.5].forEach(cy=>{
      const c=document.createElementNS(svgNS,"circle");
      c.setAttribute("cx",padL+nutW+11.5*fretW);
      c.setAttribute("cy",cy);
      c.setAttribute("r",5.5);c.setAttribute("fill","#8b775e");
      svg.appendChild(c);
    });
  }
  // 弦
  for(let s=0;s<4;s++){
    const y=padT+s*rowH;
    const l=document.createElementNS(svgNS,"line");
    l.setAttribute("x1",padL+nutW-5);l.setAttribute("y1",y);
    l.setAttribute("x2",padL+nutW+frets*fretW);l.setAttribute("y2",y);
    l.setAttribute("stroke","#cfc8b8");l.setAttribute("stroke-width",1.4+s*0.9);
    svg.appendChild(l);
    // 弦名
    const t=document.createElementNS(svgNS,"text");
    t.setAttribute("x",padL+14);t.setAttribute("y",y+5);
    t.setAttribute("text-anchor","middle");t.setAttribute("font-size","15");
    t.setAttribute("font-weight","700");
    t.setAttribute("fill", "#f5a623");
    t.textContent=BASS_STRING_NAMES[s];
    svg.appendChild(t);
  }
  // 音位（含 open=fret0）
  const cells={}; // key "s_f" -> {circle,text,midi}
  for(let s=0;s<4;s++){
    for(let f=0;f<=frets;f++){
      const midi=BASS_OPEN[s]+f;
      const cx = f===0? padL+nutW-16 : padL+nutW+(f-0.5)*fretW;
      const cy = padT+s*rowH;
      const g=document.createElementNS(svgNS,"g");
      g.classList.add("clickable");
      const c=document.createElementNS(svgNS,"circle");
      c.setAttribute("cx",cx);c.setAttribute("cy",cy);c.setAttribute("r",13.5);
      c.setAttribute("fill","transparent");
      c.setAttribute("stroke","transparent");
      const t=document.createElementNS(svgNS,"text");
      t.setAttribute("x",cx);t.setAttribute("y",cy+4);
      t.setAttribute("text-anchor","middle");t.setAttribute("font-size","11.5");
      t.setAttribute("font-weight","700");t.setAttribute("fill","transparent");
      const nm=midiToName(midi);
      if(showNames==="all" || (showNames==="natural" && nm.length===1)){
        c.setAttribute("fill","rgba(255,255,255,0.10)");
        t.setAttribute("fill","#e8ecf4"); t.textContent=nm;
      }
      g.appendChild(c);g.appendChild(t);
      svg.appendChild(g);
      const cell={circle:c,text:t,midi,s,f,baseShown:(showNames==="all"||(showNames==="natural"&&nm.length===1))};
      cells[s+"_"+f]=cell;
      g.addEventListener("pointerdown",()=>{
        AudioEngine.bass(midi);
        flashCell(cell);
        if(opts.onClick)opts.onClick(midi,s,f);
      });
    }
  }
  function flashCell(cell,color){
    const pc=cell.circle.getAttribute("fill"), pt=cell.text.getAttribute("fill"), ptxt=cell.text.textContent;
    cell.circle.setAttribute("fill",color||"#f5a623");
    cell.text.setAttribute("fill","#141414");
    cell.text.textContent=midiToName(cell.midi);
    setTimeout(()=>{
      if(cell._hold){ applyHold(cell); }
      else{
        cell.circle.setAttribute("fill",pc==="#f5a623"?"transparent":pc);
        cell.text.setAttribute("fill",pt);
        cell.text.textContent=ptxt;
      }
    },280);
  }
  function applyHold(cell){
    cell.circle.setAttribute("fill",cell._hold.color);
    cell.circle.setAttribute("stroke",cell._hold.stroke||"transparent");
    cell.circle.setAttribute("stroke-width",2.5);
    cell.text.setAttribute("fill",cell._hold.tcolor||"#141414");
    cell.text.textContent=cell._hold.label!==undefined?cell._hold.label:midiToName(cell.midi);
  }
  function clear(){
    Object.values(cells).forEach(cell=>{
      cell._hold=null;
      const nm=midiToName(cell.midi);
      if(cell.baseShown){
        cell.circle.setAttribute("fill","rgba(255,255,255,0.10)");
        cell.text.setAttribute("fill","#e8ecf4");cell.text.textContent=nm;
      }else{
        cell.circle.setAttribute("fill","transparent");
        cell.text.setAttribute("fill","transparent");
      }
      cell.circle.setAttribute("stroke","transparent");
    });
  }
  function highlight(list){
    clear();
    list.forEach(item=>{
      const cell=cells[item.string+"_"+item.fret];
      if(!cell)return;
      cell._hold={color:item.color||"#f5a623",label:item.label,tcolor:item.tcolor,stroke:item.stroke};
      applyHold(cell);
    });
  }
  function flashPos(s,f,color){ const cell=cells[s+"_"+f]; if(cell)flashCell(cell,color); }
  return {highlight,clear,flashPos,cells,svg,frets};
}

/* 在指板上找音（優先低把位）：回傳 {string,fret,midi} */
function findOnFretboard(midi, maxFret){
  maxFret=maxFret||12;
  for(let s=3;s>=0;s--){ // 從 E 弦(最低)找
    const f=midi-BASS_OPEN[s];
    if(f>=0&&f<=maxFret) return {string:s,fret:f,midi};
  }
  return null;
}
/* 音階在指板上的所有位置 */
function scaleOnFretboard(rootPc, intervals, maxFret){
  maxFret=maxFret||12;
  const pcs=intervals.map(iv=>(rootPc+iv)%12);
  const out=[];
  for(let s=0;s<4;s++){
    for(let f=0;f<=maxFret;f++){
      const midi=BASS_OPEN[s]+f;
      const pc=midi%12;
      const idx=pcs.indexOf(pc);
      if(idx>=0) out.push({string:s,fret:f,midi,degree:idx});
    }
  }
  return out;
}

/* ---------- 常用資料 ---------- */
const SCALES={
  major:      {name:"大調音階", iv:[0,2,4,5,7,9,11], formula:"W–W–H–W–W–W–H", deg:["1","2","3","4","5","6","7"]},
  minor:      {name:"自然小調", iv:[0,2,3,5,7,8,10], formula:"W–H–W–W–H–W–W", deg:["1","2","b3","4","5","b6","b7"]},
  majPent:    {name:"大調五聲", iv:[0,2,4,7,9],      formula:"W–W–WH–W–WH",   deg:["1","2","3","5","6"]},
  minPent:    {name:"小調五聲", iv:[0,3,5,7,10],     formula:"WH–W–W–WH–W",   deg:["1","b3","4","5","b7"]},
  blues:      {name:"藍調音階", iv:[0,3,5,6,7,10],   formula:"WH–W–H–H–WH–W", deg:["1","b3","4","b5","5","b7"]},
  harmMinor:  {name:"和聲小調", iv:[0,2,3,5,7,8,11], formula:"W–H–W–W–H–WH–H",deg:["1","2","b3","4","5","b6","7"]},
  melMinor:   {name:"旋律小調", iv:[0,2,3,5,7,9,11], formula:"W–H–W–W–W–W–H", deg:["1","2","b3","4","5","6","7"]},
  chromatic:  {name:"半音階",   iv:[0,1,2,3,4,5,6,7,8,9,10,11], formula:"H×12", deg:null}
};
const MODES={
  ionian:    {name:"Ionian（伊奧尼安）",   iv:[0,2,4,5,7,9,11], deg:"1-2-3-4-5-6-7",        desc:"就是大調音階本身，明亮、穩定。"},
  dorian:    {name:"Dorian（多利安）",     iv:[0,2,3,5,7,9,10], deg:"1-2-b3-4-5-6-b7",      desc:"小調色彩但帶大六度，爵士、放克常用。"},
  phrygian:  {name:"Phrygian（弗里吉安）", iv:[0,1,3,5,7,8,10], deg:"1-b2-b3-4-5-b6-b7",    desc:"b2 帶來西班牙／異國風味。"},
  lydian:    {name:"Lydian（利底安）",     iv:[0,2,4,6,7,9,11], deg:"1-2-3-#4-5-6-7",       desc:"#4 帶來夢幻、飄浮感。"},
  mixolydian:{name:"Mixolydian（混合利底安）",iv:[0,2,4,5,7,9,10],deg:"1-2-3-4-5-6-b7",     desc:"大調但 b7，藍調、搖滾必備。"},
  aeolian:   {name:"Aeolian（伊奧利安）",  iv:[0,2,3,5,7,8,10], deg:"1-2-b3-4-5-b6-b7",     desc:"就是自然小調，憂鬱、內斂。"},
  locrian:   {name:"Locrian（洛克里安）",  iv:[0,1,3,5,6,8,10], deg:"1-b2-b3-4-b5-b6-b7",   desc:"含 b5，最不穩定、最黑暗的調式。"}
};
const CHORDS={
  maj:  {name:"大三和弦",  sym:"",     iv:[0,4,7],      f:"1-3-5"},
  min:  {name:"小三和弦",  sym:"m",    iv:[0,3,7],      f:"1-b3-5"},
  dim:  {name:"減三和弦",  sym:"dim",  iv:[0,3,6],      f:"1-b3-b5"},
  aug:  {name:"增三和弦",  sym:"aug",  iv:[0,4,8],      f:"1-3-#5"},
  sus2: {name:"掛二和弦",  sym:"sus2", iv:[0,2,7],      f:"1-2-5"},
  sus4: {name:"掛四和弦",  sym:"sus4", iv:[0,5,7],      f:"1-4-5"},
  p5:   {name:"強力和弦",  sym:"5",    iv:[0,7],        f:"1-5"},
  maj7: {name:"大七和弦",  sym:"maj7", iv:[0,4,7,11],   f:"1-3-5-7"},
  m7:   {name:"小七和弦",  sym:"m7",   iv:[0,3,7,10],   f:"1-b3-5-b7"},
  dom7: {name:"屬七和弦",  sym:"7",    iv:[0,4,7,10],   f:"1-3-5-b7"},
  m7b5: {name:"半減七和弦",sym:"m7b5", iv:[0,3,6,10],   f:"1-b3-b5-b7"},
  dim7: {name:"減七和弦",  sym:"dim7", iv:[0,3,6,9],    f:"1-b3-b5-bb7"},
  maj6: {name:"大六和弦",  sym:"6",    iv:[0,4,7,9],    f:"1-3-5-6"},
  maj9: {name:"大九和弦",  sym:"maj9", iv:[0,4,7,11,14],f:"1-3-5-7-9"}
};
const INTERVALS=[
  {semi:0, abbr:"P1", name:"完全一度（同度）", en:"Unison",       quality:"開放協和"},
  {semi:1, abbr:"m2", name:"小二度",   en:"Minor 2nd",   quality:"強烈不協和"},
  {semi:2, abbr:"M2", name:"大二度",   en:"Major 2nd",   quality:"輕度不協和"},
  {semi:3, abbr:"m3", name:"小三度",   en:"Minor 3rd",   quality:"柔和協和"},
  {semi:4, abbr:"M3", name:"大三度",   en:"Major 3rd",   quality:"柔和協和"},
  {semi:5, abbr:"P4", name:"完全四度", en:"Perfect 4th", quality:"中度協和"},
  {semi:6, abbr:"TT", name:"三全音",   en:"Tritone",     quality:"曖昧、緊張"},
  {semi:7, abbr:"P5", name:"完全五度", en:"Perfect 5th", quality:"開放協和"},
  {semi:8, abbr:"m6", name:"小六度",   en:"Minor 6th",   quality:"柔和協和"},
  {semi:9, abbr:"M6", name:"大六度",   en:"Major 6th",   quality:"柔和協和"},
  {semi:10,abbr:"m7", name:"小七度",   en:"Minor 7th",   quality:"輕度不協和"},
  {semi:11,abbr:"M7", name:"大七度",   en:"Major 7th",   quality:"強烈不協和"},
  {semi:12,abbr:"P8", name:"完全八度", en:"Octave",      quality:"開放協和"}
];

/* ---------- 小工具 ---------- */
function $(sel,root){ return (root||document).querySelector(sel); }
function $all(sel,root){ return Array.from((root||document).querySelectorAll(sel)); }
function segButtons(el, items, onPick, initial){
  // items: [{key,label}]
  el.classList.add("seg");
  const btns={};
  items.forEach(it=>{
    const b=document.createElement("button");
    b.textContent=it.label;
    b.addEventListener("click",()=>{
      Object.values(btns).forEach(x=>x.classList.remove("on"));
      b.classList.add("on");
      onPick(it.key);
    });
    el.appendChild(b);
    btns[it.key]=b;
  });
  if(initial!==undefined && btns[initial]){ btns[initial].classList.add("on"); }
  return btns;
}
/* 播放和弦：type="block"|"arp", inst="piano"|"bass" */
function playChord(midis, mode, inst, bpm){
  bpm=bpm||100;
  const beat=60/bpm;
  const fn = inst==="bass"? AudioEngine.bass : AudioEngine.piano;
  const evs=[];
  if(mode==="arp"){
    midis.forEach((m,i)=>evs.push({time:i*beat*0.5, dur:beat*0.9, fn:(t)=>fn(m,t,beat*0.9)}));
    evs.push({time:midis.length*beat*0.5+beat*0.2, dur:beat*2,
      fn:(t)=>midis.forEach(m=>fn(m,t,beat*2,0.8))});
  }else{
    evs.push({time:0, dur:beat*2.2, fn:(t)=>midis.forEach(m=>fn(m,t,beat*2.2,0.85))});
  }
  Player.play(evs);
}

/* ---------- 目錄欄（捲動高亮）與已讀記錄 ---------- */
(function(){
  const slug=document.body.dataset.page;
  if(slug && slug!=="index"){
    try{ localStorage.setItem("bl-visit-"+slug, "1"); }catch(e){}
  }
  const toc=document.getElementById("toc");
  if(toc){
    const secs=$all("section.lesson");
    const links=[];
    secs.forEach((sec,i)=>{
      if(!sec.id) sec.id="sec-"+(i+1);
      const h2=sec.querySelector("h2");
      if(!h2) return;
      const a=document.createElement("a");
      a.href="#"+sec.id;
      a.innerHTML=`<span class="dot"></span><span>${h2.textContent}</span>`;
      toc.appendChild(a);
      links.push({a,sec});
    });
    function update(){
      const mid=window.scrollY+window.innerHeight*0.35;
      let current=0;
      links.forEach((l,i)=>{ if(l.sec.offsetTop<=mid) current=i; });
      links.forEach((l,i)=>{
        l.a.classList.toggle("now",i===current);
        l.a.classList.toggle("done",i<current);
      });
    }
    window.addEventListener("scroll",update,{passive:true});
    update();
  }
  /* 首頁章節卡進度 */
  $all("[data-chprog]").forEach(el=>{
    try{
      if(localStorage.getItem("bl-visit-"+el.dataset.chprog)==="1"){
        const bar=el.querySelector(".prog>div");
        if(bar)bar.style.width="100%";
        const lv=el.querySelector(".lv");
        if(lv){lv.textContent="✓ 已讀";lv.className="lv a";}
      }
    }catch(e){}
  });
})();
