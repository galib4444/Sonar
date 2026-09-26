/**
 * HustlerAI - Premium Login Page
 * Black-Gold Theme with Glassmorphism
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { GlassCard } from '@/components/ui/glass-card';
import { GoldButton } from '@/components/ui/gold-button';
import { Sparkles, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 [LOGIN PAGE] Form submitted');
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);

    setError('');
    setLoading(true);

    try {
      console.log('🚀 [LOGIN PAGE] Calling login function...');
      await login(email, password);
      console.log('✅ [LOGIN PAGE] Login successful!');
    } catch (err) {
      console.error('❌ [LOGIN PAGE] Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
      console.log('🏁 [LOGIN PAGE] Login attempt completed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Back to Home */}
      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-gold-200 hover:text-gold transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Home</span>
      </Link>

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-up">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center shadow-gold">
              <span className="text-2xl font-bold text-black">H</span>
            </div>
            <span className="text-3xl font-bold text-gold">HustlerAI</span>
          </Link>
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-2 mt-4">
            <Sparkles className="text-gold" size={14} />
            <p className="text-gold-200 text-sm">Welcome back to premium AI</p>
          </div>
        </div>

        {/* Login Form */}
        <GlassCard variant="cream" className="p-8 shadow-gold">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>

          {error && (
            <div className="bg-red-100/50 border border-red-300 text-red-800 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-800 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent bg-white/70 text-gray-900 placeholder-gray-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-800 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent bg-white/70 text-gray-900 placeholder-gray-500"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <GoldButton
              type="submit"
              disabled={loading}
              loading={loading}
              fullWidth
              size="lg"
              className="mt-6 shadow-gold-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </GoldButton>
          </form>

          <div className="mt-6 text-center text-sm text-gray-700">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-gold hover:text-gold-600 font-semibold transition-colors">
              Sign up
            </Link>
          </div>
        </GlassCard>

        {/* Additional Info */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Secure login with premium encryption
        </p>
      </div>
    </div>
  );
}

