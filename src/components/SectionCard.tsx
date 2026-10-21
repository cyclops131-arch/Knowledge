import type { ReactNode } from 'react'
import { RichText } from './RichText'

export function SectionCard({ title, intro, children }: { title?: string; intro?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      {title && <h2 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">{title}</h2>}
      {intro && <RichText text={intro} className="mt-1 mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400" />}
      {!intro && title && <div className="mb-3" />}
      {children}
    </section>
  )
}
