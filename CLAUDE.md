# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Yarn is the package manager (`yarn.lock` is the only lockfile; CI's `withastro/action` detects it).

```bash
yarn install
yarn dev        # dev server on http://localhost:4321/ — Astro 7 daemonises it;
                # manage with `yarn astro dev status|logs|stop`
yarn build      # regenerates public/cv.pdf, then builds the site to dist/
yarn cv:pdf     # CV only: cv.json -> build/cv.tex -> public/cv.pdf
yarn cv:tex     # CV .tex only, no LaTeX engine required
yarn preview
yarn astro check   # TS/template diagnostics
```

No test suite, linter, or formatter. `yarn build` is the verification step — it type-checks content-collection frontmatter against the Zod schema and fails on unresolved imports.

## Architecture

Astro 7 static site, Tailwind CSS 4, React only for MDX islands. Two pages, deployed to GitHub Pages on push to `main`.

- **`/`** — the news feed ("Blog" in code, News in the UI).
- **`/profile`** — the CV.

`ACTIVATE_BLOG` in `src/data/consts.ts` toggles this: when false, both routes render the CV. `src/pages/[...page].astro` is a single catch-all that pre-renders both paths and picks the body component; this deliberately replaced a config-level `redirects` entry (still commented out in `astro.config.mjs`) that caused a redirect flicker. Don't reintroduce it. Files prefixed `_` (`_blog.astro`, `_profile.astro`) are body fragments, not routes.

### The CV: one source, two outputs

`src/data/cv.json` is the single source of truth for the website CV **and** the PDF. Its fields are semantic (`role`, `org`, `location`, `start`, `end`, `supervisor`, `topics`) rather than layout slots, because the same record has to drive both an HTML component and a LaTeX table.

```
src/data/cv.json ─┬─> src/lib/cv.mjs ─┬─> src/pages/_profile.astro  -> website
                  │                   └─> scripts/generate-cv-tex.mjs -> build/cv.tex -> public/cv.pdf
                  └─ scripts/cv-template.tex (preamble/styling only)
```

Conventions that matter:

- **Dates** are `"YYYY-MM"` (or `"YYYY"`); `null` end = ongoing. `formatRange()` in `src/lib/cv.mjs` renders `Mar 2024 – Aug 2026` for the web and `03/2024 -- 08/2026` for LaTeX, and renders a not-yet-started position as `Starting Oct 2026` rather than `… – Present`.
- **`"omit": ["pdf"]` / `["web"]`** on any item or section drops it from that one output. This is how the PDF stays a tailored subset (Korean-conference papers, the Dialog Direct job, Miscellany) while the website shows everything.
- **`$…$` spans** in text pass through to LaTeX as maths and are stripped by `stripMath()` for HTML.
- **Section order differs per output**: the JSON order *is* the website's importance order; the PDF uses `PDF_ORDER` in the generator to match the original CV layout.
- `meta.authorName` is the name bolded in author lists (middle initials ignored when matching, so "Lasse M. Jantsch" resolves).

Adding a new section kind means: a `kind` value in cv.json, a branch in `_profile.astro`, a component in `src/components/cv_components/`, and an emitter in the generator's `emitters` map (which throws if one is missing).

**Styling the PDF** is `scripts/cv-template.tex` (the preamble, lifted from the original Overleaf CV, with a `%%CV-BODY%%` marker). Content never goes there. The generator prefers `tectonic`, falls back to `pdflatex`; with neither it warns and leaves `public/cv.pdf` alone during `yarn build`, but fails if invoked directly. CI installs Tectonic before the Astro build.

### The news feed

One content collection (`src/content.config.ts`) over `src/news/`, discriminated on `kind`:

| kind | file | renders as | goes to |
|---|---|---|---|
| `writeup` | `.mdx` with a body | card or row | `/news/<id>` on this site |
| `external` | frontmatter-only `.md` | card or row + source name | `url` (new tab) |
| `note` | frontmatter-only `.md` | inert row | nowhere |

The schema is a `z.discriminatedUnion` with `.strict()`, so `external` *requires* `url` + `source` and `note` *rejects* them. Two orthogonal signals drive the rendering in `NewsItem.astro`: `featured` controls weight (full card vs compact row), `kind` controls the destination affordance. **A `note` must never look clickable** — no anchor, no hover, no pointer cursor.

Writeup routes come from the collection entry's file-path id (`src/news/mdx-feature-showcase/` → `/news/mdx-feature-showcase`); the glob loader slugifies underscores to hyphens.

### Styling

Tailwind 4 is configured entirely in CSS — `src/styles/global.css` (imported once via `BaseHead.astro`) declares the palette as `@theme` tokens: `primary_bg`, `secondary_bg`, `primary`, `secondary`, each with a `_dark` counterpart. Use those token classes (`text-primary dark:text-primary_dark`) rather than raw colours. There is no `tailwind.config.js`.

Dark mode is a custom variant bound to a `.dark` class on `<html>` (`@custom-variant dark`), toggled and persisted to `localStorage.theme` by the inline script in `Header.astro`.

Astro's image service is set to `noop` in `astro.config.mjs`, so images pass through unoptimised despite `sharp` being installed.

### Pinned dependency

`@lucide/astro` is held at **0.525.0**. Version 1.x removed brand icons, and `Socials.astro` needs `Linkedin` and `Github`. It declares `astro@^4 || ^5`, so `yarn install` prints a peer warning — that is expected, and it builds fine. Moving to 1.x requires sourcing those two marks elsewhere (e.g. `astro-icon` + `@iconify-json/simple-icons`).

### Deployment

`site` in `astro.config.mjs` feeds canonical URLs, the sitemap, and RSS. For a project page (repo not named `<user>.github.io`) it must include the repo path segment.
