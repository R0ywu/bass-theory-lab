#!/usr/bin/env python3
"""組合共用 CSS/JS 與各章內容，輸出單檔 HTML。"""
import os, io

SRC = os.path.join(os.path.dirname(__file__), "src")
OUT = os.path.join(os.path.dirname(__file__), "out")
os.makedirs(OUT, exist_ok=True)

SITE_BASE = "https://r0ywu.github.io/bass-theory-lab/"
SITE_NAME = "Bass 樂理互動教室"

CHAPTERS = [
    # (檔名, 編號顯示, 標題, 副標, meta description)
    ("index.html",  "",   "Bass 樂理互動教室", "",
     "中文貝斯樂理互動學習網站：可發聲的鋼琴鍵盤與貝斯指板、音階與和弦播放器、節奏機與互動五度圈，8 個章節帶你從零開始學會 bass 樂理。"),
    ("ch1-piano.html",    "第 1 章", "鋼琴基礎：12 音的世界", "12 音循環・音名・全音與半音",
     "認識 12 音循環、音名與升降記號、全音與半音——用可點擊發聲的互動鋼琴鍵盤打好樂理基礎，附找 C 遊戲與步伐測驗。"),
    ("ch2-bass.html",     "第 2 章", "貝斯基礎：認識你的指板", "四條弦・指板音名・鋼琴 vs 貝斯",
     "貝斯四條弦 E–A–D–G、指板音名與八度規律，鋼琴與貝斯同步對照互動，用半音階記住整個指板，附指板音名測驗。"),
    ("ch3-scales.html",   "第 3 章", "調與音階", "調・音階公式・五聲音階・關係調・調式",
     "大調、小調、五聲與藍調音階公式，關係調與七個調式——互動音階實驗室讓你邊看指型邊聽聲音，附大小調聽力測驗。"),
    ("ch4-chords.html",   "第 4 章", "和聲：音程與和弦", "音程・三和弦・七和弦・sus/aug/dim・轉位",
     "12 種音程與和弦公式：maj、min、7、maj7、sus、aug、dim 與轉位，全部可播放試聽、可與大三和弦比較，附音程與和弦聽力測驗。"),
    ("ch5-progressions.html", "第 5 章", "和弦進行與羅馬數字", "順階和弦・級數功能・經典進行",
     "順階和弦、羅馬數字與級數功能，I–V–vi–IV 等經典進行可自由拼裝，配上鼓組與三種貝斯伴奏模式循環播放。"),
    ("ch6-notation.html", "第 6 章", "記譜法：看懂樂譜與 TAB", "五線譜・貝斯 TAB・音符時值・附點",
     "五分鐘看懂貝斯 TAB 與音符時值：互動 TAB 播放器跟著亮起的數字聽，全音符到十六分音符與附點節奏全部有聲音示範。"),
    ("ch7-rhythm.html",   "第 7 章", "節奏與拍子", "BPM・小節・拍號・強弱拍",
     "BPM、拍號與強弱拍：互動節拍器體驗 2/4、3/4、4/4 的差別，16 格節奏機自己做 groove，附拍號聽力測驗。"),
    ("ch8-circle.html",   "第 8 章", "五度圈", "調號・升降記號・關係小調・和弦進行地圖",
     "互動五度圈：調號、關係小調與 I–IV–V 一眼看懂，點圈上任何調即可試聽音階與和弦，附五度圈反應測驗。"),
    ("game.html", "", "闖關模式：邊玩邊學", "指板尋寶・耳朵大冒險・節奏跟拍",
     "18 個關卡的貝斯樂理小遊戲：限時指板尋寶、聽力大冒險、節奏跟拍，收集星星與經驗值，零基礎也能邊玩邊學。"),
    ("songs.html", "", "練習曲目庫", "YouTube 播放・個人筆記・練成度追蹤",
     "把正在練的曲子收進清單：內嵌 YouTube 播放搭配你手上的譜，記錄調性、BPM、段落重點與練成度，支援 JSON 匯出匯入。"),
    ("groove.html", "", "Groove 節奏機", "自訂 Kick・Snare・Hi-hat・貝斯根音",
     "多軌 16 格節奏機：自訂 Kick、Snare、閉合與開放 Hi-hat 和貝斯根音，調 BPM 與 swing，設計自己的 groove 練習並存檔。"),
    ("styles.html", "", "曲風百科：貝斯的八種語言", "Rock・Funk・Jazz・Metal・Blues…",
     "八種曲風的貝斯導覽：曲風特色、貝斯的角色、代表樂手聆聽指南，配上可播放的原創示範 groove 與 TAB，以及入門練習建議。"),
]
SHORT = ["首頁","1 鋼琴","2 貝斯","3 音階","4 和弦","5 進行","6 記譜","7 節奏","8 五度圈","🎮 闖關","🎵 曲庫","🥁 節奏機","🎼 曲風"]

