'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';

interface SuccessRateChartProps {
  data: Array<{
    score_range: string;
    interview_rate: number;
  }>;
}

export function SuccessRateChart({ data }: SuccessRateChartProps) {
  const maxRate = Math.max(...data.map((d) => d.interview_rate), 1);

  return (
    <GlassCard variant="cream" className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Success Rate by Match Score
      </h3>

      <div className="space-y-4">
        {data.map((item) => {
          const heightPercent = (item.interview_rate / maxRate) * 100;

          return (
            <div key={item.score_range}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-800">
                  Match Score: {item.score_range}
                </span>
                <span className="text-sm font-bold text-gold">
                  {item.interview_rate.toFixed(1)}% Interview Rate
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6">
                <div
                  className="bg-gradient-to-r from-gold to-gold-300 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                  style={{ width: `${heightPercent}%` }}
                >
                  {heightPercent > 15 && (
                    <span className="text-white text-xs font-semibold">
                      {item.interview_rate.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Insight */}
      <div className="mt-6 p-4 bg-gold/10 rounded-lg">
        <div className="text-sm font-medium text-gray-900 mb-1">💡 Insight</div>
        <div className="text-sm text-gray-800">
          Applications with 80%+ match score have the highest interview rates. Focus
          on quality over quantity!
        </div>
      </div>
    </GlassCard>
  );
}
