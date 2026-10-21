import type { Section } from '../content/types'
import { Callout } from './Callout'
import { DeepDive } from './DeepDive'
import { FlowWindow } from './FlowWindow'
import { Journey } from './Journey'
import { KeyPoints } from './KeyPoints'
import { LayerStack } from './LayerStack'
import { Quiz } from './Quiz'
import { RichText } from './RichText'
import { SectionCard } from './SectionCard'
import { SequenceDiagram } from './SequenceDiagram'

/** Maps each section type in the chapter data to its component. */
export function SectionRenderer({ section }: { section: Section }) {
  switch (section.type) {
    case 'prose':
      return (
        <div className="space-y-3 text-base leading-relaxed">
          {section.title && <h2 className="text-xl font-bold text-slate-900 dark:text-white">{section.title}</h2>}
          {section.paragraphs.map((p, i) => (
            <RichText key={i} text={p} />
          ))}
        </div>
      )
    case 'sequence':
      return <SequenceDiagram section={section} />
    case 'layerStack':
      return <LayerStack section={section} />
    case 'journey':
      return <Journey section={section} />
    case 'keyPoints':
      return <KeyPoints section={section} />
    case 'flowWindow':
      return <FlowWindow section={section} />
    case 'callout':
      return <Callout section={section} />
    case 'quiz':
      return <Quiz section={section} />
    case 'deepDives':
      return (
        <SectionCard title={section.title ?? 'Deep dives'}>
          <div className="space-y-2">
            {section.items.map((item) => (
              <DeepDive key={item.question} item={item} />
            ))}
          </div>
        </SectionCard>
      )
  }
}
