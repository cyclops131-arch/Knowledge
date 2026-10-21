import type { Chapter, GlossaryEntry } from './types'
import { bigPicture } from './bigPicture'
import { dns } from './dns'
import { tcp } from './tcp'
import { tls } from './tls'
import { http } from './http'
import { auth } from './auth'
import { beyond } from './beyond'

/**
 * Every chapter, in reading order. To add a chapter:
 *   1. create src/content/<id>.ts exporting a `Chapter`
 *   2. add it to this list
 * Routes, the timeline strip and the glossary all pick it up automatically.
 */
export const chapters: Chapter[] = [bigPicture, dns, tcp, tls, http, auth, beyond]

export const chapterById = new Map(chapters.map((c) => [c.id, c]))

/** All glossary entries from all chapters, keyed by id. */
export const glossary = new Map<string, GlossaryEntry & { chapterId: string }>()
for (const chapter of chapters) {
  for (const entry of chapter.glossary) {
    if (glossary.has(entry.id) && import.meta.env.DEV) {
      console.warn(`Duplicate glossary id "${entry.id}" in chapter "${chapter.id}"`)
    }
    glossary.set(entry.id, { ...entry, chapterId: chapter.id })
  }
}
