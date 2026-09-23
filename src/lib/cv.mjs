// Shared CV helpers. Plain .mjs so that both the Astro components and the
// Node-side LaTeX generator (scripts/generate-cv-tex.mjs) consume the same logic.
import cvData from '../data/cv.json' with { type: 'json' };

/** Name to bold in author lists. Middle initials are ignored when matching. */
export const AUTHOR_NAME = cvData.meta.authorName;

const MONTHS_SHORT = [
	'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Parse a 'YYYY-MM' or 'YYYY' string. Returns null for null/undefined. */
export function parseDate(value) {
	if (!value) return null;
	const [year, month] = String(value).split('-');
	return { year: Number(year), month: month ? Number(month) : null };
}

function isFuture(date, now = new Date()) {
	if (!date) return false;
	const nowYear = now.getFullYear();
	const nowMonth = now.getMonth() + 1;
	if (date.year !== nowYear) return date.year > nowYear;
	return (date.month ?? 1) > nowMonth;
}

/**
 * Format a start/end pair.
 * style 'web'   → "Mar 2024 – Aug 2026" / "Jun 2026 – Present" / "Starting Oct 2026"
 * style 'latex' → "03/2024 -- 08/2026" / "06/2026 -- Present"
 */
export function formatRange(start, end, style = 'web') {
	const from = parseDate(start);
	const to = parseDate(end);
	if (!from) return '';

	if (style === 'latex') {
		const fmt = (d) => (d.month ? `${String(d.month).padStart(2, '0')}/${d.year}` : `${d.year}`);
		return `${fmt(from)} -- ${to ? fmt(to) : 'Present'}`;
	}

	const fmt = (d) => (d.month ? `${MONTHS_SHORT[d.month - 1]} ${d.year}` : `${d.year}`);
	// A position that has not started yet reads oddly as "Oct 2026 – Present".
	if (!to && isFuture(from)) return `Starting ${fmt(from)}`;
	if (!to) return `${fmt(from)} – Present`;
	if (start === end) return fmt(from);
	return `${fmt(from)} – ${fmt(to)}`;
}

/** Sort key (descending): ongoing items first, then by start date. */
export function startValue(item) {
	const d = parseDate(item.start);
	return d ? d.year * 12 + (d.month ?? 1) : 0;
}

function isVisible(entry, target) {
	return !(entry.omit ?? []).includes(target);
}

/**
 * The CV filtered for one output target ('web' | 'pdf'), with empty sections dropped.
 * Never mutates the imported JSON.
 */
export function getSections(target) {
	return cvData.sections
		.filter((section) => isVisible(section, target))
		.map((section) => ({ ...section, items: section.items.filter((item) => isVisible(item, target)) }))
		.filter((section) => section.items.length > 0);
}

/** Split an author list around the site owner so their name can be emphasised. */
export function splitAuthors(authors, owner) {
	return authors.map((name) => ({ name, isOwner: normalise(name) === normalise(owner) }));
}

function normalise(name) {
	// "Lasse M. Jantsch" and "Lasse Jantsch" are the same person.
	return name.toLowerCase().replace(/\b[a-z]\.\s*/g, '').replace(/\s+/g, ' ').trim();
}

/** Render "$O(1)$" as "O(1)" for HTML; the LaTeX side keeps the maths. */
export function stripMath(text) {
	return String(text ?? '').replace(/\$([^$]*)\$/g, '$1');
}

export const PUBLICATION_STATUS = {
	'under-review': 'Under Review',
	accepted: 'Accepted',
	published: null,
};
