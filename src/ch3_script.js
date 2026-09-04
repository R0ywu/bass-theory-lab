/* ===== 第 3 章：調與音階 ===== */

/* --- s2: 音階實驗室 --- */
const ROOTS=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const s2root=$("#s2-root");
ROOTS.forEach(r=>{
  const o=document.createElement("option");o.value=r;o.textContent=r;
  if(r==="C")o.selected=true;s2root.appendChild(o);
});
let s2type="major", s2view="single";
const s2boardWrap=$("#s2-board");
let s2board=makeFretboard(s2boardWrap,{frets:16,fretW:52,showNames:"none"});
const s2piano=makePiano($("#s2-piano"),{octaves:2,startMidi:48,showLabels:"white",keyW:40,keyH:110});

const DEG_COLOR=(d)=> d===0? "#f5a623" : "#4fc3f7";

function s2ScaleMidis(){
  /* 從指板低把位找主音，回傳上行一個八度的 midi 陣列 */
  const pc=nameToPc(s2root.value);
  const sc=SCALES[s2type];
  let rootMidi=null;
  for(let m=BASS_OPEN[3];m<=BASS_OPEN[3]+11;m++){ if(m%12===pc){rootMidi=m;break;} }
  return sc.iv.concat([12]).map(iv=>rootMidi+iv);
}
const S2_FLAT_TYPES=["minor","minPent","blues","harmMinor","melMinor"];
function s2Render(){
  const pc=nameToPc(s2root.value);
  const sc=SCALES[s2type];
  const useFlat=S2_FLAT_TYPES.includes(s2type);
  const names=sc.iv.map(iv=>(useFlat?NOTE_NAMES_FLAT:NOTE_NAMES_SHARP)[(pc+iv)%12]);
  $("#s2-info").innerHTML=
    `<b class="acc">${s2root.value} ${sc.name}</b>　公式：<span class="mono">${sc.formula}</span>　`+
    `組成音：<b class="mono">${names.join(" – ")}</b>`;
  /* 指板 */
  if(s2view==="single"){
    /* 挑根音把位最低的那條弦，顯示 root→root+12 */
    let best={s:3,f:99};
    for(let s=0;s<4;s++){
      const f=((pc-BASS_OPEN[s])%12+12)%12;
      if(f<best.f) best={s,f};
    }
    const list=[];
    sc.iv.concat([12]).forEach((iv,i)=>{
      const f=best.f+iv;
      if(f<=16) list.push({string:best.s,fret:f,
        color:DEG_COLOR(iv%12===0?0:1),
        label: iv%12===0 ? "R" : (sc.deg?sc.deg[i%sc.deg.length]:midiToName(BASS_OPEN[best.s]+f))});
    });
    s2board.highlight(list);
  }else{
    const all=scaleOnFretboard(pc,sc.iv,16).map(p=>({
      string:p.string,fret:p.fret,
      color:DEG_COLOR(p.degree),
      label: p.degree===0? "R":(sc.deg?sc.deg[p.degree]:midiToName(p.midi))
    }));
    s2board.highlight(all);
  }
  /* 鋼琴 */
  const map={};
  for(let m=48;m<=72;m++){
    const rel=((m%12)-pc+12)%12;
    const idx=sc.iv.indexOf(rel);
    if(idx>=0) map[m]={color: rel===0? "#f5a623":"#8ecdf7", label: sc.deg?sc.deg[idx]:""};
  }
  s2piano.highlight(map);
}
segButtons($("#s2-type"),[
  {key:"major",label:"大調"},{key:"minor",label:"自然小調"},
  {key:"majPent",label:"大調五聲"},{key:"minPent",label:"小調五聲"},
  {key:"blues",label:"藍調"},{key:"harmMinor",label:"和聲小調"},{key:"melMinor",label:"旋律小調"}
],(k)=>{s2type=k;s2Render();},"major");
segButtons($("#s2-view"),[
  {key:"single",label:"單弦模式（看公式）"},
  {key:"all",label:"全指板模式（看位置）"}
],(k)=>{s2view=k;s2Render();},"single");
s2root.addEventListener("change",s2Render);
s2Render();

