import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

/**
 * A single news feed of mixed-weight items. The `kind` discriminator decides both
 * how an item renders and where it sends the reader:
 *
 *   writeup  — has a body; rendered on this site at /news/<id>
 *   external — lives elsewhere (LessWrong, Substack, arXiv, …); requires url + source
 *   note     — no destination at all (job change, award); url/source are rejected
 *
 * Small items are frontmatter-only .md files; writeups are .mdx with a body.
 */
const shared = {
	title: z.string(),
	date: z.coerce.date(),
	/** One plain sentence on why this matters. Shown on highlight cards. */
	summary: z.string().optional(),
	/** Promotes the item to a full-width highlight card. */
	featured: z.boolean().default(false),
	tags: z.array(z.string()).default([]),
};

const news = defineCollection({
	loader: glob({ base: './src/news', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.discriminatedUnion('kind', [
			z
				.object({
					...shared,
					kind: z.literal('writeup'),
					image: image().optional(),
					updatedDate: z.coerce.date().optional(),
				})
				.strict(),
			z
				.object({
					...shared,
					kind: z.literal('external'),
					/** Where it lives. */
					url: z.string().url(),
					/** Publication name shown on the card, e.g. "LessWrong", "arXiv". */
					source: z.string(),
					image: image().optional(),
				})
				.strict(),
			z
				.object({
					...shared,
					kind: z.literal('note'),
				})
				.strict(),
		]),
});

export const collections = { news };
