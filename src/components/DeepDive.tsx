import { AnimatePresence, motion } from 'framer-motion'
import { useId, useState } from 'react'
import type { DeepDive as DeepDiveData } from '../content/types'
import { renderRich, RichText } from './RichText'

/** Expandable card titled with the original question. */
export function DeepDive({ item, defaultOpen = false }: { item: DeepDiveData; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()
  return (
    <div className="overflow-hidden rounded-lg border border-violet-200 bg-violet-50/60 dark:border-violet-900 dark:bg-violet-950/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-start gap-3 p-3 text-left transition hover:bg-violet-100/60 sm:p-4 dark:hover:bg-violet-900/30"
      >
        <span className="mt-0.5 shrink-0 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
          Deep dive
        </span>
        <span className="flex-1 font-semibold text-slate-900 italic dark:text-white">“{item.question}”</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-400" aria-hidden>
          ▾
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="space-y-2 px-3 pb-4 text-sm leading-relaxed sm:px-4">
              {item.answer.map((p, i) => (
                <RichText key={i} text={p} />
              ))}
              {item.points && (
                <ul className="ml-5 list-disc space-y-1 marker:text-violet-500">
                  {item.points.map((p, i) => (
                    <li key={i}>{renderRich(p, `pt${i}`)}</li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
