/* ===== 第 4 章：和聲——音程與和弦 ===== */
const ROOTS=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

/* --- s1: 音程表 --- */
const iTable=$("#i-table");
INTERVALS.forEach(iv=>{
  const tr=document.createElement("tr");
  tr.innerHTML=`<td class="mono">${iv.semi}</td><td>${iv.name}<span style="color:var(--muted)">（${iv.en}）</span></td>
    <td class="mono">${iv.abbr}</td><td>${iv.quality}</td>
    <td><span class="play-ico" data-semi="${iv.semi}">▶</span></td>`;
  iTable.appendChild(tr);
});

/* --- s1: 音程播放器 --- */
const iRoot=$("#i-root");
for(let m=48;m<=60;m++){
  const o=document.createElement("option");o.value=m;o.textContent=midiToNameOct(m);
  if(m===55)o.selected=true;iRoot.appendChild(o);
}
let iSemi=7;
const iPiano=makePiano($("#i-piano"),{octaves:2,startMidi:48,showLabels:"white",keyW:40,keyH:120});
function iRender(){
  const root=parseInt(iRoot.value,10);
  const info=INTERVALS[iSemi];
  $("#i-info").innerHTML=`<b class="acc">${info.name}</b>（${info.abbr}，${iSemi} 個半音）：`+
    `${midiToName(root)} → ${midiToName(root+iSemi)}　聽感：${info.quality}`;
  iPiano.highlight({[root]:{color:"#f5a623",label:"1"},[root+iSemi]:{color:"#4fc3f7",label:info.abbr}});
}
const iSegBtns=segButtons($("#i-seg"),INTERVALS.map(iv=>({key:String(iv.semi),label:iv.abbr})),
  (k)=>{iSemi=parseInt(k,10);iRender();},"7");
iRoot.addEventListener("change",iRender);
iRender();
function iInst(){ return $("#i-bass").checked? AudioEngine.bass: AudioEngine.piano; }
function iPlay(mode,semi,root){
  semi=semi===undefined?iSemi:semi;
  root=root===undefined?parseInt(iRoot.value,10):root;
  const fn=iInst();
  const evs=[];
  if(mode==="mel"){
    evs.push({time:0,dur:0.7,fn:(t)=>fn(root,t,0.8),hl:()=>iPiano.flash(root)});
    evs.push({time:0.75,dur:0.9,fn:(t)=>fn(root+semi,t,1.0),hl:()=>iPiano.flash(root+semi)});
  }else{
    evs.push({time:0,dur:1.6,fn:(t)=>{fn(root,t,1.7,0.8);fn(root+semi,t,1.7,0.8);},
      hl:()=>{iPiano.flash(root);iPiano.flash(root+semi);}});
  }
  Player.play(evs);
}
$("#i-mel").addEventListener("click",()=>iPlay("mel"));
$("#i-harm").addEventListener("click",()=>iPlay("harm"));
$all("#i-table .play-ico").forEach(ic=>{
  ic.addEventListener("click",()=>{
    iSemi=parseInt(ic.dataset.semi,10);
    Object.values(iSegBtns).forEach(b=>b.classList.remove("on"));
    if(iSegBtns[String(iSemi)])iSegBtns[String(iSemi)].classList.add("on");
    iRender();iPlay("mel");
  });
});

/* --- s1: 音程聽力測驗 --- */
const IQ_EASY=[3,4,5,7,12], IQ_ALL=INTERVALS.slice(1).map(i=>i.semi);
let iqAns=null,iqRoot=null,iqScore=0,iqTotal=0;
function iqPlay(){ if(iqAns!==null) iPlay("mel",iqAns,iqRoot); }
function iqRenderOpts(){
  const pool=$("#iq-level").value==="easy"?IQ_EASY:IQ_ALL;
  const box=$("#iq-opts");box.innerHTML="";
  pool.forEach(s=>{
    const info=INTERVALS[s];
    const b=document.createElement("button");
    b.className="btn small secondary";b.textContent=info.abbr+" "+info.name;
    b.addEventListener("click",()=>{
      if(iqAns===null){$("#iq-fb").textContent="先按「出題」！";return;}
      iqTotal++;
      const fb=$("#iq-fb");
      if(s===iqAns){iqScore++;fb.textContent="✔ 正確！";fb.className="quiz-fb ok";}
      else{fb.textContent=`✘ 是 ${INTERVALS[iqAns].name}（${INTERVALS[iqAns].abbr}）。`;fb.className="quiz-fb no";}
      $("#iq-score").textContent=`答對 ${iqScore} / ${iqTotal} 題`;
      iqAns=null;
    });
    box.appendChild(b);
  });
}
$("#iq-level").addEventListener("change",iqRenderOpts);
iqRenderOpts();
$("#iq-new").addEventListener("click",()=>{
  const pool=$("#iq-level").value==="easy"?IQ_EASY:IQ_ALL;
  iqAns=pool[Math.floor(Math.random()*pool.length)];
  iqRoot=48+Math.floor(Math.random()*12);
  $("#iq-fb").textContent="聽聽看兩個音的距離…";
  $("#iq-fb").className="quiz-fb";
  iqPlay();
});
$("#iq-again").addEventListener("click",iqPlay);

