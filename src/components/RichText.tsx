import type { ReactNode } from 'react'
import { Term } from './Term'

const TOKEN = /(\*\*.+?\*\*|`[^`]+`|\[\[[^\]]+\]\])/g

/** Renders the content markup: **bold**, `code`, [[term-id]] and [[term-id|text]]. */
export function renderRich(text: string, keyPrefix = 'r'): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    const key = `${keyPrefix}-${i}`
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={key} className="font-semibold text-slate-900 dark:text-white">
          {renderRich(part.slice(2, -2), key)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code
          key={key}
          className="rounded bg-slate-200/70 px-1 py-0.5 font-mono text-[0.85em] text-slate-800 dark:bg-slate-800 dark:text-slate-200"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('[[') && part.endsWith(']]')) {
      const [id, shown] = part.slice(2, -2).split('|')
      return (
        <Term key={key} id={id.trim()}>
          {shown?.trim() ?? id.trim()}
        </Term>
      )
    }
    return part
  })
}

export function RichText({ text, as: As = 'p', className }: { text: string; as?: 'p' | 'span' | 'div'; className?: string }) {
  return <As className={className}>{renderRich(text)}</As>
}
