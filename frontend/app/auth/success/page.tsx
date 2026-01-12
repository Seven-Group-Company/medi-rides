import { Suspense } from 'react';
import OAuthSuccessClient from './OAuthSuccessClient';

export default function OAuthSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OAuthSuccessClient />
    </Suspense>
  );
}
