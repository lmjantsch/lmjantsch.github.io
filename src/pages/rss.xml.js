import rss from '@astrojs/rss';
import { getNewsFeed } from '../lib/news';
import { SITE_TITLE, SITE_DESCRIPTION } from '../data/consts';

export async function GET(context) {
	const items = await getNewsFeed();

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: items.map((entry) => ({
			title: entry.data.title,
			description: entry.data.summary ?? '',
			pubDate: entry.data.date,
			// External items point at where they actually live; everything else at this site.
			link:
				entry.data.kind === 'external'
					? entry.data.url
					: new URL(entry.data.kind === 'writeup' ? `/news/${entry.id}/` : '/', context.site).href,
		})),
	});
}
