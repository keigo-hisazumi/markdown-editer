import { useEffect } from 'react'

/**
 * iOS（Safari / Capacitor）でソフトウェアキーボードが表示されてビューポートの高さが
 * 変わったときに、アプリの高さを追従させる。
 *
 * visualViewport の高さとオフセットを CSS 変数（--app-height / --vv-offset-top）へ書き出し、
 * .split-app がレイアウトビューポートではなくビジュアルビューポート基準で配置されるようにする。
 */
export function useVisualViewport(): void {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const viewport = vv

    function onViewportChange() {
      const root = document.documentElement.style
      root.setProperty('--app-height', `${viewport.height}px`)
      root.setProperty('--vv-offset-top', `${viewport.offsetTop}px`)
    }

    onViewportChange()
    viewport.addEventListener('resize', onViewportChange)
    viewport.addEventListener('scroll', onViewportChange)
    return () => {
      viewport.removeEventListener('resize', onViewportChange)
      viewport.removeEventListener('scroll', onViewportChange)
    }
  }, [])
}
