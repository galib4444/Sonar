/**
 * Premium Navigation Component
 * Black-Gold Theme with glassmorphism floating nav
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Home, Briefcase, Target, User } from 'lucide-react';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: <Home size={20} />, label: 'home', href: '/' },
  { icon: <Briefcase size={20} />, label: 'dashboard', href: '/dashboard' },
  { icon: <Target size={20} />, label: 'tracker', href: '/tracker' },
  { icon: <User size={20} />, label: 'profile', href: '/profile' },
];

export function PremiumNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 nav-glass px-6 py-4">
      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-6 py-3 rounded-full transition-all duration-300',
                isActive
                  ? 'bg-gold text-black'
                  : 'text-gold-300 hover:text-gold hover:bg-white/5'
              )}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

interface FloatingHeaderProps {
  title: string;
  subtitle?: string;
}

export function FloatingHeader({ title, subtitle }: FloatingHeaderProps) {
  return (
    <div className="fixed top-20 left-[42.1%] z-40 nav-glass px-8 py-4" style={{ transform: 'translateX(-50%)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center shadow-gold">
          <span className="text-2xl font-bold text-black">H</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gold">{title}</h1>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
