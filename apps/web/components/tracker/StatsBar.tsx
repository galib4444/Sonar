'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { BarChart3, FileText, Briefcase, PartyPopper, Target, DollarSign } from 'lucide-react';
import type { ApplicationRecord } from '@/lib/types';

interface StatsBarProps {
  applications: ApplicationRecord[];
}

export function StatsBar({ applications }: StatsBarProps) {
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    interviews: applications.filter((a) =>
      ['phone_screen', 'onsite'].includes(a.status)
    ).length,
    offers: applications.filter((a) => a.status === 'offer').length,
    avgMatchScore:
      applications.length > 0
        ? Math.round(
            applications.reduce((sum, a) => sum + a.resume.match_score, 0) /
              applications.length
          )
        : 0,
    avgROI:
      applications.length > 0
        ? Math.round(
            applications.reduce((sum, a) => sum + a.financial.roi_score, 0) /
              applications.length
          )
        : 0,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <StatCard label="Total Apps" value={stats.total} icon={<BarChart3 className="w-6 h-6" />} color="gray-800" />
      <StatCard label="Applied" value={stats.applied} icon={<FileText className="w-6 h-6" />} color="gray-800" />
      <StatCard label="Interviews" value={stats.interviews} icon={<Briefcase className="w-6 h-6" />} color="gray-800" />
      <StatCard label="Offers" value={stats.offers} icon={<PartyPopper className="w-6 h-6" />} color="gray-800" />
      <StatCard
        label="Avg Match"
        value={`${stats.avgMatchScore}%`}
        icon={<Target className="w-6 h-6" />}
        color="gray-800"
      />
      <StatCard
        label="Avg ROI"
        value={`$${(stats.avgROI / 1000).toFixed(0)}K`}
        icon={<DollarSign className="w-6 h-6" />}
        color="gray-800"
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'gray-800';
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  const colorClasses = {
    'gray-800': 'text-gray-800',
  };

  return (
    <GlassCard variant="cream" className="p-4">
      <div className={`${colorClasses[color]} mb-2`}>{icon}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-800">{label}</div>
    </GlassCard>
  );
}
