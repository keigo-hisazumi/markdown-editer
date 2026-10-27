import { useEffect, useRef } from 'react'

/**
 * document 上のクリックで handler を呼ぶ。ポップアップメニューを外側のクリックで閉じるために使う。
 * メニュー内のクリックで閉じないよう、メニュー側では stopPropagation すること。
 */
export function useDocumentClick(handler: () => void): void {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    function onClick() {
      handlerRef.current()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}
