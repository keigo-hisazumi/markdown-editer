# markdown-editer

Markdown 形式で記事を書き、プレビューしながら編集できるブラウザベースのエディター「Markdown Editor」です。記事は Firebase に保存して端末間で同期し、PWA としてスマートフォンにも対応しています。

**公開 URL**: <https://keigo-hisazumi.github.io/markdown-editer/>

## 主な機能

- メールアドレスとパスワードによるログイン・新規登録
- 記事の作成・編集・削除（削除した記事はゴミ箱から復元・完全削除・ゴミ箱を空にする）
- Markdown のプレビュー表示（編集とプレビューを切り替え）
- 入力内容の自動保存（端末へ即時保存し、入力が止まるとサーバーへも反映）
- 記事の状態管理（作成中 / 投稿済み）と、状態ごとの一覧表示
- 記事の検索
- Firestore によるリアルタイム同期と、オフライン時の編集内容の保持
- ライト / ダークテーマの切り替え
- PWA 対応（スマートフォンのホーム画面に追加可能）

## デモ用ログイン情報

```text
メールアドレス: demo@example.com
パスワード: password
```

## 同期の仕組み

記事は端末（`localStorage`）に即時保存し、Firestore とはリアルタイムに購読して同期します。起動時や再接続時は端末とサーバーの記事を更新日時で比較し、新しい方を採用します（端末にしかない記事はサーバーへ反映します）。

## Firestore セキュリティルール

Firestore のセキュリティルールは `firestore.rules` で管理しています（`users/{userId}/articles/{articleId}` を本人のみ読み書き可）。Firebase CLI で反映できます。

```bash
firebase deploy --only firestore:rules --project markdown-editer
```

## 技術スタック

- TypeScript
- React
- React Router
- Zustand（状態管理）
- marked（Markdown のレンダリング）
- Vite
- vite-plugin-pwa（PWA）
- Firebase（Authentication / Cloud Firestore）
- GitHub Pages（ホスティング）

## 開発

### 必要な環境

- Node.js 22（`package.json` の `engines` は `^20.19.0 || >=22.12.0`）

### コマンド

```bash
npm ci               # 依存関係のインストール
npm run dev          # 開発サーバーを起動
npm run build        # 型チェックと dist/ への本番ビルドを並列実行
npm run build-only   # 型チェックなしで dist/ に本番ビルド
npm run preview      # ビルド結果をプレビュー
npm run type-check   # TypeScript の型チェック
npm run lint         # ESLint
npm run lint:fix     # ESLint の自動修正
```

## ディレクトリ構成

```text
src/
  main.tsx          エントリーポイント
  App.tsx           認証状態の監視とスプラッシュ画面の表示
  firebase.ts       Firebase（Authentication / Firestore）の初期化
  views/            画面（ログイン / 新規登録・記事の一覧と編集）
  components/       スプラッシュ画面、記事一覧の項目
  stores/           Zustand のストア（認証・記事・テーマ）
  lib/              端末への保存と、端末とサーバーの記事のマージ
  assets/           スタイル
public/             favicon と PWA 用アイコン
firestore.rules     Firestore のセキュリティルール
vite.config.ts      Vite と PWA の設定
```

## デプロイ

- `main` への PR マージ時に `.github/workflows/deploy.yml` が GitHub Pages（`gh-pages` ブランチ）へデプロイします
- PR ごとに `.github/workflows/pr-preview.yml` がプレビューを `gh-pages` の `pr-<番号>/` に公開し、PR に URL をコメントします（プレビューでは Service Worker を無効化、PR を閉じると削除）

## 開発ルール

開発ルールは [AGENTS.md](./AGENTS.md) を参照してください。
貢献の手順は [CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。

## ライセンス

MIT
