import type { KeyboardEvent, RefObject } from 'react'

/**
 * タイトル欄と本文欄の間のキーボード操作（共通実装）。
 *
 * - タイトルで Enter を押すと本文へフォーカスを移す
 * - 本文の先頭で Backspace を押すとタイトル末尾へフォーカスを戻す
 *
 * IME 変換中（isComposing）の Enter / Backspace は変換操作なのでフォーカス移動しない。
 * これを行うとタイトルの変換確定で本文へカーソルが移り、続きが本文に入力されてしまう。
 */
export function useTitleBodyKeys(
  titleRef: RefObject<HTMLTextAreaElement | null>,
  bodyRef: RefObject<HTMLTextAreaElement | null>,
) {
  function onTitleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      const body = bodyRef.current
      if (!body) return
      body.focus()
      body.setSelectionRange(0, 0)
    }
  }

  function onBodyKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key !== 'Backspace' || e.nativeEvent.isComposing) return
    const el = e.currentTarget
    if (el.selectionStart !== 0 || el.selectionEnd !== 0) return
    e.preventDefault()
    const title = titleRef.current
    if (!title) return
    const end = title.value.length
    title.focus()
    setTimeout(() => title.setSelectionRange(end, end), 0)
  }

  return { onTitleKeyDown, onBodyKeyDown }
}
