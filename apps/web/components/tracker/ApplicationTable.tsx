'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import type { ApplicationRecord } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface ApplicationTableProps {
  applications: ApplicationRecord[];
  onApplicationClick?: (app: ApplicationRecord) => void;
}

export function ApplicationTable({ applications, onApplicationClick }: ApplicationTableProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      bookmarked: 'bg-gray-100 text-gray-800',
      ready_to_submit: 'bg-gold/10 text-gold-800',
      applied: 'bg-gold-200/20 text-gold-800',
      phone_screen: 'bg-gold-300/20 text-gold-800',
      onsite: 'bg-gold-400/20 text-gold-800',
      offer: 'bg-gold-500/20 text-gold-800',
      rejected: 'bg-red-100 text-red-800',
      accepted: 'bg-green-100 text-green-800',
      withdrawn: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatSalary = (range: { low: number; high: number }) => {
    return `$${(range.low / 1000).toFixed(0)}-${(range.high / 1000).toFixed(0)}K`;
  };

  const formatROI = (roi: number) => {
    return `$${(roi / 1000).toFixed(0)}K/hr`;
  };

  if (applications.length === 0) {
    return (
      <GlassCard variant="cream" className="text-center py-12">
        <div className="text-4xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications yet</h3>
        <p className="text-gray-800">Start applying to jobs to see them tracked here!</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="cream" className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-white/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
              Role & Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
              Match
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
              Salary
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
              ROI
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
              Applied
            </th>
          </tr>
        </thead>
        <tbody className="bg-white/30 divide-y divide-gray-200">
          {applications.map((app) => (
            <tr
              key={app.id}
              onClick={() => onApplicationClick?.(app)}
              className="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{app.job.title}</div>
                <div className="text-sm text-gray-700">{app.job.company}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="text-sm font-semibold text-gray-900">
                    {app.resume.match_score}%
                  </div>
                  <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gold h-2 rounded-full"
                    style={{ width: `${app.resume.match_score}%` }}
                  ></div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatSalary(app.financial.salary_range)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gold">
                  {formatROI(app.financial.roi_score)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                    app.status
                  )}`}
                >
                  {formatStatus(app.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                {formatDistanceToNow(new Date(app.applied_date), { addSuffix: true })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </GlassCard>
  );
}
