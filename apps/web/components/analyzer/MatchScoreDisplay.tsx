'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { MatchScoreResult } from '@/lib/types';

interface MatchScoreDisplayProps {
  matchScore: MatchScoreResult;
}

export function MatchScoreDisplay({ matchScore }: MatchScoreDisplayProps) {
  const { total_score, breakdown, matched_skills, gaps, recommendations } = matchScore;

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFitLevel = (score: number) => {
    if (score >= 85) return 'Strong Fit';
    if (score >= 70) return 'Good Fit';
    if (score >= 60) return 'Moderate Fit';
    return 'Stretch Role';
  };

  return (
    <Card className="bg-gradient-to-br from-gold-100 to-gold-200 border-gold-300 shadow-gold">
      <CardHeader>
        <CardTitle className="text-gold-900">Match Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="text-center">
          <div
            className={`text-6xl font-bold ${getScoreColor(total_score)}`}
          >
            {total_score}
            <span className="text-2xl text-gray-400">/100</span>
          </div>
          <div className="text-lg font-medium text-gray-600 mt-2">
            {getFitLevel(total_score)}
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="p-4 bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl border border-gold-200 shadow-sm">
          <h3 className="font-semibold text-gold-800 mb-3">Score Breakdown</h3>

          <ScoreBar
            label="Skill Overlap"
            score={breakdown.skill_overlap}
            maxScore={50}
          />
          <ScoreBar
            label="Must-Have Coverage"
            score={breakdown.must_have_coverage}
            maxScore={20}
          />
          <ScoreBar
            label="Seniority Fit"
            score={breakdown.seniority_fit}
            maxScore={15}
          />
          <ScoreBar
            label="Evidence Score"
            score={breakdown.evidence_score}
            maxScore={15}
          />
        </div>

        {/* Matched Skills */}
        {matched_skills.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl border border-gold-300 shadow-sm">
            <h3 className="font-semibold text-gold-800 mb-3">
              Matched Skills ({matched_skills.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {matched_skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gold-200 text-gold-800 rounded-full text-sm font-medium"
                >
                  ✓ {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skill Gaps */}
        {gaps.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-gold-200 to-gold-300 rounded-xl border border-gold-400 shadow-sm">
            <h3 className="font-semibold text-gold-800 mb-3">
              Skill Gaps ({gaps.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {gaps.map((gap, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gold-300 text-gold-800 rounded-full text-sm font-medium"
                >
                  ✗ {gap}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-gold-300 to-gold-400 rounded-xl border border-gold-500 shadow-sm">
            <h3 className="font-semibold text-gold-800 mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-gold-800 flex items-start">
                  <span className="text-gold-600 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ScoreBarProps {
  label: string;
  score: number;
  maxScore: number;
}

function ScoreBar({ label, score, maxScore }: ScoreBarProps) {
  const percentage = (score / maxScore) * 100;
  const getColor = () => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">
          {score.toFixed(0)}/{maxScore}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${getColor()} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
