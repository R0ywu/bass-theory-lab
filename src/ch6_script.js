/* ===== 第 6 章：記譜法 ===== */

/* --- s2: TAB 播放器 ---
   自製練習片段（原創短句），notes: {s(0=G..3=E), f, beat(第幾拍,0起), len(拍)} */
const TAB_EXAMPLES={
  scale:{
    label:"C 大調音階",
    desc:"C 大調音階的上行：從 A 弦第 3 格的 C 出發。每個音一拍（四分音符）。",
    notes:[
      {s:2,f:3,beat:0,len:1},{s:2,f:5,beat:1,len:1},{s:1,f:2,beat:2,len:1},{s:1,f:3,beat:3,len:1},
      {s:1,f:5,beat:4,len:1},{s:0,f:2,beat:5,len:1},{s:0,f:4,beat:6,len:1},{s:0,f:5,beat:7,len:1}
    ]
  },
  groove:{
    label:"根音五音 Groove",
    desc:"經典的「根音—五音」bassline（A 小調）：根音 A、五音 E 交替，最後用 G 走回 A。",
    notes:[
      {s:2,f:0,beat:0,len:1},{s:2,f:0,beat:1,len:1},{s:1,f:2,beat:2,len:1},{s:2,f:0,beat:3,len:1},
      {s:2,f:0,beat:4,len:1},{s:1,f:2,beat:5,len:1},{s:3,f:3,beat:6,len:1},{s:2,f:0,beat:7,len:2}
    ]
  },
  octave:{
    label:"八度跳躍（放克味）",
    desc:"Disco／放克常用的八度形狀：同一個音名、跳兩條弦＋2 格。",
    notes:[
      {s:3,f:1,beat:0,len:0.5},{s:1,f:3,beat:0.5,len:0.5},{s:3,f:1,beat:1,len:0.5},{s:1,f:3,beat:1.5,len:0.5},
      {s:3,f:3,beat:2,len:0.5},{s:1,f:5,beat:2.5,len:0.5},{s:3,f:3,beat:3,len:0.5},{s:1,f:5,beat:3.5,len:0.5}
    ]
  }
};
let tKey="scale";
const tBoard=makeFretboard($("#t-board"),{frets:7,fretW:76,showNames:"none"});
$("#t-bpm").addEventListener("input",()=>{$("#t-bpmv").textContent=$("#t-bpm").value;});

function tRenderTab(activeIdx){
  const ex=TAB_EXAMPLES[tKey];
  /* 以 0.5 拍為一欄 */
  const maxBeat=Math.max(...ex.notes.map(n=>n.beat+n.len));
  const cols=Math.ceil(maxBeat/0.5);
  const lines=[[],[],[],[]];
  for(let c=0;c<cols;c++){
    for(let s=0;s<4;s++){
      const note=ex.notes.findIndex(n=>n.s===s&&Math.abs(n.beat-c*0.5)<0.01);
      if(note>=0){
        const n=ex.notes[note];
        const txt=String(n.f).padEnd(3,"—");
        lines[s].push(note===activeIdx?`<span style="background:var(--accent);color:#141414;border-radius:3px">${txt}</span>`:txt);
      }else{
        lines[s].push("———");
      }
    }
  }
  const names=["G","D","A","E"];
  $("#t-tab").innerHTML=lines.map((l,s)=>`${names[s]}|—${l.join("")}|`).join("\n");
  $("#t-desc").textContent=ex.desc;
}
function tRender(){ tRenderTab(-1); tBoard.clear(); }
segButtons($("#t-seg"),Object.keys(TAB_EXAMPLES).map(k=>({key:k,label:TAB_EXAMPLES[k].label})),
  (k)=>{tKey=k;tRender();},"scale");
tRender();
$("#t-play").addEventListener("click",()=>{
  const ex=TAB_EXAMPLES[tKey];
  const bpm=parseInt($("#t-bpm").value,10);
  const beat=60/bpm;
  const evs=ex.notes.map((n,i)=>({
    time:n.beat*beat, dur:n.len*beat,
    fn:(t)=>AudioEngine.bass(BASS_OPEN[n.s]+n.f,t,n.len*beat*0.95),
    hl:()=>{tRenderTab(i);tBoard.flashPos(n.s,n.f);}
  }));
  Player.play(evs,()=>tRenderTab(-1));
});
$("#t-stop").addEventListener("click",()=>{Player.stop();tRenderTab(-1);});

