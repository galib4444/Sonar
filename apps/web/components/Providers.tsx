/**
 * Client-side Providers
 * Wraps app with error boundary and other providers
 */

'use client';

import { AuthProvider } from '@/lib/auth/AuthContext';
import { ErrorBoundary } from './ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary source="AppRoot">
      <AuthProvider>{children}</AuthProvider>
    </ErrorBoundary>
  );
}
