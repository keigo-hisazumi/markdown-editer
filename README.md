# Markdown Editor

Markdown 形式で記事を編集するためのブラウザベースエディターです。React で構築されており、PWA としてスマートフォンにも対応しています。

## 機能

- **ログイン** → **記事一覧** → **編集画面** のフロー
- Markdown のリアルタイムプレビュー
- 記事の作成・編集・削除
- ページ離脱時の自動保存
- Firestore によるリアルタイム同期（デバイス間でのデータ同期）
- PWA 対応（スマートフォンへのインストール可）

## デモ用ログイン情報

```
メールアドレス: demo@example.com
パスワード: password
```

## 技術スタック

- [React 19](https://react.dev/)
- [React Router 7](https://reactrouter.com/)
- [Zustand](https://zustand.docs.pmnd.rs/)
- TypeScript
- [Vite](https://vite.dev/) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [marked](https://marked.js.org/)（Markdown レンダリング）

## セットアップ

```sh
npm install
```

### 開発サーバー起動

```sh
npm run dev
```

### 本番ビルド

```sh
npm run build
```

## 今後の予定

- 記事のタグ・カテゴリー管理
- 全文検索の強化
