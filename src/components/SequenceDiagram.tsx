import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState, type KeyboardEvent, type PointerEvent } from 'react'
import type { Lane, MessageStep, NoteStep, Scenario, SequenceSection, SequenceStep } from '../content/types'
import { toneBadge, toneSvg } from '../lib/tone'
import { useElementWidth } from '../lib/useElementWidth'
import { useStepper } from '../lib/useStepper'
import { RichText } from './RichText'
import { SectionCard } from './SectionCard'
import { StepperControls } from './StepperControls'
import { WhatIfToggle } from './WhatIfToggle'

/** Sequence diagram with lanes, an animated stepper, and What If scenarios. */
export function SequenceDiagram({ section }: { section: SequenceSection }) {
  const [scenarioId, setScenarioId] = useState(section.scenarios[0].id)
  const scenario = section.scenarios.find((s) => s.id === scenarioId) ?? section.scenarios[0]

  return (
    <SectionCard title={section.title} intro={section.intro}>
      <div className="mb-3">
        <WhatIfToggle options={section.scenarios} value={scenario.id} onChange={setScenarioId} />
        {scenario.description && (
          <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">⚡ {scenario.description}</p>
        )}
      </div>
      {/* Keyed so the stepper restarts when the scenario changes. */}
      <ScenarioView key={scenario.id} scenario={scenario} lanes={scenario.lanes ?? section.lanes} />
      {section.simplification && (
        <p className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="font-semibold">Simplified:</span> {section.simplification.replace(/^Simplified:\s*/i, '')}
        </p>
      )}
    </SectionCard>
  )
}

const HEADER_H = 50
const ROW_H = 46
const FIRST_ROW = HEADER_H + 30

