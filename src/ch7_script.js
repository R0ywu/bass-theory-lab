/* ===== 第 7 章：節奏與拍子 ===== */

/* --- s1: 節拍器 --- */
let mSig=4, mRunning=false, mTimer=null, mBeatIdx=0;
$("#m-bpm").addEventListener("input",()=>{$("#m-bpmv").textContent=$("#m-bpm").value;});
function mDrawBeats(active){
  const box=$("#m-beats");box.innerHTML="";
  for(let b=0;b<mSig;b++){
    const d=document.createElement("div");
    const on=b===active;
    d.style.cssText=`width:${b===0?56:46}px;height:${b===0?56:46}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;transition:all .05s;
      background:${on?(b===0?"var(--accent)":"var(--accent2)"):"var(--card2)"};
      color:${on?"#141414":"var(--muted)"};
      border:2px solid ${b===0?"var(--accent)":"var(--line)"}`;
    d.textContent=b+1;
    box.appendChild(d);
  }
}
mDrawBeats(-1);
segButtons($("#m-sig"),[
  {key:"2",label:"2/4 行軍"},{key:"3",label:"3/4 華爾滋"},{key:"4",label:"4/4 標準"}
],(k)=>{mSig=parseInt(k,10);mBeatIdx=0;mDrawBeats(-1);},"4");
function mStop(){
  mRunning=false;
  if(mTimer){clearTimeout(mTimer);mTimer=null;}
  $("#m-toggle").textContent="▶ 開始";
  $("#m-toggle").classList.remove("toggled");
  mDrawBeats(-1);
}
function mTick(){
  if(!mRunning)return;
  const bpm=parseInt($("#m-bpm").value,10);
  const beat=60/bpm;
  const b=mBeatIdx%mSig;
  AudioEngine.click(null,b===0);
  mDrawBeats(b);
  mBeatIdx++;
  mTimer=setTimeout(mTick,beat*1000);
}
$("#m-toggle").addEventListener("click",()=>{
  if(mRunning){mStop();return;}
  AudioEngine.ensure();
  mRunning=true;mBeatIdx=0;
  $("#m-toggle").textContent="■ 停止";
  $("#m-toggle").classList.add("toggled");
  mTick();
});

/* --- s1: 鼓組 + 貝斯 groove --- */
let gStopFlag=false;
$("#g-play").addEventListener("click",()=>{
  AudioEngine.ensure();
  const bpm=96, beat=60/bpm;
  const t0=AudioEngine.now()+0.1;
  const evs=[];
  for(let bar=0;bar<4;bar++){
    const off=bar*4*beat;
    /* kick 1,3 / snare 2,4 */
    AudioEngine.drum(t0+off,"kick");
    AudioEngine.drum(t0+off+2*beat,"kick");
    AudioEngine.drum(t0+off+beat,"snare");
    AudioEngine.drum(t0+off+3*beat,"snare");
    for(let b=0;b<4;b++) AudioEngine.click(t0+off+b*beat+beat/2,false); // off-beat hats
    /* 貝斯：跟 kick 一起 + 第 4 拍過門 */
    const root = bar<2? 33: (bar===2? 31:33); // A A G A
    AudioEngine.bass(root,t0+off,beat*0.9);
    AudioEngine.bass(root,t0+off+2*beat,beat*0.9);
    AudioEngine.bass(root+7,t0+off+3*beat,beat*0.45,0.8);
    AudioEngine.bass(root+5,t0+off+3.5*beat,beat*0.45,0.8);
  }
});
$("#g-stop").addEventListener("click",()=>Player.stop());

