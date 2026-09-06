/* ===== 闖關模式 ===== */

/* ---------- 關卡定義 ---------- */
const LEVELS=[
  {id:1, type:"hunt",   name:"暖身：找出 C",     sub:"在指板上找出 3 個 C（有自然音提示）",        cfg:{note:"C", count:3, time:90, hint:true},  help:"看不懂指板？先翻第 2 章「認識整個指板」，再回來玩。"},
  {id:2, type:"ear",    name:"哪個音比較高？",   sub:"聽兩個音，判斷第二個音較高或較低（5 題）",   cfg:{mode:"pitch", n:5},                      help:"聽不出來就多按幾次「再聽一次」，注意音的明亮度。"},
  {id:3, type:"rhythm", name:"穩住四拍",         sub:"BPM 80・跟著節拍點 2 小節",                  cfg:{bpm:80, bars:2, sub:1},                  help:"先聽完 1 小節前導拍再開始點，跟著「叩」的聲音。"},
  {id:4, type:"hunt",   name:"指板尋寶：G",      sub:"找出 4 個 G（沒有提示了！）",                cfg:{note:"G", count:4, time:75, hint:false}, help:"提示：最細那條空弦就是 G。"},
  {id:5, type:"ear",    name:"大調 vs 小調",     sub:"聽音階判斷是明亮還是憂鬱（5 題）",           cfg:{mode:"scale", n:5},                      help:"卡關了？回第 3 章的「耳朵訓練」多練幾輪。"},
  {id:6, type:"rhythm", name:"加速四拍",         sub:"BPM 100・2 小節",                            cfg:{bpm:100, bars:2, sub:1},                 help:"身體跟著搖，比用腦數拍更準。"},
  {id:7, type:"hunt",   name:"指板尋寶：A",      sub:"限時 60 秒找出 5 個 A",                      cfg:{note:"A", count:5, time:60, hint:false}, help:"A 弦空弦、E 弦第 5 格……還有呢？"},
  {id:8, type:"ear",    name:"聽距離：入門音程", sub:"分辨八度、完全五度、大三度（6 題）",         cfg:{mode:"interval", pool:[4,7,12], n:6},    help:"八度像「同一個音變高」，五度最空曠，三度最甜。第 4 章有完整練習。"},
  {id:9, type:"rhythm", name:"八分音符登場",     sub:"BPM 90・每拍點 2 下・2 小節",                cfg:{bpm:90, bars:2, sub:2},                  help:"嘴裡念「1 &amp; 2 &amp; 3 &amp; 4 &amp;」會容易很多。"},
  {id:10,type:"hunt",   name:"指板尋寶：F",      sub:"50 秒找出 4 個 F",                           cfg:{note:"F", count:4, time:50, hint:false}, help:"E 的隔壁格就是 F（E–F 天生只差半音）。"},
  {id:11,type:"ear",    name:"和弦的表情",       sub:"大三和弦 vs 小三和弦（6 題）",               cfg:{mode:"chord", pool:["maj","min"], n:6},  help:"大＝開心、小＝憂鬱。第 4 章的和弦實驗室可以無限試聽。"},
  {id:12,type:"rhythm", name:"再快一點",         sub:"BPM 110・3 小節",                            cfg:{bpm:110, bars:3, sub:1},                 help:""},
  {id:13,type:"hunt",   name:"黑鍵出沒：D#",     sub:"找出 4 個 D#／Eb",                           cfg:{note:"D#", count:4, time:60, hint:false},help:"先找到 D，再往琴身方向移 1 格。"},
  {id:14,type:"ear",    name:"聽距離：進階音程", sub:"六種音程混合出題（6 題）",                   cfg:{mode:"interval", pool:[2,4,5,7,9,12], n:6}, help:"把每種音程連結到一首熟悉的歌，會突然變簡單。"},
  {id:15,type:"rhythm", name:"八分音符進階",     sub:"BPM 100・每拍 2 下・3 小節",                 cfg:{bpm:100, bars:3, sub:2},                 help:""},
  {id:16,type:"hunt",   name:"指板大師：B",      sub:"50 秒找出 5 個 B",                           cfg:{note:"B", count:5, time:50, hint:false}, help:"B–C 也只差半音——從 C 往回退 1 格。"},
  {id:17,type:"ear",    name:"三種和弦聽辨",     sub:"大・小・屬七和弦（8 題）",                   cfg:{mode:"chord", pool:["maj","min","dom7"], n:8}, help:"屬七＝大三和弦＋一點藍調的「不安定感」。"},
  {id:18,type:"rhythm", name:"最終考驗",         sub:"BPM 120・每拍 2 下・4 小節",                 cfg:{bpm:120, bars:4, sub:2},                 help:"守住 Perfect，你就是 Groove 大師。"}
];
const TYPE_LABEL={hunt:"指板尋寶", ear:"耳朵大冒險", rhythm:"節奏跟拍"};
const TITLES=[["見習樂手",0],["車庫樂手",80],["排練室常客",200],["舞台新星",380],["錄音室樂手",620],["Groove 大師",900]];