function ScenarioView({ scenario, lanes }: { scenario: Scenario; lanes: Lane[] }) {
  const steps = scenario.steps
  const stepper = useStepper(steps.length, 1600)
  const [hovered, setHovered] = useState<number | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [ref, width] = useElementWidth<HTMLDivElement>()

  // A tapped arrow stays selected until the stepper moves.
  useEffect(() => setSelected(null), [stepper.index])

  const layout = useMemo(() => {
    const hasTimes = steps.some((s) => s.time)
    const marginL = hasTimes ? 40 : 6
    const marginR = 6
    const usable = Math.max(200, width - marginL - marginR)
    const n = lanes.length
    const boxW = Math.min(140, usable / n - 8)
    const span = usable - boxW
    const laneX = new Map<string, number>()
    lanes.forEach((lane, i) => laneX.set(lane.id, marginL + boxW / 2 + (n === 1 ? span / 2 : (i * span) / (n - 1))))

    let row = 0
    const ys = steps.map((s) => {
      row += s.gapBefore ?? 0
      const y = FIRST_ROW + row * ROW_H
      row += 1
      return y
    })
    const height = FIRST_ROW + (row - 1) * ROW_H + 32
    return { laneX, ys, height, boxW, marginL, marginR, total: Math.max(width, 200) }
  }, [steps, lanes, width])

  const shown = hovered ?? selected ?? stepper.index
  const shownStep = steps[shown]

  return (
    <div>
      <div ref={ref} className="w-full">
        <svg
          width={layout.total}
          height={layout.height}
          viewBox={`0 0 ${layout.total} ${layout.height}`}
          className="block select-none"
          role="img"
          aria-label={`Sequence diagram between ${lanes.map((l) => l.label).join(', ')}`}
        >
          {/* Lanes */}
          {lanes.map((lane) => {
            const x = layout.laneX.get(lane.id)!
            return (
              <g key={lane.id}>
                <line
                  x1={x}
                  x2={x}
                  y1={HEADER_H}
                  y2={layout.height - 4}
                  className="stroke-slate-300 dark:stroke-slate-700"
                  strokeDasharray="4 5"
                />
                <rect
                  x={x - layout.boxW / 2}
                  y={4}
                  width={layout.boxW}
                  height={HEADER_H - 8}
                  rx={8}
                  className="fill-slate-100 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600"
                />
                <text
                  x={x}
                  y={lane.sublabel ? 22 : 30}
                  textAnchor="middle"
                  className="fill-slate-900 text-[12px] font-semibold dark:fill-white"
                  style={{ fontSize: fitFont(lane.label, layout.boxW - 10, 12.5, 0.58) }}
                >
                  {lane.label}
                </text>
                {lane.sublabel && (
                  <text
                    x={x}
                    y={37}
                    textAnchor="middle"
                    className="fill-slate-500 font-mono dark:fill-slate-400"
                    style={{ fontSize: fitFont(lane.sublabel, layout.boxW - 10, 10.5, 0.62) }}
                  >
                    {lane.sublabel}
                  </text>
                )}
              </g>
            )
          })}

          {/* Steps revealed so far */}
          {steps.map((step, i) => {
            if (i > stepper.index) return null
            const y = layout.ys[i]
            const active = shown === i
            const dim = (hovered !== null || selected !== null) && !active
            const handlers = {
              onPointerEnter: (e: PointerEvent) => e.pointerType === 'mouse' && setHovered(i),
              onPointerLeave: (e: PointerEvent) => e.pointerType === 'mouse' && setHovered(null),
              onFocus: () => setHovered(i),
              onBlur: () => setHovered(null),
              onClick: () => setSelected((s) => (s === i ? null : i)),
              onKeyDown: (e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSelected((s) => (s === i ? null : i))
                }
              },
            }
            return (
              <g key={i} opacity={dim ? 0.35 : 1} className="cursor-pointer outline-none transition-opacity" tabIndex={0} role="button" aria-label={stepAria(step, i)} {...handlers}>
                {step.time && (
                  <text x={4} y={y + 4} className="fill-slate-400 font-mono text-[10px] dark:fill-slate-500">
                    {step.time}
                  </text>
                )}
                {step.kind === 'message' ? (
                  <MessageArrow step={step} y={y} laneX={layout.laneX} current={i === stepper.index} active={active} />
                ) : (
                  <NoteBox step={step} y={y} laneX={layout.laneX} boxW={layout.boxW} min={layout.marginL} max={layout.total - layout.marginR} active={active} />
                )}
              </g>
            )
          })}
        </svg>
      </div>

      <div className="mt-3">
        <StepperControls stepper={stepper} />
      </div>

      {/* Explanation of the current / hovered step */}
      <div aria-live="polite" className="mt-3 min-h-28 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${scenario.id}-${shown}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <StepDetail step={shownStep} index={shown} count={steps.length} inspecting={shown !== stepper.index} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function MessageArrow({
  step,
  y,
  laneX,
  current,
  active,
}: {
  step: MessageStep
  y: number
  laneX: Map<string, number>
  current: boolean
  active: boolean
}) {
  const tone = toneSvg[step.lost ? 'danger' : (step.tone ?? 'default')]
  const x1 = laneX.get(step.from) ?? 0
  const x2 = laneX.get(step.to) ?? 0
  const dir = Math.sign(x2 - x1) || 1
  const y1 = y - 8
  const y2 = y + 8
  const frac = step.lost ? 0.6 : 1
  const endX = x1 + (x2 - x1 - dir * 2) * frac
  const endY = y1 + (y2 - y1) * frac
  const angle = (Math.atan2(endY - y1, endX - x1) * 180) / Math.PI
  const midX = (x1 + x2) / 2
  const labelY = y - 13
  const maxLabelW = Math.abs(x2 - x1) - 12
  const strokeW = active ? 3 : 2

  return (
    <g>
      {/* Wide invisible hit area for hover / tap */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={26} />
      <motion.line
        x1={x1}
        y1={y1}
        initial={{ x2: x1, y2: y1 }}
        animate={{ x2: endX, y2: endY }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className={tone.stroke}
        strokeWidth={strokeW}
        strokeDasharray={step.lost ? '6 5' : undefined}
        strokeLinecap="round"
      />
      {step.lost ? (
        <motion.g
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.2 }}
          style={{ transformOrigin: `${endX}px ${endY}px` }}
          className={tone.stroke}
          strokeWidth={2.5}
          strokeLinecap="round"
        >
          <line x1={endX - 6} y1={endY - 6} x2={endX + 6} y2={endY + 6} />
          <line x1={endX - 6} y1={endY + 6} x2={endX + 6} y2={endY - 6} />
        </motion.g>
      ) : (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45, duration: 0.15 }}>
          <path d="M0 0 L-10 -5 L-10 5 Z" transform={`translate(${endX} ${endY}) rotate(${angle})`} className={tone.fill} />
        </motion.g>
      )}
      {current && (
        <motion.circle
          r={5}
          className={tone.fill}
          initial={{ cx: x1, cy: y1, opacity: 1 }}
          animate={{ cx: endX, cy: endY, opacity: [1, 1, 0] }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      )}
      <motion.text
        x={midX}
        y={labelY}
        textAnchor="middle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className={`halo font-mono ${active ? 'font-bold' : 'font-medium'} ${toneSvg[step.tone ?? 'default'].text}`}
        style={{ fontSize: fitFont(step.label, maxLabelW, 12, 0.62) }}
      >
        {step.label}
      </motion.text>
    </g>
  )
}