function s2Play(desc){
  const midis=s2ScaleMidis();
  const seq=desc? midis.slice().reverse():midis;
  const evs=seq.map((m,i)=>({
    time:i*0.42,dur:0.4,
    fn:(t)=>AudioEngine.bass(m,t,0.5),
    hl:()=>{
      const pos=findOnFretboard(m,16);
      if(pos)s2board.flashPos(pos.string,pos.fret);
      s2piano.flash(m+24>96? m+12: m+24,"#f5a623");
    }
  }));
  Player.play(evs);
}
$("#s2-play").addEventListener("click",()=>s2Play(false));
$("#s2-playdown").addEventListener("click",()=>s2Play(true));
$("#s2-stop").addEventListener("click",()=>Player.stop());

/* 小抄表格試聽 */
$all("#s2-table .play-ico").forEach(ic=>{
  ic.addEventListener("click",()=>{
    s2type=ic.dataset.scale;
    $all("#s2-type button").forEach(b=>b.classList.remove("on"));
    const labels={major:"大調",minor:"自然小調",majPent:"大調五聲",minPent:"小調五聲",blues:"藍調",harmMinor:"和聲小調",melMinor:"旋律小調"};
    $all("#s2-type button").forEach(b=>{ if(b.textContent===labels[s2type]) b.classList.add("on"); });
    s2Render(); s2Play(false);
  });
});

/* --- s3: 關係調 --- */
const s3key=$("#s3-key");
ROOTS.forEach(r=>{
  const o=document.createElement("option");o.value=r;o.textContent=r+" 大調";
  if(r==="C")o.selected=true;s3key.appendChild(o);
});
const s3piano=makePiano($("#s3-piano"),{octaves:2,startMidi:48,showLabels:"white",keyW:40,keyH:120});
function s3Render(){
  const pc=nameToPc(s3key.value);
  const relPc=(pc+9)%12;
  const relName=NOTE_NAMES_SHARP[relPc];
  $("#s3-info").innerHTML=`<b class="acc">${s3key.value} 大調</b> 的關係小調是 <b class="acc2">${relName} 小調</b>（${s3key.value} 往下 3 個半音）。兩者共用同一組音。`;
  const map={};
  for(let m=48;m<=72;m++){
    const rel=((m%12)-pc+12)%12;
    if(SCALES.major.iv.includes(rel)){
      map[m]={color: m%12===pc? "#f5a623" : (m%12===relPc? "#b78cf7":"#8ecdf7"),
              label: m%12===pc? "大":(m%12===relPc?"小":"")};
    }
  }
  s3piano.highlight(map);
  return {pc,relPc};
}
s3key.addEventListener("change",s3Render);
s3Render();
function s3Play(minor){
  const {pc,relPc}=s3Render();
  const startPc = minor? relPc: pc;
  let start=48+((startPc-0+12)%12); // 48=C3
  if(start>59) start-=12;
  const ivs = minor? SCALES.minor.iv : SCALES.major.iv;
  const midis=ivs.concat([12]).map(iv=>start+iv);
  const evs=midis.map((m,i)=>({
    time:i*0.42,dur:0.4,
    fn:(t)=>AudioEngine.piano(m,t,0.55),
    hl:()=>s3piano.flash(m,"#f5a623")
  }));
  Player.play(evs);
}
$("#s3-major").addEventListener("click",()=>s3Play(false));
$("#s3-minor").addEventListener("click",()=>s3Play(true));

