/* ===== 第 5 章：和弦進行 ===== */
const ROOTS=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const MAJ_IV=[0,2,4,5,7,9,11];
const MIN_IV=[0,2,3,5,7,8,10];
const MAJ_QUAL=["maj","min","min","maj","maj","min","dim"];
const MIN_QUAL=["min","dim","maj","min","min","maj","maj"];
const MAJ_RN=["I","ii","iii","IV","V","vi","vii°"];
const MIN_RN=["i","ii°","III","iv","v","VI","VII"];
const QUAL_IV={maj:[0,4,7],min:[0,3,7],dim:[0,3,6]};
const QUAL_SYM={maj:"",min:"m",dim:"°"};

/* --- s1: 順階和弦實驗室 --- */
const dKey=$("#d-key");
ROOTS.forEach(r=>{
  const o=document.createElement("option");o.value=r;o.textContent=r;
  if(r==="C")o.selected=true;dKey.appendChild(o);
});
let dMinor=false;
const dPiano=makePiano($("#d-piano"),{octaves:2,startMidi:48,showLabels:"white",keyW:40,keyH:110});
function diatonic(keyPc,minor){
  const scale=minor?MIN_IV:MAJ_IV;
  const quals=minor?MIN_QUAL:MAJ_QUAL;
  const rns=minor?MIN_RN:MAJ_RN;
  return scale.map((iv,i)=>{
    const rootPc=(keyPc+iv)%12;
    return {
      rn:rns[i], qual:quals[i],
      name:NOTE_NAMES_SHARP[rootPc]+QUAL_SYM[quals[i]],
      rootPc,
      midis:QUAL_IV[quals[i]].map(x=>{
        let base=48+rootPc; if(base>=60)base-=12;
        return base+x;
      })
    };
  });
}
function dRender(){
  const chords=diatonic(nameToPc(dKey.value),dMinor);
  const box=$("#d-chords");box.innerHTML="";
  chords.forEach((ch,i)=>{
    const div=document.createElement("div");
    div.style.cssText="background:var(--card2);border:1px solid var(--line);border-radius:10px;padding:10px 14px;cursor:pointer;text-align:center;min-width:76px";
    div.innerHTML=`<div class="mono" style="color:var(--accent);font-weight:800;font-size:16px">${ch.rn}</div>
      <div style="font-weight:700">${ch.name}</div>
      <div style="font-size:11.5px;color:var(--muted)">${{maj:"大",min:"小",dim:"減"}[ch.qual]}</div>`;
    div.addEventListener("click",()=>{
      const map={};
      ch.midis.forEach((m,j)=>map[m]={color:j===0?"#f5a623":"#8ecdf7"});
      dPiano.highlight(map);
      $("#d-info").innerHTML=`<b class="acc">${ch.rn} = ${ch.name}</b>　組成音：${ch.midis.map(m=>midiToName(m)).join("+")}`;
      Player.play([{time:0,dur:1.5,fn:(t)=>ch.midis.forEach(m=>AudioEngine.piano(m,t,1.6,0.85))}]);
    });
    box.appendChild(div);
  });
}
segButtons($("#d-mode"),[
  {key:"maj",label:"大調"},{key:"min",label:"小調"}
],(k)=>{dMinor=(k==="min");dRender();},"maj");
dKey.addEventListener("change",dRender);
dRender();
$("#d-playall").addEventListener("click",()=>{
  const chords=diatonic(nameToPc(dKey.value),dMinor);
  const evs=[];
  chords.forEach((ch,i)=>{
    evs.push({time:i*1.0,dur:0.95,
      fn:(t)=>ch.midis.forEach(m=>AudioEngine.piano(m,t,0.95,0.8)),
      hl:()=>{
        const map={};
        ch.midis.forEach((m,j)=>map[m]={color:j===0?"#f5a623":"#8ecdf7"});
        dPiano.highlight(map);
        $("#d-info").innerHTML=`<b class="acc">${ch.rn} = ${ch.name}</b>`;
      }});
  });
  Player.play(evs);
});

/* --- s2: 功能引力 --- */
function fChord(rn, keyPc){
  const chords=diatonic(keyPc,false);
  return chords[MAJ_RN.indexOf(rn)];
}
function fPlaySeq(rns, resolveTail){
  const keyPc=0; // C 大調示範
  const evs=[];
  rns.forEach((rn,i)=>{
    const ch=fChord(rn,keyPc);
    const bass=36+ch.rootPc;
    evs.push({time:i*1.1,dur:1.05,
      fn:(t)=>{
        ch.midis.forEach(m=>AudioEngine.piano(m,t,1.05,0.8));
        AudioEngine.bass(bass,t,1.05,0.9);
      }});
  });
  Player.play(evs);
}
$("#f-cadence").addEventListener("click",()=>fPlaySeq(["I","IV","V","I"]));
$("#f-hang").addEventListener("click",()=>fPlaySeq(["I","IV","V"]));
$("#f-resolve").addEventListener("click",()=>fPlaySeq(["V","I"]));

