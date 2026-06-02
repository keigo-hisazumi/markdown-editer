import{_ as e,i as t}from"./index-Bhj5OPye.js";var n=[{id:`1`,title:`Vue.js 入門`,content:`# Vue.js 入門

## はじめに

Vue.js はプログレッシブフレームワークです。

## 特徴

- **リアクティブ** なデータバインディング
- **コンポーネント** ベースのアーキテクチャ
- **軽量** で学習コストが低い

## コード例

\`\`\`javascript
const app = Vue.createApp({})
\`\`\`
`,updatedAt:`2026-06-01T10:00:00Z`},{id:`2`,title:`Markdown チートシート`,content:`# Markdown チートシート

## 見出し

# H1
## H2
### H3

## テキスト装飾

**太字** / *斜体* / ~~取り消し線~~

## リスト

- 項目1
- 項目2
  - サブ項目

## テーブル

| 列1 | 列2 |
|-----|-----|
| A   | B   |
`,updatedAt:`2026-05-31T15:30:00Z`},{id:`3`,title:`未完成の記事`,content:`# 下書き

ここに内容を書く。
`,updatedAt:`2026-05-30T09:00:00Z`}],r=t(`articles`,()=>{let t=e(JSON.parse(JSON.stringify(n)));function r(e){return t.value.find(t=>t.id===e)}function i(e,n,r){let i=t.value.find(t=>t.id===e);i&&(i.title=n,i.content=r,i.updatedAt=new Date().toISOString())}function a(){let e={id:String(Date.now()),title:`新しい記事`,content:`# 新しい記事

ここに内容を書いてください。
`,updatedAt:new Date().toISOString()};return t.value.unshift(e),e}function o(e){t.value=t.value.filter(t=>t.id!==e)}return{articles:t,getById:r,save:i,create:a,remove:o}});export{r as t};