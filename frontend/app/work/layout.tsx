import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo.config';

export const metadata: Metadata = generatePageMetadata({
  title: 'Careers - Join Our Team',
  description: 'Join the Compassionate Medi Rides team. Explore career opportunities in medical transportation and make a difference in people\'s lives.',
  path: '/work',
  keywords: [
    'medical transportation careers',
    'driver jobs',
    'transportation careers',
    'healthcare jobs',
  ],
});

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
