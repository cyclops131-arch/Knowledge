import type { CalloutSection } from '../content/types'
import { RichText } from './RichText'

const styles = {
  info: 'border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/40',
  warning: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40',
  success: 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40',
}

export function Callout({ section }: { section: CalloutSection }) {
  return (
    <aside className={`rounded-xl border p-4 text-sm leading-relaxed ${styles[section.tone]}`}>
      {section.title && <p className="mb-1 font-semibold text-slate-900 dark:text-white">{section.title}</p>}
      <RichText text={section.body} />
    </aside>
  )
}
