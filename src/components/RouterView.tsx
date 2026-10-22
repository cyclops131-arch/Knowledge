import { useEffect, useMemo, useState } from 'react'
import type { RouterViewSection } from '../content/types'
import { RichText } from './RichText'
import { SectionCard } from './SectionCard'

/** Deterministic fake ciphertext: a TLS record header plus pseudo-random bytes. */
function fakeCipher(length: number) {
  let seed = 0x2f6b9a13
  const rnd = () => {
    seed ^= seed << 13
    seed ^= seed >>> 17
    seed ^= seed << 5
    return (seed >>> 0) % 256
  }
  const bytes = [0x17, 0x03, 0x03, (length >> 8) & 0xff, length & 0xff]
  while (bytes.length < length) bytes.push(rnd())
  return bytes.map((b) => b.toString(16).padStart(2, '0')).join(' ')
}

/** Side by side: what the endpoints see vs. what a router in the middle sees. */
export function RouterView({ section }: { section: RouterViewSection }) {
  const [https, setHttps] = useState(true)
  const cipher = useMemo(() => fakeCipher(Math.min(64, section.plaintext.length)), [section.plaintext])
  // Brief "scramble" animation when switching modes.
  const [progress, setProgress] = useState(1)
  useEffect(() => {
    setProgress(0)
    let frame = 0
    const id = window.setInterval(() => {
      frame += 1
      setProgress(Math.min(1, frame / 12))
      if (frame >= 12) window.clearInterval(id)
    }, 35)
    return () => window.clearInterval(id)
  }, [https])

  const target = https ? cipher : section.plaintext
  const shown = progress >= 1 ? target : target.slice(0, Math.floor(target.length * progress)) + scrambleTail(target.length - Math.floor(target.length * progress))

  return (
    <SectionCard title={section.title} intro={section.intro}>
      <div className="mb-3 inline-flex rounded-full border border-slate-300 p-0.5 text-sm font-semibold dark:border-slate-700" role="radiogroup" aria-label="Protocol">
        {[
          { v: true, label: '🔒 https://' },
          { v: false, label: '⚠️ http:// (no TLS)' },
        ].map((o) => (
          <button
            key={String(o.v)}
            type="button"
            role="radio"
            aria-checked={https === o.v}
            onClick={() => setHttps(o.v)}
            className={`rounded-full px-3 py-1 transition ${
              https === o.v ? (o.v ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white dark:text-slate-950') : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-300 bg-emerald-50/60 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
          <p className="text-xs font-bold tracking-wide text-emerald-800 uppercase dark:text-emerald-300">💻 Browser & 🏢 Google see</p>
          <pre className="mt-2 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-slate-800 dark:text-slate-200">{section.plaintext}</pre>
        </div>
        <div
          className={`rounded-lg border p-3 ${
            https ? 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-950/60' : 'border-rose-400 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30'
          }`}
        >
          <p className={`text-xs font-bold tracking-wide uppercase ${https ? 'text-slate-600 dark:text-slate-300' : 'text-rose-700 dark:text-rose-300'}`}>
            📡 A router in the middle sees
          </p>
          <pre className={`mt-2 font-mono text-xs leading-relaxed break-all whitespace-pre-wrap ${https ? 'text-slate-500 dark:text-slate-400' : 'text-rose-800 dark:text-rose-200'}`} aria-live="polite">
            {shown}
          </pre>
          {!https && <p className="mt-2 text-xs font-semibold text-rose-700 dark:text-rose-300">Readable by every hop, including your search and your session cookie.</p>}
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
        <p className="text-xs font-bold tracking-wide text-slate-600 uppercase dark:text-slate-300">Visible on the wire either way</p>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-xs">
          {Object.entries(section.visibleMetadata).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-slate-500 dark:text-slate-400">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        {section.note && <RichText text={section.note} className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400" />}
      </div>
    </SectionCard>
  )
}

const GLYPHS = '░▒▓█<>/\\|#%&*?'
function scrambleTail(n: number) {
  let s = ''
  for (let i = 0; i < Math.min(n, 120); i++) s += GLYPHS[(i * 7 + n) % GLYPHS.length]
  return s
}
