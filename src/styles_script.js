/* ===== 曲風百科 =====
   示範 groove 皆為本站原創編寫的通用風格型樂句（非任何現有歌曲的採譜）。 */

const STYLES={
rock:{
  name:"Rock 搖滾", bpm:100, swing:0,
  intro:[
    "搖滾的核心是能量與推進感。電吉他負責牆一般的和弦，鼓組打直來直往的 backbeat（小鼓在 2、4 拍），而貝斯是把這一切釘在地上的那根柱子。",
    "貝斯的角色：跟大鼓鎖在一起，用穩定的八分音符根音「推」整首歌前進。不花俏，但少了它整個樂團會立刻散掉——搖滾貝斯的美學是『穩定就是力量』。"
  ],
  traits:["典型速度 90–140 BPM","八分音符根音為主","跟大鼓對齊","Pick 或指彈皆常見","音色：中頻飽滿、略帶顆粒"],
  listen:[
    {artist:"John Paul Jones", note:"Led Zeppelin——把藍調底子放進硬搖滾的教科書"},
    {artist:"Krist Novoselic", note:"Nirvana——極簡根音推進的 grunge 典範"},
    {artist:"Duff McKagan", note:"Guns N' Roses——pick 彈奏的顆粒感與行進感"}
  ],
  drums:{kick:[0,8,10],snare:[4,12],hhc:[0,2,4,6,8,10,12,14]},
  bass:[[0,28],[2,28],[4,28],[6,28],[8,28],[10,28],[12,31],[14,33]],
  bassDesc:"E 根音八分音符打底，小節尾用 G→A 走回主音——搖滾 bassline 最典型的骨架。",
  exercises:[
    "跟著示範 groove 只彈根音八分音符，目標是每一顆都跟大鼓完全重疊——先 80 BPM，穩了再原速。",
    "把示範最後兩顆（G→A）換成你自己的走法試試：E→D→E、G→B→E……感受「小節尾巴帶路回家」。",
    "到節奏機載入「8-Beat 搖滾」，把 Bass 軌改成你設計的節奏型，再拿琴跟著彈。"
  ]
},
funk:{
  name:"Funk 放克", bpm:96, swing:0,
  intro:[
    "放克是節奏的音樂——和弦可以一整段不換，全部的張力都來自節奏的推擠。十六分音符是它的最小單位，「空拍」跟「發聲」一樣重要。",
    "貝斯的角色：放克的主角！貝斯線本身就是 hook，用切分、休止和 ghost note 在鼓的縫隙裡跳舞。Slap 技巧（拇指＋勾弦）就是從放克長出來的。"
  ],
  traits:["典型速度 90–110 BPM","十六分音符與切分","Ghost note 悶音","Slap／指彈","『空拍』是樂句的一部分"],
  listen:[
    {artist:"Larry Graham", note:"Sly & the Family Stone——slap 技法的開山祖師"},
    {artist:"Bootsy Collins", note:"James Brown／Parliament——把「the one」哲學彈進骨子裡"},
    {artist:"Flea", note:"Red Hot Chili Peppers——放克能量與搖滾的混血"}
  ],
  drums:{kick:[0,3,6,10],snare:[4,12],hhc:[0,1,2,3,4,5,6,8,9,10,11,12,13,14,15],hho:[7]},
  bass:[[0,28],[3,28],[6,31],[10,28],[13,38],[14,40]],
  bassDesc:"E 小調五聲的切分樂句：注意第 3、6 格的推位——不在正拍上的音才是放克味的來源。",
  exercises:[
    "先用手拍打示範的貝斯節奏（嘴念 1e&a 2e&a…），拍對了再上琴——放克先練節奏、再練音。",
    "彈的時候左手保持輕觸弦，把沒點亮的十六分位置加進悶音「嘎」（ghost note），groove 會立刻活起來。",
    "到節奏機載入「Slap 十六分放克・100」，跟著 T／P 兩軌用拇指與勾弦打整小節。"
  ]
},
jazz:{
  name:"Jazz 爵士", bpm:120, swing:50,
  intro:[
    "爵士的語言是搖擺（swing）與即興。八分音符不是平均的，而是「長—短」地滾動；和弦一小節一換甚至兩換，樂手在和聲的河道裡即興航行。",
    "貝斯的角色：walking bass——用四分音符一步一步「走」過每個和弦，兼任節奏的心跳與和聲的地圖。爵士貝斯手是樂團裡同時掌管時間與方向的人。"
  ],
  traits:["典型速度 100–220 BPM","Walking bass 四分音符","Swing 律動","以和弦音＋經過音行走","音色：圓潤、木質感"],
  listen:[
    {artist:"Paul Chambers", note:"Miles Davis 五重奏——walking bass 的黃金標準"},
    {artist:"Ray Brown", note:"Oscar Peterson 三重奏——時間感穩如節拍器卻充滿彈性"},
    {artist:"Jaco Pastorius", note:"Weather Report——把電貝斯帶進爵士最前線的革命者"}
  ],
  drums:{hhc:[0,4,6,8,12,14],hhp:[4,12],kick:[0]},
  bass:[[0,36],[4,40],[8,43],[12,45]],
  bassDesc:"一小節的 walking：C→E→G→A（根音→三音→五音→六音），下一小節就能順勢走到 D 開始新的和弦。開著 swing 聽，律動完全不同。",
  exercises:[
    "跟著示範用四分音符走 C–E–G–A，每顆音都要「落在拍子正中間」——walking 的第一課是時間感。",
    "自己設計走法：規則是「第一顆彈和弦根音，最後一顆走向下一個和弦的根音」，中間兩顆用和弦音或經過音自由連接。",
    "把 swing 滑桿從 0% 拉到 50% 比較同一句的感覺——理解「搖擺」不是速度，是比例。"
  ]
},
metal:{
  name:"Metal 金屬", bpm:142, swing:0,
  intro:[
    "金屬追求重量、速度與精準。吉他 riff 是主體，鼓的雙踏像機關槍，整個樂團經常「riff 齊奏」——所有人彈同一句，齊到一毫秒都不能差。",
    "貝斯的角色：加厚。緊跟吉他 riff（常常低八度），用 galloping（馬蹄式：八分＋兩個十六分）等節奏型提供衝刺感。右手耐力與左手悶音是基本功。"
  ],
  traits:["典型速度 120–200+ BPM","Galloping 馬蹄節奏","與吉他 riff 齊奏","Pick 快速交替撥弦","音色：緊、有攻擊性"],
  listen:[
    {artist:"Steve Harris", note:"Iron Maiden——三指 galloping 的代名詞"},
    {artist:"Cliff Burton", note:"Metallica——旋律性與破音貝斯的先驅"},
    {artist:"Geezer Butler", note:"Black Sabbath——重金屬貝斯的起點"}
  ],
  drums:{kick:[0,2,3,4,6,7,8,10,11,12,14,15],snare:[4,12],hhc:[0,2,4,6,8,10,12,14]},
  bass:[[0,28],[2,28],[3,28],[4,28],[6,28],[7,28],[8,28],[10,28],[11,28],[12,28],[14,28],[15,28]],
  bassDesc:"經典 gallop：每拍「噠-噠噠」（八分＋兩個十六分），全部打在低音 E——聽起來簡單，140 BPM 撐滿一首歌就知道厲害。",
  exercises:[
    "從 100 BPM 開始練 gallop，右手兩指（或 pick 下上下）固定指序，「三顆音量一致」比速度重要。",
    "每彈 4 小節休 4 小節，逐步拉長連續彈奏時間——金屬貝斯是耐力運動。",
    "到節奏機把 BPM 每次 +5，記錄你「三顆還乾淨」的極限速度，每週回來挑戰一次。"
  ]
},
blues:{
  name:"Blues 藍調", bpm:88, swing:40,
  intro:[
    "藍調是搖滾、放克、爵士共同的祖先。十二小節輪迴、三和弦（I–IV–V）、shuffle 律動——簡單的框架裡裝著最深的表情。",
    "貝斯的角色：用「根音—三音—五音—六音」的經典行走線鋪出 shuffle 的搖晃感，讓吉他和歌聲在上面自由哭喊。學會藍調行走線，半個流行樂壇的歌你都能跟。"
  ],
  traits:["典型速度 60–120 BPM","Shuffle（三連音感）","12 小節藍調形式","1-3-5-6 行走線","音色：溫暖、圓"],
  listen:[
    {artist:"Willie Dixon", note:"Chess Records 御用——寫歌＋低音貝斯的藍調巨人"},
    {artist:"Donald 'Duck' Dunn", note:"Booker T. & the M.G.'s——藍調／靈魂樂句的活字典"},
    {artist:"Tommy Shannon", note:"Stevie Ray Vaughan——德州藍調的引擎"}
  ],
  drums:{kick:[0,8],snare:[4,12],hhc:[0,2,4,6,8,10,12,14]},
  bass:[[0,33],[2,37],[4,40],[6,42],[8,45],[10,42],[12,40],[14,37]],
  bassDesc:"A 調的 1–3–5–6 上行再下行（A–C#–E–F#–A–F#–E–C#），開著 swing 就是標準 shuffle 行走線。",
  exercises:[
    "把這條線背到不用看：它就是藍調的『萬用鑰匙』，換調只要平移指型。",
    "用同一條線套 12 小節藍調：A 彈 4 小節、D 彈 2、A 彈 2、E 彈 1、D 彈 1、A 彈 2——恭喜，你會伴奏藍調了。",
    "swing 開 40% 跟 0% 各練一次，聽出 shuffle 與 straight 的差別。"
  ]
},
reggae:{
  name:"Reggae 雷鬼", bpm:74, swing:0,
  intro:[
    "雷鬼把重心整個翻過來：第 1 拍常常是空的（one drop），重量落在第 3 拍。吉他刷反拍的「skank」，一切都慢、鬆、卻異常紮實。",
    "貝斯的角色：雷鬼的靈魂。音色極沉（tone 全關）、樂句極簡、休止極多——「不彈的地方」跟彈的地方一樣講究。貝斯線常常就是這首歌的主旋律。"
  ],
  traits:["典型速度 60–90 BPM","One drop（重心在第 3 拍）","大量休止與空間","音色：極沉、無高頻","樂句像唱歌一樣"],
  listen:[
    {artist:"Aston 'Family Man' Barrett", note:"Bob Marley & The Wailers——雷鬼貝斯的定義者"},
    {artist:"Robbie Shakespeare", note:"Sly & Robbie——雷鬼／dub 節奏組的半壁江山"},
    {artist:"Paul Douglas 時期的 Toots 節奏組", note:"Toots & the Maytals——早期 rocksteady 的彈跳感"}
  ],
  drums:{kick:[8],snare:[8],hhc:[0,2,4,6,8,10,12,14],hhp:[4,12]},
  bass:[[4,33],[7,31],[8,33],[12,28]],
  bassDesc:"注意第 1 拍是空的！A–G–A–E 落在後半小節——雷鬼的重量感來自「等」。",
  exercises:[
    "先數拍再彈：嘴裡數「1、2、3、4」，第 1 拍忍住不彈——這比想像中難。",
    "把琴的 tone 鈕全關、靠近指板撥弦，找那種「圓球落地」的音色。",
    "自己寫一句雷鬼線，規則：整小節最多 5 顆音、第 1 拍留空、至少一個八分休止。"
  ]
},
pop:{
  name:"Pop 流行", bpm:108, swing:0,
  intro:[
    "流行樂什麼都借：搖滾的鼓、放克的律動、電子的音色——目標只有一個：讓人第一次聽就記住。歌曲結構清楚（主歌—副歌—橋段），每個段落的能量都精心設計。",
    "貝斯的角色：服務歌曲。主歌收斂、副歌打開，跟著和弦進行（常常是 I–V–vi–IV）提供低音旋律。流行貝斯手的美德是『什麼時候該少彈』。"
  ],
  traits:["典型速度 95–125 BPM","跟隨四和弦進行","段落動態設計","乾淨圓潤的音色","旋律性的根音-五音線"],
  listen:[
    {artist:"Paul McCartney", note:"The Beatles——把貝斯變成第二旋律的人"},
    {artist:"Nathan East", note:"Eric Clapton／Daft Punk 等——錄音室全能貝斯的標竿"},
    {artist:"Pino Palladino", note:"D'Angelo／John Mayer——鬆到極致的口袋律動"}
  ],
  drums:{kick:[0,6,8],snare:[4,12],hhc:[0,2,4,6,8,10,12,14],hho:[14]},
  bass:[[0,36],[2,36],[4,43],[6,36],[8,45],[10,43],[12,41],[14,43]],
  bassDesc:"C 大調上的根音—五音旋律線（C–G–A–F 的輪廓）——一小節內畫出 I–V–vi–IV 的影子。",
  exercises:[
    "用第 5 章的進行播放器拼 I–V–vi–IV，每個和弦先只彈根音全音符，再進化成「根音＋五音」。",
    "同一段進行彈兩種版本：主歌版（音少、低八度）與副歌版（八分音符、加五音）——練段落動態。",
    "挑一首你喜歡的流行歌放進曲目庫，寫下它的和弦進行，用進行播放器重現看看。"
  ]
},
soul:{
  name:"Soul / R&B 靈魂樂", bpm:92, swing:0,
  intro:[
    "靈魂樂是教會福音＋節奏藍調的孩子：歌聲至上，樂團在後面織一張又暖又彈的網。Motown 與 Stax 兩大廠牌在 60 年代定義了它的聲音。",
    "貝斯的角色：旋律與律動的雙重擔當。靈魂樂貝斯線常常美到可以單獨唱出來，同時又把 groove 顧得死緊——這是貝斯手的夢幻曲風，也是最好的音樂性教材。"
  ],
  traits:["典型速度 70–105 BPM","旋律性極強的樂句","切分與經過音","指彈、悶音顆粒","音色：溫暖、前段清楚"],
  listen:[
    {artist:"James Jamerson", note:"Motown 御用——史上最被研究的貝斯手，一根食指走天下"},
    {artist:"Donald 'Duck' Dunn", note:"Stax——南方靈魂的沉穩骨架"},
    {artist:"Verdine White", note:"Earth, Wind & Fire——把靈魂樂帶進 disco 時代的彈跳"}
  ],
  drums:{kick:[0,7,10],snare:[4,12],hhc:[0,2,4,6,8,10,12,14]},
  bass:[[0,38],[3,38],[4,42],[6,45],[8,47],[10,45],[12,42],[14,40]],
  bassDesc:"D 大調上的旋律線：D–F#–A–B 爬上去再滑回來，第 3 格的切分是靈魂味的關鍵。",
  exercises:[
    "先把示範線「唱」出來再彈——靈魂樂句一定要能唱，唱不順就是彈不順。",
    "同一句改三個音自己重寫，保留輪廓（低起—爬升—回落），練「在框架裡寫旋律」。",
    "彈熟後把左手放鬆加進幾顆 ghost note，體會 Jamerson 式的顆粒感。"
  ]
}
};

