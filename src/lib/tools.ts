import type { UIKey } from '~/i18n/ui';

export type ToolCategory = 'encoding' | 'security' | 'qr' | 'data';

export interface ToolMeta {
  slug: string; // e.g. 'base64'
  titleKey: UIKey;
  bodyKey: UIKey;
  icon: string; // emoji is enough; styled via CSS
  category: ToolCategory;
}

export interface CategoryMeta {
  id: ToolCategory;
  titleKey: UIKey;
  bodyKey: UIKey;
}

export const CATEGORIES: readonly CategoryMeta[] = [
  { id: 'encoding', titleKey: 'home.cat.encoding.title', bodyKey: 'home.cat.encoding.body' },
  { id: 'security', titleKey: 'home.cat.security.title', bodyKey: 'home.cat.security.body' },
  { id: 'qr', titleKey: 'home.cat.qr.title', bodyKey: 'home.cat.qr.body' },
  { id: 'data', titleKey: 'home.cat.data.title', bodyKey: 'home.cat.data.body' },
] as const;

export const TOOLS: readonly ToolMeta[] = [
  { slug: 'base64', titleKey: 'home.cards.base64.title', bodyKey: 'home.cards.base64.body', icon: 'B64', category: 'encoding' },
  { slug: 'base64-image', titleKey: 'home.cards.base64Image.title', bodyKey: 'home.cards.base64Image.body', icon: 'IMG', category: 'encoding' },
  { slug: 'jwt', titleKey: 'home.cards.jwt.title', bodyKey: 'home.cards.jwt.body', icon: 'JWT', category: 'encoding' },
  { slug: 'aes', titleKey: 'home.cards.aes.title', bodyKey: 'home.cards.aes.body', icon: 'AES', category: 'security' },
  { slug: 'password', titleKey: 'home.cards.password.title', bodyKey: 'home.cards.password.body', icon: 'PWD', category: 'security' },
  { slug: 'qr-read', titleKey: 'home.cards.qrRead.title', bodyKey: 'home.cards.qrRead.body', icon: 'QR↓', category: 'qr' },
  { slug: 'qr-generate', titleKey: 'home.cards.qrGen.title', bodyKey: 'home.cards.qrGen.body', icon: 'QR↑', category: 'qr' },
  { slug: 'json', titleKey: 'home.cards.json.title', bodyKey: 'home.cards.json.body', icon: '{ }', category: 'data' },
  { slug: 'json-excel', titleKey: 'home.cards.jsonExcel.title', bodyKey: 'home.cards.jsonExcel.body', icon: 'XLS', category: 'data' },
] as const;

export function toolsByCategory(category: ToolCategory): ToolMeta[] {
  return TOOLS.filter((t) => t.category === category);
}
