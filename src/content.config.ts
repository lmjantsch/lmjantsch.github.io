import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const post = defineCollection({
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: () => z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		slug: z.string()
	}),
});

export const collections = { post };
