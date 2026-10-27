/**
 * ゴミ箱操作の確認ダイアログ（共通実装）。
 * noun には「メモ」「記事」など、アプリで扱う項目の呼び方を渡す。
 */

export function confirmPermanentDelete(noun: string): boolean {
  return confirm(`この${noun}を完全に削除しますか？この操作は元に戻せません。`)
}

export function confirmEmptyTrash(noun: string, count: number): boolean {
  return confirm(`ゴミ箱内の${count}件の${noun}を完全に削除しますか？この操作は元に戻せません。`)
}
