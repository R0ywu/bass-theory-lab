/* ===== 第 2 章：貝斯基礎 ===== */

/* --- s1: 四條弦 --- */
const b1 = makeFretboard($("#b1-board"), {frets:12, showNames:"none"});
$("#b1-open").addEventListener("click",()=>{
  const order=[3,2,1,0]; // E A D G（由低到高）
  const evs=order.map((s,i)=>({
    time:i*0.75, dur:0.7,
    fn:(t)=>AudioEngine.bass(BASS_OPEN[s],t,0.9),
    hl:()=>b1.flashPos(s,0)
  }));
  Player.play(evs);
});
$("#b1-updown").addEventListener("click",()=>{
  const evs=[];
  for(let f=0;f<=5;f++){
    evs.push({time:f*0.45,dur:0.42,
      fn:(t)=>AudioEngine.bass(BASS_OPEN[3]+f,t,0.5),
      hl:()=>b1.flashPos(3,f)});
  }
  Player.play(evs);
});

/* --- s2: 鋼琴 vs 貝斯（A 弦） --- */
const b2p = makePiano($("#b2-piano"), {octaves:2, startMidi:48, showLabels:"all", keyW:40, keyH:120});
const b2b = makeFretboard($("#b2-board"), {frets:12, showNames:"none"});
/* A 弦 open = MIDI 33（A1），鋼琴顯示區從 C3(48) 起，
   為了聽起來一致，鋼琴亮起時播同一個 midi+24（高兩個八度顯示、同音名） */
function b2Play(frets, gap){
  const evs=[];
  frets.forEach((f,i)=>{
    const midi=BASS_OPEN[2]+f;         // A 弦實際音
    const pMidi=57+f;                  // 鋼琴上的 A3 起點（顯示用，同音名）
    evs.push({time:i*gap, dur:gap*0.9,
      fn:(t)=>AudioEngine.bass(midi,t,gap*0.95),
      hl:()=>{ b2b.flashPos(2,f); b2p.flash(pMidi,"#f5a623"); }});
  });
  Player.play(evs);
}
$("#b2-chrom").addEventListener("click",()=>{
  b2Play([0,1,2,3,4,5,6,7,8,9,10,11,12], 0.42);
});
$("#b2-alpha").addEventListener("click",()=>{
  /* A B C D E F G A：從 A 起的自然音 → 半音距離 0,2,3,5,7,8,10,12 */
  b2Play([0,2,3,5,7,8,10,12], 0.55);
});

/* --- s3: 同音異位 --- */
const b3 = makeFretboard($("#b3-board"), {frets:8, fretW:78, showNames:"none"});
function b3Pair(sA,fA,sB,fB){
  b3.highlight([
    {string:sA,fret:fA,color:"#f5a623"},
    {string:sB,fret:fB,color:"#4fc3f7"}
  ]);
  const m1=BASS_OPEN[sA]+fA, m2=BASS_OPEN[sB]+fB;
  Player.play([
    {time:0,   dur:0.8, fn:(t)=>AudioEngine.bass(m1,t,0.85), hl:()=>b3.flashPos(sA,fA)},
    {time:0.9, dur:0.8, fn:(t)=>AudioEngine.bass(m2,t,0.85), hl:()=>b3.flashPos(sB,fB)},
    {time:1.9, dur:1.0, fn:(t)=>{AudioEngine.bass(m1,t,1.0,0.7);AudioEngine.bass(m2,t,1.0,0.7);}}
  ]);
}
$("#b3-same1").addEventListener("click",()=>b3Pair(3,5,2,0));
$("#b3-same2").addEventListener("click",()=>b3Pair(2,5,1,0));
$("#b3-same3").addEventListener("click",()=>b3Pair(1,5,0,0));

/* --- s4: 指板地圖 --- */
let b4mode="natural";
const b4wrap=$("#b4-board");
let b4;
function b4Build(){
  b4wrap.innerHTML="";
  b4 = makeFretboard(b4wrap,{frets:12, showNames:b4mode});
}
b4Build();
segButtons($("#b4-seg"),[
  {key:"natural",label:"只顯示自然音"},
  {key:"all",label:"顯示全部音名"},
  {key:"none",label:"全部隱藏（自我測驗）"}
],(k)=>{ b4mode=k; b4Build(); },"natural");

/* --- s4 quiz --- */
const b4q = makeFretboard($("#b4-qboard"),{frets:12, showNames:"none"});
let b4qScore=0,b4qTotal=0,b4qAnswer=null,b4qPos=null;
function b4NewQ(){
  const s=Math.floor(Math.random()*4);
  const f=1+Math.floor(Math.random()*12);
  const midi=BASS_OPEN[s]+f;
  b4qAnswer=midiToName(midi);
  b4qPos={s,f};
  b4q.highlight([{string:s,fret:f,color:"#f5a623",label:"?"}]);
  $("#b4-qtext").textContent=`${BASS_STRING_NAMES[s]} 弦・第 ${f} 格 —— 這是什麼音？（提示：${BASS_STRING_NAMES[s]} 弦空弦是 ${BASS_STRING_NAMES[s]}，往上數 ${f} 個半音）`;
  const opts=new Set([b4qAnswer]);
  while(opts.size<4){ opts.add(NOTE_NAMES_SHARP[Math.floor(Math.random()*12)]); }
  const arr=Array.from(opts).sort(()=>Math.random()-0.5);
  const box=$("#b4-qopts"); box.innerHTML="";
  arr.forEach(op=>{
    const b=document.createElement("button");
    b.className="btn small secondary"; b.textContent=op;
    b.addEventListener("click",()=>{
      b4qTotal++;
      const fb=$("#b4-qfb");
      AudioEngine.bass(BASS_OPEN[b4qPos.s]+b4qPos.f);
      if(op===b4qAnswer){
        b4qScore++;
        fb.textContent="✔ 正確！聽聽它的聲音。"; fb.className="quiz-fb ok";
      }else{
        fb.textContent=`✘ 不對，答案是 ${b4qAnswer}。`; fb.className="quiz-fb no";
      }
      b4q.highlight([{string:b4qPos.s,fret:b4qPos.f,color:op===b4qAnswer?"#66d9a3":"#ef6d6d",label:b4qAnswer}]);
      $("#b4-qscore").textContent=`答對 ${b4qScore} / ${b4qTotal} 題`;
      setTimeout(b4NewQ,1400);
    });
    box.appendChild(b);
  });
}
b4NewQ();
