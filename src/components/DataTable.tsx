import type { TableSection } from '../content/types'
import { renderRich } from './RichText'
import { SectionCard } from './SectionCard'

/** A simple table; scrolls sideways inside its card on narrow screens. */
export function DataTable({ section }: { section: TableSection }) {
  return (
    <SectionCard title={section.title} intro={section.intro}>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
          <thead>
            <tr>
              {section.columns.map((c, i) => (
                <th key={i} className="border-b-2 border-slate-200 px-2 py-2 font-semibold text-slate-900 dark:border-slate-700 dark:text-white">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-2 align-top leading-snug text-slate-700 dark:text-slate-300">
                    {renderRich(cell, `c${ri}-${ci}`)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}
