import type { Tone } from '../content/types'

/** SVG stroke/fill classes per tone. */
export const toneSvg: Record<Tone, { stroke: string; fill: string; text: string; soft: string }> = {
  default: { stroke: 'stroke-sky-600 dark:stroke-sky-400', fill: 'fill-sky-600 dark:fill-sky-400', text: 'fill-slate-800 dark:fill-slate-100', soft: 'fill-sky-50 dark:fill-sky-950' },
  info: { stroke: 'stroke-indigo-500 dark:stroke-indigo-400', fill: 'fill-indigo-500 dark:fill-indigo-400', text: 'fill-indigo-900 dark:fill-indigo-100', soft: 'fill-indigo-50 dark:fill-indigo-950' },
  success: { stroke: 'stroke-emerald-600 dark:stroke-emerald-400', fill: 'fill-emerald-600 dark:fill-emerald-400', text: 'fill-emerald-900 dark:fill-emerald-100', soft: 'fill-emerald-50 dark:fill-emerald-950' },
  warning: { stroke: 'stroke-amber-500 dark:stroke-amber-400', fill: 'fill-amber-500 dark:fill-amber-400', text: 'fill-amber-900 dark:fill-amber-100', soft: 'fill-amber-50 dark:fill-amber-950' },
  danger: { stroke: 'stroke-rose-600 dark:stroke-rose-400', fill: 'fill-rose-600 dark:fill-rose-400', text: 'fill-rose-900 dark:fill-rose-100', soft: 'fill-rose-50 dark:fill-rose-950' },
  muted: { stroke: 'stroke-slate-400 dark:stroke-slate-500', fill: 'fill-slate-400 dark:fill-slate-500', text: 'fill-slate-600 dark:fill-slate-300', soft: 'fill-slate-100 dark:fill-slate-800' },
}

/** Badge classes for HTML elements per tone. */
export const toneBadge: Record<Tone, string> = {
  default: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
  info: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
  warning: 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200',
  danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
  muted: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
}
