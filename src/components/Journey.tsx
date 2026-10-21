import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { chapterById } from '../content'
import type { JourneySection } from '../content/types'
import { RichText } from './RichText'
import { SectionCard } from './SectionCard'

/** Numbered list of stages, each linking to its chapter. */
export function Journey({ section }: { section: JourneySection }) {
  return (
    <SectionCard title={section.title} intro={section.intro}>
      <ol className="relative space-y-3 before:absolute before:top-3 before:bottom-3 before:left-[15px] before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {section.stages.map((stage, i) => {
          const chapter = stage.chapterId ? chapterById.get(stage.chapterId) : undefined
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: i * 0.05 }}
              className="relative flex gap-3"
            >
              <span
                className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  stage.stub ? 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : 'bg-sky-600 text-white'
                }`}
              >
                {i + 1}
              </span>
              <div className="flex-1 pt-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{stage.title}</h3>
                  {chapter && (
                    <Link to={chapter.path} className="text-xs font-semibold text-sky-700 hover:underline dark:text-sky-400">
                      {chapter.icon} Chapter {chapter.number}
                      {chapter.status === 'planned' ? ' (soon)' : ''} →
                    </Link>
                  )}
                </div>
                <RichText text={stage.body} className="mt-0.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400" />
              </div>
            </motion.li>
          )
        })}
      </ol>
    </SectionCard>
  )
}
