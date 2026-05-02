import type { UIKey } from '~/i18n/ui';

export interface ToolMeta {
  slug: string; // e.g. 'base64'
  titleKey: UIKey;
  bodyKey: UIKey;
  icon: string; // emoji is enough; styled via CSS
}

export const TOOLS: readonly ToolMeta[] = [
  { slug: 'base64', titleKey: 'home.cards.base64.title', bodyKey: 'home.cards.base64.body', icon: 'B64' },
  { slug: 'base64-image', titleKey: 'home.cards.base64Image.title', bodyKey: 'home.cards.base64Image.body', icon: 'IMG' },
  { slug: 'qr-read', titleKey: 'home.cards.qrRead.title', bodyKey: 'home.cards.qrRead.body', icon: 'QR↓' },
  { slug: 'qr-generate', titleKey: 'home.cards.qrGen.title', bodyKey: 'home.cards.qrGen.body', icon: 'QR↑' },
  { slug: 'json', titleKey: 'home.cards.json.title', bodyKey: 'home.cards.json.body', icon: '{ }' },
  { slug: 'json-excel', titleKey: 'home.cards.jsonExcel.title', bodyKey: 'home.cards.jsonExcel.body', icon: 'XLS' },
  { slug: 'aes', titleKey: 'home.cards.aes.title', bodyKey: 'home.cards.aes.body', icon: 'AES' },
  { slug: 'jwt', titleKey: 'home.cards.jwt.title', bodyKey: 'home.cards.jwt.body', icon: 'JWT' },
] as const;
