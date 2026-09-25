# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Yarn is the package manager (`yarn.lock` is the only lockfile; CI's `withastro/action` detects it).

```bash
yarn install
yarn dev        # dev server on http://localhost:4321/ — Astro 7 daemonises it;
                # manage with `yarn astro dev status|logs|stop`
yarn build      # regenerates public/cv.pdf, then builds the site to dist/
yarn cv:pdf     # CV only: src/cv/ -> build/cv.tex -> public/cv.pdf
yarn cv:tex     # CV .tex only, no LaTeX engine required
yarn preview
yarn astro check   # TS/template diagnostics
```

No test suite, linter, or formatter. `yarn build` is the verification step — it type-checks content-collection frontmatter against the Zod schema and fails on unresolved imports.

## Architecture

Astro 7 static site, Tailwind CSS 4, MDX; no UI framework (React was removed with the demo post). Two pages, deployed to GitHub Pages on push to `main`.

- **`/`** — the news feed ("Blog" in code, News in the UI).
- **`/profile`** — the CV.

`ACTIVATE_BLOG` in `src/data/consts.ts` toggles this: when false, both routes render the CV. `src/pages/[...page].astro` is a single catch-all that pre-renders both paths and picks the body component; this deliberately replaced a config-level `redirects` entry that caused a redirect flicker. Don't reintroduce it. Files prefixed `_` (`_blog.astro`, `_profile.astro`) are body fragments, not routes.

### The CV: one source, two outputs

`src/cv/` is the single source of truth for the website CV **and** the PDF: one folder per section, one frontmatter-only `.mdx` file per item. Fields are semantic (`role`, `org`, `location`, `start`, `end`, `supervisor`, `topics`) rather than layout slots, because the same record has to drive both an HTML component and a LaTeX table.

```
src/cv/<section>/_section.mdx   section settings; its body is the section note
src/cv/<section>/<item>.mdx     one CV entry

src/cv/ ──> readCv (src/lib/cv-content.mjs) ─┬─> `cv` collection loader -> src/pages/_profile.astro -> website
                                              ├─> src/lib/news.ts (items with `news:`)  -> news feed + RSS
                                              └─> scripts/generate-cv-tex.mjs -> build/cv.tex -> public/cv.pdf
                                                   (+ scripts/cv-template.tex, preamble/styling only)
```

`readCv` is the only parser. It runs outside Vite for the PDF, so it reads the files with `js-yaml` itself, and validates them against the strict per-kind Zod schemas in `src/lib/cv-schema.mjs`: an unknown field fails the build with the file path. The `cv` collection in `src/content.config.ts` is a custom loader around it (no collection schema), which re-reads on file changes in dev. Item bodies are ignored; only `_section.mdx` bodies are used.

Conventions that matter:

- **Dates** are `"YYYY-MM"` (or `"YYYY"`); omitted/`null` end = ongoing. `formatRange()` in `src/lib/cv.mjs` renders `Mar 2024 – Aug 2026` for the web and `03/2024 -- 08/2026` for LaTeX, and renders a not-yet-started position as `Starting Oct 2026` rather than `… – Present`.
- **Item order** is computed, not file order: newest first by year, then `order` (default 0, lower first), then month, then ongoing/later end, then file name. `skills` and `misc` have no dates and sort by `order` alone. Components render items in the order they receive them.
- **`omit: [pdf]` / `[web]`** on any item or section drops it from that one output. This is how the PDF stays a tailored subset (Korean-conference papers, the Dialog Direct job, Miscellany) while the website shows everything.
- **`$…$` spans** in text pass through to LaTeX as maths and are stripped by `stripMath()` for HTML.
- **Section order differs per output**: `order` in `_section.mdx` is the website's importance order, `pdfOrder` the PDF's (matching the original CV layout); `pdfPageBreak` starts a new PDF page.
- **`news:`** on any item puts it in the news feed (see below). Publications also render *as* news items on the CV timeline, via the same `newsEntryFor()`.
- `AUTHOR_NAME` in `src/lib/cv.mjs` is the name bolded in author lists (middle initials ignored when matching, so "Lasse M. Jantsch" resolves).

