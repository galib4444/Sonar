'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Phone, PartyPopper, Clock } from 'lucide-react';
import { FunnelChart } from '@/components/analytics/FunnelChart';
import { SuccessRateChart } from '@/components/analytics/SuccessRateChart';
import { FinancialProjections } from '@/components/analytics/FinancialProjections';
import { GlassCard } from '@/components/ui/glass-card';
import type { AnalyticsResponse } from '@/lib/types';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | '30d' | '7d'>('all');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const now = new Date();
      const start =
        timeRange === '30d'
          ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          : timeRange === '7d'
          ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          : new Date(0);

      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user_demo',
          metric_type: 'all',
          time_range: {
            start: start.toISOString(),
            end: now.toISOString(),
          },
        }),
      });

      const data: AnalyticsResponse = await res.json();

      if (data.status === 'success' && data.data) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen relative overflow-hidden pb-24 flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="text-center relative z-10">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </main>
    );
  }

  if (!analytics) {
    return (
      <main className="min-h-screen relative overflow-hidden pb-24 flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="text-center relative z-10">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-400">No analytics data available</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden pb-24">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gold-200 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Track your job search performance and financial projections
            </p>
          </div>

          {/* Time Range Filter */}
          <div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="border border-gray-300 rounded px-4 py-2 bg-white/70 text-gray-700"
            >
              <option value="all">All Time</option>
              <option value="30d">Last 30 Days</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <GlassCard variant="cream" className="p-4">
            <BarChart3 className="text-gold w-8 h-8 mb-2" />
            <div className="text-2xl font-bold text-gold">
              {analytics.funnel.applied}
            </div>
            <div className="text-sm text-gray-800">Applications</div>
          </GlassCard>

          <GlassCard variant="cream" className="p-4">
            <Phone className="text-gold-200 w-8 h-8 mb-2" />
            <div className="text-2xl font-bold text-gold-200">
              {analytics.funnel.phone_screen}
            </div>
            <div className="text-sm text-gray-800">Interviews</div>
          </GlassCard>

          <GlassCard variant="cream" className="p-4">
            <PartyPopper className="text-gold-300 w-8 h-8 mb-2" />
            <div className="text-2xl font-bold text-gold-300">
              {analytics.funnel.offer}
            </div>
            <div className="text-sm text-gray-800">Offers</div>
          </GlassCard>

          <GlassCard variant="cream" className="p-4">
            <Clock className="text-gold w-8 h-8 mb-2" />
            <div className="text-2xl font-bold text-gold">
              {analytics.time_saved.hours_saved}h
            </div>
            <div className="text-sm text-gray-800">Time Saved</div>
          </GlassCard>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FunnelChart data={analytics.funnel} />
          <SuccessRateChart data={analytics.success_by_match_score} />
        </div>

        {/* Financial Projections */}
        <FinancialProjections data={analytics.financial} />

        {/* Conversion Metrics */}
        <GlassCard variant="cream" className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Conversion Metrics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-800 mb-2">
                Applied → Phone Screen
              </div>
              <div className="text-3xl font-bold text-gold">
                {analytics.conversion_rates.applied_to_phone.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-800 mb-2">
                Phone → Onsite
              </div>
              <div className="text-3xl font-bold text-gold-200">
                {analytics.conversion_rates.phone_to_onsite.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-800 mb-2">Onsite → Offer</div>
              <div className="text-3xl font-bold text-gold-300">
                {analytics.conversion_rates.onsite_to_offer.toFixed(1)}%
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-6 text-sm text-gray-800">
            <a href="/tracker" className="hover:text-gold transition-colors">
              View Tracker →
            </a>
            <a href="/dashboard" className="hover:text-gold transition-colors">
              ← Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
