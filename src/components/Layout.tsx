import { useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { RequestTimeline } from './RequestTimeline'

function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
  return (
    <button
      type="button"
      onClick={() => {
        const next = !dark
        setDark(next)
        try {
          localStorage.setItem('theme', next ? 'dark' : 'light')
        } catch {
          /* storage unavailable: theme still switches for this visit */
        }
      }}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="flex h-9 w-9 items-center justify-center rounded-md text-lg hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}

export function Layout({ currentId, children }: { currentId?: string; children: ReactNode }) {
  const { pathname, hash } = useLocation()

  // Scroll to top on page change (or to the #anchor, e.g. a glossary term).
  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'center' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40">
        <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <span aria-hidden>📨</span> Life of a Request
            </Link>
            <span className="hidden font-mono text-xs text-slate-400 sm:inline">https://www.google.com</span>
            <nav className="ml-auto flex items-center gap-1">
              <Link to="/glossary" className="rounded-md px-2 py-1.5 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                Glossary
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </div>
        <RequestTimeline currentId={currentId} />
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        One request, followed end to end. Diagrams are simplified on purpose; each one says where.
      </footer>
    </div>
  )
}
