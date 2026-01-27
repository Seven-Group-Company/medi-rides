import { SITE_CONFIG, ORGANIZATION } from './seo.config';

// Helper to generate JSON-LD script tag
export function generateStructuredData(data: object) {
  return {
    __html: JSON.stringify(data),
  };
}

// Organization Schema
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: ORGANIZATION.name,
    legalName: ORGANIZATION.legalName,
    url: SITE_CONFIG.url,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}/logos/logo.png`,
      width: '512',
      height: '512',
    },
    description: ORGANIZATION.description,
    email: ORGANIZATION.email,
    telephone: ORGANIZATION.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORGANIZATION.address.streetAddress,
      addressLocality: ORGANIZATION.address.addressLocality,
      addressRegion: ORGANIZATION.address.addressRegion,
      postalCode: ORGANIZATION.address.postalCode,
      addressCountry: ORGANIZATION.address.addressCountry,
    },
    sameAs: [
      // Add social media profiles here
      // 'https://www.facebook.com/compassionatemedieides',
      // 'https://twitter.com/compassionatemr',
      // 'https://www.linkedin.com/company/compassionate-medi-rides',
    ],
  };
}

// LocalBusiness Schema
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_CONFIG.url}/#localbusiness`,
    name: ORGANIZATION.name,
    image: `${SITE_CONFIG.url}/logos/logo.png`,
    url: SITE_CONFIG.url,
    telephone: ORGANIZATION.phone,
    email: ORGANIZATION.email,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: ORGANIZATION.address.streetAddress,
      addressLocality: ORGANIZATION.address.addressLocality,
      addressRegion: ORGANIZATION.address.addressRegion,
      postalCode: ORGANIZATION.address.postalCode,
      addressCountry: ORGANIZATION.address.addressCountry,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 0, // Update with actual coordinates
      longitude: 0, // Update with actual coordinates
    },
    areaServed: {
      '@type': ORGANIZATION.serviceArea.type,
      name: ORGANIZATION.serviceArea.name,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    ],
  };
}

// Service Schema
export function generateServiceSchema({
  name,
  description,
  serviceType,
  areaServed,
}: {
  name: string;
  description: string;
  serviceType: string;
  areaServed?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType,
    name,
    description,
    provider: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    areaServed: areaServed || ORGANIZATION.serviceArea.name,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Medical Transportation Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name,
            description,
          },
        },
      ],
    },
  };
}

// BreadcrumbList Schema
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// WebPage Schema
export function generateWebPageSchema({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    name: title,
    description,
    isPartOf: {
      '@id': `${SITE_CONFIG.url}/#website`,
    },
    about: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}/og-image.jpg`,
    },
    inLanguage: 'en-US',
  };
}

// WebSite Schema
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}/#website`,
    url: SITE_CONFIG.url,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    publisher: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  };
}

// ContactPage Schema
export function generateContactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE_CONFIG.url}/contact#contactpage`,
    url: `${SITE_CONFIG.url}/contact`,
    name: 'Contact Us',
    description: `Get in touch with ${ORGANIZATION.name}`,
    isPartOf: {
      '@id': `${SITE_CONFIG.url}/#website`,
    },
    mainEntity: {
      '@type': 'Organization',
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
  };
}