/* ---------- 存檔 ---------- */
function gLoad(){
  try{ return JSON.parse(localStorage.getItem("bl-game-v1"))||{stars:{}}; }
  catch(e){ return {stars:{}}; }
}
function gSave(st){ try{ localStorage.setItem("bl-game-v1", JSON.stringify(st)); }catch(e){} }
let G=gLoad();
function gXp(){ return LEVELS.reduce((s,lv)=>s+(G.stars[lv.id]||0)*(10+lv.id),0); }
function gStarsTotal(){ return LEVELS.reduce((s,lv)=>s+(G.stars[lv.id]||0),0); }
function gUnlocked(id){ return id===1 || (G.stars[id-1]||0)>=1; }

/* ---------- 頁首統計 ---------- */
function gRenderStats(){
  const xp=gXp();
  $("#g-stars-total").textContent=gStarsTotal();
  $("#g-xp").textContent=xp;
  let cur=TITLES[0], next=null;
  TITLES.forEach(t=>{ if(xp>=t[1])cur=t; });
  next=TITLES[TITLES.indexOf(cur)+1]||null;
  $("#g-title").textContent=cur[0];
  if(next){
    $("#g-next-label").textContent=`距離「${next[0]}」`;
    $("#g-next-num").textContent=`${xp} / ${next[1]} XP`;
    $("#g-xpfill").style.width=Math.min(100,Math.round((xp-cur[1])/(next[1]-cur[1])*100))+"%";
  }else{
    $("#g-next-label").textContent="已達最高稱號 🏆";
    $("#g-next-num").textContent=`${xp} XP`;
    $("#g-xpfill").style.width="100%";
  }
}

/* ---------- 關卡地圖 ---------- */
function starHtml(n){
  let s="";
  for(let i=1;i<=3;i++) s+=`<span class="${i<=n?"on":"off"}">★</span>`;
  return s;
}
function gRenderMap(){
  const map=$("#g-map"); map.innerHTML="";
  LEVELS.forEach(lv=>{
    const unlocked=gUnlocked(lv.id);
    const st=G.stars[lv.id]||0;
    const d=document.createElement("div");
    d.className="g-lv"+(unlocked?"":" locked");
    d.innerHTML=`<div class="top"><span class="no">LV ${String(lv.id).padStart(2,"0")}</span>
      <span class="type ${lv.type}">${unlocked?TYPE_LABEL[lv.type]:"🔒 未解鎖"}</span></div>
      <h3>${lv.name}</h3><div class="sub">${lv.sub}</div>
      <div class="stars">${starHtml(st)}</div>`;
    if(unlocked) d.addEventListener("click",()=>gOpen(lv));
    map.appendChild(d);
  });
}

