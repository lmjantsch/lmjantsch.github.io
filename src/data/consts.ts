// Global site data. CV content lives in src/cv/ (see CLAUDE.md);
// this file holds site metadata, the profile intro, and outbound links.

// Shows the news feed at "/" and moves the CV to "/profile".
export const ACTIVATE_BLOG = true;

export const SITE_TITLE = "LMJ's Profile";
export const SITE_DESCRIPTION = "Lasse Jantsch's my portfolio website!";
export const IP_OWNER = 'Lasse Jantsch';

// Generated from src/cv/ by `yarn cv:pdf`.
export const CV_PDF_PATH = '/cv.pdf';

// Top of the profile page; the picture is src/assets/profile_picture.jpg.
export const GREETING = "👋 Hey, I'm Lasse";
export const INTRODUCTION =
	'A computer scientist with a background in economics specializing in the interpretability and reliability of Large Language Models. My research focuses on improving language models as reliable, large-scale text processing tools by leveraging the models internals for information extraction and task adaptation. Through my background in economics I ground my research not only in technical facination, but also in the social and economical implications of more reliable AI technology.';

// 'type' selects the icon in Socials.astro ('email', 'github', 'linkedin',
// 'googlescholar'; anything else gets a generic link icon). 'label' is the accessible name.
export const SOCIALS = [
	{
		// Split so the address never appears whole in the HTML; Socials.astro joins
		// it into a mailto: link in the browser.
		type: 'email',
		label: 'Email',
		link: 'lassejantsch|web.de',
	},
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
];
