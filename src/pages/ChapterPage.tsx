import { Link } from 'react-router-dom'
import { SectionRenderer } from '../components/SectionRenderer'
import { chapters } from '../content'
import type { Chapter } from '../content/types'
import { Layout } from '../components/Layout'

export function ChapterPage({ chapter }: { chapter: Chapter }) {
  const i = chapters.indexOf(chapter)
  const prev = chapters[i - 1]
  const next = chapters[i + 1]
  const isLanding = chapter.number === 0

  return (
    <Layout currentId={chapter.id}>
      <header className="mb-6">
        <p className="text-sm font-semibold text-sky-700 dark:text-sky-400">
          {isLanding ? 'Life of a Request' : `Chapter ${chapter.number}`}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          <span aria-hidden className="mr-2">
            {chapter.icon}
          </span>
          {isLanding ? 'What really happens when you load google.com' : chapter.title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-slate-600 dark:text-slate-400">{chapter.summary}</p>
      </header>

      {chapter.status === 'planned' ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-4xl" aria-hidden>
            🚧
          </p>
          <p className="mt-2 font-semibold text-slate-900 dark:text-white">Coming soon</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            This chapter is planned but not built yet. Meanwhile, <Link to="/tcp" className="font-semibold text-sky-700 hover:underline dark:text-sky-400">the TCP chapter</Link> is ready.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {chapter.sections.map((section, idx) => (
            <SectionRenderer key={idx} section={section} />
          ))}
        </div>
      )}

      <nav className="mt-10 grid grid-cols-2 gap-3 text-sm" aria-label="Chapter navigation">
        {prev ? (
          <Link to={prev.path} className="rounded-lg border border-slate-200 p-3 hover:border-sky-500 dark:border-slate-800">
            <span className="text-xs text-slate-500">← Previous</span>
            <span className="block font-semibold">
              {prev.icon} {prev.short}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={next.path} className="rounded-lg border border-slate-200 p-3 text-right hover:border-sky-500 dark:border-slate-800">
            <span className="text-xs text-slate-500">Next →</span>
            <span className="block font-semibold">
              {next.icon} {next.short}
              {next.status === 'planned' && <span className="text-xs font-normal text-slate-400"> (soon)</span>}
            </span>
          </Link>
        )}
      </nav>
    </Layout>
  )
}
