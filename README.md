# 🎸 Bass 樂理互動教室

中文的貝斯樂理互動學習網站。每章一個獨立 HTML 頁面，內建 Web Audio 發聲：
可點擊的鋼琴鍵盤與貝斯指板、音階／和弦／音程播放器、節奏機、互動五度圈，以及各種耳朵訓練小測驗。

所有教學內容為原創編寫的中文樂理教材（音階公式、和弦公式、五度圈等通用樂理知識）。

## 章節

| 頁面 | 內容 |
|---|---|
| `index.html` | 總覽與學習路線 |
| `ch1-piano.html` | 鋼琴基礎：12 音循環、音名、全音半音 |
| `ch2-bass.html` | 貝斯基礎：四條弦、指板音名 |
| `ch3-scales.html` | 調與音階：公式、五聲、關係調、調式 |
| `ch4-chords.html` | 和聲：音程、和弦類型、轉位 |
| `ch5-progressions.html` | 和弦進行與羅馬數字 |
| `ch6-notation.html` | 記譜法：TAB、音符時值 |
| `ch7-rhythm.html` | 節奏與拍子：拍號、節奏機 |
| `ch8-circle.html` | 五度圈 |

## 開發

頁面由 `src/` 中的共用元件（`common.css`、`common.js`）與各章內容組合而成：

```bash
python3 build.py        # 產出所有頁面到 out/
python3 build.py ch3-scales.html   # 只重建單一頁面
```

本 repo 根目錄的 HTML 為建置後的成品，可直接以 GitHub Pages 服務。
