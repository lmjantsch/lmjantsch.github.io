#!/usr/bin/env node
// Generates build/cv.tex from src/cv/ and compiles it to public/cv.pdf.
//
//   node scripts/generate-cv-tex.mjs             # write .tex and compile
//   node scripts/generate-cv-tex.mjs --tex-only  # write .tex only (no LaTeX needed)
//
// Styling lives in scripts/cv-template.tex; content lives in src/cv/. The website
// and this PDF read the same files through readCv (src/lib/cv-content.mjs), so
// they cannot drift. Section order and page breaks are set per section, in
// src/cv/<section>/_section.mdx (pdfOrder, pdfPageBreak).

import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { formatRange, parseDate, splitAuthors, AUTHOR_NAME } from '../src/lib/cv.mjs';
import { readCv, forTarget } from '../src/lib/cv-content.mjs';

const execFileAsync = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BUILD_DIR = join(ROOT, 'build');
const TEX_PATH = join(BUILD_DIR, 'cv.tex');
const PDF_OUT = join(ROOT, 'public', 'cv.pdf');

const REPLACEMENTS = [
	[/\\/g, '\\textbackslash{}'],
	[/([&%$#_{}])/g, '\\$1'],
	[/~/g, '\\textasciitilde{}'],
	[/\^/g, '\\textasciicircum{}'],
	[/↑/g, '$\\uparrow$'],
	[/↓/g, '$\\downarrow$'],
	[/—/g, '---'],
	[/–/g, '--'],
];

function tex(value) {
	// Spans already written as $...$ in src/cv/ are maths and pass through untouched;
	// the website strips the delimiters instead (see stripMath in src/lib/cv.mjs).
	return String(value ?? '')
		.split(/(\$[^$]*\$)/)
		.map((part, i) => {
			if (i % 2 === 1) return part;
			let out = part;
			for (const [pattern, replacement] of REPLACEMENTS) out = out.replace(pattern, replacement);
			return out;
		})
		.join('');
}

function heading(title) {
	return `\\section*{\\centerline{${tex(title.toUpperCase())}}}`;
}

function itemize(lines, options = '[leftmargin=0cm, rightmargin=-1cm]') {
	return [`\\begin{itemize}${options}`, ...lines, '\\end{itemize}'].join('\n');
}

function authorList(authors) {
	return splitAuthors(authors, AUTHOR_NAME)
		.map(({ name, isOwner }) => (isOwner ? `\\textbf{${tex(name)}}` : tex(name)))
		.join(', ');
}

// --- one emitter per section kind -------------------------------------------

const emitters = {
	publications(items) {
		const lines = items.map((item) => {
			const year = String(parseDate(item.date).year);
			const venueText = item.venue.includes(year) ? tex(item.venue) : `${tex(item.venue)} ${year}`;
			const venue = item.status === 'published' ? `In \\emph{${tex(item.venue)}}.` : `\\emph{${venueText}}`;
			let entry = `\\item \\emph{${tex(item.title)}.} ${authorList(item.authors)}. ${venue}`;
			if (item.award) entry += ` ${tex(item.award.replace(/^\P{L}+/u, ''))}.`;
			if (item.bullets?.length) {
				entry += [
					'\n{\\small',
					'\\begin{itemize}[leftmargin=0.5cm, rightmargin=0cm]',
					...item.bullets.map((bullet) => `    \\item ${tex(bullet)}`),
					'\\end{itemize}',
					'}',
				].join('\n');
			}
			return entry;
		});
		return itemize(lines);
	},

	education(items) {
		// Each line ends with "\\"; vertical spacing is appended to that same line,
		// because LaTeX reads "[1em]" on a following line as literal text.
		const rows = items.map((item) => {
			const lines = [
				`\\textbf{${tex(item.org)}} & \\textbf{${tex(item.degree)}} --- ${formatRange(item.start, item.end, 'latex')} \\\\`,
			];
			if (item.advisor) lines.push(`& Advisor: ${tex(item.advisor)}\\\\`);
			if (item.thesis) lines.push(`& Thesis: ${tex(item.thesis)}\\\\`);
			if (item.gpa) lines.push(`& ${tex(item.gpa.scale)}: ${tex(item.gpa.value)}\\\\`);
			for (const sub of item.sub ?? []) {
				lines[lines.length - 1] += '[0.5em]';
				lines.push(`& \\textbf{${tex(sub.title)}} --- ${formatRange(sub.start, sub.end, 'latex')}\\\\`);
				if (sub.note) lines.push(`& ${tex(sub.note)}\\\\`);
			}
			return lines;
		});
		const body = rows
			.map((lines, i) => {
				if (i < rows.length - 1) lines[lines.length - 1] += '[1em]';
				return lines.join('\n');
			})
			.join('\n');
		return [
			'\\begin{tabularx}{\\textwidth}{@{} l  X @{}}',
			body,
			'\\end{tabularx}',
			'\\vspace{6 mm}',
		].join('\n');
	},

	experience(items) {
		const rows = items.map((item) => {
			// Column 1 is the organisation block, column 3 the role block. They are
			// zipped row by row: an entry without a supervisor simply starts its
			// topics one line higher, which is what keeps each entry three lines.
			const left = [`\\textbf{${tex(item.org)}}`, item.unit ? ` ${tex(item.unit)}` : '', `(${tex(item.location)})`];
			const topics = item.topics ?? [];
			const right = [
				`\\textbf{${tex(item.role)}}`,
				...(item.supervisor ? [`Supervisor: ${tex(item.supervisor)}`] : []),
				...topics.map((topic, i) => `${tex(topic)}${i < topics.length - 1 ? ',' : ''}`),
			];

			const rowCount = Math.max(left.length, right.length);
			return Array.from({ length: rowCount }, (_, i) => {
				const dates = i === 0 ? `     ${formatRange(item.start, item.end, 'latex')}     ` : '';
				return `${left[i] ?? ' '}    &${dates}& ${right[i] ?? ''}\\\\`;
			}).join('\n');
		});
		return [
			// \providecommand: both experience sections emit this, and \newcommand would clash.
			'\\providecommand{\\exptablebreak}{\\multicolumn{3}{c}{} \\\\}',
			'\\begin{tabularx}{\\textwidth}{@{} l | X l@{}}',
			rows.join('\n\n\\exptablebreak\n\n'),
			'\\end{tabularx}',
		].join('\n');
	},

	skills(items, section) {
		const note = section.note ? `${tex(section.note)}\n` : '';
		const lines = items.map((group) => {
			const tools = group.tools.map((tool) => `${tex(tool.name)}${tool.active ? '$^*$' : ''}`).join(', ');
			return `\\item \\textbf{${tex(group.category)}:} ${tools}`;
		});
		return note + itemize(['\\setlength{\\itemsep}{2pt}', ...lines]);
	},

	training(items) {
		return itemize(
			items.map((item) => `\\item ${tex(item.org)}: ${tex(item.title)}, ${formatRange(item.start, item.end, 'latex')}`),
		);
	},

	awards(items) {
		return itemize(
			items.map((item) => {
				const years = item.start === item.end ? tex(item.start) : `${tex(item.start)}-${tex(item.end)}`;
				return `\\item ${tex(item.title)}, ${years}.`;
			}),
		);
	},

	volunteering(items) {
		return itemize(
			items.map(
				(item) =>
					`\\item ${tex(item.role)} -- ${tex(item.org)}\\\\\n${tex(item.location)}, ${formatRange(item.start, item.end, 'latex')}`,
			),
		);
	},

	misc(items) {
		return itemize(
			items.map((item) => {
				const range = item.start ? ` -- ${formatRange(item.start, item.end, 'latex')}` : '';
				const note = item.note ? `\\\\\n${tex(item.note)}` : '';
				return `\\item ${tex(item.text)}${range}${note}`;
			}),
		);
	},
};

async function buildBody() {
	const sections = forTarget(await readCv(join(ROOT, 'src', 'cv')), 'pdf');

	const unordered = sections.filter((section) => section.pdfOrder === undefined).map((section) => section.id);
	if (unordered.length) {
		console.warn(`⚠ No pdfOrder, appended at the end: ${unordered.join(', ')}`);
	}

	return sections
		.map((section) => {
			const emit = emitters[section.kind];
			if (!emit) throw new Error(`No LaTeX emitter for section kind "${section.kind}" (${section.id})`);
			const parts = [];
			if (section.pdfPageBreak) parts.push('\\vspace{16pt}\n\\clearpage');
			parts.push(heading(section.pdfTitle ?? section.title));
			parts.push('');
			parts.push(emit(section.items, section));
			return parts.join('\n');
		})
		.join('\n\n\n');
}

/** Engines in preference order. Tectonic is what CI installs; pdflatex is the local default. */
const ENGINES = [
	{ bin: 'tectonic', args: (tex) => ['--outdir', BUILD_DIR, tex] },
	{ bin: 'pdflatex', args: (tex) => ['-interaction=nonstopmode', '-halt-on-error', '-output-directory', BUILD_DIR, tex] },
];

async function findEngine() {
	for (const engine of ENGINES) {
		try {
			await execFileAsync(engine.bin, ['--version']);
			return engine;
		} catch {
			// not installed — try the next one
		}
	}
	return null;
}

async function compile(engine) {
	await execFileAsync(engine.bin, engine.args(TEX_PATH)).catch((error) => {
		// LaTeX reports failures on stdout, not stderr.
		const log = String(error.stdout ?? error.message);
		const relevant = log
			.split('\n')
			.filter((line) => /^(!|l\.\d)/.test(line))
			.slice(0, 20)
			.join('\n');
		throw new Error(`${engine.bin} failed:\n${relevant || log}`);
	});
	await copyFile(join(BUILD_DIR, 'cv.pdf'), PDF_OUT);
}

const template = await readFile(join(ROOT, 'scripts', 'cv-template.tex'), 'utf8');
if (!template.includes('%%CV-BODY%%')) throw new Error('cv-template.tex is missing the %%CV-BODY%% marker');

await mkdir(BUILD_DIR, { recursive: true });
await writeFile(TEX_PATH, template.replace('%%CV-BODY%%', await buildBody()));
console.log(`✓ wrote ${TEX_PATH.replace(`${ROOT}/`, '')}`);

if (process.argv.includes('--tex-only')) process.exit(0);

const engine = await findEngine();
if (!engine) {
	const message = `no LaTeX engine found (tried ${ENGINES.map((e) => e.bin).join(', ')})`;
	// Called directly: fail. Called as part of `yarn build`: warn, so that a missing
	// LaTeX install does not block the website build.
	if (!process.env.npm_lifecycle_event?.startsWith('build')) throw new Error(message);
	console.warn(`⚠ ${message} — public/cv.pdf left unchanged, it may be out of date`);
	process.exit(0);
}

await compile(engine);
for (const ext of ['aux', 'log', 'out']) await rm(join(BUILD_DIR, `cv.${ext}`), { force: true });
console.log(`✓ wrote ${PDF_OUT.replace(`${ROOT}/`, '')} (via ${engine.bin})`);
