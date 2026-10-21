# Life of a Request

An interactive, layer-by-layer walk through what really happens when you load `https://www.google.com`: DNS, TCP, IP routing, TLS and HTTP, with step-through diagrams, "What If" failure scenarios, and Deep Dive cards built from real questions.

See [PROJECT_BRIEF.md](PROJECT_BRIEF.md) for the full plan.

## Status

| Phase | What | State |
|---|---|---|
| 1 | Scaffold: Vite + React + TS + Tailwind + Framer Motion, routing, Pages deploy, chapter schema | ✅ |
| 2 | Core components: RequestTimeline, SequenceDiagram, DeepDive, Term, LayerStack, WhatIfToggle, Quiz | ✅ |
| 3 | Chapter 0 (Big Picture) + Chapter 2 (TCP) | ✅ |
| 4 | Chapter 1: DNS | planned |
| 5 | Chapter 3: TLS | planned |
| 6 | Stubs: HTTP, Auth, Beyond | planned |
| 7 | Polish | planned |

## Run it

```bash
npm install
npm run dev        # http://localhost:5173/Knowledge/
npm run build      # type-check + production build into dist/
npm run preview    # serve the built site
```

## Deploy (GitHub Pages)

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.
One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
The site is then at `https://<user>.github.io/<repo>/`.

## Project layout

```
src/
  content/          one data file per chapter + types.ts (the schema) + index.ts (registry)
  components/       reusable pieces (SequenceDiagram, LayerStack, Term, DeepDive, ...)
  pages/            ChapterPage (renders any chapter), GlossaryPage
  lib/              hooks: useStepper (play/pause/step), useElementWidth, tone colours
```

## Adding a chapter

1. Create `src/content/<id>.ts` exporting a `Chapter` (see `src/content/types.ts`).
2. Add it to the `chapters` array in `src/content/index.ts`.

That's it: the route, timeline strip, prev/next links and glossary pick it up. A chapter is a list of `sections`, each rendered by an existing component:

| Section `type` | Renders |
|---|---|
| `prose` | Paragraphs |
| `sequence` | Animated sequence diagram. The first scenario is the normal case; extra scenarios become **What If** toggles |
| `layerStack` | Nested protocol layers with hover details |
| `journey` | Numbered stage list linking to chapters |
| `flowWindow` | TCP receive-window simulator |
| `keyPoints` | Card grid |
| `deepDives` | Expandable cards titled with the original question |
| `quiz` | Check-yourself questions |
| `callout` | Highlighted note |

Text supports a small markup: `**bold**`, `` `code` ``, and `[[term-id]]` or `[[term-id|shown text]]` for glossary tooltips. Glossary entries live in each chapter's `glossary` array.

Conventions: keep the google.com example and the 100/500 sequence numbers consistent, and say what's simplified (every `sequence` section has a `simplification` field).
