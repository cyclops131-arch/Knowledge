import { LayoutGroup, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { FlowWindowSection } from '../content/types'
import { SectionCard } from './SectionCard'

type Sim = { acked: number; inFlight: number; roundTrips: number }
const START: Sim = { acked: 0, inFlight: 0, roundTrips: 0 }
const MAX_WINDOW = 6

/**
 * Flow control demo. Each tick either sends a full window of packets or
 * receives the ACKs for them. A bigger window means fewer round trips.
 */
export function FlowWindow({ section }: { section: FlowWindowSection }) {
  const n = section.totalPackets
  const [windowSize, setWindowSize] = useState(2)
  const [sim, setSim] = useState<Sim>(START)
  const [playing, setPlaying] = useState(false)
  const done = sim.acked === n

  const step = () =>
    setSim((s) => {
      if (s.inFlight > 0) return { acked: s.acked + s.inFlight, inFlight: 0, roundTrips: s.roundTrips + 1 }
      if (s.acked < n) return { ...s, inFlight: Math.min(windowSize, n - s.acked) }
      return s
    })

  useEffect(() => {
    if (!playing) return
    if (done) {
      setPlaying(false)
      return
    }
    const t = window.setTimeout(step, 900)
    return () => window.clearTimeout(t)
  }, [playing, sim, done])

  const reset = () => {
    setPlaying(false)
    setSim(START)
  }

  const seq = (i: number) => section.startSeq + i * section.packetSize
  const packets = Array.from({ length: n }, (_, i) => i)
  const waiting = packets.filter((i) => i >= sim.acked + sim.inFlight)
  const flying = packets.filter((i) => i >= sim.acked && i < sim.acked + sim.inFlight)
  const acked = packets.filter((i) => i < sim.acked)
  const needed = Math.ceil(n / windowSize)

  const status = done
    ? `All ${n} packets delivered in ${sim.roundTrips} round trips.`
    : sim.inFlight > 0
      ? `Round trip ${sim.roundTrips + 1}: ${sim.inFlight} packet${sim.inFlight > 1 ? 's' : ''} in flight. The window is full, so the server waits for ACKs.`
      : sim.roundTrips === 0
        ? `Window = ${windowSize}: the receiver says “I have room for ${windowSize} packet${windowSize > 1 ? 's' : ''}.” Press Play.`
        : `ACKs arrived (ack=${seq(sim.acked)}). The window slides forward; the server can send again.`

  const row = (label: string, items: number[], kind: 'wait' | 'fly' | 'ack') => (
    <div>
      <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
        {label} <span className="tabular-nums">({items.length})</span>
      </p>
      <div
        className={`flex min-h-11 flex-wrap gap-1 rounded-lg border p-1.5 ${
          kind === 'fly'
            ? 'border-dashed border-sky-400 bg-sky-50/60 dark:border-sky-700 dark:bg-sky-950/30'
            : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50'
        }`}
      >
        {items.map((i) => (
          <motion.div
            key={i}
            layoutId={`pkt-${i}`}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className={`flex h-8 w-12 items-center justify-center rounded font-mono text-[10px] font-semibold sm:w-14 sm:text-xs ${
              kind === 'ack'
                ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                : kind === 'fly'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            }`}
            title={`seq=${seq(i)}`}
          >
            {seq(i)}
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <SectionCard title={section.title} intro={section.intro}>
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="window-size" className="text-sm font-medium">
          Receive window: <span className="font-mono font-bold text-sky-700 dark:text-sky-400">{windowSize}</span> packet{windowSize > 1 ? 's' : ''}
        </label>
        <input
          id="window-size"
          type="range"
          min={1}
          max={MAX_WINDOW}
          value={windowSize}
          onChange={(e) => {
            setWindowSize(Number(e.target.value))
            reset()
          }}
          className="w-40 accent-sky-600"
        />
      </div>

      <LayoutGroup id={`flow-${section.title}`}>
        <div className="mt-3 space-y-2">
          {row('At the server, not yet sent', waiting, 'wait')}
          {row('In flight (unacknowledged) — at most the window', flying, 'fly')}
          {row('Delivered and ACKed', acked, 'ack')}
        </div>
      </LayoutGroup>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (done) setSim(START)
            setPlaying((p) => !p)
          }}
          className="inline-flex h-9 min-w-20 items-center justify-center rounded-md bg-sky-600 px-3 text-sm font-medium text-white hover:bg-sky-700"
        >
          {playing ? '❚❚ Pause' : done ? '↺ Replay' : '▶ Play'}
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false)
            step()
          }}
          disabled={done}
          className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm font-medium hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Step ›
        </button>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-9 items-center rounded-md border border-slate-300 px-3 text-sm font-medium hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          ⟲ Reset
        </button>
        <span className="ml-auto text-sm tabular-nums text-slate-600 dark:text-slate-400">
          Round trips: <b>{sim.roundTrips}</b> / {needed}
        </span>
      </div>

      <p aria-live="polite" className="mt-3 min-h-10 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/60">
        {status}
      </p>

      <div className="mt-3 flex flex-wrap gap-1.5 text-xs" aria-label="Round trips needed per window size">
        {Array.from({ length: MAX_WINDOW }, (_, i) => i + 1).map((w) => (
          <span
            key={w}
            className={`rounded px-2 py-1 font-mono ${
              w === windowSize ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            w={w} → {Math.ceil(n / w)} RTT
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold">Simplified:</span> real windows are measured in bytes, ACKs arrive continuously rather than in batches, and the sender is also limited by its own congestion window, which shrinks when packets drop.
      </p>
    </SectionCard>
  )
}
