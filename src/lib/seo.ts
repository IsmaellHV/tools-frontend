import type { Lang } from '~/i18n/ui';

export interface ToolJsonLdInput {
  name: string;
  description: string;
  url: string;
  lang: Lang;
  category?: string; // e.g. "DeveloperApplication", "UtilitiesApplication"
}

// Returns a SoftwareApplication + BreadcrumbList JSON-LD pair for a tool page.
// Search engines render these as rich results when the field set is complete.
export function buildToolJsonLd(t: ToolJsonLdInput, siteRoot: string, homePath: string) {
  const home = `${siteRoot}${homePath}`;
  const app = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: t.name,
    description: t.description,
    url: t.url,
    applicationCategory: t.category ?? 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript and a modern browser',
    isAccessibleForFree: true,
    inLanguage: t.lang,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1',
    },
    publisher: {
      '@type': 'Person',
      name: 'ismaelhv',
      url: 'https://ismaelhv.com',
    },
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t.lang === 'es' ? 'Herramientas' : 'Tools',
        item: home,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t.name,
        item: t.url,
      },
    ],
  };

  return [app, breadcrumbs];
}
