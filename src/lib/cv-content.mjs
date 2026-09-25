// Reads the CV from src/cv/: one folder per section, holding a `_section.mdx`
// (section settings; its body is the section note) and one `.mdx` per item
// (frontmatter only). Used by the Astro `cv` collection loader and by
// scripts/generate-cv-tex.mjs, so the website and the PDF read identical data.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import yaml from 'js-yaml';
import { z } from 'zod';
import { ITEM_SCHEMAS, SECTION_SCHEMA } from './cv-schema.mjs';
import { parseDate, stripMath } from './cv.mjs';

const SECTION_FILE = '_section.mdx';
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

/** Kinds without dates, ordered by `order` alone. */
const UNDATED = new Set(['skills', 'misc']);

/** The field each kind uses as its headline, used as the default news title. */
const TITLE_FIELD = {
	publications: 'title',
	experience: 'role',
	education: 'degree',
	skills: 'category',
	training: 'title',
	awards: 'title',
	volunteering: 'role',
	misc: 'text',
};

async function parseFile(path, cwd) {
	const match = (await readFile(path, 'utf8')).match(FRONTMATTER);
	if (!match) throw new Error(`${relative(cwd, path)}: missing --- frontmatter ---`);
	return { data: yaml.load(match[1]) ?? {}, body: match[2].trim() };
}

function validate(schema, data, path, cwd) {
	const result = schema.safeParse(data);
	if (!result.success) throw new Error(`${relative(cwd, path)}:\n${z.prettifyError(result.error)}`);
	return result.data;
}

/** Newest first: year, then `order`, then month, then ongoing/later end, then file name. */
function compareItems(a, b) {
	const x = parseDate(a.date ?? a.start);
	const y = parseDate(b.date ?? b.start);
	const endValue = (item) => {
		if (item.end == null) return Infinity;
		const d = parseDate(item.end);
		return d.year * 100 + (d.month ?? 0);
	};
	return (
		(y?.year ?? 0) - (x?.year ?? 0) ||
		a.order - b.order ||
		(y?.month ?? 0) - (x?.month ?? 0) ||
		(endValue(b) === endValue(a) ? 0 : endValue(b) > endValue(a) ? 1 : -1) ||
		a.id.localeCompare(b.id)
	);
}

function sortItems(kind, items) {
	const compare = UNDATED.has(kind) ? (a, b) => a.order - b.order || a.id.localeCompare(b.id) : compareItems;
	return [...items].sort(compare);
}

/** 'YYYY' / 'YYYY-MM' / 'YYYY-MM-DD' as a Date at UTC midnight, like the news collection's dates. */
function toDate(value) {
	const [year, month = '01', day = '01'] = value.split('-');
	return new Date(`${year}-${month}-${day}`);
}

/**
 * A CV item in the shape of a news entry's data, so it renders with NewsItem.
 * Linked to its paper when it has one, an inert note otherwise.
 */
export function newsEntryFor(item, kind, overrides = {}) {
	const url = overrides.url ?? item.links?.find((link) => link.label === 'Paper')?.url;
	const source = overrides.source ?? item.source;
	const date = overrides.date ?? item.date ?? item.start;
	const data = {
		title: overrides.title ?? item[TITLE_FIELD[kind]],
		summary: stripMath(overrides.summary ?? item.summary) || undefined,
		featured: overrides.featured ?? item.featured ?? false,
		tags: overrides.tags ?? item.tags ?? [],
		// A bare year would display as "Jan 1, <year>", which isn't a real date.
		date: date?.includes('-') ? toDate(date) : undefined,
		authors: item.authors,
		// An overridden title is an announcement that already says where it appeared.
		venue: overrides.title ? undefined : item.venue,
		// Shown beside the tags; the destination itself is already the whole item.
		links: (item.links ?? []).filter((link) => link.url !== url),
	};
	return url ? { ...data, kind: 'external', url, source } : { ...data, kind: 'note' };
}

/** The news entry an item opted into with `news:`, or null. */
export function cvNewsEntry(item, kind) {
	if (!item.news) return null;
	return newsEntryFor(item, kind, item.news === true ? {} : item.news);
}

/** Cross-field rules the schema can't express. */
function check(item, kind, path) {
	const entries = [cvNewsEntry(item, kind), kind === 'publications' ? newsEntryFor(item, kind) : null];
	for (const entry of entries.filter(Boolean)) {
		if (entry.kind === 'external' && !entry.source) {
			throw new Error(`${path}: has a paper link, so it needs a "source" (short venue name, e.g. "ACL Findings")`);
		}
	}
	if (item.news && !cvNewsEntry(item, kind).date) {
		throw new Error(`${path}: "news" needs a date with at least a month — set news.date to "YYYY-MM"`);
	}
}

/** All sections, validated, with their items sorted. `dir` is the absolute path of src/cv. */
export async function readCv(dir) {
	const cwd = join(dir, '..', '..');
	const folders = (await readdir(dir, { withFileTypes: true })).filter((entry) => entry.isDirectory());

	return Promise.all(
		folders.map(async (folder) => {
			const sectionDir = join(dir, folder.name);
			const sectionPath = join(sectionDir, SECTION_FILE);
			const files = (await readdir(sectionDir)).filter((file) => !file.startsWith('.'));
			if (!files.includes(SECTION_FILE)) throw new Error(`${relative(cwd, sectionDir)}: missing ${SECTION_FILE}`);

			const { data, body } = await parseFile(sectionPath, cwd);
			const section = validate(SECTION_SCHEMA, data, sectionPath, cwd);
			const schema = ITEM_SCHEMAS[section.kind];

			const items = await Promise.all(
				files
					.filter((file) => file !== SECTION_FILE)
					.map(async (file) => {
						const path = join(sectionDir, file);
						if (!file.endsWith('.mdx')) throw new Error(`${relative(cwd, path)}: CV items must be .mdx files`);
						const item = { id: file.slice(0, -'.mdx'.length), ...validate(schema, (await parseFile(path, cwd)).data, path, cwd) };
						check(item, section.kind, relative(cwd, path));
						return item;
					}),
			);

			return { id: folder.name, ...section, note: body || undefined, items: sortItems(section.kind, items) };
		}),
	);
}

/**
 * The CV for one output ('web' | 'pdf'): omitted sections and items dropped,
 * empty sections dropped, sections in that output's order.
 */
export function forTarget(sections, target) {
	const position = (section) => (target === 'pdf' ? (section.pdfOrder ?? Infinity) : section.order);
	return sections
		.filter((section) => !section.omit.includes(target))
		.map((section) => ({ ...section, items: section.items.filter((item) => !item.omit.includes(target)) }))
		.filter((section) => section.items.length > 0)
		.sort((a, b) => position(a) - position(b));
}
