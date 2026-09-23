// Global site data. CV content lives in cv.json (see CLAUDE.md for its schema);
// this file holds site metadata, the profile intro, and outbound links.

// Shows the news feed at "/" and moves the CV to "/profile".
export const ACTIVATE_BLOG = true;

// metadata
export const SITE_TITLE = "LMJ's Profile"; // title of page
export const SITE_DESCRIPTION = "Lasse Jantsch's my portfolio website!"; // description of page
export const IP_OWNER = 'Lasse Jantsch'; // put your name

// Name used to bold your own entry in author lists (set in cv.json -> meta.authorName).
// Middle initials are ignored when matching, so "Lasse M. Jantsch" still resolves to you.
export { AUTHOR_NAME } from '../lib/cv.mjs';

// Generated from cv.json by `yarn cv:pdf` — see scripts/generate-cv-tex.mjs.
export const CV_PDF_PATH = '/cv.pdf';

// Profile [top of profile page]
// change the profile picture in src/assets/profile_picture
export const GREETING = "👋 Hey, I'm Lasse";
export const INTRODUCTION =
	'A computer scientist with a background in economics specializing in the interpretability and reliability of Large Language Models. My research focuses on improving language models as reliable, large-scale text processing tools by leveraging the models internals for information extraction and task adaptation. Through my background in economics I ground my research not only in technical facination, but also in the social and economical implications of more reliable AI technology.';
export const CONTACT_AND_CV = 'Please contact me at lassejantsch [at] web.de.';

// Socials / outbound links.
// 'type' selects the icon: 'github', 'linkedin', 'googlescholar' have designated
// icons, anything else falls back to a generic external-link icon (add your own
// in src/components/Socials.astro). 'label' is used for the accessible name.
export const SOCIALS = [
	{
		type: 'github',
		label: 'GitHub',
		link: 'https://github.com/lmjantsch',
	},
	{
		type: 'linkedin',
		label: 'LinkedIn',
		link: 'https://www.linkedin.com/in/lasse-jantsch-6985581a7',
	},
	{
		type: 'googlescholar',
		label: 'Google Scholar',
		link: 'https://scholar.google.com/citations?user=FjrsTUUAAAAJ',
	},
	// Add your writing platforms here once the profiles exist, e.g.
	// { type: 'lesswrong', label: 'LessWrong', link: 'https://www.lesswrong.com/users/<you>' },
	// { type: 'substack', label: 'Substack', link: 'https://<you>.substack.com' },
];
