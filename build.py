#!/usr/bin/env python3
"""組合共用 CSS/JS 與各章內容，輸出單檔 HTML。"""
import os, io

SRC = os.path.join(os.path.dirname(__file__), "src")
OUT = os.path.join(os.path.dirname(__file__), "out")
os.makedirs(OUT, exist_ok=True)

CHAPTERS = [
    # (檔名, 編號顯示, 標題, 副標)
    ("index.html",  "",   "Bass 樂理互動教室", ""),
    ("ch1-piano.html",    "第 1 章", "鋼琴基礎：12 音的世界", "12 音循環・音名・全音與半音"),
    ("ch2-bass.html",     "第 2 章", "貝斯基礎：認識你的指板", "四條弦・指板音名・鋼琴 vs 貝斯"),
    ("ch3-scales.html",   "第 3 章", "調與音階", "調・音階公式・五聲音階・關係調・調式"),
    ("ch4-chords.html",   "第 4 章", "和聲：音程與和弦", "音程・三和弦・七和弦・sus/aug/dim・轉位"),
    ("ch5-progressions.html", "第 5 章", "和弦進行與羅馬數字", "順階和弦・級數功能・經典進行"),
    ("ch6-notation.html", "第 6 章", "記譜法：看懂樂譜與 TAB", "五線譜・貝斯 TAB・音符時值・附點"),
    ("ch7-rhythm.html",   "第 7 章", "節奏與拍子", "BPM・小節・拍號・強弱拍"),
    ("ch8-circle.html",   "第 8 章", "五度圈", "調號・升降記號・關係小調・和弦進行地圖"),
]
SHORT = ["首頁","1 鋼琴","2 貝斯","3 音階","4 和弦","5 進行","6 記譜","7 節奏","8 五度圈"]

def read(p):
    with io.open(os.path.join(SRC, p), encoding="utf-8") as f:
        return f.read()

css = read("common.css")
js  = read("common.js")

def nav(active_idx):
    links = []
    for i,(fn,_,_,_) in enumerate(CHAPTERS):
        cls = "chip active" if i==active_idx else "chip"
        links.append(f'<a class="{cls}" href="{fn}">{SHORT[i]}</a>')
    return ('<nav class="topnav"><span class="brand">🎸 Bass 樂理互動教室</span>'
            f'<div class="links">{"".join(links)}</div></nav>')

def pagenav(idx):
    prev_a = next_a = ""
    if idx > 0:
        fn,num,title,_ = CHAPTERS[idx-1]
        label = f"{num}　{title}" if num else title
        prev_a = f'<a href="{fn}"><div class="dir">← 上一章</div><div class="ttl">{label}</div></a>'
    else:
        prev_a = "<span></span>"
    if idx < len(CHAPTERS)-1:
        fn,num,title,_ = CHAPTERS[idx+1]
        next_a = f'<a href="{fn}" style="text-align:right"><div class="dir">下一章 →</div><div class="ttl">{num}　{title}</div></a>'
    else:
        next_a = "<span></span>"
    return f'<div class="pagenav">{prev_a}{next_a}</div>'

def build(idx, body_file, script_file):
    fn, num, title, sub = CHAPTERS[idx]
    body = read(body_file)
    script = read(script_file) if script_file else ""
    hero = ""
    if idx > 0:
        hero = (f'<div class="hero"><div class="kicker">{num}｜{sub}</div>'
                f'<h1>{title}</h1></div>')
    html = f"""<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}｜Bass 樂理互動教室</title>
<style>
{css}
</style>
</head>
<body>
{nav(idx)}
<div class="wrap">
{hero}
{body}
{pagenav(idx)}
</div>
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
]

if __name__ == "__main__":
    import sys
    only = sys.argv[1:] if len(sys.argv)>1 else None
    for idx, b, s in PAGES:
        if only and CHAPTERS[idx][0] not in only: continue
        if not os.path.exists(os.path.join(SRC,b)):
            print(f"skip {CHAPTERS[idx][0]} (missing {b})"); continue
        build(idx, b, s)
