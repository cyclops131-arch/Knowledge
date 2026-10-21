/**
 * Chapter data schema.
 *
 * A chapter is pure data. `ChapterPage` renders its `sections` in order, so
 * adding a chapter means writing a new file in `src/content/` and registering
 * it in `src/content/index.ts`. No component changes needed.
 *
 * Text fields support a tiny markup (see `RichText`):
 *   **bold**, `code`, and [[term-id]] or [[term-id|shown text]] for glossary terms.
 */

export type ChapterStatus = 'ready' | 'stub' | 'planned'

export interface GlossaryEntry {
  /** Lowercase, kebab-case id used in [[term-id]] markup. */
  id: string
  term: string
  definition: string
}

export interface DeepDive {
  /** The original question, in the asker's words. */
  question: string
  /** Paragraphs (RichText markup allowed). */
  answer: string[]
  /** Optional bullet list shown after the paragraphs. */
  points?: string[]
}

// ---------- Sequence diagrams ----------

export interface Lane {
  id: string
  label: string
  sublabel?: string
}

/** One arrow between two lanes. */
export interface MessageStep {
  kind: 'message'
  from: string
  to: string
  /** Short label drawn on the arrow, e.g. "SYN". */
  label: string
  /** Field/value pairs shown when hovering or selecting the arrow. */
  fields?: Record<string, string>
  /** What this step means, in plain words (RichText). */
  caption: string
  /** The packet never arrives: draws a broken arrow ending in ✕. */
  lost?: boolean
  /** Visual style for the arrow. */
  tone?: Tone
  /** Extra empty rows before this step, to show time passing (e.g. backoff). */
  gapBefore?: number
  /** Optional time marker shown in the left margin, e.g. "t=3s". */
  time?: string
}

/** A box over one or more lanes: an event rather than a message. */
export interface NoteStep {
  kind: 'note'
  /** Lane ids the note spans. One id = a box on that lane. */
  lanes: string[]
  label: string
  caption: string
  tone?: Tone
  gapBefore?: number
  time?: string
}

export type SequenceStep = MessageStep | NoteStep

export type Tone = 'default' | 'info' | 'success' | 'warning' | 'danger' | 'muted'

export interface Scenario {
  id: string
  /** Toggle label, e.g. "Server crashed". */
  label: string
  /** One line shown above the diagram when this scenario is active. */
  description?: string
  /** Overrides the section's lanes, e.g. to add a second server for a retry. */
  lanes?: Lane[]
  steps: SequenceStep[]
}

export interface SequenceSection {
  type: 'sequence'
  id: string
  title: string
  intro?: string
  lanes: Lane[]
  /** First scenario is the normal case; the rest are "What If" toggles. */
  scenarios: Scenario[]
  /** Honest note about what was simplified. */
  simplification?: string
}

// ---------- Other section types ----------

export interface ProseSection {
  type: 'prose'
  title?: string
  paragraphs: string[]
}

export interface KeyPointsSection {
  type: 'keyPoints'
  title?: string
  points: { title: string; body: string; icon?: string }[]
}

export interface LayerInfo {
  id: string
  name: string
  /** One-line analogy, e.g. "the letter itself". */
  analogy: string
  job: string
  example?: string
  chapterId?: string
}

export interface LayerStackSection {
  type: 'layerStack'
  title?: string
  intro?: string
  /** Top of the stack first. */
  layers: LayerInfo[]
}

export interface JourneySection {
  type: 'journey'
  title?: string
  intro?: string
  stages: { title: string; body: string; chapterId?: string; stub?: boolean }[]
}

export interface FlowWindowSection {
  type: 'flowWindow'
  title?: string
  intro?: string
  totalPackets: number
  /** Starting sequence number for the first packet (keep 100/500 convention). */
  startSeq: number
  /** Bytes per packet, used to label sequence numbers. */
  packetSize: number
}

export interface DeepDivesSection {
  type: 'deepDives'
  title?: string
  items: DeepDive[]
}

export interface QuizQuestion {
  question: string
  options: string[]
  answerIndex: number
  explanation: string
}

export interface QuizSection {
  type: 'quiz'
  title?: string
  questions: QuizQuestion[]
}

export interface CalloutSection {
  type: 'callout'
  tone: 'info' | 'warning' | 'success'
  title?: string
  body: string
}

export type Section =
  | ProseSection
  | KeyPointsSection
  | LayerStackSection
  | JourneySection
  | SequenceSection
  | FlowWindowSection
  | DeepDivesSection
  | QuizSection
  | CalloutSection

export interface Chapter {
  /** Also used as the URL path segment (except the landing chapter). */
  id: string
  path: string
  number: number
  title: string
  /** Short name for the timeline strip. */
  short: string
  icon: string
  summary: string
  status: ChapterStatus
  sections: Section[]
  glossary: GlossaryEntry[]
}
