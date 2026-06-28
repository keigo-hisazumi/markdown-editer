import type { Article } from '@/stores/articles'

export interface MergeResult {
  /** マージ後の記事一覧（更新日時の降順） */
  merged: Article[]
  /** ローカルの方が新しく、リモート（Firestore）へ反映（上書き）すべき記事 */
  toPush: Article[]
}

/**
 * a の更新日時が b 以降（同時刻を含む）かどうかを判定する。
 * updatedAt は ISO 8601 文字列のため、文字列比較で時刻の前後を判定できる。
 */
function isNewerOrEqual(a: Article, b: Article): boolean {
  return a.updatedAt >= b.updatedAt
}

/**
 * ローカルとリモートの記事一覧を更新日時で比較してマージする。
 *
 * 同じ id の記事が双方に存在する場合は updatedAt が新しい方を採用し、
 * 「新しい方で古い方を上書きする」というルールで競合を解決する。
 * ローカルにしか存在しない記事（オフラインで作成・編集したもの）は
 * リモートへ反映するため toPush に含める。
 */
export function mergeArticles(local: Article[], remote: Article[]): MergeResult {
  const localById = new Map(local.map((a) => [a.id, a]))
  const remoteById = new Map(remote.map((a) => [a.id, a]))

  const mergedById = new Map<string, Article>()
  const toPush: Article[] = []

  const ids = new Set<string>([...localById.keys(), ...remoteById.keys()])
  for (const id of ids) {
    const l = localById.get(id)
    const r = remoteById.get(id)

    if (l && r) {
      // 双方に存在 → 更新日時が新しい方を採用する
      if (isNewerOrEqual(r, l)) {
        mergedById.set(id, r)
      } else {
        mergedById.set(id, l)
        toPush.push(l)
      }
    } else if (l) {
      // ローカルのみに存在（オフラインで作成・編集） → ローカルを採用しリモートへ反映
      mergedById.set(id, l)
      toPush.push(l)
    } else if (r) {
      // リモートのみに存在 → リモートを採用
      mergedById.set(id, r)
    }
  }

  const merged = [...mergedById.values()].sort((a, b) =>
    a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0,
  )
  return { merged, toPush }
}
