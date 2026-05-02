// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

const SITE = env.PUBLIC_SITE_URL;
const BASE = env.PUBLIC_BASE_PATH;

export default defineConfig({
  site: SITE,
  base: BASE,
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [react(), sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } } })],
  vite: {
    plugins: [tailwindcss()],
  },
  prefetch: { prefetchAll: true },
  build: { inlineStylesheets: 'auto' },
});
