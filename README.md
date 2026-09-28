# 旅の持ち物（tabi-no-mochimono）

旅行の持ち物チェックリスト PWA。日本語テンプレートからすぐ作れて、オフラインで使えます。

**無料・広告なし・ログイン不要・通信なし・アナリティクスなし。** 一度開けばオフラインで動きます。UI は日本語が初期設定で、右上で 日本語 / English を切り替えられます（`tabi-no-mochimono-lang`）。

## 主な機能

- 内蔵テンプレート：海外旅行・国内1泊・海/ビーチ・出張（空のリストも可）
- チェック、すべてリセット、リストの複製、名前・アイコン変更
- アイテム・カテゴリの追加／削除／並べ替え（↑↓ボタンで指でも確実）
- 「残りだけ表示」で未チェックのものだけ確認
- JSON で書き出し／読み込み（バックアップ・機種変更用）
- データは localStorage（`tabi-no-mochimono:v1`）にだけ保存

## 使い方（開発）

```bash
npm install
npm run dev       # Vite 開発サーバー
npm run build     # 型チェック + 本番ビルド → dist/
npm run preview   # 本番ビルドのプレビュー
```

## デプロイ

GitHub Pages：`.github/workflows/pages.yml`（npm ci → build → `dist` をアップロード → deploy-pages）。`base: './'` なのでサブパス（`/tabi-no-mochimono/`）でも動きます。

## プライバシー

データはすべてこの端末のブラウザ内にだけ保存されます。サーバー・外部 API・トラッキング・広告は一切ありません。

---

## English

**Packing List** — An offline packing checklist with Japanese templates built in.

Free, no ads, no login, no network calls, no analytics. Works fully offline once loaded and can be installed to the home screen as a PWA. The UI defaults to Japanese; switch 日本語 / English at the top right.

- Built-in templates: overseas trip, domestic overnight, beach, business trip (or start blank)
- Check off, uncheck everything, duplicate lists, rename and pick an icon
- Add, delete and reorder items and categories (big ↑↓ buttons for touch)
- “Remaining only” filter
- Export / import JSON for backups or moving phones
- Data lives only in localStorage (`tabi-no-mochimono:v1`)

Tech: Vite + vanilla TypeScript + `vite-plugin-pwa` (`registerType: 'autoUpdate'`, `base: './'`). Deploys to GitHub Pages via `.github/workflows/pages.yml`.
