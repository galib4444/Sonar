'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Navigation Bar */}
      <nav className="bg-white/70 shadow-sm border-b relative">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex-shrink-0">
            <a href="/dashboard" className="text-xl font-bold text-gray-900">
              HustlerAI
            </a>
          </div>

          {/* Center - Navigation Links (absolutely positioned for true centering) */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2">
              <a
                href="/dashboard"
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  pathname === '/dashboard'
                    ? 'bg-gold/20 text-gray-900 border border-gold/40 shadow-sm'
                    : 'text-gray-700 hover:bg-gold/10 hover:text-gold'
                }`}
              >
                Dashboard
              </a>
              <a
                href="/tracker"
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  pathname === '/tracker'
                    ? 'bg-gold/20 text-gray-900 border border-gold/40 shadow-sm'
                    : 'text-gray-700 hover:bg-gold/10 hover:text-gold'
                }`}
              >
                Tracker
              </a>
              <a
                href="/analytics"
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                  pathname === '/analytics'
                    ? 'bg-gold/20 text-gray-900 border border-gold/40 shadow-sm'
                    : 'text-gray-700 hover:bg-gold/10 hover:text-gold'
                }`}
              >
                Analytics
              </a>
            </div>
          </div>

          {/* Right side - User info and logout */}
          <div className="flex-shrink-0 flex items-center space-x-4">
            <span className="text-gray-600">
              Welcome, {user.name}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 font-medium transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}

