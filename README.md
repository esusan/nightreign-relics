# 遺物共有ページ

ナイトレインの遺物構成を対象キャラ・ボスごとに共有するページ。

## 構成

- `index.html` / `style.css` / `app.js` — 表示ページ本体（ビルド不要、静的HTML）
- `data/relics.json` — キャラ一覧・ボス一覧・遺物エントリのデータ
- `assets/bosses/` `assets/characters/` `assets/relics/` — 画像置き場
- `scripts/crop_relic.ps1` — スクリーンショットから遺物画像2枚を座標指定でトリミングするツール

## データの追加方法

`data/relics.json` の `entries` 配列に1件追加する。

```json
{
  "id": "guardian-adel",
  "characterId": "guardian",
  "bossId": "adel",
  "relicImages": ["assets/relics/guardian-adel_1.png", "assets/relics/guardian-adel_2.png"],
  "hpLv15": 1234,
  "concept": "コンセプト文言"
}
```

`characterId` / `bossId` は `characters` / `bosses` 配列の `id` と対応させる。ボスアイコンは `bosses` 配列側の `icon` に持たせてあるので、エントリ側では指定しない。

## 遺物画像のトリミング

1. ゲーム内スクリーンショットを用意する
2. `scripts/crop_relic.ps1` 内の `$Regions` の座標（X, Y, 幅, 高さ）を実際の画像に合わせて調整する
3. 実行する

```powershell
.\scripts\crop_relic.ps1 -SourceImage "C:\path\to\screenshot.png" -OutputPrefix ".\assets\relics\guardian-adel"
```

`guardian-adel_1.png` `guardian-adel_2.png` が出力されるので、`relics.json` の `relicImages` に指定する。

## 対象キャラ

守護者・追跡者・鉄の目・隠者の4キャラ。現状データが揃っているのは守護者のコンセプト欄のみ。
