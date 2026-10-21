import { Link, useLocation } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { chapterById, glossary } from '../content'

/** Every term defined in any chapter, alphabetically. */
export function GlossaryPage() {
  const { hash } = useLocation()
  const target = decodeURIComponent(hash.slice(1))
  const entries = [...glossary.values()].sort((a, b) => a.term.localeCompare(b.term))

  return (
    <Layout>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Glossary</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">
        Every dotted-underlined term on the site, in one place. {entries.length} terms so far; the list grows with each chapter.
      </p>
      <dl className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
        {entries.map((e) => {
          const chapter = chapterById.get(e.chapterId)
          return (
            <div
              key={e.id}
              id={e.id}
              className={`scroll-mt-32 p-4 transition-colors ${target === e.id ? 'bg-sky-50 dark:bg-sky-950/40' : ''}`}
            >
              <dt className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold text-slate-900 dark:text-white">{e.term}</span>
                {chapter && (
                  <Link to={chapter.path} className="text-xs text-sky-700 hover:underline dark:text-sky-400">
                    {chapter.icon} {chapter.short}
                  </Link>
                )}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{e.definition}</dd>
            </div>
          )
        })}
      </dl>
    </Layout>
  )
}
