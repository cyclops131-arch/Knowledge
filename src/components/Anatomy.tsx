import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import type { AnatomySection, Tone } from '../content/types'
import { RichText } from './RichText'
import { SectionCard } from './SectionCard'

const partTone: Record<Tone, string> = {
  default: 'text-sky-700 decoration-sky-400 dark:text-sky-300',
  info: 'text-indigo-700 decoration-indigo-400 dark:text-indigo-300',
  success: 'text-emerald-700 decoration-emerald-400 dark:text-emerald-300',
  warning: 'text-amber-700 decoration-amber-400 dark:text-amber-300',
  danger: 'text-rose-700 decoration-rose-400 dark:text-rose-300',
  muted: 'text-slate-400 decoration-slate-300 dark:text-slate-500',
}

/** A string split into parts; hover or tap a part to explain it. */
export function Anatomy({ section }: { section: AnatomySection }) {
  const [hover, setHover] = useState<number | null>(null)
  const [pinned, setPinned] = useState<number | null>(null)
  const active = hover ?? pinned
  const part = active !== null ? section.parts[active] : null

  return (
    <SectionCard title={section.title} intro={section.intro}>
      <div className="flex flex-wrap items-baseline justify-center gap-0.5 rounded-lg bg-slate-50 px-2 py-5 font-mono text-2xl font-bold sm:text-4xl dark:bg-slate-950/60">
        {section.parts.map((p, i) => (
          <button
            key={i}
            type="button"
            onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(i)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            onClick={() => setPinned((v) => (v === i ? null : i))}
            aria-pressed={pinned === i}
            aria-label={`${p.text}: ${p.label}`}
            className={`rounded px-0.5 underline decoration-4 underline-offset-8 transition ${partTone[p.tone ?? 'default']} ${
              active === i ? 'bg-white shadow dark:bg-slate-800' : active !== null ? 'opacity-40' : ''
            }`}
          >
            {p.text}
          </button>
        ))}
      </div>
      {section.hint && <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">{section.hint}</p>}
      <div aria-live="polite" className="mt-3 min-h-20 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/60">
        <AnimatePresence mode="wait">
          <motion.div key={active ?? 'none'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
            {part ? (
              <>
                <p className="font-semibold text-slate-900 dark:text-white">
                  <span className="font-mono">{part.text}</span> · {part.label}
                </p>
                <RichText text={part.detail} className="mt-1 leading-relaxed" />
              </>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">Hover or tap a part.</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </SectionCard>
  )
}
