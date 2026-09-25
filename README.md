# lmjantsch.github.io

![License](https://img.shields.io/badge/license-MIT-blue.svg)

Personal academic site of Lasse Jantsch, live at [lmjantsch.github.io](https://lmjantsch.github.io/): a news feed at `/` and a CV at `/profile`. Built with [Astro](https://astro.build/) and [Tailwind CSS](https://tailwindcss.com/), deployed to GitHub Pages on every push to `main`.

The CV has a single source, `src/cv/`, which drives both the website and the PDF at `public/cv.pdf`.

## Development

```bash
yarn install
yarn dev      # http://localhost:4321/
yarn build    # regenerates public/cv.pdf (needs tectonic or pdflatex), then builds to dist/
yarn cv:pdf   # CV PDF only
```

## Editing content

- **CV:** one folder per section in `src/cv/`, holding a `_section.mdx` for the section settings and one frontmatter-only `.mdx` file per entry. Add `omit: [pdf]` or `omit: [web]` to leave an entry out of one output, and `news: true` to also post it to the news feed.
- **News posts** that aren't CV entries go in `src/news/` as `.mdx` files with `kind: writeup | external | note`.
- **Site metadata, intro text and social links** are in `src/data/consts.ts`. The profile picture is `src/assets/profile_picture.jpg`.
- **PDF styling** is in `scripts/cv-template.tex`.

See `CLAUDE.md` for the architecture and conventions.
