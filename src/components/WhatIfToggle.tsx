export interface WhatIfOption {
  id: string
  label: string
}

/**
 * Switches a diagram between its normal case (first option) and failure
 * scenarios. Failure options get a warning style so they read as "break it".
 */
export function WhatIfToggle({
  options,
  value,
  onChange,
}: {
  options: WhatIfOption[]
  value: string
  onChange: (id: string) => void
}) {
  if (options.length < 2) return null
  return (
    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Scenario">
      {options.map((o, i) => {
        const active = o.id === value
        const failure = i > 0
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.id)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition sm:text-sm ${
              active
                ? failure
                  ? 'border-amber-500 bg-amber-500 text-white dark:border-amber-400 dark:bg-amber-500 dark:text-slate-950'
                  : 'border-sky-600 bg-sky-600 text-white dark:border-sky-500 dark:bg-sky-600'
                : failure
                  ? 'border-amber-400 text-amber-800 hover:bg-amber-50 dark:border-amber-600 dark:text-amber-300 dark:hover:bg-amber-950'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {failure && '⚡ '}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