/* ---------- 渲染 ---------- */
let stKey="rock", stRunning=false, stTimer=null, stStep=0;
const STEPS16=16;

function stStop(){
  stRunning=false;
  if(stTimer){clearTimeout(stTimer);stTimer=null;}
  const b=$("#st-play");
  if(b){b.textContent="▶ 播放示範";b.classList.remove("toggled");}
  stRenderTab(-1);
}
function stTabText(st, active){
  const cols=[];
  for(let i=0;i<STEPS16;i++){
    const hit=st.bass.find(n=>n[0]===i);
    let cell=["———","———","———","———"];
    if(hit){
      const pos=findOnFretboard(hit[1],12);
      if(pos){
        cell=["———","———","———","———"];
        const txt=String(pos.fret).padEnd(3,"—");
        cell[pos.string]= (i===active)? `▶${pos.fret}`.padEnd(3,"—") : txt;
      }
    }else if(i===active){
      cell=["·——","·——","·——","·——"];
    }
    cols.push(cell);
  }
  const names=["G","D","A","E"];
  let out="";
  for(let s=0;s<4;s++){
    out+=names[s]+"|—";
    for(let i=0;i<STEPS16;i++){ out+=cols[i][s]; if(i%4===3)out+="|"; }
    out+="\n";
  }
  out+="   拍1          拍2          拍3          拍4";
  return out;
}
function stRenderTab(active){
  const el=$("#st-tab"); if(el)el.textContent=stTabText(STYLES[stKey],active);
}
function stTick(){
  if(!stRunning)return;
  const st=STYLES[stKey];
  const bpm=parseInt($("#st-bpm").value,10);
  const sw=(st.swing||0)/100;
  const stepDur=(60/bpm)/4;
  const i=stStep%STEPS16;
  const d=st.drums;
  ["kick","snare","hhc","hho","hhp"].forEach(k=>{
    if(d[k]&&d[k].includes(i))AudioEngine.drum(null,k==="kick"?"kick":(k==="snare"?"snare":k));
  });
  const hit=st.bass.find(n=>n[0]===i);
  if(hit)AudioEngine.bass(hit[1],null,stepDur*3,0.95);
  stRenderTab(i);
  const dur=(i%2===0)?stepDur*(1+sw):stepDur*(1-sw);
  stStep++;
  stTimer=setTimeout(stTick,dur*1000);
}
function stRender(){
  stStop();
  const st=STYLES[stKey];
  const el=$("#st-content");
  el.innerHTML=`
    <section class="lesson" style="margin-top:26px">
      <h2>${st.name}</h2>
      ${st.intro.map(p=>`<p>${p}</p>`).join("")}
      <div class="st-traits">${st.traits.map(t=>`<span>${t}</span>`).join("")}</div>
    </section>
    <div class="panel">
      <div class="panel-title">示範 groove（原創風格範例・${st.name}）</div>
      <div class="controls">
        <button class="btn" id="st-play">▶ 播放示範</button>
        <label class="ctl">BPM <input type="range" id="st-bpm" min="55" max="200" value="${st.bpm}" style="width:130px"><b class="mono" id="st-bpmv" style="color:var(--accent);font-size:16px">${st.bpm}</b></label>
        ${st.swing?`<span class="badge">swing ${st.swing}%</span>`:""}
        <span style="font-size:12.5px;color:var(--muted)">建議速度 ♩=${st.bpm}</span>
      </div>
      <div class="st-tab" id="st-tab"></div>
      <div class="hint">${st.bassDesc}　TAB 由上而下是 G–D–A–E 弦，數字＝第幾格；播放時 ▶ 會跟著跑。</div>
    </div>
    <section class="lesson">
      <h2>值得一聽的貝斯手</h2>
      <div class="st-listen">
        ${st.listen.map(l=>`<a href="https://www.youtube.com/results?search_query=${encodeURIComponent(l.artist+" bass")}" target="_blank" rel="noopener"><b>🔍 ${l.artist}</b><small>${l.note}</small></a>`).join("")}
      </div>
    </section>
    <section class="lesson">
      <h2>入門練習</h2>
      <div class="st-ex">
        ${st.exercises.map((e,i)=>`<div class="item"><div class="n">${i+1}</div><div class="t">${e}</div></div>`).join("")}
      </div>
      <p style="font-size:13.5px;color:var(--muted)">進一步：把這個風格的節奏帶到 <a href="groove.html">🥁 節奏機</a> 自己改編，或把喜歡的曲子收進 <a href="songs.html">🎵 曲目庫</a>。</p>
    </section>`;
  stRenderTab(-1);
  $("#st-bpm").addEventListener("input",()=>{$("#st-bpmv").textContent=$("#st-bpm").value;});
  $("#st-play").addEventListener("click",()=>{
    if(stRunning){stStop();return;}
    AudioEngine.ensure();
    stRunning=true; stStep=0;
    $("#st-play").textContent="■ 停止";
    $("#st-play").classList.add("toggled");
    stTick();
  });
}
segButtons($("#st-seg"),Object.keys(STYLES).map(k=>({key:k,label:STYLES[k].name})),
  (k)=>{stKey=k;stRender();window.scrollTo({top:0,behavior:"smooth"});},"rock");
stRender();
