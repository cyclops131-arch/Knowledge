import * as Popover from '@radix-ui/react-popover'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { glossary } from '../content'

/**
 * An inline glossary word. Hover (mouse) or tap (touch) to see the definition.
 * Click with a mouse pins it open; Escape or clicking elsewhere closes it.
 */
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  const entry = glossary.get(id)
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)

  if (!entry) {
    if (import.meta.env.DEV) console.warn(`Unknown glossary term "${id}"`)
    return <>{children ?? id}</>
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setPinned(false)
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          className="cursor-help rounded-sm font-medium underline decoration-sky-500/70 decoration-dotted decoration-2 underline-offset-4 hover:decoration-solid focus-visible:outline-2 focus-visible:outline-sky-500"
          onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
          onPointerLeave={(e) => e.pointerType === 'mouse' && !pinned && setOpen(false)}
          onClick={(e) => {
            e.preventDefault() // we manage open state ourselves
            if (pinned) {
              setPinned(false)
              setOpen(false)
            } else {
              setPinned(true)
              setOpen(true)
            }
          }}
        >
          {children ?? entry.term}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={6}
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-50 max-w-[min(20rem,calc(100vw-24px))] rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="font-semibold text-slate-900 dark:text-white">{entry.term}</p>
          <p className="mt-1 leading-snug text-slate-600 dark:text-slate-300">{entry.definition}</p>
          <Link
            to={`/glossary#${entry.id}`}
            className="mt-2 inline-block text-xs font-medium text-sky-700 hover:underline dark:text-sky-400"
            onClick={() => setOpen(false)}
          >
            All terms →
          </Link>
          <Popover.Arrow className="fill-white dark:fill-slate-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
