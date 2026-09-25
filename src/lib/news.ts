import { getCollection } from 'astro:content';
import { cvNewsEntry } from './cv-content.mjs';

/**
 * The news feed, newest first: posts from src/news/ plus every CV item that
 * opted in with `news:`. Both come out as `{ id, data }` for NewsItem.
 */
export async function getNewsFeed() {
	const posts = await getCollection('news');
	const fromCv = (await getCollection('cv')).flatMap(({ data: section }: any) =>
		section.items
			.filter((item: any) => item.news)
			.map((item: any) => ({ id: `${section.id}/${item.id}`, data: cvNewsEntry(item, section.kind) })),
	);
	return [...posts, ...fromCv].sort((a: any, b: any) => b.data.date.valueOf() - a.data.date.valueOf());
}
