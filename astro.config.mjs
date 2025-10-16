// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
	site: 'https://lmjantsch.github.io', // change to your github website
	integrations: [
		mdx(), 
		sitemap(),
		icon(),
		react(),
	],
	vite: {
		plugins: [tailwindcss()],
	},
	image: {
    service: {
      entrypoint: 'astro/assets/services/noop',
    },
  },
});
