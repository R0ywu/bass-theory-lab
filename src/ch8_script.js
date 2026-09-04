/* ===== 第 8 章：五度圈 ===== */

/* 圈資料：從 C 順時針 */
const CF=[
  {maj:"C", min:"Am", acc:""},
  {maj:"G", min:"Em", acc:"1♯"},
  {maj:"D", min:"Bm", acc:"2♯"},
  {maj:"A", min:"F#m",acc:"3♯"},
  {maj:"E", min:"C#m",acc:"4♯"},
  {maj:"B", min:"G#m",acc:"5♯"},
  {maj:"Gb",min:"Ebm",acc:"6♭/6♯"},
  {maj:"Db",min:"Bbm",acc:"5♭"},
  {maj:"Ab",min:"Fm", acc:"4♭"},
  {maj:"Eb",min:"Cm", acc:"3♭"},
  {maj:"Bb",min:"Gm", acc:"2♭"},
  {maj:"F", min:"Dm", acc:"1♭"}
];
const SHARP_ORDER=["F#","C#","G#","D#","A#","E#","B#"];
const FLAT_ORDER=["Bb","Eb","Ab","Db","Gb","Cb","Fb"];
let cfSel=0;

/* --- 畫圈 --- */
const svgNS="http://www.w3.org/2000/svg";
const size=380, cx=size/2, cy=size/2;
const cfSvg=document.createElementNS(svgNS,"svg");
cfSvg.setAttribute("viewBox",`0 0 ${size} ${size}`);
cfSvg.setAttribute("width",Math.min(size,360));
$("#cf-circle").appendChild(cfSvg);
const cfNodes=[];
function cfDraw(){
  cfSvg.innerHTML="";
  /* 背景圓 */
  [165,120,72].forEach((r,i)=>{
    const c=document.createElementNS(svgNS,"circle");
    c.setAttribute("cx",cx);c.setAttribute("cy",cy);c.setAttribute("r",r);
    c.setAttribute("fill","none");c.setAttribute("stroke","var(--line)");
    cfSvg.appendChild(c);
  });
  CF.forEach((d,i)=>{
    const ang=(i*30-90)*Math.PI/180;
    const selected=i===cfSel;
    const isNeighbor=(i===(cfSel+1)%12)||(i===(cfSel+11)%12);
    /* 外圈：大調 */
    const x1=cx+142*Math.cos(ang), y1=cy+142*Math.sin(ang);
    const g=document.createElementNS(svgNS,"g");
    g.classList.add("clickable");
    const bg=document.createElementNS(svgNS,"circle");
    bg.setAttribute("cx",x1);bg.setAttribute("cy",y1);bg.setAttribute("r",21);
    bg.setAttribute("fill",selected?"#f5a623":(isNeighbor?"#31527a":"#232a3a"));
    bg.setAttribute("stroke",selected?"#f5a623":"var(--line)");
    bg.setAttribute("stroke-width","2");
    const tx=document.createElementNS(svgNS,"text");
    tx.setAttribute("x",x1);tx.setAttribute("y",y1+5);
    tx.setAttribute("text-anchor","middle");tx.setAttribute("font-size","16");
    tx.setAttribute("font-weight","800");
    tx.setAttribute("fill",selected?"#141414":"#e8ecf4");
    tx.textContent=d.maj;
    g.appendChild(bg);g.appendChild(tx);
    /* 中圈：關係小調 */
    const x2=cx+96*Math.cos(ang), y2=cy+96*Math.sin(ang);
    const t2=document.createElementNS(svgNS,"text");
    t2.setAttribute("x",x2);t2.setAttribute("y",y2+4);
    t2.setAttribute("text-anchor","middle");t2.setAttribute("font-size","12");
    t2.setAttribute("fill",selected?"#f5a623":"#9aa3b5");
    t2.setAttribute("font-weight","700");
    t2.textContent=d.min;
    g.appendChild(t2);
    /* 內圈：調號 */
    const x3=cx+52*Math.cos(ang), y3=cy+52*Math.sin(ang);
    const t3=document.createElementNS(svgNS,"text");
    t3.setAttribute("x",x3);t3.setAttribute("y",y3+4);
    t3.setAttribute("text-anchor","middle");t3.setAttribute("font-size","10");
    t3.setAttribute("fill","#6b7385");
    t3.textContent=d.acc||"0";
    g.appendChild(t3);
    g.addEventListener("pointerdown",()=>{cfSel=i;cfDraw();cfInfo();cfPlayScale(false);});
    cfSvg.appendChild(g);
    cfNodes[i]=g;
  });
  /* 中央文字 */
  const ct=document.createElementNS(svgNS,"text");
  ct.setAttribute("x",cx);ct.setAttribute("y",cy);
  ct.setAttribute("text-anchor","middle");ct.setAttribute("font-size","12");
  ct.setAttribute("fill","#6b7385");
  ct.textContent="五度圈";
  cfSvg.appendChild(ct);
  const ct2=document.createElementNS(svgNS,"text");
  ct2.setAttribute("x",cx);ct2.setAttribute("y",cy+16);
  ct2.setAttribute("text-anchor","middle");ct2.setAttribute("font-size","10");
  ct2.setAttribute("fill","#6b7385");
  ct2.textContent="順時針＝+5度";
  cfSvg.appendChild(ct2);
}
cfDraw();

