import type { KeyPointsSection } from '../content/types'
import { RichText } from './RichText'
import { SectionCard } from './SectionCard'

export function KeyPoints({ section }: { section: KeyPointsSection }) {
  return (
    <SectionCard title={section.title}>
      <div className="grid gap-3 sm:grid-cols-3">
        {section.points.map((p) => (
          <div key={p.title} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="font-semibold text-slate-900 dark:text-white">
              {p.icon && <span className="mr-1.5">{p.icon}</span>}
              {p.title}
            </p>
            <RichText text={p.body} className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400" />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