/* --- s2: 十六格節奏機 --- */
let qCells=new Array(16).fill(false);
let qRunning=false,qTimer=null,qStep=0;
$("#q-bpm").addEventListener("input",()=>{$("#q-bpmv").textContent=$("#q-bpm").value;});
function qDraw(active){
  const box=$("#q-grid");box.innerHTML="";
  const row=document.createElement("div");
  row.style.cssText="display:flex;gap:5px";
  for(let i=0;i<16;i++){
    const d=document.createElement("div");
    const isBeatHead=i%4===0;
    d.style.cssText=`flex:1;height:56px;border-radius:8px;cursor:pointer;position:relative;
      background:${qCells[i]?"var(--accent)":(isBeatHead?"#2a3040":"var(--card2)")};
      border:2px solid ${i===active?"var(--accent2)":"var(--line)"};
      transition:border-color .05s`;
    if(isBeatHead){
      const lbl=document.createElement("div");
      lbl.style.cssText="position:absolute;top:-20px;left:2px;font-size:11px;color:var(--muted)";
      lbl.textContent="拍"+(i/4+1);
      d.appendChild(lbl);
    }
    d.addEventListener("pointerdown",()=>{
      qCells[i]=!qCells[i];
      qDraw(qRunning?qStep%16:-1);
      if(qCells[i])AudioEngine.bass(parseInt($("#q-note").value,10),null,0.25,0.8);
    });
    row.appendChild(d);
  }
  box.style.paddingTop="20px";
  box.appendChild(row);
}
qDraw(-1);
function qStop(){
  qRunning=false;
  if(qTimer){clearTimeout(qTimer);qTimer=null;}
  $("#q-toggle").textContent="▶ 播放";
  $("#q-toggle").classList.remove("toggled");
  qDraw(-1);
}
function qTick(){
  if(!qRunning)return;
  const bpm=parseInt($("#q-bpm").value,10);
  const step=(60/bpm)/4;
  const i=qStep%16;
  if($("#q-drums").checked){
    if(i===0||i===8)AudioEngine.drum(null,"kick");
    if(i===4||i===12)AudioEngine.drum(null,"snare");
    if(i%2===0)AudioEngine.click(null,false);
  }
  if(qCells[i])AudioEngine.bass(parseInt($("#q-note").value,10),null,step*1.8,0.95);
  qDraw(i);
  qStep++;
  qTimer=setTimeout(qTick,step*1000);
}
$("#q-toggle").addEventListener("click",()=>{
  if(qRunning){qStop();return;}
  AudioEngine.ensure();
  qRunning=true;qStep=0;
  $("#q-toggle").textContent="■ 停止";
  $("#q-toggle").classList.add("toggled");
  qTick();
});
$("#q-clear").addEventListener("click",()=>{qCells=new Array(16).fill(false);qDraw(qRunning?qStep%16:-1);});
$("#q-preset1").addEventListener("click",()=>{
  qCells=new Array(16).fill(false);
  [0,2,4,6,8,10,12,14].forEach(i=>qCells[i]=true);
  qDraw(qRunning?qStep%16:-1);
});
$("#q-preset2").addEventListener("click",()=>{
  qCells=new Array(16).fill(false);
  [0,3,6,8,11,14].forEach(i=>qCells[i]=true);
  qDraw(qRunning?qStep%16:-1);
});

/* --- s3: 拍號聽力 --- */
let mqAns=null,mqScore=0,mqTotal=0;
function mqPlay(){
  if(mqAns===null)return;
  const bpm=100,beat=60/bpm;
  const evs=[];
  const bars=3;
  for(let bar=0;bar<bars;bar++){
    for(let b=0;b<mqAns;b++){
      const t=(bar*mqAns+b)*beat;
      evs.push({time:t,dur:0.1,fn:(x)=>{
        AudioEngine.click(x,b===0);
        if(b===0)AudioEngine.drum(x,"kick");
      }});
    }
  }
  Player.play(evs);
}
$("#mq-new").addEventListener("click",()=>{
  mqAns=[2,3,4][Math.floor(Math.random()*3)];
  $("#mq-fb").textContent="數數看：重音多久出現一次？";
  $("#mq-fb").className="quiz-fb";
  mqPlay();
});
$("#mq-again").addEventListener("click",mqPlay);
function mqGuess(n){
  if(mqAns===null){$("#mq-fb").textContent="先按「出題」！";return;}
  mqTotal++;
  const fb=$("#mq-fb");
  if(n===mqAns){mqScore++;fb.textContent="✔ 答對了！";fb.className="quiz-fb ok";}
  else{fb.textContent=`✘ 是 ${mqAns}/4 拍。再聽一次，跟著重音數。`;fb.className="quiz-fb no";}
  $("#mq-score").textContent=`答對 ${mqScore} / ${mqTotal} 題`;
  mqAns=null;
}
$("#mq-2").addEventListener("click",()=>mqGuess(2));
$("#mq-3").addEventListener("click",()=>mqGuess(3));
$("#mq-4").addEventListener("click",()=>mqGuess(4));