/* --- s1: 指板音程形狀 --- */
const ibBoard=makeFretboard($("#ib-board"),{frets:10,fretW:70,showNames:"none"});
const IB_SHAPES=[
  {key:"m3",label:"小三度",semi:3,desc:"同弦 +3 格；或下一弦 −2 格。"},
  {key:"M3",label:"大三度",semi:4,desc:"同弦 +4 格；或下一弦 −1 格。"},
  {key:"P4",label:"完全四度",semi:5,desc:"下一弦同一格——貝斯調音本身就是四度！"},
  {key:"P5",label:"完全五度",semi:7,desc:"下一弦 +2 格。bassline 最常用的好朋友。"},
  {key:"m7",label:"小七度",semi:10,desc:"跨兩弦同一格 −2 格；或下一弦 +5 格。"},
  {key:"P8",label:"八度",semi:12,desc:"跨兩弦 +2 格——經典的八度形狀，放克必備。"}
];
function ibShow(shape){
  const rootS=2, rootF=5; // A 弦第 5 格 = D
  const rootMidi=BASS_OPEN[rootS]+rootF;
  const target=rootMidi+shape.semi;
  const list=[{string:rootS,fret:rootF,color:"#f5a623",label:"R"}];
  for(let s=0;s<4;s++){
    const f=target-BASS_OPEN[s];
    if(f>=0&&f<=10) list.push({string:s,fret:f,color:"#4fc3f7",label:shape.key});
  }
  ibBoard.highlight(list);
  $("#ib-info").innerHTML=`<b class="acc">${shape.label}</b>（+${shape.semi} 半音）：${shape.desc}　亮起的藍點都是同一個音 ${midiToName(target)}。`;
  Player.play([
    {time:0,dur:0.6,fn:(t)=>AudioEngine.bass(rootMidi,t,0.7)},
    {time:0.7,dur:0.9,fn:(t)=>AudioEngine.bass(target,t,1.0)}
  ]);
}
segButtons($("#ib-seg"),IB_SHAPES.map(s=>({key:s.key,label:s.label})),
  (k)=>ibShow(IB_SHAPES.find(s=>s.key===k)),"P5");
ibShow(IB_SHAPES.find(s=>s.key==="P5"));