/* --- s3: 時值播放器 --- */
const NOTE_VALUES=[
  {key:"1",label:"全音符 𝅝",len:4,count:1},
  {key:"2",label:"二分 𝅗𝅥",len:2,count:2},
  {key:"4",label:"四分 ♩",len:1,count:4},
  {key:"8",label:"八分 ♪",len:0.5,count:8},
  {key:"16",label:"十六分 𝅘𝅥𝅯",len:0.25,count:16}
];
let nKey="4";
$("#n-bpm").addEventListener("input",()=>{$("#n-bpmv").textContent=$("#n-bpm").value;});
function nViz(activeIdx){
  const nv=NOTE_VALUES.find(v=>v.key===nKey);
  const box=$("#n-viz");box.innerHTML="";
  const row=document.createElement("div");
  row.style.cssText="display:flex;gap:4px;margin-bottom:8px";
  for(let i=0;i<nv.count;i++){
    const d=document.createElement("div");
    d.style.cssText=`flex:${nv.len};height:38px;border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:700;
      background:${i===activeIdx?"var(--accent)":"var(--card2)"};color:${i===activeIdx?"#141414":"var(--muted)"};border:1px solid var(--line);font-size:13px`;
    d.textContent=nv.len>=1? nv.len+"拍":(nv.len===0.5?"½":"¼");
    row.appendChild(d);
  }
  box.appendChild(row);
  const beats=document.createElement("div");
  beats.style.cssText="display:flex;gap:4px";
  for(let b=0;b<4;b++){
    const d=document.createElement("div");
    d.style.cssText="flex:1;height:20px;border-radius:5px;background:var(--bg2);border:1px dashed var(--line);display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--muted)";
    d.textContent="拍 "+(b+1);
    beats.appendChild(d);
  }
  box.appendChild(beats);
}
segButtons($("#n-seg"),NOTE_VALUES.map(v=>({key:v.key,label:v.label})),
  (k)=>{nKey=k;nViz(-1);},"4");
nViz(-1);
function nPlayBar(nv, offset, withHl){
  const bpm=parseInt($("#n-bpm").value,10);
  const beat=60/bpm;
  const evs=[];
  for(let b=0;b<4;b++){
    evs.push({time:offset+b*beat,dur:0.1,fn:(t)=>AudioEngine.click(t,b===0)});
  }
  for(let i=0;i<nv.count;i++){
    evs.push({time:offset+i*nv.len*beat, dur:nv.len*beat,
      fn:(t)=>AudioEngine.bass(43,t,Math.max(nv.len*beat*0.9,0.12)),
      hl: withHl? ()=>nViz(i): undefined});
  }
  return {evs, total:4*beat};
}
$("#n-play").addEventListener("click",()=>{
  const nv=NOTE_VALUES.find(v=>v.key===nKey);
  const {evs}=nPlayBar(nv,0,true);
  Player.play(evs,()=>nViz(-1));
});
$("#n-all").addEventListener("click",()=>{
  let offset=0; let all=[];
  NOTE_VALUES.forEach(nv=>{
    all.push({time:offset,dur:0.1,hl:()=>{
      nKey=nv.key;
      $all("#n-seg button").forEach(b=>b.classList.toggle("on",b.textContent===nv.label));
      nViz(-1);
    }});
    const {evs,total}=nPlayBar(nv,offset,true);
    all=all.concat(evs);
    offset+=total+0.5;
  });
  Player.play(all,()=>nViz(-1));
});

/* --- 附點 --- */
function dotDemo(dotted){
  const bpm=80, beat=60/bpm;
  const evs=[];
  for(let b=0;b<4;b++) evs.push({time:b*beat,dur:0.1,fn:(t)=>AudioEngine.click(t,b===0)});
  if(dotted){
    /* ♩. ♪ ♩. ♪ : 1.5 + 0.5 + 1.5 + 0.5 */
    const pat=[[0,1.5],[1.5,0.5],[2,1.5],[3.5,0.5]];
    pat.forEach(([st,len])=>evs.push({time:st*beat,dur:len*beat,fn:(t)=>AudioEngine.bass(38,t,len*beat*0.92)}));
  }else{
    for(let b=0;b<4;b++) evs.push({time:b*beat,dur:beat,fn:(t)=>AudioEngine.bass(38,t,beat*0.9)});
  }
  Player.play(evs);
}
$("#dot-straight").addEventListener("click",()=>dotDemo(false));
$("#dot-dotted").addEventListener("click",()=>dotDemo(true));
