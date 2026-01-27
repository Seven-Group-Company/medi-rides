import { Metadata } from 'next';

// Base domain configuration
export const SITE_CONFIG = {
  name: 'Compassionate Medi Rides',
  domain: 'compassionatemedieides.com',
  url: 'https://compassionatemedieides.com',
  description: 'Professional non-emergency medical and personal transportation services. Doctor appointments, dialysis, airport transfers, and more.',
  locale: 'en_US',
  type: 'website',
} as const;

// Organization information
export const ORGANIZATION = {
  name: 'Compassionate Medi Rides',
  legalName: 'Compassionate Medi Rides LLC',
  description: 'Professional medical and non-medical transportation services provider',
  email: 'info@compassionatemedieides.com',
  phone: '+1-XXX-XXX-XXXX', // Update with actual phone
  address: {
    streetAddress: 'Your Street Address', // Update with actual address
    addressLocality: 'Your City',
    addressRegion: 'Your State',
    postalCode: 'Your ZIP',
    addressCountry: 'US',
  },
  serviceArea: {
    name: 'Your Service Area', // e.g., "Greater Phoenix Area"
    type: 'City' as const,
  },
} as const;

// Default metadata for the site
export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} | Professional Medical Transportation Services`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    'medical transportation',
    'non-emergency medical transport',
    'wheelchair accessible transportation',
    'dialysis transportation',
    'doctor appointment transportation',
    'airport transportation',
    'senior transportation',
    'mobility assistance',
    'patient transport',
  ],
  authors: [{ name: SITE_CONFIG.name }],
  creator: SITE_CONFIG.name,
  publisher: SITE_CONFIG.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    title: `${SITE_CONFIG.name} | Professional Medical Transportation Services`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: '/og-image.jpg', // You'll need to add this image to /public
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - Professional Medical Transportation`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} | Professional Medical Transportation Services`,
    description: SITE_CONFIG.description,
    images: ['/twitter-image.jpg'], // You'll need to add this image to /public
    creator: '@compassionatemr', // Update with actual Twitter handle if available
  },
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  verification: {
    google: '', // Add Google Search Console verification code
    // yandex: '',
    // bing: '',
  },
};

// Helper function to generate page-specific metadata
export function generatePageMetadata({
  title,
  description,
  path = '',
  keywords = [],
  noIndex = false,
  ogImage,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  ogImage?: string;
}): Metadata {
  const url = `${SITE_CONFIG.url}${path}`;
  const image = ogImage || '/og-image.jpg';

  return {
    title,
    description,
    keywords: [...defaultMetadata.keywords as string[], ...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}