/* --- s2: 和弦實驗室 --- */
const cRoot=$("#c-root");
ROOTS.forEach(r=>{
  const o=document.createElement("option");o.value=r;o.textContent=r;
  if(r==="C")o.selected=true;cRoot.appendChild(o);
});
let cType="maj";
const cPiano=makePiano($("#c-piano"),{octaves:2,startMidi:48,showLabels:"white",keyW:40,keyH:120});
const cBoard=makeFretboard($("#c-board"),{frets:12,fretW:60,showNames:"none"});
function cMidisPiano(){
  const pc=nameToPc(cRoot.value);
  let base=48+pc; if(base>55)base-=0; // 保持在畫面內
  return CHORDS[cType].iv.map(iv=>base+iv);
}
function cMidisBass(){
  const pc=nameToPc(cRoot.value);
  let root=null;
  for(let m=BASS_OPEN[3];m<=BASS_OPEN[3]+11;m++){ if(m%12===pc){root=m;break;} }
  return CHORDS[cType].iv.map(iv=>root+iv).concat([root+12]);
}
function cRender(){
  const ch=CHORDS[cType];
  const pc=nameToPc(cRoot.value);
  const names=ch.iv.map(iv=>NOTE_NAMES_SHARP[(pc+iv)%12]);
  $("#c-info").innerHTML=`<b class="acc" style="font-size:19px">${cRoot.value}${ch.sym}</b>　${ch.name}　`+
    `公式：<span class="mono">${ch.f}</span>　組成音：<b class="mono">${names.join(" + ")}</b>`;
  const map={};
  cMidisPiano().forEach((m,i)=>{
    map[m]={color:i===0?"#f5a623":"#8ecdf7",label:ch.f.split("-")[i]};
  });
  cPiano.highlight(map);
  const degs=ch.f.split("-");
  const list=[];
  ch.iv.forEach((iv,i)=>{
    const pcN=(pc+iv)%12;
    for(let s=0;s<4;s++)for(let f=0;f<=12;f++){
      if((BASS_OPEN[s]+f)%12===pcN)
        list.push({string:s,fret:f,color:iv%12===(0)?"#f5a623":"#4fc3f7",
          label:iv===0?"R":degs[i]});
    }
  });
  cBoard.highlight(list);
}
segButtons($("#c-seg"),[
  {key:"maj",label:"大"},{key:"min",label:"小 m"},
  {key:"sus2",label:"sus2"},{key:"sus4",label:"sus4"},
  {key:"aug",label:"aug 增"},{key:"dim",label:"dim 減"},
  {key:"p5",label:"5 強力"},
  {key:"maj7",label:"maj7"},{key:"m7",label:"m7"},{key:"dom7",label:"7 屬"},
  {key:"m7b5",label:"m7b5"},{key:"dim7",label:"dim7"}
],(k)=>{cType=k;cRender();},"maj");
cRoot.addEventListener("change",cRender);
cRender();
$("#c-block").addEventListener("click",()=>{
  const ms=cMidisPiano();
  Player.play([{time:0,dur:2.0,
    fn:(t)=>ms.forEach(m=>AudioEngine.piano(m,t,2.1,0.85)),
    hl:()=>ms.forEach(m=>cPiano.flash(m))}]);
});
$("#c-arp").addEventListener("click",()=>{
  const ms=cMidisBass();
  const seq=ms.concat(ms.slice(0,-1).reverse());
  Player.play(seq.map((m,i)=>({
    time:i*0.4,dur:0.38,
    fn:(t)=>AudioEngine.bass(m,t,0.5),
    hl:()=>{const p=findOnFretboard(m,12);if(p)cBoard.flashPos(p.string,p.fret);}
  })));
});
$("#c-vs").addEventListener("click",()=>{
  const pc=nameToPc(cRoot.value);
  const base=48+pc;
  const majMs=CHORDS.maj.iv.map(iv=>base+iv);
  const curMs=cMidisPiano();
  Player.play([
    {time:0,dur:1.2,fn:(t)=>majMs.forEach(m=>AudioEngine.piano(m,t,1.3,0.8)),
      hl:()=>majMs.forEach(m=>cPiano.flash(m,"#9aa3b5"))},
    {time:1.5,dur:1.8,fn:(t)=>curMs.forEach(m=>AudioEngine.piano(m,t,1.9,0.85)),
      hl:()=>curMs.forEach(m=>cPiano.flash(m))}
  ]);
});
$("#c-stop").addEventListener("click",()=>Player.stop());

