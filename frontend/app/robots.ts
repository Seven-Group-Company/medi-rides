import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo.config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/auth/*',
          '/customer-dashboard/*',
          '/driver-dashboard/*',
          '/admin-dashboard/*',
          '/verify-email/*',
          '/forgot-password/*',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
