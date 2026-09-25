// Frontmatter schemas for src/cv/. Shared by the Astro loader and the PDF
// generator, so a malformed file fails both the same way.
import { z } from 'zod';

/**
 * 'YYYY', 'YYYY-MM' or 'YYYY-MM-DD'. YAML reads an unquoted 2026 as a number and
 * an unquoted 2026-08-01 as a Date, so both are normalised back to strings.
 */
const dateString = z.preprocess(
	(value) =>
		value instanceof Date ? value.toISOString().slice(0, 10) : typeof value === 'number' ? String(value) : value,
	z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'expected "YYYY", "YYYY-MM" or "YYYY-MM-DD"'),
);

const target = z.enum(['web', 'pdf']);

const link = z.object({ label: z.string(), icon: z.string().optional(), url: z.string().url() }).strict();

/**
 * Opts a CV item into the news feed. `true` uses the item as it is; an object
 * overrides individual fields of the generated news entry.
 */
const news = z.union([
	z.literal(true),
	z
		.object({
			title: z.string().optional(),
			summary: z.string().optional(),
			date: dateString.optional(),
			featured: z.boolean().optional(),
			tags: z.array(z.string()).optional(),
			url: z.string().url().optional(),
			source: z.string().optional(),
		})
		.strict(),
]);

/** Fields every item may carry, whatever its section. */
const common = {
	/** Leave the item out of one output. */
	omit: z.array(target).default([]),
	/** Tie-breaker within the same date (lower first); the only ordering for undated kinds. */
	order: z.number().default(0),
	news: news.optional(),
};

const range = {
	start: dateString,
	/** Omitted or null: ongoing. */
	end: dateString.nullish(),
};

export const ITEM_SCHEMAS = {
	publications: z
		.object({
			...common,
			title: z.string(),
			authors: z.array(z.string()).min(1),
			venue: z.string(),
			date: dateString,
			status: z.enum(['under-review', 'accepted', 'published']),
			featured: z.boolean().default(false),
			/** Short venue name, shown next to the paper link, e.g. "ACL Findings". */
			source: z.string().optional(),
			summary: z.string().optional(),
			tags: z.array(z.string()).default([]),
			award: z.string().optional(),
			bullets: z.array(z.string()).default([]),
			links: z.array(link).default([]),
		})
		.strict(),

	experience: z
		.object({
			...common,
			...range,
			role: z.string(),
			org: z.string(),
			unit: z.string().optional(),
			location: z.string(),
			supervisor: z.string().optional(),
			topics: z.array(z.string()).default([]),
			bullets: z.array(z.string()).default([]),
			links: z.array(link).default([]),
		})
		.strict(),

	education: z
		.object({
			...common,
			...range,
			degree: z.string(),
			org: z.string(),
			location: z.string(),
			advisor: z.string().optional(),
			thesis: z.string().optional(),
			gpa: z.object({ value: z.string(), scale: z.string() }).strict().optional(),
			logo: z.string().optional(),
			logoAlt: z.string().optional(),
			sub: z
				.array(z.object({ title: z.string(), ...range, note: z.string().optional() }).strict())
				.default([]),
		})
		.strict(),

	skills: z
		.object({
			...common,
			category: z.string(),
			tools: z.array(z.object({ name: z.string(), active: z.boolean().default(false) }).strict()),
		})
		.strict(),

	training: z.object({ ...common, ...range, title: z.string(), org: z.string() }).strict(),

	awards: z.object({ ...common, ...range, title: z.string() }).strict(),

	volunteering: z
		.object({
			...common,
			...range,
			role: z.string(),
			org: z.string(),
			location: z.string(),
			links: z.array(link).default([]),
		})
		.strict(),

	misc: z
		.object({
			...common,
			text: z.string(),
			note: z.string().optional(),
			start: dateString.optional(),
			end: dateString.nullish(),
		})
		.strict(),
};

/** Frontmatter of a section's `_section.mdx`. Its body becomes the section note. */
export const SECTION_SCHEMA = z
	.object({
		title: z.string(),
		icon: z.string().optional(),
		kind: z.enum(Object.keys(ITEM_SCHEMAS)),
		display: z.enum(['featured', 'default', 'compact']).default('default'),
		/** Position on the website (importance order). */
		order: z.number(),
		/** Position in the PDF, which follows the original CV layout. Unset: appended last. */
		pdfOrder: z.number().optional(),
		pdfTitle: z.string().optional(),
		/** Start this section on a new PDF page. */
		pdfPageBreak: z.boolean().default(false),
		omit: z.array(target).default([]),
	})
	.strict();
