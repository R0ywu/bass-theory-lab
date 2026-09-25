/* ===== Groove 節奏機 ===== */
const TRACKS=[
  {key:"hho",  label:"HH Open",  color:"#b78cf7", play:()=>AudioEngine.drum(null,"hho")},
  {key:"hhc",  label:"HH Close", color:"#4fc3f7", play:()=>AudioEngine.drum(null,"hhc")},
  {key:"snare",label:"Snare",    color:"#ef8a8a", play:()=>AudioEngine.drum(null,"snare")},
  {key:"kick", label:"Kick",     color:"#f5a623", play:()=>AudioEngine.drum(null,"kick")},
  {key:"bass", label:"Bass 根音", color:"#66d9a3", play:()=>AudioEngine.bass(gvBassNote(),null,0.3,0.9)}
];
const STEPS=16;
function emptyPat(){ const p={}; TRACKS.forEach(t=>p[t.key]=new Array(STEPS).fill(false)); return p; }
let PAT=emptyPat();
let gvRunning=false, gvTimer=null, gvStep=0;

function gvBassNote(){ return parseInt($("#gv-bassnote").value,10); }
$("#gv-bpm").addEventListener("input",()=>{$("#gv-bpmv").textContent=$("#gv-bpm").value;});
$("#gv-swing").addEventListener("input",()=>{$("#gv-swingv").textContent=$("#gv-swing").value+"%";});

/* ---------- 畫格子 ---------- */
const gridEl=$("#gv-grid");
const cellEls={};
function gvBuild(){
  gridEl.innerHTML="";
  const nums=document.createElement("div");
  nums.className="gr-beatnums";
  nums.innerHTML=`<div class="sp"></div>`+Array.from({length:STEPS},(_,i)=>
    `<div class="n">${i%4===0?("拍 "+(i/4+1)):"·"}</div>`).join("");
  gridEl.appendChild(nums);
  TRACKS.forEach(tr=>{
    const row=document.createElement("div");
    row.className="gr-row";
    const lb=document.createElement("div");
    lb.className="gr-label";
    lb.innerHTML=`<span class="sw" style="background:${tr.color}"></span>${tr.label}`;
    row.appendChild(lb);
    cellEls[tr.key]=[];
    for(let i=0;i<STEPS;i++){
      const c=document.createElement("div");
      c.className="gr-cell"+(i%4===0?" bh":"");
      c.addEventListener("pointerdown",()=>{
        PAT[tr.key][i]=!PAT[tr.key][i];
        gvPaint();
        if(PAT[tr.key][i]){ AudioEngine.ensure(); tr.play(); }
      });
      row.appendChild(c);
      cellEls[tr.key].push(c);
    }
    gridEl.appendChild(row);
  });
  gvPaint();
}
function gvPaint(playCol){
  TRACKS.forEach(tr=>{
    PAT[tr.key].forEach((on,i)=>{
      const c=cellEls[tr.key][i];
      c.classList.toggle("on",on);
      c.style.background = on? tr.color : "";
      c.classList.toggle("ph", playCol===i);
    });
  });
}
gvBuild();

/* ---------- 播放 ---------- */
function gvStop(){
  gvRunning=false;
  if(gvTimer){clearTimeout(gvTimer);gvTimer=null;}
  $("#gv-toggle").textContent="▶ 播放";
  $("#gv-toggle").classList.remove("toggled");
  gvPaint();
}
function gvTick(){
  if(!gvRunning)return;
  const bpm=parseInt($("#gv-bpm").value,10);
  const sw=parseInt($("#gv-swing").value,10)/100;
  const stepDur=(60/bpm)/4;
  const i=gvStep%STEPS;
  TRACKS.forEach(tr=>{ if(PAT[tr.key][i]) tr.play(); });
  gvPaint(i);
  /* swing：每對十六分音符「長—短」 */
  const dur = (i%2===0)? stepDur*(1+sw) : stepDur*(1-sw);
  gvStep++;
  gvTimer=setTimeout(gvTick, dur*1000);
}
$("#gv-toggle").addEventListener("click",()=>{
  if(gvRunning){gvStop();return;}
  AudioEngine.ensure();
  gvRunning=true; gvStep=0;
  $("#gv-toggle").textContent="■ 停止";
  $("#gv-toggle").classList.add("toggled");
  gvTick();
});
$("#gv-clear").addEventListener("click",()=>{ PAT=emptyPat(); gvPaint(); });

