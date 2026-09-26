'use client';

import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 mb-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="text-2xl font-bold text-gray-900">
            HustlerAI
          </a>

          {/* Main Navigation */}
          <div className="flex items-center gap-8">
            <a href="/" className={`${isActive('/')} transition-colors`}>
              New Application
            </a>
            <a href="/tracker" className={`${isActive('/tracker')} transition-colors`}>
              Tracker
            </a>
            <a href="/analytics" className={`${isActive('/analytics')} transition-colors`}>
              Analytics
            </a>
          </div>

          {/* Quick Action */}
          <a
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            + Apply to Job
          </a>
        </div>
      </div>
    </nav>
  );
}
