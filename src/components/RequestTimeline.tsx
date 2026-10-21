import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { chapters } from '../content'

/** Horizontal strip of every stage. The current one is highlighted; click to jump. */
export function RequestTimeline({ currentId }: { currentId?: string }) {
  const scroller = useRef<HTMLOListElement>(null)

  // Keep the current stage visible on narrow screens.
  useEffect(() => {
    const el = scroller.current?.querySelector<HTMLElement>('[aria-current="step"]')
    el?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [currentId])

  return (
    <nav aria-label="Stages of a request" className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
      <ol ref={scroller} className="no-scrollbar mx-auto flex max-w-5xl items-stretch gap-1 overflow-x-auto px-4 py-2">
        {chapters.map((c, i) => {
          const current = c.id === currentId
          const planned = c.status === 'planned'
          return (
            <li key={c.id} className="flex shrink-0 items-center">
              {i > 0 && <span aria-hidden className="mx-0.5 h-px w-3 bg-slate-300 sm:w-5 dark:bg-slate-700" />}
              <Link
                to={c.path}
                aria-current={current ? 'step' : undefined}
                title={c.title}
                className={`relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition sm:text-sm ${
                  current
                    ? 'text-white'
                    : planned
                      ? 'text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {current && (
                  <motion.span
                    layoutId="timeline-pill"
                    className="absolute inset-0 rounded-full bg-sky-600 dark:bg-sky-600"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative" aria-hidden>
                  {c.icon}
                </span>
                <span className="relative">
                  <span className="opacity-60">{c.number}.</span> {c.short}
                </span>
                {planned && <span className="relative text-[10px] font-medium opacity-80">soon</span>}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
