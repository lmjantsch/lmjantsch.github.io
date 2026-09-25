import { fileURLToPath } from 'node:url';
import { glob, type Loader } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';
import { readCv } from './lib/cv-content.mjs';

/**
 * A single news feed of mixed-weight items. The `kind` discriminator decides both
 * how an item renders and where it sends the reader:
 *
 *   writeup  — has a body; rendered on this site at /news/<id>
 *   external — lives elsewhere (LessWrong, Substack, arXiv, …); requires url + source
 *   note     — no destination at all (job change, award); url/source are rejected
 *
 * Items that are also on the CV don't live here: they are CV files in src/cv/
 * with a `news:` field, merged into the feed by src/lib/news.ts.
 * Small items are frontmatter-only .mdx files; writeups are .mdx with a body.
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
	loader: glob({ base: './src/news', pattern: '**/*.mdx' }),
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

/**
 * The CV, one entry per section of src/cv/. Parsing and validation happen in
 * readCv (shared with the PDF generator), so there is no collection schema here.
 */
function cvLoader(): Loader {
	return {
		name: 'cv-loader',
		load: async ({ store, config, watcher, logger }) => {
			const dir = fileURLToPath(new URL('./src/cv/', config.root));
			const sync = async () => {
				const sections = await readCv(dir);
				store.clear();
				for (const section of sections) store.set({ id: section.id, data: section });
			};
			await sync();

			watcher?.add(dir);
			watcher?.on('all', async (_event, path) => {
				if (!path.startsWith(dir)) return;
				try {
					await sync();
					logger.info('Reloaded src/cv');
				} catch (error) {
					logger.error(String((error as Error).message));
				}
			});
		},
	};
}

const cv = defineCollection({ loader: cvLoader() });

export const collections = { news, cv };
