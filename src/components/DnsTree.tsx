import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { DnsNode, DnsScenario, DnsTreeSection } from '../content/types'
import { toneBadge, toneSvg } from '../lib/tone'
import { useStepper } from '../lib/useStepper'
import { RichText } from './RichText'
import { SectionCard } from './SectionCard'
import { StepperControls } from './StepperControls'
import { WhatIfToggle } from './WhatIfToggle'

const W = 360
const ROW_GAP = 62
const TOP = 26
const NODE_H = 26
const CLIENT_W = 86
const CLIENT_H = 36

type Pos = { x: number; y: number; w: number; h: number }

/** DNS namespace tree with a resolver walking it step by step. */
export function DnsTree({ section }: { section: DnsTreeSection }) {
  const [scenarioId, setScenarioId] = useState(section.scenarios[0].id)
  const scenario = section.scenarios.find((s) => s.id === scenarioId) ?? section.scenarios[0]
  return (
    <SectionCard title={section.title} intro={section.intro}>
      <div className="mb-3">
        <WhatIfToggle options={section.scenarios} value={scenario.id} onChange={setScenarioId} />
        {scenario.description && <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">⚡ {scenario.description}</p>}
      </div>
      <TreeWalk key={scenario.id} section={section} scenario={scenario} />
      {section.simplification && (
        <p className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="font-semibold">Simplified:</span> {section.simplification}
        </p>
      )}
    </SectionCard>
  )
}

function layoutTree(nodes: DnsNode[], visible: Set<string>) {
  const shown = nodes.filter((n) => visible.has(n.id))
  const children = (id: string) => shown.filter((n) => n.parent === id)
  const rootNode = shown.find((n) => !n.parent)!
  const leaves: string[] = []
  const depth = new Map<string, number>()
  const walk = (n: DnsNode, d: number) => {
    depth.set(n.id, d)
    const kids = children(n.id)
    if (kids.length === 0) leaves.push(n.id)
    kids.forEach((k) => walk(k, d + 1))
  }
  walk(rootNode, 0)

  const pad = 8
  const slot = (W - pad * 2) / leaves.length
  const x = new Map<string, number>()
  leaves.forEach((id, i) => x.set(id, pad + slot * (i + 0.5)))
  const place = (n: DnsNode): number => {
    if (x.has(n.id)) return x.get(n.id)!
    const xs = children(n.id).map(place)
    const v = (Math.min(...xs) + Math.max(...xs)) / 2
    x.set(n.id, v)
    return v
  }
  place(rootNode)

  const pos = new Map<string, Pos>()
  let maxDepth = 0
  for (const n of shown) {
    const d = depth.get(n.id) ?? 0
    maxDepth = Math.max(maxDepth, d)
    const text = n.sublabel ? `${n.label} ${n.sublabel}` : n.label
    const w = Math.max(36, Math.min(slot - 6, 112, text.length * 7.4 + 14))
    pos.set(n.id, { x: x.get(n.id)!, y: TOP + d * ROW_GAP, w, h: NODE_H })
  }
  return { pos, shown, bottom: TOP + maxDepth * ROW_GAP + NODE_H / 2 }
}

function TreeWalk({ section, scenario }: { section: DnsTreeSection; scenario: DnsScenario }) {
  const steps = scenario.steps
  const stepper = useStepper(steps.length, 1500)
  const i = stepper.index
  const step = steps[i]

  // Ghost nodes are part of the layout only in scenarios that reveal them.
  const { pos, shown, height } = useMemo(() => {
    const revealedAnywhere = new Set(steps.flatMap((s) => s.reveal ?? []))
    const visible = new Set(section.nodes.filter((n) => !n.ghost || revealedAnywhere.has(n.id)).map((n) => n.id))
    const tree = layoutTree(section.nodes, visible)
    const clientY = tree.bottom + 64
    section.clients.forEach((c, ci) => {
      const x = (W / (section.clients.length + 1)) * (ci + 1)
      tree.pos.set(c.id, { x, y: clientY, w: CLIENT_W, h: CLIENT_H })
    })
    return { pos: tree.pos, shown: tree.shown, height: clientY + CLIENT_H / 2 + 8 }
  }, [section, steps])

  const revealedNow = new Set(steps.slice(0, i + 1).flatMap((s) => s.reveal ?? []))
  const involved = (s: (typeof steps)[number]) => [s.from, ...(s.to ? [s.to] : []), ...(s.highlight ?? [])]
  const visited = new Set(steps.slice(0, i + 1).flatMap(involved))
  const current = new Set(involved(step))
  const tone = step.tone ?? 'default'

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${height}`} className="mx-auto block w-full max-w-[540px] select-none" role="img" aria-label="DNS tree: root, top-level domains, domains and subdomains, with the resolver below">
        {/* Edges */}
        {shown
          .filter((n) => n.parent)
          .map((n) => {
            const a = pos.get(n.parent!)!
            const b = pos.get(n.id)!
            const hidden = n.ghost && !revealedNow.has(n.id)
            return (
              <motion.line
                key={`e-${n.id}`}
                x1={a.x}
                y1={a.y + a.h / 2}
                x2={b.x}
                y2={b.y - b.h / 2}
                animate={{ opacity: hidden ? 0 : 1 }}
                className={n.ghost === 'missing' ? 'stroke-rose-400' : visited.has(n.id) && visited.has(n.parent!) ? 'stroke-sky-400 dark:stroke-sky-600' : 'stroke-slate-300 dark:stroke-slate-700'}
                strokeWidth={1.5}
                strokeDasharray={n.ghost ? '4 3' : undefined}
              />
            )
          })}

        {/* Divider between "the internet" and "your side" */}
        <text x={4} y={pos.get(section.clients[0].id)!.y - CLIENT_H / 2 - 12} className="fill-slate-400 text-[9px] font-semibold tracking-wider uppercase dark:fill-slate-500">
          your side
        </text>
        <line
          x1={0}
          x2={W}
          y1={pos.get(section.clients[0].id)!.y - CLIENT_H / 2 - 24}
          y2={pos.get(section.clients[0].id)!.y - CLIENT_H / 2 - 24}
          className="stroke-slate-200 dark:stroke-slate-800"
          strokeDasharray="2 4"
        />

        {/* Tree nodes */}
        {shown.map((n) => {
          const p = pos.get(n.id)!
          const hidden = n.ghost && !revealedNow.has(n.id)
          const isCurrent = current.has(n.id)
          const ghostTone = n.ghost === 'missing' ? toneSvg.danger : n.ghost === 'new' ? toneSvg.success : null
          const t = ghostTone ?? (isCurrent ? toneSvg[tone] : null)
          return (
            <motion.g
              key={n.id}
              initial={false}
              animate={{ opacity: hidden ? 0 : 1, scale: hidden ? 0.6 : 1 }}
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <rect
                x={p.x - p.w / 2}
                y={p.y - p.h / 2}
                width={p.w}
                height={p.h}
                rx={6}
                strokeWidth={isCurrent ? 2.5 : 1.25}
                strokeDasharray={n.ghost ? '4 3' : undefined}
                className={
                  t
                    ? `${t.soft} ${t.stroke}`
                    : visited.has(n.id)
                      ? 'fill-sky-50 stroke-sky-400 dark:fill-sky-950 dark:stroke-sky-600'
                      : 'fill-white stroke-slate-300 dark:fill-slate-900 dark:stroke-slate-700'
                }
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                className={`font-mono font-bold ${t ? t.text : 'fill-slate-800 dark:fill-slate-100'}`}
                style={{ fontSize: Math.min(12, (p.w - 8) / (((n.label + (n.sublabel ? ' ' + n.sublabel : '')).length) * 0.62)) }}
              >
                {n.label}
                {n.sublabel && <tspan className="fill-slate-400 text-[9.5px] font-medium"> {n.sublabel}</tspan>}
              </text>
              {n.ghost === 'missing' && !hidden && (
                <text x={p.x} y={p.y + p.h / 2 + 12} textAnchor="middle" className="fill-rose-600 text-[9.5px] font-semibold dark:fill-rose-400">
                  ✗ not in root
                </text>
              )}
              {n.ghost === 'new' && !hidden && (
                <text x={p.x} y={p.y + p.h / 2 + 12} textAnchor="middle" className="fill-emerald-600 text-[9.5px] font-semibold dark:fill-emerald-400">
                  new leaf
                </text>
              )}
            </motion.g>
          )
        })}

        {/* Client side: browser, OS, resolver */}
        {section.clients.map((c) => {
          const p = pos.get(c.id)!
          const isCurrent = current.has(c.id)
          const t = isCurrent ? toneSvg[tone] : null
          return (
            <g key={c.id}>
              <rect
                x={p.x - p.w / 2}
                y={p.y - p.h / 2}
                width={p.w}
                height={p.h}
                rx={8}
                strokeWidth={isCurrent ? 2.5 : 1.25}
                className={t ? `${t.soft} ${t.stroke}` : 'fill-slate-100 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600'}
              />
              <text x={p.x} y={p.y - 1} textAnchor="middle" className="fill-slate-900 text-[12px] font-semibold dark:fill-white">
                {c.label}
              </text>
              {c.sublabel && (
                <text x={p.x} y={p.y + 12} textAnchor="middle" className="fill-slate-500 text-[9.5px] dark:fill-slate-400">
                  {c.sublabel}
                </text>
              )}
            </g>
          )
        })}

        {/* Past arrows, faint */}
        {steps.slice(0, i).map((s, si) =>
          s.to ? <Arrow key={`past-${si}`} from={pos.get(s.from)!} to={pos.get(s.to)!} className={toneSvg[s.tone ?? 'default'].stroke} faint /> : null,
        )}

        {/* Current step */}
        {step.to ? (
          <Arrow
            key={`cur-${i}`}
            from={pos.get(step.from)!}
            to={pos.get(step.to)!}
            className={toneSvg[tone].stroke}
            fillClass={toneSvg[tone].fill}
            label={step.label}
            labelBandY={pos.get(section.clients[0].id)!.y - CLIENT_H / 2 - 36}
          />
        ) : (
          step.badge && <Badge key={`badge-${i}`} at={pos.get(step.from)!} text={step.badge} tone={tone} />
        )}
      </svg>

      <div className="mt-3">
        <StepperControls stepper={stepper} />
      </div>

      <div aria-live="polite" className="mt-3 min-h-24 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
        <AnimatePresence mode="wait">
          <motion.div key={`${scenario.id}-${i}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                Step {i + 1} of {steps.length}
              </span>
              <span className={`rounded px-1.5 py-0.5 font-mono font-semibold ${toneBadge[tone]}`}>
                {step.label}
                {step.badge && ` · ${step.badge}`}
              </span>
            </div>
            <RichText text={step.caption} className="mt-2 text-sm leading-relaxed" />
            {step.fields && (
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono text-xs">
                {Object.entries(step.fields).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-slate-500 dark:text-slate-400">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** Curved arrow between two boxes; curves to the right of travel so request and reply don't overlap. */
function Arrow({ from, to, className, fillClass, label, faint, labelBandY }: { from: Pos; to: Pos; className: string; fillClass?: string; label?: string; faint?: boolean; labelBandY?: number }) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy) || 1
  const ux = dx / len
  const uy = dy / len
  // Trim the ends so arrows start/stop at the box edges (roughly).
  const trim = (p: Pos, sign: number) => {
    const tx = Math.abs(ux) > 1e-6 ? p.w / 2 / Math.abs(ux) : Infinity
    const ty = Math.abs(uy) > 1e-6 ? p.h / 2 / Math.abs(uy) : Infinity
    const d = Math.min(tx, ty) + 4
    return { x: p.x + ux * d * sign, y: p.y + uy * d * sign }
  }
  const a = trim(from, 1)
  const b = trim(to, -1)
  const bend = Math.min(36, len * 0.18)
  const cx = (a.x + b.x) / 2 - uy * bend
  const cy = (a.y + b.y) / 2 + ux * bend
  const d = `M${a.x} ${a.y} Q${cx} ${cy} ${b.x} ${b.y}`
  const angle = (Math.atan2(b.y - cy, b.x - cx) * 180) / Math.PI
  // Put the label where the curve passes through the free band between tree and clients.
  const at = (t: number) => ({
    x: (1 - t) ** 2 * a.x + 2 * (1 - t) * t * cx + t ** 2 * b.x,
    y: (1 - t) ** 2 * a.y + 2 * (1 - t) * t * cy + t ** 2 * b.y,
  })
  let best = at(0.5)
  if (labelBandY !== undefined) {
    for (let t = 0.15; t <= 0.85; t += 0.05) {
      const p = at(t)
      if (Math.abs(p.y - labelBandY) < Math.abs(best.y - labelBandY)) best = p
    }
  }
  const midX = Math.min(W - 40, Math.max(40, best.x))
  const midY = best.y

  if (faint) return <path d={d} fill="none" className={className} strokeWidth={1.25} opacity={0.22} />

  return (
    <g>
      <motion.path d={d} fill="none" className={className} strokeWidth={2.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: 'easeInOut' }} />
      <motion.path
        d="M0 0 L-9 -4.5 L-9 4.5 Z"
        transform={`translate(${b.x} ${b.y}) rotate(${angle})`}
        className={fillClass}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      />
      {label && (
        <motion.text
          x={midX}
          y={midY + 4}
          textAnchor="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="halo fill-slate-800 font-mono text-[10.5px] font-bold dark:fill-slate-100"
        >
          {label}
        </motion.text>
      )}
    </g>
  )
}

function Badge({ at, text, tone }: { at: Pos; text: string; tone: keyof typeof toneSvg }) {
  const t = toneSvg[tone]
  const w = text.length * 6.6 + 14
  const y = at.y - at.h / 2 - 12
  return (
    <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
      <rect x={at.x - w / 2} y={y - 9} width={w} height={18} rx={9} className={`${t.fill}`} />
      <text x={at.x} y={y + 4} textAnchor="middle" className="fill-white text-[10.5px] font-bold dark:fill-slate-950">
        {text}
      </text>
    </motion.g>
  )
}