/* ---------- 遊玩框架 ---------- */
let gCleanup=null;
function gOpen(lv){
  if(gCleanup){gCleanup();gCleanup=null;}
  Player.stop();
  $("#g-map").style.display="none";
  $("#g-play").style.display="block";
  $("#g-play-title").textContent=`Lv.${lv.id}　${lv.name}`;
  $("#g-play-desc").innerHTML=`<b>${TYPE_LABEL[lv.type]}</b>｜${lv.sub}${lv.help?`　<span style="color:var(--muted)">💡 ${lv.help}</span>`:""}`;
  $("#g-hud").innerHTML="";
  $("#g-arena").innerHTML="";
  if(lv.type==="hunt")playHunt(lv);
  else if(lv.type==="ear")playEar(lv);
  else playRhythm(lv);
  window.scrollTo({top:0,behavior:"smooth"});
}
function gBackToMap(){
  if(gCleanup){gCleanup();gCleanup=null;}
  Player.stop();
  $("#g-play").style.display="none";
  $("#g-map").style.display="grid";
  gRenderStats(); gRenderMap();
}
$("#g-back").addEventListener("click",gBackToMap);
$("#g-reset").addEventListener("click",()=>{
  if(confirm("確定要清除全部星星與經驗值嗎？")){
    G={stars:{}}; gSave(G); gRenderStats(); gRenderMap();
  }
});

function gFinish(lv, stars){
  if(gCleanup){gCleanup();gCleanup=null;}
  const prev=G.stars[lv.id]||0;
  const oldXp=gXp();
  if(stars>prev){ G.stars[lv.id]=stars; gSave(G); }
  const gained=gXp()-oldXp;
  gRenderStats();
  const next=LEVELS.find(x=>x.id===lv.id+1);
  const arena=$("#g-arena");
  const win=stars>0;
  arena.innerHTML=`<div class="g-result">
    <div class="big">${starHtml(stars)}</div>
    <h3>${win?(stars===3?"完美通關！":"過關！"):"再試一次！"}</h3>
    <p>${win?(gained>0?`獲得 ${gained} XP`:"（已拿過相同或更多星星）"):"差一點點，馬上再來一次就會了。"}</p>
    <div class="controls" style="justify-content:center;margin-top:18px">
      <button class="btn secondary" id="gr-retry">↻ 再玩一次</button>
      ${win&&next?`<button class="btn" id="gr-next">▶ 下一關：Lv.${next.id}</button>`:""}
      <button class="btn secondary" id="gr-map">回地圖</button>
    </div></div>`;
  if(win)Player.play([
    {time:0,dur:.2,fn:t=>AudioEngine.piano(72,t,.3)},
    {time:.15,dur:.2,fn:t=>AudioEngine.piano(76,t,.3)},
    {time:.3,dur:.5,fn:t=>AudioEngine.piano(79,t,.6)},
    {time:.45,dur:.8,fn:t=>AudioEngine.piano(84,t,.9)}
  ]);
  $("#gr-retry").addEventListener("click",()=>gOpen(lv));
  if(win&&next)$("#gr-next")&&$("#gr-next").addEventListener("click",()=>gOpen(next));
  $("#gr-map").addEventListener("click",gBackToMap);
}

/* ---------- 遊戲 1：指板尋寶 ---------- */
function playHunt(lv){
  const cfg=lv.cfg, pc=nameToPc(cfg.note);
  let occ=0;
  for(let s=0;s<4;s++)for(let f=0;f<=12;f++){ if((BASS_OPEN[s]+f)%12===pc)occ++; }
  const need=Math.min(cfg.count,occ);
  let timeLeft=cfg.time, found={}, done=false;
  $("#g-hud").innerHTML=`
    <div class="g-chip">目標：找出 <b>${need}</b> 個 <b style="font-size:17px">${cfg.note}</b></div>
    <div class="g-chip">進度 <b id="gh-found">0</b> / ${need}</div>
    <div class="g-chip time">⏱ <b id="gh-time">${timeLeft}</b> 秒</div>`;
  const arena=$("#g-arena");
  arena.innerHTML=`<div id="gh-board"></div><div class="g-msg" id="gh-msg">點指板上的位置——找到 ${cfg.note} 就會亮綠燈！</div>`;
  const fb=makeFretboard($("#gh-board"),{frets:12,fretW:58,showNames:cfg.hint?"natural":"none",
    onClick:(midi,s,f)=>{
      if(done)return;
      const key=s+"_"+f, msg=$("#gh-msg");
      if(midi%12===pc){
        if(found[key])return;
        found[key]=true;
        fb.highlight(Object.keys(found).map(k=>{
          const [ss,ff]=k.split("_").map(Number);
          return {string:ss,fret:ff,color:"#66d9a3",label:cfg.note};
        }));
        const n=Object.keys(found).length;
        $("#gh-found").textContent=n;
        msg.textContent=`✔ 找到了！（${n}/${need}）`; msg.className="g-msg ok";
        if(n>=need){
          done=true; clearInterval(timer);
          const ratio=timeLeft/cfg.time;
          gFinish(lv, ratio>=0.55?3:(ratio>=0.25?2:1));
        }
      }else{
        msg.textContent=`✘ 那是 ${midiToName(midi)}，扣 5 秒！`; msg.className="g-msg no";
        timeLeft=Math.max(0,timeLeft-5);
        $("#gh-time").textContent=timeLeft;
      }
    }});
  const timer=setInterval(()=>{
    if(done)return;
    timeLeft--;
    $("#gh-time").textContent=Math.max(0,timeLeft);
    if(timeLeft<=0){ done=true; clearInterval(timer); gFinish(lv,0); }
  },1000);
  gCleanup=()=>{ done=true; clearInterval(timer); };
}

