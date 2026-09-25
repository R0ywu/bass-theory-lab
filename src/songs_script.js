/* ===== 練習曲目庫 ===== */
const SG_KEY="bl-songs-v1";
const SG_STATUS=["🌱 學習中","💪 會彈了","🔥 精通"];

function sgLoad(){
  try{ return JSON.parse(localStorage.getItem(SG_KEY))||[]; }catch(e){ return []; }
}
function sgStore(list){ try{ localStorage.setItem(SG_KEY,JSON.stringify(list)); }catch(e){} }

/* 從各種 YouTube 網址格式取出影片 ID */
function sgParseYt(url){
  if(!url)return null;
  url=url.trim();
  const m =
    url.match(/[?&]v=([A-Za-z0-9_-]{6,20})/) ||
    url.match(/youtu\.be\/([A-Za-z0-9_-]{6,20})/) ||
    url.match(/youtube\.com\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{6,20})/);
  if(m)return m[1];
  if(/^[A-Za-z0-9_-]{11}$/.test(url))return url; // 直接貼 ID 也行
  return null;
}
function sgEsc(s){
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

let sgFilter="全部";
function sgRender(){
  const list=sgLoad();
  /* 篩選列 */
  const grades=Array.from(new Set(list.map(s=>s.grade||"未分類")));
  const fbox=$("#sg-filter"); fbox.innerHTML="";
  if(list.length){
    const mklabel=(g)=>{
      const b=document.createElement("button");
      b.className="btn small "+((sgFilter===g)?"":"secondary");
      b.textContent=g;
      b.addEventListener("click",()=>{sgFilter=g;sgRender();});
      return b;
    };
    fbox.appendChild(mklabel("全部"));
    grades.forEach(g=>fbox.appendChild(mklabel(g)));
  }
  const box=$("#sg-list"); box.innerHTML="";
  const shown=list.filter(s=>sgFilter==="全部"||(s.grade||"未分類")===sgFilter);
  $("#sg-empty").style.display = list.length? "none":"block";
  shown.forEach(s=>{
    const idx=list.indexOf(s);
    const card=document.createElement("div");
    card.className="sg-card";
    const start=parseInt(s.start,10);
    const src=`https://www.youtube-nocookie.com/embed/${s.yt}${start>0?`?start=${start}`:""}`;
    card.innerHTML=`
      <div class="head">
        <h3>${sgEsc(s.title)}${s.artist?`<span style="color:var(--muted);font-weight:400;font-size:14px">　${sgEsc(s.artist)}</span>`:""}</h3>
        <div class="meta">
          ${s.grade?`<span>${sgEsc(s.grade)}</span>`:""}
          ${s.key?`<span>${sgEsc(s.key)}</span>`:""}
          ${s.bpm?`<span>♩=${sgEsc(s.bpm)}</span>`:""}
        </div>
      </div>
      <div class="video"><iframe src="${src}" title="${sgEsc(s.title)}" loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
      <div class="body">
        <div class="notes">${s.notes?sgEsc(s.notes):`<span style="color:var(--muted)">（還沒有筆記——練的時候把重點記下來）</span>`}</div>
        <div class="side">
          <select class="sel sg-status"></select>
          <button class="btn small secondary sg-del">刪除</button>
        </div>
      </div>`;
    const sel=card.querySelector(".sg-status");
    SG_STATUS.forEach((st,i)=>{
      const o=document.createElement("option");
      o.value=i;o.textContent=st;
      if((s.status||0)===i)o.selected=true;
      sel.appendChild(o);
    });
    sel.addEventListener("change",()=>{
      const l=sgLoad(); l[idx].status=parseInt(sel.value,10); sgStore(l);
    });
    card.querySelector(".sg-del").addEventListener("click",()=>{
      if(!confirm(`確定刪除「${s.title}」？`))return;
      const l=sgLoad(); l.splice(idx,1); sgStore(l); sgRender();
    });
    box.appendChild(card);
  });
}

$("#sg-add").addEventListener("click",()=>{
  const msg=$("#sg-msg");
  const title=$("#sg-title").value.trim();
  const yt=sgParseYt($("#sg-url").value);
  if(!title){ msg.textContent="✘ 曲名要填"; msg.className="quiz-fb no"; return; }
  if(!yt){ msg.textContent="✘ 看不懂這個 YouTube 網址，貼完整連結試試"; msg.className="quiz-fb no"; return; }
  const list=sgLoad();
  list.unshift({
    title, yt,
    artist:$("#sg-artist").value.trim(),
    grade:$("#sg-grade").value.trim(),
    key:$("#sg-key").value.trim(),
    bpm:$("#sg-bpm").value.trim(),
    start:$("#sg-start").value.trim(),
    notes:$("#sg-notes").value.trim(),
    status:0, added:Date.now()
  });
  sgStore(list);
  ["sg-title","sg-artist","sg-url","sg-key","sg-bpm","sg-start","sg-notes"].forEach(id=>$("#"+id).value="");
  msg.textContent="✔ 已加入！"; msg.className="quiz-fb ok";
  sgFilter="全部";
  sgRender();
});

/* 匯出／匯入 */
$("#sg-export").addEventListener("click",()=>{
  const ta=$("#sg-io"), hint=$("#sg-iohint");
  ta.style.display="block"; hint.style.display="block";
  ta.value=JSON.stringify(sgLoad(),null,1);
  ta.select();
  hint.textContent="全選複製上面的文字，存成 .json 或貼到另一台裝置的「匯入」。";
});
$("#sg-import").addEventListener("click",()=>{
  const ta=$("#sg-io"), hint=$("#sg-iohint");
  if(ta.style.display==="none"||!ta.value.trim()){
    ta.style.display="block"; hint.style.display="block"; ta.value="";
    hint.textContent="把之前匯出的 JSON 貼到上面，再按一次「匯入 JSON」。";
    ta.focus(); return;
  }
  try{
    const data=JSON.parse(ta.value);
    if(!Array.isArray(data))throw 0;
    const cur=sgLoad();
    const have=new Set(cur.map(s=>s.yt+"|"+s.title));
    let n=0;
    data.forEach(s=>{
      if(s&&s.title&&s.yt&&!have.has(s.yt+"|"+s.title)){ cur.push(s); n++; }
    });
    sgStore(cur);
    hint.textContent=`✔ 匯入完成，新增 ${n} 首（重複的自動跳過）。`;
    ta.style.display="none";
    sgRender();
  }catch(e){
    hint.textContent="✘ 這段文字不是有效的 JSON，確認有完整複製再試一次。";
  }
});

sgRender();

/* ---------- Rockschool Grade 1 快速範本（僅曲目基本資料，不含譜面） ---------- */
const SG_SEED=[
  {title:"Crosstown Link", bpm:"90",  key:"E 小調",  page:5,  genre:"Blues Rock",  tech:"八分音符樂句、休止符、附點四分音符"},
  {title:"Night Ride",     bpm:"120", key:"A 大調",  page:9,  genre:"Rock",        tech:"八分音符 groove、休止符、空弦"},
  {title:"Reluctant Hero", bpm:"115", key:"E 小調",  page:13, genre:"Grunge",      tech:"八分音符 groove、休止符、跨弦"},
  {title:"Krauss Country", bpm:"88",  key:"D 大調",  page:17, genre:"Country",     tech:"跨弦、八分音符 groove、休止符"},
  {title:"The Open Air",   bpm:"80",  key:"F# 小調", page:21, genre:"Modern Rock", tech:"跨弦、連結線、節拍穩定度"},
  {title:"Inside The Box", bpm:"120", key:"C 大調",  page:25, genre:"Surf Rock",   tech:"斷奏、臨時記號、休止符"}
];
function sgRenderSeed(){
  const box=$("#sg-seed"); if(!box)return;
  box.innerHTML="";
  const lib=sgLoad();
  SG_SEED.forEach(sd=>{
    const inLib=lib.some(s=>s.title.toLowerCase()===sd.title.toLowerCase());
    const d=document.createElement("div");
    d.style.cssText="background:var(--card2);border:1px solid var(--line);border-radius:11px;padding:12px 14px;display:flex;flex-direction:column;gap:6px";
    d.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center">
        <b style="font-size:14.5px">${sgEsc(sd.title)}</b>
        <span style="font-size:11px;color:var(--muted)">書 p.${sd.page}</span></div>
      <div style="font-size:12px;color:var(--muted)">${sd.genre}・♩=${sd.bpm}・${sd.key}</div>
      <div style="font-size:12px;color:var(--muted)">技巧：${sd.tech}</div>
      <div style="display:flex;gap:6px;margin-top:4px"></div>`;
    const row=d.lastElementChild;
    const bSearch=document.createElement("a");
    bSearch.className="btn small secondary";
    bSearch.style.textDecoration="none";
    bSearch.textContent="🔍 搜尋音源";
    bSearch.target="_blank"; bSearch.rel="noopener";
    bSearch.href="https://www.youtube.com/results?search_query="+encodeURIComponent(`Rockschool Bass Grade 1 ${sd.title}`);
    row.appendChild(bSearch);
    if(inLib){
      const done=document.createElement("span");
      done.style.cssText="font-size:12.5px;color:var(--green);align-self:center";
      done.textContent="✓ 已在庫中";
      row.appendChild(done);
    }else{
      const bFill=document.createElement("button");
      bFill.className="btn small";
      bFill.textContent="⤵ 帶入表單";
      bFill.addEventListener("click",()=>{
        $("#sg-title").value=sd.title;
        $("#sg-artist").value="Rockschool（檢定曲）";
        $("#sg-grade").value="RSL Grade 1";
        $("#sg-key").value=sd.key;
        $("#sg-bpm").value=sd.bpm;
        $("#sg-notes").value=`書 p.${sd.page}・${sd.genre}\n技巧重點：${sd.tech}`;
        $("#sg-url").focus();
        $("#sg-msg").textContent="已帶入！用「搜尋音源」找到影片後，把網址貼進 YouTube 欄位再按加入。";
        $("#sg-msg").className="quiz-fb ok";
        window.scrollTo({top:$("#sg-title").getBoundingClientRect().top+window.scrollY-120,behavior:"smooth"});
      });
      row.appendChild(bFill);
    }
    box.appendChild(d);
  });
}
/* 加入曲目後同步更新範本狀態 */
const _sgRender=sgRender;
sgRender=function(){ _sgRender(); sgRenderSeed(); };
sgRenderSeed();
