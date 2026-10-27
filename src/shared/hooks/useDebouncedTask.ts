import { useCallback, useEffect, useRef } from 'react'

export interface DebouncedTask {
  /** task を delay ミリ秒後に実行する。すでに予約済みの task は置き換える */
  schedule: (task: () => void) => void
  /** 予約済みの task があれば、待たずにすぐ実行する */
  flush: () => void
  /** 予約済みの task を実行せずに取り消す */
  cancel: () => void
}

/**
 * 入力が落ち着いてから保存処理を実行するためのデバウンス。
 * キー入力ごとの書き込みを抑えつつ、アンマウント時には予約済みの保存を必ず実行する。
 */
export function useDebouncedTask(delay: number): DebouncedTask {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const taskRef = useRef<(() => void) | null>(null)

  const cancel = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    taskRef.current = null
  }, [])

  const flush = useCallback(() => {
    const task = taskRef.current
    cancel()
    task?.()
  }, [cancel])

  const schedule = useCallback((task: () => void) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    taskRef.current = task
    timerRef.current = setTimeout(flush, delay)
  }, [delay, flush])

  // アンマウント時に予約済みの保存を確定させる
  useEffect(() => flush, [flush])

  return { schedule, flush, cancel }
}
