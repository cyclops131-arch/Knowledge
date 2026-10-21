import type { Stepper } from '../lib/useStepper'

const base = 'inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-md border px-2.5 text-sm font-medium transition disabled:opacity-40'
const btn = `${base} border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:disabled:hover:bg-slate-800`
const primary = `${base} min-w-20 border-sky-600 bg-sky-600 text-white hover:bg-sky-700 dark:border-sky-500 dark:hover:bg-sky-500`

/** Prev / Play-Pause / Next / Reset, plus a clickable progress bar. */
export function StepperControls({ stepper, label = 'step' }: { stepper: Stepper; label?: string }) {
  const { index, count, playing, atEnd } = stepper
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={btn} onClick={stepper.prev} disabled={index === 0} aria-label={`Previous ${label}`}>
        ‹ <span className="hidden sm:inline">Prev</span>
      </button>
      <button
        type="button"
        className={primary}
        onClick={stepper.toggle}
        aria-label={playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}
      >
        {playing ? '❚❚ Pause' : atEnd ? '↺ Replay' : '▶ Play'}
      </button>
      <button type="button" className={btn} onClick={stepper.next} disabled={atEnd} aria-label={`Next ${label}`}>
        <span className="hidden sm:inline">Next</span> ›
      </button>
      <button type="button" className={btn} onClick={stepper.reset} disabled={index === 0 && !playing} aria-label="Reset">
        ⟲ <span className="hidden sm:inline">Reset</span>
      </button>
      <div className="ml-auto flex items-center gap-2 text-xs tabular-nums text-slate-500 dark:text-slate-400">
        <div className="hidden gap-0.5 sm:flex" role="group" aria-label="Jump to step">
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => stepper.goTo(i)}
              aria-label={`Go to ${label} ${i + 1}`}
              className={`h-2 w-3 rounded-full transition ${
                i === index ? 'bg-sky-600 dark:bg-sky-400' : i < index ? 'bg-sky-300 dark:bg-sky-800' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
        <span>
          {index + 1} / {count}
        </span>
      </div>
    </div>
  )
}
