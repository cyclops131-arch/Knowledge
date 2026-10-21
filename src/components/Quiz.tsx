import { useState } from 'react'
import type { QuizSection } from '../content/types'
import { RichText } from './RichText'
import { SectionCard } from './SectionCard'

/** Check-yourself questions. Answers reveal an explanation. */
export function Quiz({ section }: { section: QuizSection }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => section.questions.map(() => null))
  const answered = answers.filter((a) => a !== null).length
  const correct = answers.filter((a, i) => a === section.questions[i].answerIndex).length

  return (
    <SectionCard title={section.title ?? 'Check yourself'}>
      <p className="-mt-1 mb-3 text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
        {answered === 0
          ? `${section.questions.length} questions. Pick an answer to see why.`
          : `Score: ${correct} / ${answered}${answered === section.questions.length ? ' — done!' : ''}`}
        {answered > 0 && (
          <button
            type="button"
            className="ml-3 text-xs font-semibold text-sky-700 hover:underline dark:text-sky-400"
            onClick={() => setAnswers(section.questions.map(() => null))}
          >
            Reset
          </button>
        )}
      </p>
      <ol className="space-y-4">
        {section.questions.map((q, qi) => {
          const picked = answers[qi]
          return (
            <li key={qi}>
              <p className="font-medium text-slate-900 dark:text-white">
                {qi + 1}. <RichText as="span" text={q.question} />
              </p>
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const isPicked = picked === oi
                  const isAnswer = q.answerIndex === oi
                  const state =
                    picked === null
                      ? 'border-slate-300 hover:border-sky-500 hover:bg-sky-50 dark:border-slate-700 dark:hover:bg-sky-950/40'
                      : isAnswer
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                        : isPicked
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40'
                          : 'border-slate-200 opacity-60 dark:border-slate-800'
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={picked !== null}
                      onClick={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                      className={`rounded-md border px-3 py-2 text-left text-sm transition ${state}`}
                    >
                      {picked !== null && isAnswer && '✓ '}
                      {isPicked && !isAnswer && '✗ '}
                      <RichText as="span" text={opt} />
                    </button>
                  )
                })}
              </div>
              {picked !== null && (
                <RichText
                  text={`${picked === q.answerIndex ? '**Correct.** ' : '**Not quite.** '}${q.explanation}`}
                  className="mt-2 text-sm text-slate-600 dark:text-slate-400"
                />
              )}
            </li>
          )
        })}
      </ol>
    </SectionCard>
  )
}
