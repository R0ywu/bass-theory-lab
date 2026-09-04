/* ===== 第 1 章：鋼琴基礎 ===== */

/* --- s1: 12 音循環 --- */
const p1 = makePiano($("#p1-piano"), {octaves:2, startMidi:48, showLabels:"white"});
$("#p1-play12").addEventListener("click",()=>{
  const evs=[];
  for(let i=0;i<=12;i++){
    const m=48+i;
    evs.push({time:i*0.38, dur:0.36,
      fn:(t)=>AudioEngine.piano(m,t,0.5),
      hl:()=>p1.flash(m,"#f5a623")});
  }
  Player.play(evs);
});
$("#p1-octave").addEventListener("click",()=>{
  const evs=[
    {time:0,   dur:0.8, fn:(t)=>AudioEngine.piano(48,t,0.9), hl:()=>p1.flash(48)},
    {time:0.9, dur:0.8, fn:(t)=>AudioEngine.piano(60,t,0.9), hl:()=>p1.flash(60)},
    {time:1.8, dur:0.8, fn:(t)=>AudioEngine.piano(72,t,0.9), hl:()=>p1.flash(72)},
    {time:2.9, dur:1.4, fn:(t)=>{AudioEngine.piano(48,t,1.5);AudioEngine.piano(60,t,1.5);AudioEngine.piano(72,t,1.5);},
      hl:()=>{p1.flash(48);p1.flash(60);p1.flash(72);}}
  ];
  Player.play(evs);
});
$("#p1-groups").addEventListener("click",()=>{
  const map={};
  for(let m=48;m<=72;m++){
    const pc=m%12;
    if([1,3].includes(pc)) map[m]={color:"#4fc3f7",label:"2"};
    if([6,8,10].includes(pc)) map[m]={color:"#b78cf7",label:"3"};
    if(pc===0) map[m]={color:"#f5a623",label:"C"};
  }
  p1.highlight(map);
});
$("#p1-clear").addEventListener("click",()=>p1.clear());

/* --- s1 quiz: 找出所有 C --- */
const CQUIZ_TARGETS=[48,60,72];
let cFound=new Set();
const pq = makePiano($("#p1-quizpiano"), {octaves:2, startMidi:48, showLabels:"none",
  onClick:(midi)=>{
    const fb=$("#p1-quizfb");
    if(midi%12===0){
      cFound.add(midi);
      const map={};
      cFound.forEach(m=>map[m]={color:"#66d9a3",label:"C"});
      pq.highlight(map);
      if(cFound.size>=CQUIZ_TARGETS.length){
        fb.textContent="🎉 全部找到了！2 個黑鍵左邊的白鍵，永遠是 C。";
        fb.className="quiz-fb ok";
      }else{
        fb.textContent=`答對！已找到 ${cFound.size} / ${CQUIZ_TARGETS.length} 個 C。`;
        fb.className="quiz-fb ok";
      }
    }else{
      fb.textContent=`這是 ${midiToName(midi)}，不是 C。提示：先找 2 個一組的黑鍵。`;
      fb.className="quiz-fb no";
    }
  }});
$("#p1-quizreset").addEventListener("click",()=>{
  cFound=new Set(); pq.clear();
  $("#p1-quizfb").textContent="";
});

/* --- s2: 音名與異名同音 --- */
let p2FlatMode=false;
const p2 = makePiano($("#p2-piano"), {octaves:2, startMidi:48, showLabels:"white",
  onClick:(midi)=>{
    const sharp=midiToName(midi,false), flat=midiToName(midi,true);
    let txt;
    if(sharp===flat) txt=sharp;
    else txt = p2FlatMode? `${flat}（= ${sharp}）` : `${sharp}（= ${flat}）`;
    $("#p2-picked").textContent=txt;
  }});
function p2Labels(){
  const map={};
  for(let m=48;m<=72;m++){
    const pc=m%12;
    if(![0,2,4,5,7,9,11].includes(pc)){
      map[m]={color:"#3a3a44", label:midiToName(m,p2FlatMode)};
    }
  }
  p2.highlight(map);
}
segButtons($("#p2-nameseg"),[
  {key:"sharp",label:"升記號 #"},
  {key:"flat",label:"降記號 b"}
],(k)=>{ p2FlatMode = (k==="flat"); p2Labels(); },"sharp");
p2Labels();

/* --- s3: 全音半音 --- */
const p3 = makePiano($("#p3-piano"), {octaves:2, startMidi:48, showLabels:"all"});
const rootSel=$("#p3-root");
for(let m=53;m<=67;m++){
  const o=document.createElement("option");
  o.value=m;o.textContent=midiToNameOct(m);
  if(m===60)o.selected=true;
  rootSel.appendChild(o);
}
function p3Step(delta,label){
  const root=parseInt(rootSel.value,10);
  const target=root+delta;
  p3.highlight({[root]:{color:"#f5a623",label:"起"},[target]:{color:"#4fc3f7",label:"終"}});
  Player.play([
    {time:0,dur:0.6,fn:(t)=>AudioEngine.piano(root,t,0.7)},
    {time:0.65,dur:0.8,fn:(t)=>AudioEngine.piano(target,t,0.9)}
  ]);
  $("#p3-desc").innerHTML=`從 <b>${midiToName(root)}</b> ${label} → <b>${midiToName(target)}</b>（${delta>0?"+":""}${delta} 個半音）`;
}
$("#p3-half").addEventListener("click",()=>p3Step(1,"往上半音"));
$("#p3-whole").addEventListener("click",()=>p3Step(2,"往上全音"));
$("#p3-halfdown").addEventListener("click",()=>p3Step(-1,"往下半音"));
$("#p3-wholedown").addEventListener("click",()=>p3Step(-2,"往下全音"));

/* --- s3 quiz --- */
const P3Q=[
  {q:"從 C 往上一個全音，是哪個音？", opts:["C#","D","E","B"], a:"D"},
  {q:"從 E 往上一個半音，是哪個音？", opts:["E#？沒有這個音","F","F#","G"], a:"F"},
  {q:"從 B 往上一個半音，是哪個音？", opts:["B#？沒有這個音","C#","C","A"], a:"C"},
  {q:"從 G 往上一個全音，是哪個音？", opts:["G#","A","Ab","B"], a:"A"},
  {q:"哪兩組白鍵之間「天生只差半音」？", opts:["C–D 和 F–G","E–F 和 B–C","D–E 和 A–B","G–A 和 C–D"], a:"E–F 和 B–C"},
  {q:"C# 的異名同音是？", opts:["Db","D#","Cb","B"], a:"Db"}
];
let p3qi=0,p3score=0;
function p3Render(){
  const item=P3Q[p3qi%P3Q.length];
  $("#p3-qtext").textContent=`第 ${p3qi+1} 題：${item.q}`;
  const box=$("#p3-qopts"); box.innerHTML="";
  item.opts.forEach(op=>{
    const b=document.createElement("button");
    b.className="btn small secondary"; b.textContent=op;
    b.addEventListener("click",()=>{
      const fb=$("#p3-qfb");
      if(op===item.a){
        p3score++;
        fb.textContent="✔ 正確！"; fb.className="quiz-fb ok";
      }else{
        fb.textContent=`✘ 不對，答案是 ${item.a}。`; fb.className="quiz-fb no";
      }
      p3qi++;
      $("#p3-qscore").textContent=`答對 ${p3score} / ${p3qi} 題`;
      setTimeout(p3Render,1200);
    });
    box.appendChild(b);
  });
}
p3Render();
