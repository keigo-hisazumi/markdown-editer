import { useLayoutEffect, type DependencyList, type RefObject } from 'react'

/**
 * textarea を内容に合わせて伸縮させ、タイトルと本文が同一スクロール領域で動くようにする。
 *
 * 一旦 height を 'auto' に戻してから scrollHeight を測るため、その間だけ高さが縮み、
 * 外側のスクロール領域のスクロール位置がずれてしまう。編集中のカーソル位置が
 * 画面上で動いて見えないよう、リサイズ前後でスクロール位置を保持し直す。
 */
export function useAutoResize(
  ref: RefObject<HTMLTextAreaElement | null>,
  scrollRef: RefObject<HTMLElement | null>,
  deps: DependencyList,
): void {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const scrollEl = scrollRef.current
    const prevScrollTop = scrollEl?.scrollTop
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
    if (scrollEl && prevScrollTop !== undefined) scrollEl.scrollTop = prevScrollTop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