/* --- s3: 進行播放器 --- */
const pgKey=$("#pg-key");
ROOTS.forEach(r=>{
  const o=document.createElement("option");o.value=r;o.textContent=r+" 大調";
  if(r==="C")o.selected=true;pgKey.appendChild(o);
});
$("#pg-bpm").addEventListener("input",()=>{$("#pg-bpmv").textContent=$("#pg-bpm").value;});
let pgSeq=["I","V","vi","IV"];
let pgTimer=null;
function pgRenderSeq(activeIdx){
  const box=$("#pg-seq");box.innerHTML="";
  const chords=diatonic(nameToPc(pgKey.value),false);
  if(pgSeq.length===0){
    box.innerHTML=`<span style="color:var(--muted);font-size:14px">（序列是空的——按上面的羅馬數字加進來）</span>`;
    return;
  }
  pgSeq.forEach((rn,i)=>{
    const ch=chords[MAJ_RN.indexOf(rn)];
    const d=document.createElement("div");
    d.style.cssText=`background:${i===activeIdx?"var(--accent)":"var(--card2)"};color:${i===activeIdx?"#141414":"var(--text)"};border:1px solid var(--line);border-radius:10px;padding:8px 14px;text-align:center;min-width:64px;transition:background .1s`;
    d.innerHTML=`<div class="mono" style="font-weight:800">${rn}</div><div style="font-size:12.5px">${ch.name}</div>`;
    box.appendChild(d);
  });
}
segButtons($("#pg-add"),MAJ_RN.map(rn=>({key:rn,label:rn})),(rn)=>{
  if(pgSeq.length<16){pgSeq.push(rn);pgRenderSeq();}
});
$all(".pg-preset").forEach(b=>{
  b.addEventListener("click",()=>{pgSeq=b.dataset.p.split(",");pgRenderSeq();});
});
$("#pg-back").addEventListener("click",()=>{pgSeq.pop();pgRenderSeq();});
$("#pg-clearseq").addEventListener("click",()=>{pgSeq=[];pgRenderSeq();});
pgKey.addEventListener("change",()=>pgRenderSeq());
pgRenderSeq();

function pgStop(){
  if(pgTimer){clearTimeout(pgTimer);pgTimer=null;}
  Player.stop();
  pgRenderSeq();
}
$("#pg-stop").addEventListener("click",pgStop);
function pgBar(ch, t0, beat){
  /* 一小節：鋼琴和弦 + 鼓 + 貝斯 */
  let bassRoot=36+ch.rootPc; if(bassRoot>43)bassRoot-=12;
  const mode=$("#pg-bassmode").value;
  /* 鋼琴：第 1、3 拍 */
  [0,2].forEach(b=>{
    ch.midis.forEach(m=>AudioEngine.piano(m,t0+b*beat,beat*1.8,0.55));
  });
  /* 鼓：kick 1,3、snare 2,4、hihat click 每拍 */
  AudioEngine.drum(t0,"kick");AudioEngine.drum(t0+2*beat,"kick");
  AudioEngine.drum(t0+beat,"snare");AudioEngine.drum(t0+3*beat,"snare");
  /* 貝斯 */
  if(mode==="root"){
    [0,1,2,3].forEach(b=>AudioEngine.bass(bassRoot,t0+b*beat,beat*0.9,0.95));
  }else if(mode==="r5"){
    AudioEngine.bass(bassRoot,t0,beat*0.9);
    AudioEngine.bass(bassRoot+7,t0+beat,beat*0.9,0.85);
    AudioEngine.bass(bassRoot,t0+2*beat,beat*0.9);
    AudioEngine.bass(bassRoot+7,t0+3*beat,beat*0.9,0.85);
  }else{
    const third=(diatonicQualIsMinor(ch.qual))?3:4;
    AudioEngine.bass(bassRoot,t0,beat*0.9);
    AudioEngine.bass(bassRoot+third,t0+beat,beat*0.9,0.85);
    AudioEngine.bass(bassRoot+7,t0+2*beat,beat*0.9,0.85);
    AudioEngine.bass(bassRoot+third,t0+3*beat,beat*0.9,0.8);
  }
}
function diatonicQualIsMinor(q){return q==="min"||q==="dim";}
function pgPlayOnce(){
  if(pgSeq.length===0)return;
  const bpm=parseInt($("#pg-bpm").value,10);
  const beat=60/bpm;
  const chords=diatonic(nameToPc(pgKey.value),false);
  const t0=AudioEngine.now()+0.1;
  pgSeq.forEach((rn,i)=>{
    const ch=chords[MAJ_RN.indexOf(rn)];
    pgBar(ch,t0+i*4*beat,beat);
    setTimeout(()=>pgRenderSeq(i), (t0-AudioEngine.now()+i*4*beat)*1000);
  });
  const total=pgSeq.length*4*beat;
  pgTimer=setTimeout(()=>{
    if($("#pg-loop").checked){pgPlayOnce();}
    else{pgRenderSeq();pgTimer=null;}
  }, total*1000);
}
$("#pg-play").addEventListener("click",()=>{pgStop();AudioEngine.ensure();pgPlayOnce();});
