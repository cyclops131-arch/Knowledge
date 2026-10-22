import { AnimatePresence, motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import type { CertChainSection, CertCheck, CertInfo, CertScenario } from '../content/types'
import { useStepper } from '../lib/useStepper'
import { RichText } from './RichText'
import { SectionCard } from './SectionCard'
import { StepperControls } from './StepperControls'
import { WhatIfToggle } from './WhatIfToggle'

/** Certificate chain, verified one link at a time, with failure scenarios. */
export function CertChain({ section }: { section: CertChainSection }) {
  const [scenarioId, setScenarioId] = useState(section.scenarios[0].id)
  const scenario = section.scenarios.find((s) => s.id === scenarioId) ?? section.scenarios[0]
  return (
    <SectionCard title={section.title} intro={section.intro}>
      <div className="mb-3">
        <WhatIfToggle options={section.scenarios} value={scenario.id} onChange={setScenarioId} />
        {scenario.description && <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">⚡ {scenario.description}</p>}
      </div>
      <ChainView key={scenario.id} scenario={scenario} />
      {section.simplification && (
        <p className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span className="font-semibold">Simplified:</span> {section.simplification}
        </p>
      )}
    </SectionCard>
  )
}

function ResultChip({ check, done }: { check: CertCheck; done: boolean }) {
  if (!done) return <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">? {check.label}</span>
  return (
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
        check.ok ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
      }`}
    >
      {check.ok ? '✓' : '✗'} {check.label}
    </motion.span>
  )
}

function ChainView({ scenario }: { scenario: CertScenario }) {
  const { certs, checks } = scenario
  // One step per check, plus a final verdict step.
  const stepper = useStepper(checks.length + 1, 1600)
  const i = stepper.index
  const showVerdict = i === checks.length
  const currentCheck = showVerdict ? null : checks[i]
  const done = (ci: number) => ci <= i

  // Checks that sit on a link (two certs) vs on a single card.
  const linkCheck = (a: string, b: string) => checks.findIndex((c) => c.certs.length === 2 && c.certs[0] === a && c.certs[1] === b)
  const cardChecks = (id: string) => checks.map((c, ci) => ({ c, ci })).filter(({ c }) => c.certs.length === 1 && c.certs[0] === id)

  return (
    <div>
      <div className="mx-auto max-w-md">
        {certs.map((cert, idx) => {
          const next = certs[idx + 1]
          const lc = next ? linkCheck(cert.id, next.id) : -1
          return (
            <div key={cert.id}>
              <CertCard cert={cert} active={!!currentCheck?.certs.includes(cert.id)} isRoot={idx === certs.length - 1}>
                {cardChecks(cert.id).map(({ c, ci }) => (
                  <ResultChip key={ci} check={c} done={done(ci)} />
                ))}
              </CertCard>
              {next && (
                <div className="flex items-center gap-3 py-1.5 pl-6">
                  <div className={`h-10 w-0.5 ${lc >= 0 && lc <= i ? (checks[lc].ok ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-slate-300 dark:bg-slate-700'}`} />
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">↑ signed by {next.subject}</span>
                    {lc >= 0 && <ResultChip check={checks[lc]} done={done(lc)} />}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4">
        <StepperControls stepper={stepper} label="check" />
      </div>

      <div aria-live="polite" className="mt-3 min-h-20 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950/60">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {showVerdict ? (
              <p className={`font-semibold ${scenario.verdict.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                {scenario.verdict.ok ? '🔒 ' : '⚠️ '}
                {scenario.verdict.text}
              </p>
            ) : (
              <>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Check {i + 1} of {checks.length}: {currentCheck!.label}
                </p>
                <RichText text={currentCheck!.caption} className="mt-1 leading-relaxed" />
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function CertCard({ cert, active, isRoot, children }: { cert: CertInfo; active: boolean; isRoot: boolean; children?: ReactNode }) {
  return (
    <motion.div
      animate={{ scale: active ? 1.02 : 1 }}
      className={`rounded-lg border-2 p-3 transition-colors ${
        cert.suspicious
          ? 'border-rose-400 bg-rose-50 dark:border-rose-700 dark:bg-rose-950/40'
          : isRoot
            ? 'border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30'
            : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
      } ${active ? 'shadow-md ring-2 ring-sky-500/60' : ''}`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
        <p className="font-mono font-bold text-slate-900 dark:text-white">
          {isRoot ? '🏛️ ' : '📜 '}
          {cert.subject}
        </p>
        <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">{cert.role}</p>
      </div>
      <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
        <dt className="text-slate-500 dark:text-slate-400">Issuer</dt>
        <dd>{cert.issuer}</dd>
        {Object.entries(cert.fields).map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-slate-500 dark:text-slate-400">{k}</dt>
            <dd className={v.includes('ATTACKER') || v.toLowerCase().includes('attacker') ? 'font-semibold text-rose-700 dark:text-rose-400' : ''}>{v}</dd>
          </div>
        ))}
      </dl>
      {children && <div className="mt-2 flex flex-wrap gap-1">{children}</div>}
    </motion.div>
  )
}
