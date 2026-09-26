/**
 * HustlerAI - Premium Black-Gold Landing Page
 * 2025 Design with Glassmorphism
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { FeatureCard, StepCard } from '@/components/ui/glass-card';
import { GoldButton } from '@/components/ui/gold-button';
import { Sparkles, Target, FileCheck, MessageSquare, BarChart3, DollarSign, Shield } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <nav className="flex justify-between items-center backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center shadow-gold">
              <span className="text-xl font-bold text-black">H</span>
            </div>
            <h1 className="text-2xl font-bold text-gold">HustlerAI</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-gold-200 hover:text-gold px-6 py-2 font-medium transition-colors"
            >
              Login
            </Link>
            <Link href="/register">
              <GoldButton size="sm">Get Started</GoldButton>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-5xl mx-auto animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-6 py-2 mb-8">
            <Sparkles className="text-gold" size={16} />
            <span className="text-gold-200 text-sm font-medium">AI-Powered Career Optimization</span>
          </div>

          <h1 className="text-7xl font-bold mb-6 leading-tight">
            Land Your Dream Job with{' '}
            <span className="text-gold">Premium AI</span>
          </h1>

          <p className="text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Transform any job posting into a complete application package in under 60 seconds.
            ATS-optimized resumes, match scores, and interview prep—all powered by cutting-edge AI.
          </p>

          <div className="flex justify-center gap-6">
            <Link href="/register">
              <GoldButton size="lg" className="shadow-gold-lg">
                Start Free Trial
              </GoldButton>
            </Link>
            <a href="#features">
              <GoldButton size="lg" variant="outline">
                Learn More
              </GoldButton>
            </a>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-4xl font-bold text-gold mb-2">60s</div>
              <div className="text-gray-400 text-sm">Average Processing Time</div>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-4xl font-bold text-gold mb-2">100%</div>
              <div className="text-gray-400 text-sm">ATS Compliant</div>
            </div>
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-4xl font-bold text-gold mb-2">5x</div>
              <div className="text-gray-400 text-sm">More Interviews</div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gold-100 mb-4">
              Premium Features
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to dominate your job search
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Target className="text-gold" size={48} />}
              title="Instant Match Score"
              description="Get a detailed fit score (0-100) based on skill overlap, must-haves, and seniority requirements."
            />
            <FeatureCard
              icon={<FileCheck className="text-gold" size={48} />}
              title="ATS-Optimized Resume"
              description="Generate a perfectly formatted, one-page resume that passes all ATS systems."
            />
            <FeatureCard
              icon={<MessageSquare className="text-gold" size={48} />}
              title="STAR Interview Answers"
              description="Receive 5 behavioral interview answers tailored specifically to the job requirements."
            />
            <FeatureCard
              icon={<BarChart3 className="text-gold" size={48} />}
              title="Application Tracker"
              description="Track all your applications, follow-ups, and interviews in one organized dashboard."
            />
            <FeatureCard
              icon={<DollarSign className="text-gold" size={48} />}
              title="ROI Calculator"
              description="Calculate the financial value of each application based on salary, equity, and benefits."
            />
            <FeatureCard
              icon={<Shield className="text-gold" size={48} />}
              title="Privacy First"
              description="Your data stays private. We don't store or share your personal information."
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gold-100 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Three simple steps to transform your job search
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <StepCard
              number="1"
              title="Upload Resume"
              description="Upload your master resume once and we'll extract all your experiences and skills"
            />
            <StepCard
              number="2"
              title="Paste Job Description"
              description="Copy any job posting and our AI will analyze the requirements in seconds"
            />
            <StepCard
              number="3"
              title="Get Your Package"
              description="Receive tailored resume, match score, and interview prep in under 60 seconds"
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 backdrop-blur-xl bg-gold/5 border border-gold/20 rounded-3xl p-16 text-center">
          <h2 className="text-5xl font-bold mb-6 text-gold-100">
            Ready to Transform Your Job Search?
          </h2>
          <p className="text-2xl mb-10 text-gray-300 max-w-2xl mx-auto">
            Join thousands of job seekers who land more interviews with HustlerAI&apos;s premium AI technology
          </p>
          <Link href="/register">
            <GoldButton size="lg" className="shadow-gold-lg">
              Create Free Account
            </GoldButton>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-16 mt-32 border-t border-white/10 relative z-10">
        <div className="text-center text-gray-500">
          <p className="text-lg mb-4">© 2025 HustlerAI. Built with Premium AI for ambitious job seekers.</p>
          <div className="flex justify-center gap-8 text-sm">
            <a href="/tracker" className="hover:text-gold transition-colors">Application Tracker</a>
            <a href="/analytics" className="hover:text-gold transition-colors">Analytics Dashboard</a>
            <a href="/api/health" className="hover:text-gold transition-colors">API Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