/* ---------- 範本 ---------- */
function mk(steps){ const a=new Array(STEPS).fill(false); steps.forEach(i=>a[i]=true); return a; }
const PRESETS={
  rock:{label:"8-Beat 搖滾",pat:{
    hho:mk([]), hhc:mk([0,2,4,6,8,10,12,14]),
    snare:mk([4,12]), kick:mk([0,8,10]), bass:mk([0,8,10])}},
  funk:{label:"16-Beat 放克",pat:{
    hho:mk([7]), hhc:mk([0,1,2,3,4,5,6,8,9,10,11,12,13,14,15]),
    snare:mk([4,12]), kick:mk([0,3,6,10]), bass:mk([0,3,6,10])}},
  disco:{label:"Disco 四大地板",pat:{
    hho:mk([2,6,10,14]), hhc:mk([0,4,8,12]),
    snare:mk([4,12]), kick:mk([0,4,8,12]), bass:mk([0,2,4,6,8,10,12,14])}},
  half:{label:"Half-time 慢搖",pat:{
    hho:mk([14]), hhc:mk([0,2,4,6,8,10,12]),
    snare:mk([8]), kick:mk([0,10]), bass:mk([0,10])}}
};
segButtons($("#gv-presets"),Object.keys(PRESETS).map(k=>({key:k,label:PRESETS[k].label})),(k)=>{
  PAT=JSON.parse(JSON.stringify(PRESETS[k].pat));
  gvPaint();
});

/* ---------- 存檔 ---------- */
function gvLoadSaves(){
  try{ return JSON.parse(localStorage.getItem("bl-grooves-v1"))||[]; }catch(e){ return []; }
}
function gvStoreSaves(list){ try{ localStorage.setItem("bl-grooves-v1",JSON.stringify(list)); }catch(e){} }
function gvRenderSaves(){
  const list=gvLoadSaves();
  const box=$("#gv-saved"); box.innerHTML="";
  if(list.length===0){
    box.innerHTML=`<div style="color:var(--muted);font-size:13.5px">還沒有存檔——設計一個 groove、取名後按儲存。</div>`;
    return;
  }
  list.forEach((it,idx)=>{
    const d=document.createElement("div");
    d.className="item";
    d.innerHTML=`<b>${it.name}</b><span style="color:var(--muted);font-size:12.5px">BPM ${it.bpm}・swing ${it.swing}%</span>`;
    const bLoad=document.createElement("button");
    bLoad.className="btn small"; bLoad.textContent="載入";
    bLoad.addEventListener("click",()=>{
      PAT=JSON.parse(JSON.stringify(it.pat));
      /* 相容舊資料：缺少的軌補空 */
      TRACKS.forEach(t=>{ if(!PAT[t.key])PAT[t.key]=new Array(STEPS).fill(false); });
      $("#gv-bpm").value=it.bpm; $("#gv-bpmv").textContent=it.bpm;
      $("#gv-swing").value=it.swing; $("#gv-swingv").textContent=it.swing+"%";
      if(it.bassNote)$("#gv-bassnote").value=it.bassNote;
      gvPaint();
    });
    const bDel=document.createElement("button");
    bDel.className="btn small secondary"; bDel.textContent="刪除";
    bDel.addEventListener("click",()=>{
      const l=gvLoadSaves(); l.splice(idx,1); gvStoreSaves(l); gvRenderSaves();
    });
    d.appendChild(bLoad); d.appendChild(bDel);
    box.appendChild(d);
  });
}
$("#gv-save").addEventListener("click",()=>{
  const name=$("#gv-name").value.trim()||("Groove "+new Date().toLocaleDateString());
  const list=gvLoadSaves();
  list.unshift({name, pat:PAT, bpm:parseInt($("#gv-bpm").value,10),
    swing:parseInt($("#gv-swing").value,10), bassNote:$("#gv-bassnote").value});
  gvStoreSaves(list.slice(0,30));
  $("#gv-name").value="";
  gvRenderSaves();
});
gvRenderSaves();