/* --- s4: 調式 --- */
const s4root=$("#s4-root");
ROOTS.forEach(r=>{
  const o=document.createElement("option");o.value=r;o.textContent=r;
  if(r==="C")o.selected=true;s4root.appendChild(o);
});
let s4mode="ionian";
const s4board=makeFretboard($("#s4-board"),{frets:14,fretW:56,showNames:"none"});
function s4Render(){
  const md=MODES[s4mode];
  const pc=nameToPc(s4root.value);
  $("#s4-desc").innerHTML=`<b class="acc">${s4root.value} ${md.name}</b>　級數：<span class="mono">${md.deg}</span> — ${md.desc}`;
  const all=scaleOnFretboard(pc,md.iv,14).map(p=>({
    string:p.string,fret:p.fret,
    color:p.degree===0?"#f5a623":"#4fc3f7",
    label:p.degree===0?"R":""
  }));
  s4board.highlight(all);
}
segButtons($("#s4-seg"),[
  {key:"ionian",label:"Ionian"},{key:"dorian",label:"Dorian"},
  {key:"phrygian",label:"Phrygian"},{key:"lydian",label:"Lydian"},
  {key:"mixolydian",label:"Mixolydian"},{key:"aeolian",label:"Aeolian"},{key:"locrian",label:"Locrian"}
],(k)=>{s4mode=k;s4Render();},"ionian");
s4root.addEventListener("change",s4Render);
s4Render();
function s4Midis(mode){
  const pc=nameToPc(s4root.value);
  let root=null;
  for(let m=BASS_OPEN[3];m<=BASS_OPEN[3]+11;m++){ if(m%12===pc){root=m;break;} }
  return MODES[mode].iv.concat([12]).map(iv=>root+iv);
}
$("#s4-play").addEventListener("click",()=>{
  const midis=s4Midis(s4mode);
  Player.play(midis.map((m,i)=>({
    time:i*0.42,dur:0.4,
    fn:(t)=>AudioEngine.bass(m,t,0.5),
    hl:()=>{const p=findOnFretboard(m,14); if(p)s4board.flashPos(p.string,p.fret);}
  })));
});
$("#s4-compare").addEventListener("click",()=>{
  const a=s4Midis("ionian"), b=s4Midis(s4mode);
  const evs=[];
  a.forEach((m,i)=>evs.push({time:i*0.33,dur:0.3,fn:(t)=>AudioEngine.bass(m,t,0.38)}));
  const off=a.length*0.33+0.7;
  b.forEach((m,i)=>evs.push({time:off+i*0.33,dur:0.3,
    fn:(t)=>AudioEngine.bass(m,t,0.38),
    hl:()=>{const p=findOnFretboard(m,14); if(p)s4board.flashPos(p.string,p.fret);}}));
  Player.play(evs);
});

/* --- s5: 聽力測驗 --- */
let s5answer=null,s5score=0,s5total=0,s5rootMidi=null;
function s5PlayScale(){
  if(s5answer===null)return;
  const ivs=s5answer==="maj"? SCALES.major.iv: SCALES.minor.iv;
  const midis=ivs.concat([12]).map(iv=>s5rootMidi+iv);
  Player.play(midis.map((m,i)=>({time:i*0.38,dur:0.36,fn:(t)=>AudioEngine.piano(m,t,0.45)})));
}
$("#s5-new").addEventListener("click",()=>{
  s5answer=Math.random()<0.5?"maj":"min";
  s5rootMidi=50+Math.floor(Math.random()*10);
  $("#s5-fb").textContent="仔細聽…是明亮還是憂鬱？";
  $("#s5-fb").className="quiz-fb";
  s5PlayScale();
});
$("#s5-again").addEventListener("click",s5PlayScale);
function s5Answer(guess){
  if(s5answer===null){$("#s5-fb").textContent="先按「出題」！";return;}
  s5total++;
  const fb=$("#s5-fb");
  if(guess===s5answer){s5score++;fb.textContent="✔ 答對了！";fb.className="quiz-fb ok";}
  else{fb.textContent=`✘ 其實是${s5answer==="maj"?"大調":"小調"}，再多聽幾次感受差別。`;fb.className="quiz-fb no";}
  $("#s5-score").textContent=`答對 ${s5score} / ${s5total} 題`;
  s5answer=null;
}
$("#s5-ansmaj").addEventListener("click",()=>s5Answer("maj"));
$("#s5-ansmin").addEventListener("click",()=>s5Answer("min"));
