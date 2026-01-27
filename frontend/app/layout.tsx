import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { defaultMetadata } from '@/lib/seo.config';
import { 
  generateOrganizationSchema, 
  generateLocalBusinessSchema,
  generateWebSiteSchema,
  generateStructuredData 
} from '@/lib/structured-data';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationSchema = generateOrganizationSchema();
  const localBusinessSchema = generateLocalBusinessSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateStructuredData(organizationSchema)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateStructuredData(localBusinessSchema)}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateStructuredData(webSiteSchema)}
        />
      </head>
      <body className={inter.className}>
        <main className="">
          <AuthProvider>
          {children}
          </AuthProvider>
        </main>
      </body>
    </html>
  );
}