const cfPiano=makePiano($("#cf-piano"),{octaves:2,startMidi:48,showLabels:"white",keyW:40,keyH:110});
function cfKeyData(){
  const d=CF[cfSel];
  const pc=nameToPc(d.maj);
  const flat=d.maj.includes("b")||["F"].includes(d.maj);
  const names=SCALES.major.iv.map(iv=> (flat?NOTE_NAMES_FLAT:NOTE_NAMES_SHARP)[(pc+iv)%12]);
  let accList="";
  if(cfSel===0)accList="無升降記號";
  else if(cfSel<=6){ accList="升記號："+SHARP_ORDER.slice(0,cfSel).join("、"); }
  if(cfSel>=6){ const nF=12-cfSel; const alt="降記號："+FLAT_ORDER.slice(0,nF).join("、");
    accList = cfSel===6? accList+"　或　"+alt : alt; }
  return {d,pc,names,accList,flat};
}
function cfInfo(){
  const {d,names,accList}=cfKeyData();
  const left=CF[(cfSel+11)%12].maj, right=CF[(cfSel+1)%12].maj;
  $("#cf-info").innerHTML=
    `<div style="font-size:22px;font-weight:800" class="acc">${d.maj} 大調</div>`+
    `<div>組成音：<b class="mono">${names.join(" – ")}</b></div>`+
    `<div>調號：${accList}</div>`+
    `<div>關係小調：<b class="acc2">${d.min}</b>（共用同一組音）</div>`+
    `<div>左鄰 <b class="mono">${left}</b> = IV（下屬）、右鄰 <b class="mono">${right}</b> = V（屬）</div>`;
  /* 鋼琴亮起音階 */
  const {pc}=cfKeyData();
  const map={};
  for(let m=48;m<=72;m++){
    const rel=((m%12)-pc+12)%12;
    if(SCALES.major.iv.includes(rel)) map[m]={color:rel===0?"#f5a623":"#8ecdf7"};
  }
  cfPiano.highlight(map);
}
cfInfo();
function cfPlayScale(minor){
  const {pc}=cfKeyData();
  const startPc=minor?(pc+9)%12:pc;
  let start=48+startPc; if(start>59)start-=12;
  const ivs=minor?SCALES.minor.iv:SCALES.major.iv;
  const midis=ivs.concat([12]).map(iv=>start+iv);
  Player.play(midis.map((m,i)=>({
    time:i*0.38,dur:0.36,
    fn:(t)=>AudioEngine.piano(m,t,0.45),
    hl:()=>cfPiano.flash(m)
  })));
}
$("#cf-scale").addEventListener("click",()=>cfPlayScale(false));
$("#cf-rel").addEventListener("click",()=>cfPlayScale(true));
$("#cf-145").addEventListener("click",()=>{
  const {pc}=cfKeyData();
  const chords=[0,5,7,0].map(iv=>(pc+iv)%12); // I IV V I
  const evs=[];
  chords.forEach((rootPc,i)=>{
    let base=48+rootPc; if(base>=60)base-=12;
    const ms=[base,base+4,base+7];
    evs.push({time:i*1.0,dur:0.95,
      fn:(t)=>{ms.forEach(m=>AudioEngine.piano(m,t,0.95,0.8));AudioEngine.bass(base-12,t,0.95,0.9);},
      hl:()=>{
        const map={};ms.forEach((m,j)=>map[m]={color:j===0?"#f5a623":"#8ecdf7"});
        cfPiano.highlight(map);
      }});
  });
  Player.play(evs,cfInfo);
});
$("#cf-walk").addEventListener("click",()=>{
  const evs=[];
  for(let i=0;i<=12;i++){
    const idx=i%12;
    const pc=nameToPc(CF[idx].maj);
    let m=36+pc; if(m<36)m+=12;
    evs.push({time:i*0.5,dur:0.48,
      fn:(t)=>AudioEngine.bass(m+12,t,0.55),
      hl:()=>{cfSel=idx;cfDraw();}});
  }
  Player.play(evs,()=>{cfInfo();});
});

/* --- s3: 測驗 --- */
let cq8Score=0,cq8Total=0;
function cq8New(){
  const type=Math.floor(Math.random()*3);
  const i=Math.floor(Math.random()*12);
  const d=CF[i];
  let q,ans,pool;
  if(type===0){
    q=`${d.maj} 大調的關係小調是？`;
    ans=d.min;
    pool=CF.map(x=>x.min);
  }else if(type===1){
    q=`${d.maj} 大調順時針的下一格（往上一個完全五度）是哪個調？`;
    ans=CF[(i+1)%12].maj;
    pool=CF.map(x=>x.maj);
  }else{
    q=`在 ${d.maj} 大調裡，IV 級和弦的根音是？（提示：看左鄰）`;
    ans=CF[(i+11)%12].maj;
    pool=CF.map(x=>x.maj);
  }
  $("#cq8-text").textContent=q;
  const opts=new Set([ans]);
  while(opts.size<4){ opts.add(pool[Math.floor(Math.random()*pool.length)]); }
  const arr=Array.from(opts).sort(()=>Math.random()-0.5);
  const box=$("#cq8-opts");box.innerHTML="";
  arr.forEach(op=>{
    const b=document.createElement("button");
    b.className="btn small secondary";b.textContent=op;
    b.addEventListener("click",()=>{
      cq8Total++;
      const fb=$("#cq8-fb");
      if(op===ans){cq8Score++;fb.textContent="✔ 正確！";fb.className="quiz-fb ok";}
      else{fb.textContent=`✘ 答案是 ${ans}。`;fb.className="quiz-fb no";}
      $("#cq8-score").textContent=`答對 ${cq8Score} / ${cq8Total} 題`;
      setTimeout(cq8New,1300);
    });
    box.appendChild(b);
  });
}
cq8New();
