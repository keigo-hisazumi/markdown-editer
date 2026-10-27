import { useEffect, useState } from 'react'

/** 一覧とエディタを並べず、どちらか片方だけを表示する画面幅の上限 */
export const MOBILE_BREAKPOINT = 768

/** 画面幅がモバイル表示の範囲かどうかを返す（リサイズに追従する） */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT)

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return isMobile
}