Adding a new section kind means: a schema in `ITEM_SCHEMAS`, a headline field in `TITLE_FIELD` (`cv-content.mjs`), a branch in `_profile.astro`, a component in `src/components/cv_components/`, and an emitter in the generator's `emitters` map (which throws if one is missing). A new section of an existing kind is just a new folder with a `_section.mdx`.

**Styling the PDF** is `scripts/cv-template.tex` (the preamble, lifted from the original Overleaf CV, with a `%%CV-BODY%%` marker). Content never goes there. The generator prefers `tectonic`, falls back to `pdflatex`; with neither it warns and leaves `public/cv.pdf` alone during `yarn build`, but fails if invoked directly. CI installs Tectonic before the Astro build.

### The news feed

The feed (`getNewsFeed()` in `src/lib/news.ts`, used by `_blog.astro` and `rss.xml.js`) merges two sources into one `{ id, data }` shape:

- **CV items with `news:`** — anything that is also on the CV lives only in `src/cv/`. `news: true` uses the item as is; an object overrides `title`, `summary`, `date`, `featured`, `tags`, `url`, `source`. The entry links to the item's `Paper` link if it has one (`external`, needs `source`), otherwise it is a `note`. A news entry needs a date with a month.
- **`src/news/`** — posts that aren't CV entries: a content collection (`src/content.config.ts`) of `.mdx` files, discriminated on `kind`:

| kind | file | renders as | goes to |
|---|---|---|---|
| `writeup` | `.mdx` with a body | card or row | `/news/<id>` on this site |
| `external` | frontmatter-only `.mdx` | card or row + source name | `url` (new tab) |
| `note` | frontmatter-only `.mdx` | inert row | nowhere |

The schema is a `z.discriminatedUnion` with `.strict()`, so `external` *requires* `url` + `source` and `note` *rejects* them. Two orthogonal signals drive the rendering in `NewsItem.astro`: `featured` controls weight (full card vs compact row), `kind` controls the destination affordance. **A `note` must never look clickable** — no anchor, no hover, no pointer cursor. `date` is optional in `NewsItem` only so the CV's publication timeline (which shows the year itself) can omit it for year-only papers. CV-derived entries also carry `venue` (dropped when `news.title` is overridden) and `links` (the item's links minus the destination), shown right-aligned on the tag row. Because those links sit inside the item, a clickable item is an `<article>` whose title link is stretched over it with `::after`, not a wrapping `<a>`; the inner links are `z-10` above it.

Both the feed and the CV's publications render through `NewsTimeline.astro` (line, a year pill per year, a node per item: filled for `featured`). Given `initial`, it shows that many items and a centred button reveals `step` more, then collapses back; the publications use 5 / 10, the feed shows everything.

Writeup routes come from the collection entry's file-path id (`src/news/my_post/index.mdx` → `/news/my-post`); the glob loader slugifies underscores to hyphens. `src/news/` currently holds only a `.gitkeep`, so the build warns that no files match — expected until the first post.

### Styling

Tailwind 4 is configured entirely in CSS — `src/styles/global.css` (imported once via `BaseHead.astro`) declares the palette as `@theme` tokens: `primary_bg`, `secondary_bg`, `primary`, `secondary`, each with a `_dark` counterpart. Use those token classes (`text-primary dark:text-primary_dark`) rather than raw colours. There is no `tailwind.config.js`.

Dark mode is a custom variant bound to a `.dark` class on `<html>` (`@custom-variant dark`), toggled and persisted to `localStorage.theme` by the inline script in `Header.astro`.

Astro's image service is set to `noop` in `astro.config.mjs`, so images pass through unoptimised (and `sharp` is not a dependency).

### Pinned dependency

`@lucide/astro` is held at **0.525.0**. Version 1.x removed brand icons, and `Socials.astro` needs `Linkedin` and `Github`. It declares `astro@^4 || ^5`, so `yarn install` prints a peer warning — that is expected, and it builds fine. Moving to 1.x requires sourcing those two marks elsewhere (e.g. re-adding `astro-icon` with `@iconify-json/simple-icons`).

### Deployment

Astro 7 needs Node >= 22.12; `withastro/action` defaults to Node 20, so `deploy.yml` pins `node-version: 22`.

`site` in `astro.config.mjs` feeds canonical URLs, the sitemap, and RSS. For a project page (repo not named `<user>.github.io`) it must include the repo path segment.
