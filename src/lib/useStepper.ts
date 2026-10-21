import { useCallback, useEffect, useState } from 'react'

/**
 * Step / Play / Pause / Reset state for any diagram.
 * `index` runs from 0 to count - 1. Playing stops at the last step.
 */
export function useStepper(count: number, intervalMs = 1400) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  const last = Math.max(0, count - 1)
  const atEnd = index >= last

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, last)), [last])
  const prev = useCallback(() => {
    setPlaying(false)
    setIndex((i) => Math.max(i - 1, 0))
  }, [])
  const reset = useCallback(() => {
    setPlaying(false)
    setIndex(0)
  }, [])
  const goTo = useCallback(
    (i: number) => {
      setPlaying(false)
      setIndex(Math.max(0, Math.min(i, last)))
    },
    [last],
  )
  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p && atEnd) setIndex(0) // replay from the start
      return !p
    })
  }, [atEnd])

  useEffect(() => {
    if (!playing) return
    if (atEnd) {
      setPlaying(false)
      return
    }
    const t = window.setTimeout(next, intervalMs)
    return () => window.clearTimeout(t)
  }, [playing, atEnd, index, next, intervalMs])

  // Clamp when the step count changes (e.g. switching scenarios).
  useEffect(() => {
    setIndex((i) => Math.min(i, last))
  }, [last])

  return { index, count, playing, atEnd, next: () => { setPlaying(false); next() }, prev, reset, goTo, toggle }
}

export type Stepper = ReturnType<typeof useStepper>
