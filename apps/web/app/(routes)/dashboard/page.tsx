/**
 * HustlerAI - Premium Dashboard
 * Main application page with JD paste form (Protected)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ResumeUpload } from '@/components/resume/ResumeUpload';
import { GlassCard, FeatureCard } from '@/components/ui/glass-card';
import { GoldButton } from '@/components/ui/gold-button';
import type { UserProfile } from '@/lib/types';
import { Target, FileCheck, MessageSquare, CheckCircle2, Sparkles, ArrowRight, FolderOpen } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [jdText, setJdText] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedResumesCount, setSavedResumesCount] = useState(0);

  // Load saved resumes count on mount
  useEffect(() => {
    const savedResumesJson = sessionStorage.getItem('saved_resumes');
    if (savedResumesJson) {
      try {
        const resumes = JSON.parse(savedResumesJson);
        setSavedResumesCount(resumes.length);
      } catch {
        setSavedResumesCount(0);
      }
    }
  }, []);

  const handleResumeExtracted = (profile: UserProfile) => {
    setUserProfile(profile);
    setError('');
  };

  const handleAnalyze = async () => {
    // Validate inputs
    if (!userProfile) {
      setError('Please upload your resume first');
      return;
    }

    if (!jdText.trim()) {
      setError('Please paste a job description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Store data in sessionStorage for the tailor page
      sessionStorage.setItem('user_profile', JSON.stringify(userProfile));
      sessionStorage.setItem('jd_text', jdText);

      // Navigate to tailor page (where AI will generate suggestions)
      router.push('/tailor');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden pb-24">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Shooting Stars */}
        <div className="shooting-star shooting-star-1" />
        <div className="shooting-star shooting-star-2" />
        <div className="shooting-star shooting-star-3" />
        <div className="shooting-star shooting-star-4" />
        <div className="shooting-star shooting-star-5" />
      </div>

      <div className="container mx-auto px-4 pt-0 pb-24 relative z-10 flex flex-col items-center">
        {/* HUSTLERAI Logo */}
        <div className="mb-0 animate-slide-up flex justify-center">
          <div className="relative w-[550px] h-[380px] overflow-hidden">
            <Image
              src="/logo.png"
              alt="HUSTLERAI"
              width={550}
              height={800}
              className="object-contain"
              style={{ objectPosition: 'center 22%' }}
              priority
            />
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-6 animate-slide-up w-full">
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-6 py-2 mb-4">
            <Sparkles className="text-gold" size={16} />
            <span className="text-gold-200 text-sm font-medium">Transform Your Job Search</span>
          </div>
          <h1 className="text-4xl font-bold text-gold-200 mb-4">
            AI Career Optimizer
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Transform any job posting into a complete application package in under 60 seconds
          </p>
        </div>

        {/* Quick Actions - Saved Resumes */}
        <Link href="/resumes" className="block max-w-2xl w-full mb-12 animate-slide-up group">
          <style jsx>{`
            @keyframes shimmer-flow {
              0% {
                transform: translateX(-100%) translateY(-100%) rotate(45deg);
                opacity: 0;
              }
              50% {
                opacity: 0.6;
              }
              100% {
                transform: translateX(200%) translateY(200%) rotate(45deg);
                opacity: 0;
              }
            }

            .shimmer-overlay {
              animation: shimmer-flow 4s ease-in-out infinite;
            }
          `}</style>

          <div className="relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-500 ease-out hover:scale-[1.02] group-hover:shadow-2xl"
            style={{
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(255, 255, 255, 0.5) inset, 0 -1px 1px rgba(0, 0, 0, 0.05) inset, 0 4px 16px rgba(0, 0, 0, 0.04)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(255, 255, 255, 0.03) 100%)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)'
            }}
          >
            {/* Top light reflection */}
            <div
              className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
              style={{ pointerEvents: 'none' }}
            />

            {/* Animated shimmer overlay */}
            <div
              className="shimmer-overlay absolute inset-0 w-full h-full pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 215, 0, 0.15) 50%, transparent 100%)',
                width: '200%',
                height: '200%',
                top: '-50%',
                left: '-50%'
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center transition-all duration-300 group-hover:bg-gold-500/30 group-hover:shadow-lg group-hover:shadow-gold-500/20">
                  <FolderOpen className="text-gold-600 transition-all duration-300 group-hover:scale-110" size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-semibold text-white mb-1 transition-colors duration-300 group-hover:text-gold-200">
                    Your Saved Resumes
                  </h3>
                  <p className="text-sm text-gray-300 transition-colors duration-300 group-hover:text-gray-100">
                    {savedResumesCount > 0
                      ? `${savedResumesCount} ${savedResumesCount === 1 ? 'resume' : 'resumes'} saved • View, edit, or download`
                      : 'No resumes saved yet • Save your first resume to access it here'}
                  </p>
                </div>
              </div>
              <ArrowRight className="text-gold-600 flex-shrink-0 transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110" size={20} />
            </div>
          </div>
        </Link>

        {/* Main Content */}
        <div className="max-w-4xl w-full space-y-8">
          {/* Step 1: Upload Resume */}
          <ResumeUpload onResumeExtracted={handleResumeExtracted} loading={loading} />

          {/* Step 2: Paste JD */}
          {userProfile && (
            <GlassCard variant="cream" className="p-10 animate-slide-up">
              <div className="flex items-center mb-8">
                <div className="bg-gold/20 text-gold rounded-full w-10 h-10 flex items-center justify-center mr-4">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Resume Loaded: {userProfile.name}
                  </h3>
                  <p className="text-sm text-gray-700">
                    {userProfile.experience?.length || 0} experiences •{' '}
                    {userProfile.skills?.length || 0} skills
                  </p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent mb-6" />

              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Now Paste the Job Description
              </h2>
              <p className="text-gray-700 mb-6">
                We&apos;ll analyze the role and generate a tailored 1-page resume from your full profile.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="jd-text" className="block text-sm font-medium text-gray-800 mb-2">
                    Job Description
                  </label>
                  <textarea
                    id="jd-text"
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gold focus:border-transparent bg-white/50 text-gray-900 placeholder-gray-500"
                    placeholder="Paste the job description here..."
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-red-100/50 border border-red-300 text-red-800 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <GoldButton
                  onClick={handleAnalyze}
                  disabled={loading || !userProfile}
                  loading={loading}
                  fullWidth
                  size="lg"
                  className="shadow-gold-lg"
                >
                  {loading ? 'Analyzing...' : (
                    <span className="flex items-center justify-center gap-2">
                      Continue to Tailor Resume
                      <ArrowRight size={20} />
                    </span>
                  )}
                </GoldButton>
              </div>

              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Sparkles size={16} className="text-gold" />
                  Results in 60s
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 size={16} className="text-gold" />
                  100% ATS compliant
                </span>
              </div>
            </GlassCard>
          )}

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12 w-full max-w-6xl mx-auto">
            <FeatureCard
              icon={<Target className="text-gold" size={48} />}
              title="Match Score"
              description="Get an instant fit score (0-100) based on skill overlap, must-haves, and seniority."
            />
            <FeatureCard
              icon={<FileCheck className="text-gold" size={48} />}
              title="ATS-Optimized Resume"
              description="Generate a perfectly formatted, one-page resume that passes all ATS systems."
            />
            <FeatureCard
              icon={<MessageSquare className="text-gold" size={48} />}
              title="STAR Interview Answers"
              description="Receive 5 behavioral interview answers tailored to the job requirements."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 w-full">
          <p className="mb-4 text-base text-gray-400">
            Built with Premium AI | Agent-First Architecture
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <a href="/tracker" className="hover:text-gold transition-colors duration-200 font-semibold">Application Tracker</a>
            <a href="/analytics" className="hover:text-gold transition-colors duration-200 font-semibold">Analytics Dashboard</a>
            <a href="/api/health" className="hover:text-gold transition-colors duration-200">API Status</a>
          </div>
        </div>
      </div>
    </main>
  );
}
