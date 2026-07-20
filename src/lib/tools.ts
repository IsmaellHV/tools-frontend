import type { UIKey } from '~/i18n/ui';

export type ToolCategory = 'encoding' | 'security' | 'qr' | 'data' | 'text' | 'pdf' | 'image';

export interface ToolMeta {
  slug: string; // e.g. 'base64'
  titleKey: UIKey;
  bodyKey: UIKey;
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
  { id: 'text', titleKey: 'home.cat.text.title', bodyKey: 'home.cat.text.body' },
  { id: 'pdf', titleKey: 'home.cat.pdf.title', bodyKey: 'home.cat.pdf.body' },
  { id: 'image', titleKey: 'home.cat.image.title', bodyKey: 'home.cat.image.body' },
] as const;

export const TOOLS: readonly ToolMeta[] = [
  { slug: 'base64', titleKey: 'home.cards.base64.title', bodyKey: 'home.cards.base64.body', category: 'encoding' },
  { slug: 'base64-image', titleKey: 'home.cards.base64Image.title', bodyKey: 'home.cards.base64Image.body', category: 'encoding' },
  { slug: 'jwt', titleKey: 'home.cards.jwt.title', bodyKey: 'home.cards.jwt.body', category: 'encoding' },
  { slug: 'aes', titleKey: 'home.cards.aes.title', bodyKey: 'home.cards.aes.body', category: 'security' },
  { slug: 'password', titleKey: 'home.cards.password.title', bodyKey: 'home.cards.password.body', category: 'security' },
  { slug: 'qr-read', titleKey: 'home.cards.qrRead.title', bodyKey: 'home.cards.qrRead.body', category: 'qr' },
  { slug: 'qr-generate', titleKey: 'home.cards.qrGen.title', bodyKey: 'home.cards.qrGen.body', category: 'qr' },
  { slug: 'json', titleKey: 'home.cards.json.title', bodyKey: 'home.cards.json.body', category: 'data' },
  { slug: 'json-excel', titleKey: 'home.cards.jsonExcel.title', bodyKey: 'home.cards.jsonExcel.body', category: 'data' },
  { slug: 'text-diff', titleKey: 'home.cards.textDiff.title', bodyKey: 'home.cards.textDiff.body', category: 'text' },
  { slug: 'pdf-merge', titleKey: 'home.cards.pdfMerge.title', bodyKey: 'home.cards.pdfMerge.body', category: 'pdf' },
  { slug: 'pdf-split', titleKey: 'home.cards.pdfSplit.title', bodyKey: 'home.cards.pdfSplit.body', category: 'pdf' },
  { slug: 'images-to-pdf', titleKey: 'home.cards.imagesToPdf.title', bodyKey: 'home.cards.imagesToPdf.body', category: 'pdf' },
  { slug: 'pdf-rotate', titleKey: 'home.cards.pdfRotate.title', bodyKey: 'home.cards.pdfRotate.body', category: 'pdf' },
  { slug: 'pdf-to-images', titleKey: 'home.cards.pdfToImages.title', bodyKey: 'home.cards.pdfToImages.body', category: 'pdf' },
  { slug: 'pdf-compress', titleKey: 'home.cards.pdfCompress.title', bodyKey: 'home.cards.pdfCompress.body', category: 'pdf' },
  { slug: 'pdf-page-numbers', titleKey: 'home.cards.pdfPageNumbers.title', bodyKey: 'home.cards.pdfPageNumbers.body', category: 'pdf' },
  { slug: 'image-compress', titleKey: 'home.cards.imageCompress.title', bodyKey: 'home.cards.imageCompress.body', category: 'image' },
  { slug: 'image-convert', titleKey: 'home.cards.imageConvert.title', bodyKey: 'home.cards.imageConvert.body', category: 'image' },
  { slug: 'image-resize', titleKey: 'home.cards.imageResize.title', bodyKey: 'home.cards.imageResize.body', category: 'image' },
] as const;

export function toolsByCategory(category: ToolCategory): ToolMeta[] {
  return TOOLS.filter((t) => t.category === category);
}

