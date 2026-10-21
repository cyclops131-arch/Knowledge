import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { chapterById } from '../content'
import type { LayerStackSection } from '../content/types'
import { SectionCard } from './SectionCard'

const colors = [
  'border-sky-400 bg-sky-50 dark:border-sky-600 dark:bg-sky-950/50',
  'border-emerald-400 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/50',
  'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/50',
  'border-violet-400 bg-violet-50 dark:border-violet-600 dark:bg-violet-950/50',
  'border-rose-400 bg-rose-50 dark:border-rose-600 dark:bg-rose-950/50',
]

/**
 * Layers drawn as nested boxes: the bottom layer wraps everything above it,
 * which is exactly how encapsulation works. Hover / tap a layer to focus it.
 */
export function LayerStack({ section }: { section: LayerStackSection }) {
  const [active, setActive] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const focus = active ?? pinned
  // Outermost first for nesting: reverse the top-first list.
  const outerFirst = [...section.layers].reverse()
  const focused = section.layers.find((l) => l.id === focus)

  const render = (i: number): ReactNode => {
    const layer = outerFirst[i]
    if (!layer) return null
    const isFocus = focus === layer.id
    const dimmed = focus !== null && !isFocus
    return (
      <div
        key={layer.id}
        role="button"
        tabIndex={0}
        aria-pressed={pinned === layer.id}
        aria-label={`${layer.name}: ${layer.analogy}`}
        onPointerOver={(e) => {
          e.stopPropagation()
          if (e.pointerType === 'mouse') setActive(layer.id)
        }}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setActive(null)}
        onFocus={(e) => {
          e.stopPropagation()
          setActive(layer.id)
        }}
        onBlur={() => setActive(null)}
        onClick={(e) => {
          e.stopPropagation()
          setPinned((p) => (p === layer.id ? null : layer.id))
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            e.stopPropagation()
            setPinned((p) => (p === layer.id ? null : layer.id))
          }
        }}
        className={`cursor-pointer rounded-lg border-2 p-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:p-3 ${colors[(outerFirst.length - 1 - i) % colors.length]} ${
          isFocus ? 'shadow-md ring-2 ring-sky-500/60' : ''
        } ${dimmed ? 'border-dashed' : ''}`}
      >
        <div className={`flex items-baseline gap-2 transition-opacity ${dimmed ? 'opacity-35' : ''}`}>
          <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">{layer.name}</span>
          <span className="truncate text-xs text-slate-600 dark:text-slate-400">{layer.analogy}</span>
        </div>
        {i < outerFirst.length - 1 && <div className="mt-2">{render(i + 1)}</div>}
      </div>
    )
  }

  return (
    <SectionCard title={section.title} intro={section.intro}>
      <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
        <div>{render(0)}</div>
        <div aria-live="polite" className="min-h-36 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/60">
          <AnimatePresence mode="wait">
            <motion.div key={focused?.id ?? 'none'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {focused ? (
                <>
                  <p className="font-mono text-base font-bold text-slate-900 dark:text-white">{focused.name}</p>
                  <p className="text-xs font-medium tracking-wide text-sky-700 uppercase dark:text-sky-400">{focused.analogy}</p>
                  <p className="mt-2 leading-relaxed">{focused.job}</p>
                  {focused.example && (
                    <pre className="mt-2 overflow-x-auto rounded bg-slate-200/70 p-2 font-mono text-xs dark:bg-slate-800">{focused.example}</pre>
                  )}
                  {focused.chapterId && chapterById.get(focused.chapterId) && (
                    <Link to={chapterById.get(focused.chapterId)!.path} className="mt-2 inline-block text-xs font-semibold text-sky-700 hover:underline dark:text-sky-400">
                      Chapter {chapterById.get(focused.chapterId)!.number}: {chapterById.get(focused.chapterId)!.short} →
                    </Link>
                  )}
                </>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">
                  Hover or tap a layer. Each one wraps the layer above it, like a letter inside an envelope inside a delivery guarantee, with an address on the outside.
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SectionCard>
  )
}
