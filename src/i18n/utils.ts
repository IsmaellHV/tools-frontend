import { ui, defaultLang, type Lang, type UIKey } from './ui';

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

export const isLang = (v: string): v is Lang => v === 'en' || v === 'es';

// Strip Astro's base prefix from a pathname so locale detection / rewriting stay base-agnostic.
const stripBase = (pathname: string): string => {
  if (!BASE) return pathname;
  if (pathname === BASE) return '/';
  if (pathname.startsWith(BASE + '/')) return pathname.slice(BASE.length);
  return pathname;
};

export function getLangFromUrl(url: URL): Lang {
  const [, seg] = stripBase(url.pathname).split('/');
  if (isLang(seg)) return seg;
  return defaultLang;
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

// Build the equivalent URL in the other locale, base-prefixed.
// "/fastlink/about" + "es" -> "/fastlink/es/about"
// "/fastlink/es/about" + "en" -> "/fastlink/about"
export function localizePath(pathname: string, target: Lang): string {
  const inner = stripBase(pathname);
  const withoutLocale = inner.replace(/^\/(en|es)(\/|$)/, '/');
  const localePart = target === defaultLang ? '' : `/${target}`;
  const tail = withoutLocale === '/' ? '' : withoutLocale;
  const out = `${BASE}${localePart}${tail}`;
  return out || '/';
}

// Helper to prepend base to an absolute-from-root path.
export const withBase = (path: string): string => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${p}`;
};
