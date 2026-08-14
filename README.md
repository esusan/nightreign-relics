# 遺物共有ページ

ナイトレインの遺物構成を対象キャラ・ボスごとに共有するページ。

## 構成

- `index.html` / `style.css` / `app.js` — 表示ページ本体（ビルド不要、静的HTML）
- `data/relics.json` — キャラ一覧・ボス一覧・遺物エントリのデータ
- `assets/bosses/` `assets/characters/` `assets/relics/` — 画像置き場
- `scripts/crop_relic.ps1` — 遺物儀式画面のスクリーンショットから詳細パネルを座標指定でトリミングするツール

## データの追加方法

`data/relics.json` の `entries` 配列に1件追加する。

```json
{
  "id": "guardian-adel",
  "characterId": "guardian",
  "bossIds": ["adel"],
  "relicImages": ["assets/relics/guardian-adel_1.png", "assets/relics/guardian-adel_2.png"],
  "hpLv15": 1234,
  "concept": "コンセプト文言"
}
```

`characterId` / `bossIds` は `characters` / `bosses` 配列の `id` と対応させる。ボスアイコンは `bosses` 配列側の `icon` に持たせてあるので、エントリ側では指定しない。

同じ遺物構成を複数ボスで使い回す場合、コンセプト文もまとめて共有できるなら `bossIds` に複数指定して1エントリにする。ボスごとにコンセプト文が異なる場合は、エントリはボスごとに分けたまま `relicImages` にだけ同じファイルパスを指定する（画像だけ使い回す）。

同じボスに対して複数の遺物構成パターン（耐久型・鎌型など）を1枚のカードで見せたい場合は、`relicImages` の代わりに `variantGroups` を使う。

```json
{
  "id": "guardian-gladius",
  "characterId": "guardian",
  "bossIds": ["gladius"],
  "hpLv15": 1742,
  "concept": "コンセプト文言",
  "variantGroups": [
    { "label": "耐久特化", "images": ["assets/relics/guardian-gladius-taikyu_1.png", "assets/relics/guardian-gladius-taikyu_2.png"] },
    { "label": "鎌見つけやすく", "images": ["assets/relics/guardian-gladius-kama_1.png", "assets/relics/guardian-gladius-kama_2.png"] }
  ]
}
```

各グループの `label` が画像の上に見出しとして表示される。HP・コンセプトはエントリ共通で1回だけ表示される。

## 遺物画像のトリミング

`遺物儀式`画面でスロットを選択した状態（左側に詳細パネルが出た状態）でスクリーンショットを撮る。スロットを切り替えて2枚撮ると、遺物画像2枚分になる。

1. 3840x2160でスクリーンショットを2枚（見せたい遺物ごとにスロットを切り替えて）用意する
2. 実行する

```powershell
.\scripts\crop_relic.ps1 -SourceImages "C:\path\to\slot1.png","C:\path\to\slot4.png" -OutputPrefix ".\assets\relics\guardian-adel"
```

`guardian-adel_1.png` `guardian-adel_2.png` が出力されるので、`relics.json` の `relicImages` に指定する。解像度が3840x2160以外の場合は `crop_relic.ps1` 内の `$Region` を撮り直して調整する。

## 対象キャラ

守護者・追跡者・鉄の目・隠者の4キャラ。現状データが揃っているのは守護者のコンセプト欄のみ。