/* ---------- 遊戲 2：耳朵大冒險 ---------- */
function playEar(lv){
  const cfg=lv.cfg;
  let qi=0, lives=3, wrong=0, cur=null, done=false;
  const results=[];
  $("#g-hud").innerHTML=`
    <div class="g-chip">第 <b id="ge-qi">1</b> / ${cfg.n} 題</div>
    <div class="g-chip g-hearts" id="ge-hearts"></div>
    <div class="g-dots" id="ge-dots"></div>`;
  function hearts(){ $("#ge-hearts").innerHTML="❤️".repeat(lives)+"🖤".repeat(3-lives); }
  function dots(){
    const d=$("#ge-dots"); d.innerHTML="";
    for(let i=0;i<cfg.n;i++){
      const s=document.createElement("span");
      if(i<results.length)s.className=results[i]?"ok":"no";
      else if(i===qi)s.className="now";
      d.appendChild(s);
    }
  }
  hearts(); dots();
  const arena=$("#g-arena");
  arena.innerHTML=`<div class="g-bigplay"><button class="btn" id="ge-play" style="font-size:17px;padding:14px 34px">🔊 播放題目</button>
    <button class="btn secondary" id="ge-again" style="margin-left:10px">↻ 再聽一次</button></div>
    <div class="quiz-opts" id="ge-opts" style="justify-content:center"></div>
    <div class="g-msg center" id="ge-msg"></div>`;
  const IV_LABEL={2:"大二度",4:"大三度",5:"完全四度",7:"完全五度",9:"大六度",12:"八度"};
  const CH_LABEL={maj:"大三和弦 😊",min:"小三和弦 😢",dom7:"屬七和弦 😏"};
  function makeQ(){
    if(cfg.mode==="pitch"){
      const a=52+Math.floor(Math.random()*16);
      const d=(3+Math.floor(Math.random()*7))*(Math.random()<0.5?1:-1);
      const b=a+d;
      return {play:()=>Player.play([
          {time:0,dur:.6,fn:t=>AudioEngine.piano(a,t,.7)},
          {time:.75,dur:.8,fn:t=>AudioEngine.piano(b,t,.9)}]),
        opts:["第二個音比較高","第二個音比較低"], ans:d>0?0:1};
    }
    if(cfg.mode==="scale"){
      const root=50+Math.floor(Math.random()*10);
      const maj=Math.random()<0.5;
      const ivs=(maj?SCALES.major.iv:SCALES.minor.iv).concat([12]);
      return {play:()=>Player.play(ivs.map((iv,i)=>({time:i*.33,dur:.3,fn:t=>AudioEngine.piano(root+iv,t,.38)}))),
        opts:["大調 😊 明亮","小調 😢 憂鬱"], ans:maj?0:1};
    }
    if(cfg.mode==="interval"){
      const semi=cfg.pool[Math.floor(Math.random()*cfg.pool.length)];
      const root=48+Math.floor(Math.random()*12);
      return {play:()=>Player.play([
          {time:0,dur:.55,fn:t=>AudioEngine.piano(root,t,.65)},
          {time:.7,dur:.8,fn:t=>AudioEngine.piano(root+semi,t,.95)}]),
        opts:cfg.pool.map(s=>IV_LABEL[s]), ans:cfg.pool.indexOf(semi)};
    }
    /* chord */
    const q=cfg.pool[Math.floor(Math.random()*cfg.pool.length)];
    const root=48+Math.floor(Math.random()*12);
    const ms=CHORDS[q].iv.map(iv=>root+iv);
    return {play:()=>Player.play([
        {time:0,dur:1.2,fn:t=>ms.forEach(m=>AudioEngine.piano(m,t,1.3,.85))},
        ...ms.map((m,i)=>({time:1.4+i*.28,dur:.3,fn:t=>AudioEngine.piano(m,t,.36)}))]),
      opts:cfg.pool.map(x=>CH_LABEL[x]), ans:cfg.pool.indexOf(q)};
  }
  function nextQ(){
    cur=makeQ();
    $("#ge-qi").textContent=qi+1;
    $("#ge-msg").textContent=""; $("#ge-msg").className="g-msg center";
    const box=$("#ge-opts"); box.innerHTML="";
    cur.opts.forEach((op,i)=>{
      const b=document.createElement("button");
      b.className="btn secondary"; b.textContent=op;
      b.addEventListener("click",()=>{
        if(done)return;
        const ok=i===cur.ans;
        results.push(ok);
        const msg=$("#ge-msg");
        if(ok){ msg.textContent="✔ 答對了！"; msg.className="g-msg center ok"; }
        else{ wrong++; lives--; hearts();
          msg.textContent=`✘ 正確答案：${cur.opts[cur.ans]}`; msg.className="g-msg center no"; }
        qi++; dots();
        if(lives<=0){ done=true; setTimeout(()=>gFinish(lv,0),900); return; }
        if(qi>=cfg.n){
          done=true;
          setTimeout(()=>gFinish(lv, wrong===0?3:(wrong===1?2:1)),900);
          return;
        }
        setTimeout(()=>{ nextQ(); cur.play(); },1000);
      });
      box.appendChild(b);
    });
    dots();
  }
  $("#ge-play").addEventListener("click",()=>cur&&cur.play());
  $("#ge-again").addEventListener("click",()=>cur&&cur.play());
  nextQ();
  gCleanup=()=>{ done=true; };
}