/* --- s3: 轉位 --- */
const vRoot=$("#v-root");
ROOTS.forEach(r=>{
  const o=document.createElement("option");o.value=r;o.textContent=r;
  if(r==="C")o.selected=true;vRoot.appendChild(o);
});
let vQual="maj", vInv=0;
const vPiano=makePiano($("#v-piano"),{octaves:2,startMidi:48,showLabels:"white",keyW:40,keyH:120});
function vMidis(){
  const pc=nameToPc(vRoot.value);
  const iv=CHORDS[vQual].iv;
  let base=48+pc; if(base>53)base-=12;
  if(base<48)base+=12;
  let ms=iv.map(x=>base+x);
  for(let i=0;i<vInv;i++){ ms=ms.slice(1).concat([ms[0]+12]); }
  return ms;
}
function vRender(){
  const ms=vMidis();
  const pc=nameToPc(vRoot.value);
  const bassNote=midiToName(ms[0]);
  const chordName=vRoot.value+CHORDS[vQual].sym;
  const invNames=["原位","第一轉位","第二轉位","第三轉位"];
  const slash= vInv===0? chordName : `${chordName}/${bassNote}`;
  $("#v-info").innerHTML=`<b class="acc" style="font-size:18px">${slash}</b>　${invNames[vInv]}　`+
    `由低到高：<b class="mono">${ms.map(m=>midiToName(m)).join(" → ")}</b>`+
    `${vInv>0? `　→ 貝斯手請彈 <b class="acc2">${bassNote}</b>`:""}`;
  const map={};
  ms.forEach((m,i)=>{ map[m]={color:i===0?"#f5a623":"#8ecdf7",label:i===0?"低":""}; });
  vPiano.highlight(map);
}
segButtons($("#v-quality"),[
  {key:"maj",label:"大三和弦"},{key:"min",label:"小三和弦"},{key:"maj7",label:"maj7（四個音）"}
],(k)=>{vQual=k; if(vInv>CHORDS[k].iv.length-1)vInv=0; vSegRefresh(); vRender();},"maj");
let vSegEl=$("#v-seg");
function vSegRefresh(){
  vSegEl.innerHTML="";
  const n=CHORDS[vQual].iv.length;
  const names=["原位","第一轉位","第二轉位","第三轉位"].slice(0,n);
  segButtons(vSegEl,names.map((nm,i)=>({key:String(i),label:nm})),
    (k)=>{vInv=parseInt(k,10);vRender();},String(vInv));
}
vSegRefresh();
vRoot.addEventListener("change",vRender);
vRender();
function vPlay(ms){
  Player.play([
    ...ms.map((m,i)=>({time:i*0.3,dur:0.4,fn:(t)=>AudioEngine.piano(m,t,0.5),hl:()=>vPiano.flash(m)})),
    {time:ms.length*0.3+0.2,dur:1.5,fn:(t)=>ms.forEach(m=>AudioEngine.piano(m,t,1.6,0.8))}
  ]);
}
$("#v-play").addEventListener("click",()=>vPlay(vMidis()));
$("#v-cycle").addEventListener("click",()=>{
  const saved=vInv;
  const n=CHORDS[vQual].iv.length;
  const evs=[];
  for(let inv=0;inv<n;inv++){
    vInv=inv;
    const ms=vMidis();
    const off=inv*2.0;
    evs.push({time:off,dur:1.8,
      fn:(t)=>ms.forEach(m=>AudioEngine.piano(m,t,1.8,0.8)),
      hl:()=>{vInv=inv;vSegRefresh();vRender();ms.forEach(m=>vPiano.flash(m));}});
  }
  vInv=saved;
  Player.play(evs,()=>{vSegRefresh();vRender();});
});

/* --- s4: 和弦聽力 --- */
const CQ_POOLS={
  "1":["maj","min"],
  "2":["maj","min","sus4","dim"],
  "3":["maj","min","maj7","m7","dom7"]
};
const CQ_LABEL={maj:"大三和弦",min:"小三和弦",sus4:"sus4",dim:"減三和弦",maj7:"maj7",m7:"m7",dom7:"屬七 (7)"};
let cqAns=null,cqRoot=null,cqScore=0,cqTotal=0;
function cqPlay(){
  if(cqAns===null)return;
  const ms=CHORDS[cqAns].iv.map(iv=>cqRoot+iv);
  Player.play([
    {time:0,dur:1.4,fn:(t)=>ms.forEach(m=>AudioEngine.piano(m,t,1.5,0.85))},
    ...ms.map((m,i)=>({time:1.6+i*0.3,dur:0.32,fn:(t)=>AudioEngine.piano(m,t,0.4)}))
  ]);
}
function cqOpts(){
  const pool=CQ_POOLS[$("#cq-level").value];
  const box=$("#cq-opts");box.innerHTML="";
  pool.forEach(k=>{
    const b=document.createElement("button");
    b.className="btn small secondary";b.textContent=CQ_LABEL[k];
    b.addEventListener("click",()=>{
      if(cqAns===null){$("#cq-fb").textContent="先按「出題」！";return;}
      cqTotal++;
      const fb=$("#cq-fb");
      if(k===cqAns){cqScore++;fb.textContent="✔ 正確！";fb.className="quiz-fb ok";}
      else{fb.textContent=`✘ 是 ${CQ_LABEL[cqAns]}。再聽一次感受它的個性。`;fb.className="quiz-fb no";}
      $("#cq-score").textContent=`答對 ${cqScore} / ${cqTotal} 題`;
      cqAns=null;
    });
    box.appendChild(b);
  });
}
$("#cq-level").addEventListener("change",cqOpts);
cqOpts();
$("#cq-new").addEventListener("click",()=>{
  const pool=CQ_POOLS[$("#cq-level").value];
  cqAns=pool[Math.floor(Math.random()*pool.length)];
  cqRoot=48+Math.floor(Math.random()*12);
  $("#cq-fb").textContent="聽聽這個和弦的表情…";
  $("#cq-fb").className="quiz-fb";
  cqPlay();
});
$("#cq-again").addEventListener("click",cqPlay);
