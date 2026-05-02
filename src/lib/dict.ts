// Lightweight dict passed from .astro pages to React islands so the islands
// stay framework-agnostic and don't import the full ui object.

import { ui, defaultLang, type Lang, type UIKey } from '~/i18n/ui';

export type Dict = Partial<Record<UIKey, string>>;

export function buildDict(lang: Lang, keys: readonly UIKey[]): Dict {
  const d: Dict = {};
  for (const k of keys) d[k] = ui[lang][k] ?? ui[defaultLang][k];
  return d;
}

export function pick(dict: Dict, key: UIKey, fallback = ''): string {
  return dict[key] ?? fallback;
}