def read(p):
    with io.open(os.path.join(SRC, p), encoding="utf-8") as f:
        return f.read()

css = read("common.css")
js  = read("common.js")

def nav(active_idx):
    links = []
    for i,(fn,_,_,_,_) in enumerate(CHAPTERS):
        cls = "chip active" if i==active_idx else "chip"
        links.append(f'<a class="{cls}" href="{fn}">{SHORT[i]}</a>')
    return ('<nav class="topnav"><span class="brand">🎸 Bass 樂理互動教室</span>'
            f'<div class="links">{"".join(links)}</div></nav>')

def pagenav(idx):
    prev_a = next_a = ""
    if idx > 0:
        fn,num,title,_,_ = CHAPTERS[idx-1]
        label = f"{num}　{title}" if num else title
        prev_a = f'<a href="{fn}"><div class="dir">← 上一章</div><div class="ttl">{label}</div></a>'
    else:
        prev_a = "<span></span>"
    if idx < len(CHAPTERS)-1:
        fn,num,title,_,_ = CHAPTERS[idx+1]
        next_a = f'<a href="{fn}" style="text-align:right"><div class="dir">下一章 →</div><div class="ttl">{num}　{title}</div></a>'
    else:
        next_a = "<span></span>"
    return f'<div class="pagenav">{prev_a}{next_a}</div>'

FAVICON = ("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>"
           "<text y='.9em' font-size='90'>🎸</text></svg>")

def build(idx, body_file, script_file):
    fn, num, title, sub, desc = CHAPTERS[idx]
    is_chapter = 1 <= idx <= 8
    body = read(body_file)
    script = read(script_file) if script_file else ""
    hero = ""
    if is_chapter:
        hero = (f'<div class="hero"><div class="kicker-row">'
                f'<span class="chbadge">CH 0{idx}</span>'
                f'<span class="kicker">{sub}</span></div>'
                f'<h1>{title}</h1></div>')
    slug = fn.replace(".html", "")
    full_title = title if idx == 0 else f"{title}｜{SITE_NAME}"
    og_title = full_title
    page_url = SITE_BASE + ("" if idx == 0 else fn)
    og_img = f"{SITE_BASE}og/{slug}.png"
    html = f"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{full_title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{page_url}">
<link rel="icon" href="{FAVICON}">
<meta name="theme-color" content="#0f1117">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{SITE_NAME}">
<meta property="og:locale" content="zh_TW">
<meta property="og:title" content="{og_title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{page_url}">
<meta property="og:image" content="{og_img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{og_title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{og_img}">
<style>
{css}
</style>
</head>
<body data-page="{slug}">
{nav(idx)}
{f'<div class="chprogress"><div style="width:{round(idx/8*100)}%"></div></div>' if is_chapter else ''}
{f'''<div class="wrap with-rail"><div class="main">
{hero}
{body}
{pagenav(idx)}
</div>
<aside class="toc-rail"><div class="toc-box"><div class="toc-head">本章目錄</div><nav id="toc"></nav></div></aside>
</div>''' if is_chapter else f'''<div class="wrap">
{hero}
{body}
{pagenav(idx)}
</div>'''}
<script>
{js}
</script>
<script>
{script}
</script>
</body>
</html>"""
    with io.open(os.path.join(OUT, fn), "w", encoding="utf-8") as f:
        f.write(html)
    print(f"built {fn}  ({len(html)//1024} KB)")

PAGES = [
    (0, "index_body.html", None),
    (1, "ch1_body.html", "ch1_script.js"),
    (2, "ch2_body.html", "ch2_script.js"),
    (3, "ch3_body.html", "ch3_script.js"),
    (4, "ch4_body.html", "ch4_script.js"),
    (5, "ch5_body.html", "ch5_script.js"),
    (6, "ch6_body.html", "ch6_script.js"),
    (7, "ch7_body.html", "ch7_script.js"),
    (8, "ch8_body.html", "ch8_script.js"),
    (9, "game_body.html", "game_script.js"),
    (10, "songs_body.html", "songs_script.js"),
    (11, "groove_body.html", "groove_script.js"),
    (12, "styles_body.html", "styles_script.js"),
]

if __name__ == "__main__":
    import sys
    only = sys.argv[1:] if len(sys.argv)>1 else None
    for idx, b, s in PAGES:
        if only and CHAPTERS[idx][0] not in only: continue
        if not os.path.exists(os.path.join(SRC,b)):
            print(f"skip {CHAPTERS[idx][0]} (missing {b})"); continue
        build(idx, b, s)
