import { Suspense } from 'react';
import VerifyEmail from './VerifyEmail';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyEmail />
    </Suspense>
  );
}