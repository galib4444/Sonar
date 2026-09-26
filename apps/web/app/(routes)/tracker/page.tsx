'use client';

import { useState, useEffect } from 'react';
import { ApplicationTable } from '@/components/tracker/ApplicationTable';
import { StatsBar } from '@/components/tracker/StatsBar';
import { GlassCard } from '@/components/ui/glass-card';
import { GoldButton } from '@/components/ui/gold-button';
import { RefreshCw, Database } from 'lucide-react';
import type { ApplicationRecord, ApplicationStatus, ListApplicationsResponse } from '@/lib/types';

export default function TrackerPage() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: [] as ApplicationStatus[],
    min_match_score: 0,
    sort_by: 'roi_score' as 'roi_score' | 'match_score' | 'applied_date' | 'salary',
  });

  useEffect(() => {
    loadApplications();
  }, [filters]);

  async function loadApplications() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        sort_by: filters.sort_by,
      });

      if (filters.status.length > 0) {
        params.set('status', filters.status.join(','));
      }

      if (filters.min_match_score > 0) {
        params.set('min_match', filters.min_match_score.toString());
      }

      const res = await fetch(`/api/tracker/list?${params}`);
      const data: ListApplicationsResponse = await res.json();

      if (data.status === 'success' && data.data) {
        setApplications(data.data.applications);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function seedDemoData() {
    // Call storage seed function via a new API route
    const res = await fetch('/api/tracker/seed', { method: 'POST' });
    if (res.ok) {
      loadApplications();
    }
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold-200 mb-2">Application Tracker</h1>
          <p className="text-gray-600">
            Track all your applications with financial intelligence and analytics
          </p>
        </div>

        {/* Stats Bar */}
        <StatsBar applications={applications} />

        {/* Filters */}
        <GlassCard variant="cream" className="p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Sort By
              </label>
              <select
                value={filters.sort_by}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sort_by: e.target.value as typeof filters.sort_by,
                  })
                }
                className="border border-gray-300 rounded px-3 py-2 bg-white/70 text-gray-800"
              >
                <option value="roi_score">ROI Score (Highest)</option>
                <option value="match_score">Match Score (Highest)</option>
                <option value="applied_date">Date Applied (Recent)</option>
                <option value="salary">Salary (Highest)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">
                Min Match Score
              </label>
              <select
                value={filters.min_match_score}
                onChange={(e) =>
                  setFilters({ ...filters, min_match_score: parseInt(e.target.value) })
                }
                className="border border-gray-300 rounded px-3 py-2 bg-white/70 text-gray-800"
              >
                <option value="0">All</option>
                <option value="70">70%+</option>
                <option value="80">80%+</option>
                <option value="90">90%+</option>
              </select>
            </div>

            <div className="ml-auto flex gap-2">
              <GoldButton
                onClick={seedDemoData}
                className="flex items-center gap-2"
              >
                <Database size={16} />
                Seed Demo Data
              </GoldButton>
              <GoldButton
                onClick={loadApplications}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh
              </GoldButton>
            </div>
          </div>
        </GlassCard>

        {/* Applications Table */}
        {loading ? (
          <GlassCard variant="cream" className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Loading applications...</p>
          </GlassCard>
        ) : (
          <ApplicationTable applications={applications} />
        )}

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-6 text-sm text-gray-800">
            <a href="/analytics" className="hover:text-gold transition-colors">
              View Analytics →
            </a>
            <a href="/bookmarks" className="hover:text-gold transition-colors">
              View Bookmarks →
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
