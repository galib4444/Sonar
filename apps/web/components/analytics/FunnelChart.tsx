'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';

interface FunnelChartProps {
  data: {
    applied: number;
    phone_screen: number;
    onsite: number;
    offer: number;
  };
}

export function FunnelChart({ data }: FunnelChartProps) {
  const stages = [
    { label: 'Applied', value: data.applied, color: 'bg-gold' },
    { label: 'Phone Screen', value: data.phone_screen, color: 'bg-gold-200' },
    { label: 'Onsite', value: data.onsite, color: 'bg-gold-300' },
    { label: 'Offer', value: data.offer, color: 'bg-gold-400' },
  ];

  const maxValue = data.applied || 1;

  return (
    <GlassCard variant="cream" className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Funnel</h3>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const widthPercent = (stage.value / maxValue) * 100;
          const conversionRate =
            index > 0 && stages[index - 1].value > 0
              ? ((stage.value / stages[index - 1].value) * 100).toFixed(1)
              : '100.0';

          return (
            <div key={stage.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">{stage.label}</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-gold">{stage.value}</span>
                  {index > 0 && (
                    <span className="text-sm text-gray-400 ml-2">({conversionRate}%)</span>
                  )}
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-8 relative overflow-hidden">
                <div
                  className={`${stage.color} h-8 rounded-full transition-all duration-500 flex items-center justify-end pr-4`}
                  style={{ width: `${widthPercent}%` }}
                >
                  <span className="text-white text-xs font-semibold">
                    {widthPercent.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-800">Overall Conversion</div>
            <div className="text-2xl font-bold text-gold">
              {data.applied > 0
                ? ((data.offer / data.applied) * 100).toFixed(1)
                : '0.0'}
              %
            </div>
            <div className="text-xs text-gray-700">Applied → Offer</div>
          </div>
          <div>
            <div className="text-sm text-gray-800">Interview Rate</div>
            <div className="text-2xl font-bold text-gold-200">
              {data.applied > 0
                ? ((data.phone_screen / data.applied) * 100).toFixed(1)
                : '0.0'}
              %
            </div>
            <div className="text-xs text-gray-700">Applied → Interview</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
