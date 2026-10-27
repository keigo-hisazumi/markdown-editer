# 共通実装（src/shared）

このディレクトリは [memo-list](https://github.com/keigo-hisazumi/memo-list) と [markdown-editer](https://github.com/keigo-hisazumi/markdown-editer) で **同一内容を保つ** 共通実装です。両アプリの見た目と基本操作を揃えるために使います。

## ルール

- `src/shared/` 配下のファイルは、両リポジトリで同じ内容にする。片方だけを変更しない
- 変更するときは、両リポジトリへ同じ内容の PR を出す
- アプリ固有の型やストア（`Memo` / `Article`、Context / Zustand など）には依存させない。必要な値は props で受け取る
- `src/shared/` の中では `@/` を使わず相対パスで import する

両リポジトリの内容が一致しているかは、2 つのリポジトリを並べてクローンしたうえで次のコマンドで確認できます。

```bash
diff -r memo-list/src/shared markdown-editer/src/shared
```

## 含まれるもの

| パス | 内容 |
| --- | --- |
| `styles/base.css` | ライト / ダークのカラートークン、リセット、スクロールバー、フォント |
| `styles/ui.css` | 2 ペインのレイアウトと共通コンポーネントのスタイル |
| `theme.ts` | テーマの解決・適用・保存と OS 設定の監視（描画前に適用してちらつきを防ぐ） |
| `components/AppHeader.tsx` | 一覧側のヘッダー |
| `components/DrawerMenu.tsx` | ハンバーガーボタンとドロワー（アカウント・画面切り替え・テーマ・ログアウト） |
| `components/SearchBar.tsx` | 検索欄 |
| `components/SwipeableList.tsx` | タッチ操作のスワイプでゴミ箱ボタンを表示する一覧 |
| `components/Trash.tsx` | ゴミ箱の件数表示・空にするボタンと、復元 / 完全削除ができる項目 |
| `components/EditorNav.tsx` | エディタ側のナビゲーション（モバイル時の戻るボタン） |
| `components/Popover.tsx` | その他メニュー・情報表示のポップアップ |
| `components/SaveStatus.tsx` | 「編集中」「保存済み」の表示 |
| `components/EmptyState.tsx` / `NoSelection.tsx` | 一覧が空のとき・未選択のときの表示 |
| `components/LoginPage.tsx` | ログイン・新規登録画面 |
| `components/SplashScreen.tsx` | 起動時のスプラッシュ画面 |
| `components/IconButton.tsx` / `Icons.tsx` | アイコンボタンと共通アイコン |
| `hooks/useAutoResize.ts` | textarea を内容に合わせて伸縮させる |
| `hooks/useTitleBodyKeys.ts` | タイトルと本文の間のキー操作（IME 変換中は無視） |
| `hooks/useDebouncedTask.ts` | 入力が落ち着いてから保存するためのデバウンス |
| `hooks/useIsMobile.ts` | モバイル表示かどうか |
| `hooks/useVisualViewport.ts` | iOS のキーボード表示時に画面の高さを追従させる |
| `hooks/useDocumentClick.ts` | 外側のクリックでポップアップを閉じる |
| `lib/format.ts` | 日時とプレビュー文の整形 |
| `lib/authError.ts` | Firebase Authentication のエラーメッセージ |
| `lib/confirm.ts` | ゴミ箱操作の確認ダイアログ |
