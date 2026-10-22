import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { AnycastMapSection, MapPoint } from '../content/types'
import { distanceKm, LAND_DOTS, MAP, project } from '../lib/worldDots'
import { SectionCard } from './SectionCard'

const USER_COLORS = ['#0284c7', '#db2777', '#16a34a', '#d97706', '#7c3aed']

/** Label anchor for a marker at (x, y). */
function labelAt(x: number, y: number, pos: MapPoint['labelPos'], fallback: 'above' | 'below') {
  switch (pos ?? fallback) {
    case 'above':
      return { x, y: y - 12, anchor: 'middle' as const }
    case 'below':
      return { x, y: y + 23, anchor: 'middle' as const }
    case 'left':
      return { x: x - 12, y: y + 5, anchor: 'end' as const }
    case 'right':
      return { x: x + 12, y: y + 5, anchor: 'start' as const }
  }
}

/** Anycast demo: every site announces the same IP; each user lands on the nearest live one. */
export function AnycastMap({ section }: { section: AnycastMapSection }) {
  const [down, setDown] = useState<Set<string>>(new Set())

  const routes = useMemo(
    () =>
      section.users.map((u) => {
        const live = section.sites.filter((s) => !down.has(s.id))
        const best = live
          .map((s) => ({ site: s, km: distanceKm(u, s) }))
          .sort((a, b) => a.km - b.km)[0]
        return { user: u, ...best }
      }),
    [section, down],
  )

  const toggle = (id: string) =>
    setDown((d) => {
      const next = new Set(d)
      if (next.has(id)) next.delete(id)
      else if (next.size < section.sites.length - 1) next.add(id) // keep at least one site up
      return next
    })

  return (
    <SectionCard title={section.title} intro={section.intro}>
      <div className="rounded-lg bg-slate-50 p-1 dark:bg-slate-950/60">
        <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="block w-full select-none" role="img" aria-label={`World map: users connecting to the nearest site announcing ${section.ip}`}>
          {LAND_DOTS.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={1.7} className="fill-slate-300 dark:fill-slate-700" />
          ))}

          {/* Routes */}
          {routes.map((r, i) => {
            if (!r.site) return null
            const a = project(r.user.lon, r.user.lat)
            const b = project(r.site.lon, r.site.lat)
            return (
              <g key={r.user.id}>
                <motion.line
                  key={r.site.id}
                  x1={a.x}
                  y1={a.y}
                  initial={{ x2: a.x, y2: a.y }}
                  animate={{ x2: b.x, y2: b.y }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  stroke={USER_COLORS[i % USER_COLORS.length]}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <motion.circle
                  key={`pkt-${r.site.id}`}
                  r={4}
                  fill={USER_COLORS[i % USER_COLORS.length]}
                  initial={{ cx: a.x, cy: a.y, opacity: 0 }}
                  animate={{ cx: [a.x, b.x], cy: [a.y, b.y], opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'linear', delay: 0.6 + i * 0.2 }}
                />
              </g>
            )
          })}

          {/* Sites */}
          {section.sites.map((s) => {
            const p = project(s.lon, s.lat)
            const isDown = down.has(s.id)
            const serving = routes.some((r) => r.site?.id === s.id)
            return (
              <g
                key={s.id}
                role="button"
                tabIndex={0}
                aria-pressed={isDown}
                aria-label={`${s.label} site, ${isDown ? 'offline' : 'online'}. Activate to toggle.`}
                className="cursor-pointer outline-none"
                onClick={() => toggle(s.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggle(s.id)
                  }
                }}
              >
                <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
                <rect
                  x={p.x - 7}
                  y={p.y - 7}
                  width={14}
                  height={14}
                  rx={3}
                  strokeWidth={2}
                  className={
                    isDown
                      ? 'fill-slate-200 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-600'
                      : serving
                        ? 'fill-emerald-500 stroke-emerald-700 dark:stroke-emerald-300'
                        : 'fill-white stroke-emerald-600 dark:fill-slate-900 dark:stroke-emerald-500'
                  }
                />
                {isDown && (
                  <text x={p.x} y={p.y + 5} textAnchor="middle" className="fill-rose-600 text-[14px] font-bold">
                    ✕
                  </text>
                )}
                {(() => {
                  const l = labelAt(p.x, p.y, s.labelPos, 'below')
                  return (
                    <text x={l.x} y={l.y} textAnchor={l.anchor} className="halo fill-slate-700 text-[13px] font-semibold dark:fill-slate-300">
                      {s.label}
                    </text>
                  )
                })()}
              </g>
            )
          })}

          {/* Users */}
          {section.users.map((u, i) => {
            const p = project(u.lon, u.lat)
            return (
              <g key={u.id}>
                <circle cx={p.x} cy={p.y} r={7} fill={USER_COLORS[i % USER_COLORS.length]} stroke="white" strokeWidth={2} />
                {(() => {
                  const l = labelAt(p.x, p.y, u.labelPos, 'above')
                  return (
                    <text x={l.x} y={l.y} textAnchor={l.anchor} className="halo text-[13px] font-bold" fill={USER_COLORS[i % USER_COLORS.length]}>
                      {u.label}
                    </text>
                  )
                })()}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
        <span>
          <span className="mr-1 inline-block h-3 w-3 rounded-sm border-2 border-emerald-700 bg-emerald-500 align-middle" /> site serving traffic
        </span>
        <span>
          <span className="mr-1 inline-block h-3 w-3 rounded-sm border-2 border-emerald-600 bg-white align-middle dark:bg-slate-900" /> idle site
        </span>
        <span>
          <span className="mr-1 inline-block h-3 w-3 rounded-full bg-sky-600 align-middle" /> user
        </span>
        {down.size > 0 && (
          <button type="button" onClick={() => setDown(new Set())} className="ml-auto font-semibold text-sky-700 hover:underline dark:text-sky-400">
            Bring all sites back
          </button>
        )}
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/60" aria-live="polite">
        <p className="font-medium text-slate-900 dark:text-white">
          Everyone asks for <code className="font-mono">{section.ip}</code> ({section.serviceName})…
        </p>
        <ul className="mt-2 space-y-1">
          {routes.map((r, i) => (
            <li key={r.user.id} className="flex flex-wrap items-baseline gap-x-2">
              <span className="font-semibold" style={{ color: USER_COLORS[i % USER_COLORS.length] }}>
                {r.user.label}
              </span>
              <span className="text-slate-500">→</span>
              <span>
                lands in <b>{r.site?.label}</b>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">≈ {Math.round((r.km ?? 0) / 100) * 100} km</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {down.size > 0
            ? `${down.size} site${down.size > 1 ? 's' : ''} offline: they stop announcing the address, so routing quietly sends users to the next nearest. No user changed anything.`
            : 'Tap a site to take it offline.'}{' '}
          Every site holds a replicated copy of the same zone data, so the answer is identical wherever you land.
        </p>
      </div>
      {section.simplification && (
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold">Simplified:</span> {section.simplification}
        </p>
      )}
    </SectionCard>
  )
}