function NoteBox({
  step,
  y,
  laneX,
  boxW,
  min,
  max,
  active,
}: {
  step: NoteStep
  y: number
  laneX: Map<string, number>
  boxW: number
  min: number
  max: number
  active: boolean
}) {
  const tone = toneSvg[step.tone ?? 'info']
  const xs = step.lanes.map((id) => laneX.get(id) ?? 0)
  const textW = step.label.length * 6.6 + 20
  let left: number
  let right: number
  if (xs.length > 1) {
    left = Math.min(...xs) - boxW / 2 + 4
    right = Math.max(...xs) + boxW / 2 - 4
  } else {
    const w = Math.min(Math.max(textW, 80), boxW + 24)
    left = xs[0] - w / 2
    right = xs[0] + w / 2
  }
  left = Math.max(min, left)
  right = Math.min(max, right)
  const w = right - left
  const h = 26

  return (
    <motion.g
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <rect x={left} y={y - h / 2} width={w} height={h} rx={6} className={`${tone.soft} ${tone.stroke}`} strokeWidth={active ? 2 : 1.25} />
      <text
        x={left + w / 2}
        y={y + 4}
        textAnchor="middle"
        className={`${tone.text} ${active ? 'font-bold' : 'font-semibold'}`}
        style={{ fontSize: fitFont(step.label, w - 12, 11.5, 0.58) }}
      >
        {step.label}
      </text>
    </motion.g>
  )
}

function StepDetail({ step, index, count, inspecting }: { step: SequenceStep; index: number; count: number; inspecting: boolean }) {
  const tone = step.kind === 'message' && step.lost ? 'danger' : (step.tone ?? (step.kind === 'note' ? 'info' : 'default'))
  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium text-slate-500 dark:text-slate-400">
          Step {index + 1} of {count}
          {inspecting && ' · inspecting'}
        </span>
        <span className={`rounded px-1.5 py-0.5 font-mono font-semibold ${toneBadge[tone]}`}>
          {step.label}
          {step.kind === 'message' && step.lost && ' — lost'}
        </span>
      </div>
      <RichText text={step.caption} className="mt-2 text-sm leading-relaxed" />
      {step.kind === 'message' && step.fields && (
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
          {Object.entries(step.fields).map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-mono text-slate-500 dark:text-slate-400">{k}</dt>
              <dd className="font-mono text-slate-800 dark:text-slate-200">{v}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

function stepAria(step: SequenceStep, i: number) {
  if (step.kind === 'message') return `Step ${i + 1}: ${step.from} to ${step.to}, ${step.label}${step.lost ? ', lost' : ''}`
  return `Step ${i + 1}: ${step.label}`
}

/** Shrinks a font so `text` fits in `maxWidth` (approximate glyph width ratio). */
function fitFont(text: string, maxWidth: number, max: number, ratio: number) {
  const fit = maxWidth / Math.max(1, text.length * ratio)
  return Math.max(8.5, Math.min(max, fit))
}
