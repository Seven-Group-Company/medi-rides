import { Suspense } from 'react';
import OAuthErrorClient from './OAuthErrorClient';

export default function OAuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OAuthErrorClient />
    </Suspense>
  );
}