/* ---------- 遊戲 3：節奏跟拍 ---------- */
function playRhythm(lv){
  const cfg=lv.cfg, beat=60/cfg.bpm, step=beat/cfg.sub;
  const total=cfg.bars*4*cfg.sub;
  let expected=[], matched=[], running=false, doneFlag=false, endTimer=null;
  let stats={p:0,g:0}, combo=0;
  let latency=0, offset=0, pulseTimers=[];
  $("#g-hud").innerHTML=`
    <div class="g-chip">BPM <b>${cfg.bpm}</b></div>
    <div class="g-chip">${cfg.sub===1?"每拍點 1 下":"每拍點 2 下（八分音符）"}・${cfg.bars} 小節</div>
    <div class="g-chip">連擊 <b id="gr-combo">0</b></div>`;
  const arena=$("#g-arena");
  arena.innerHTML=`
    <div class="center" style="color:var(--muted);font-size:14px">按「開始」→ 先聽 1 小節前導拍（叩、叩、叩、叩）→ 跟著每個「叩」點大按鈕</div>
    <div class="g-bigplay"><button class="btn" id="gr-start" style="font-size:17px;padding:14px 40px">▶ 開始</button></div>
    <div class="g-bigplay"><button class="g-tap" id="gr-tap">🥁 點我跟拍</button></div>
    <div class="g-feedback" id="gr-fb"></div>`;
  function pulse(accent){
    const pad=$("#gr-tap"); if(!pad)return;
    pad.style.boxShadow=accent?"0 0 0 8px rgba(245,166,35,.55)":"0 0 0 5px rgba(79,195,247,.45)";
    setTimeout(()=>{ if(pad)pad.style.boxShadow="none"; },110);
  }
  function start(){
    if(running)return;
    running=true; expected=[]; matched=[]; stats={p:0,g:0}; combo=0; offset=0;
    pulseTimers.forEach(id=>clearTimeout(id)); pulseTimers=[];
    $("#gr-combo").textContent="0"; $("#gr-fb").textContent="";
    const c=AudioEngine.ensure();
    /* 補償裝置音訊延遲（藍牙耳機可達 0.2 秒以上）*/
    latency=Math.min(0.35,(c.outputLatency||0)+(c.baseLatency||0));
    const t0=c.currentTime+0.35;
    /* 前導 1 小節（畫面同步倒數）*/
    for(let b=0;b<4;b++){
      AudioEngine.click(t0+b*beat, b===0);
      pulseTimers.push(setTimeout(()=>{
        const fb=$("#gr-fb");
        if(fb&&running){fb.textContent=["4","3","2","1"][b];fb.style.color="var(--muted)";}
        pulse(b===0);
      },(t0+b*beat+latency-c.currentTime)*1000));
    }
    const play0=t0+4*beat;
    for(let i=0;i<total;i++){
      const t=play0+i*step;
      expected.push(t); matched.push(false);
      const onBeat=i%cfg.sub===0;
      AudioEngine.click(t, onBeat && (i/cfg.sub)%4===0);
      if(onBeat){
        const bi=(i/cfg.sub)%4;
        AudioEngine.drum(t, (bi===0||bi===2)?"kick":"snare");
      }
      /* 視覺節拍：按鈕跟著閃 */
      pulseTimers.push(setTimeout(()=>{ if(running)pulse(onBeat&&(i/cfg.sub)%4===0); },
        (t+latency-c.currentTime)*1000));
    }
    const endT=(play0+total*step+0.55-c.currentTime)*1000;
    endTimer=setTimeout(()=>{
      if(doneFlag)return;
      doneFlag=true; running=false;
      const missed=matched.filter(m=>!m).length;
      const score=(stats.p+stats.g*0.6)/total;
      let stars=0;
      if(missed<=total*0.1 && score>=0.85)stars=3;
      else if(score>=0.6)stars=2;
      else if(score>=0.35)stars=1;
      gFinish(lv,stars);
    }, endT);
  }
  function tap(){
    const c=AudioEngine.ensure();
    if(!running)return;
    /* 扣掉裝置延遲與個人偏移後再比對 */
    const t=c.currentTime-latency-offset;
    let best=-1,bestD=1e9;
    expected.forEach((et,i)=>{
      if(matched[i])return;
      const d=Math.abs(t-et);
      if(d<bestD){bestD=d;best=i;}
    });
    const fb=$("#gr-fb");
    const signed=best>=0? t-expected[best]:0;
    if(best>=0 && bestD<=0.12){ matched[best]=true; stats.p++; combo++;
      fb.textContent="PERFECT！"; fb.style.color="var(--green)"; }
    else if(best>=0 && bestD<=0.25){ matched[best]=true; stats.g++; combo++;
      fb.textContent="GOOD"; fb.style.color="var(--accent2)"; }
    else{
      combo=0;
      if(bestD>0.4){ fb.textContent="…等節拍來再點"; }
      else{ fb.textContent=signed<0?"早了一點！":"晚了一點！"; }
      fb.style.color="var(--red)";
    }
    /* 自動校正：往你的穩定偏移靠攏（節奏穩比絕對準更重要）*/
    if(best>=0 && bestD<=0.25){
      offset=Math.max(-0.25,Math.min(0.25, offset+signed*0.35));
    }
    $("#gr-combo").textContent=combo;
  }
  $("#gr-start").addEventListener("click",start);
  $("#gr-tap").addEventListener("pointerdown",e=>{e.preventDefault();tap();});
  gCleanup=()=>{ doneFlag=true; running=false;
    if(endTimer)clearTimeout(endTimer);
    pulseTimers.forEach(id=>clearTimeout(id)); pulseTimers=[]; };
}

/* ---------- 初始化 ---------- */
gRenderStats();
gRenderMap();
