/**
 * HustlerAI - Premium Register Page
 * Black-Gold Theme with Glassmorphism
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { GlassCard } from '@/components/ui/glass-card';
import { GoldButton } from '@/components/ui/gold-button';
import { Sparkles, ArrowLeft, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await register(name, email, password, confirmPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
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
            <UserPlus className="text-gold" size={14} />
            <p className="text-gold-200 text-sm">Start your premium career journey</p>
          </div>
        </div>

        {/* Register Form */}
        <GlassCard variant="cream" className="p-8 shadow-gold">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>

          {error && (
            <div className="bg-red-100/50 border border-red-300 text-red-800 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent bg-white/70 text-gray-900 placeholder-gray-500"
                placeholder="John Doe"
              />
            </div>

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
                Password (min. 8 characters)
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
                  autoComplete="new-password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-800 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent bg-white/70 text-gray-900 placeholder-gray-500"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
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
              {loading ? 'Creating account...' : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles size={18} />
                  Create Account
                </span>
              )}
            </GoldButton>
          </form>

          <div className="mt-6 text-center text-sm text-gray-700">
            Already have an account?{' '}
            <Link href="/login" className="text-gold hover:text-gold-600 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
        </GlassCard>

        {/* Additional Info */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Join the premium AI-powered career platform
        </p>
      </div>
    </div>
  );
}

