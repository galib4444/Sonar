'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';

interface FinancialProjectionsProps {
  data: {
    total_potential_earnings: number;
    avg_target_salary: number;
    highest_offer?: number;
  };
}

export function FinancialProjections({ data }: FinancialProjectionsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <GlassCard variant="cream" className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        💰 Financial Projections
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Potential */}
        <div className="bg-white/70 rounded-lg p-4">
          <div className="text-sm text-gray-800 mb-1">Total Potential Earnings</div>
          <div className="text-3xl font-bold text-gold mb-1">
            {formatCurrency(data.total_potential_earnings)}
          </div>
          <div className="text-xs text-gray-700">
            Sum of all target salaries
          </div>
        </div>

        {/* Average Target */}
        <div className="bg-white/70 rounded-lg p-4">
          <div className="text-sm text-gray-800 mb-1">Average Target Salary</div>
          <div className="text-3xl font-bold text-gold-200 mb-1">
            {formatCurrency(data.avg_target_salary)}
          </div>
          <div className="text-xs text-gray-700">
            Across all applications
          </div>
        </div>

        {/* Highest Offer */}
        <div className="bg-white/70 rounded-lg p-4">
          <div className="text-sm text-gray-800 mb-1">Highest Offer</div>
          <div className="text-3xl font-bold text-gold-300 mb-1">
            {data.highest_offer
              ? formatCurrency(data.highest_offer)
              : 'No offers yet'}
          </div>
          <div className="text-xs text-gray-700">
            {data.highest_offer ? 'Received' : 'Keep applying!'}
          </div>
        </div>
      </div>

      {/* Income Mobility Projection */}
      <div className="mt-6 p-4 bg-white/70 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-3">📈 Income Mobility</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-800">Current Baseline</span>
            <span className="text-sm font-medium text-gold">$100,000</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-800">Target Average</span>
            <span className="text-sm font-medium text-gold-200">
              {formatCurrency(data.avg_target_salary)}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm font-semibold text-gray-900">
              Potential Increase
            </span>
            <span className="text-lg font-bold text-gold">
              +{((data.avg_target_salary - 100000) / 100000 * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
