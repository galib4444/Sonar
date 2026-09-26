'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { ATSValidationResult } from '@/lib/types';

interface ATSChecklistProps {
  atsValidation: ATSValidationResult;
}

export function ATSChecklist({ atsValidation }: ATSChecklistProps) {
  const { valid, score, checks, issues, warnings, recommendations } = atsValidation;

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="bg-gradient-to-br from-gold-100 to-gold-200 border-gold-300 shadow-gold">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gold-900">
          <span>ATS Compliance</span>
          <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
            {score}
            <span className="text-lg text-gold-700">/100</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div
          className={`p-4 rounded-lg border-2 ${
            valid
              ? 'bg-green-50 border-green-500'
              : 'bg-red-50 border-red-500'
          }`}
        >
          <div className="text-center">
            {valid ? (
              <>
                <div className="text-4xl mb-2">✓</div>
                <div className="font-semibold text-green-900">
                  ATS Compliant
                </div>
                <div className="text-sm text-green-700">
                  Resume meets all ATS requirements
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">⚠</div>
                <div className="font-semibold text-red-900">
                  Needs Improvements
                </div>
                <div className="text-sm text-red-700">
                  {issues.length} critical issue{issues.length !== 1 ? 's' : ''} found
                </div>
              </>
            )}
          </div>
        </div>

        {/* Detailed Checks */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gold-800 mb-4">Compliance Checks</h3>

          {/* Layout Checks */}
          <div className="p-4 bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl border border-gold-200 shadow-sm">
            <CheckSection title="Layout">
              <CheckItem
                label="Single Column"
                passed={checks.layout.single_column}
              />
              <CheckItem label="No Tables" passed={checks.layout.no_tables} />
              <CheckItem
                label="No Text Boxes"
                passed={checks.layout.no_text_boxes}
              />
              <CheckItem label="No Images" passed={checks.layout.no_images} />
            </CheckSection>
          </div>

          {/* Font Checks */}
          <div className="p-4 bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl border border-gold-300 shadow-sm">
            <CheckSection title="Fonts">
              <CheckItem
                label="Approved Fonts"
                passed={checks.fonts.approved_fonts}
              />
              <CheckItem
                label="Body Size (10.5-11.5pt)"
                passed={checks.fonts.body_size_ok}
              />
              <CheckItem
                label="Header Size (12-14pt)"
                passed={checks.fonts.header_size_ok}
              />
            </CheckSection>
          </div>

          {/* Section Checks */}
          <div className="p-4 bg-gradient-to-br from-gold-200 to-gold-300 rounded-xl border border-gold-400 shadow-sm">
            <CheckSection title="Sections">
              <CheckItem
                label="Standard Headings"
                passed={checks.sections.standard_headings}
              />
              <CheckItem
                label="Required Sections Present"
                passed={checks.sections.required_present}
              />
            </CheckSection>
          </div>

          {/* Keyword Checks */}
          <div className="p-4 bg-gradient-to-br from-gold-300 to-gold-400 rounded-xl border border-gold-500 shadow-sm">
            <CheckSection title="Keywords">
              <CheckItem
                label={`Coverage (${checks.keywords.coverage}/10)`}
                passed={checks.keywords.coverage >= 8}
              />
              <CheckItem
                label="Keyword Density OK"
                passed={checks.keywords.density_ok}
              />
              <CheckItem
                label="Proper Placement"
                passed={checks.keywords.placement_ok}
              />
            </CheckSection>
          </div>

          {/* Page Count */}
          <div className="p-4 bg-gradient-to-br from-gold-400 to-gold-500 rounded-xl border border-gold-600 shadow-sm">
            <CheckSection title="Page Count">
              <CheckItem
                label={`One Page (${checks.page_count.line_count} lines, max 52)`}
                passed={checks.page_count.is_one_page}
              />
            </CheckSection>
          </div>
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div>
            <h3 className="font-semibold text-red-900 mb-2">
              Critical Issues ({issues.length})
            </h3>
            <ul className="space-y-1">
              {issues.map((issue, index) => (
                <li
                  key={index}
                  className="text-sm text-red-700 flex items-start"
                >
                  <span className="mr-2">✗</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {warnings.length > 0 && (
          <div>
            <h3 className="font-semibold text-yellow-900 mb-2">
              Warnings ({warnings.length})
            </h3>
            <ul className="space-y-1">
              {warnings.map((warning, index) => (
                <li
                  key={index}
                  className="text-sm text-yellow-700 flex items-start"
                >
                  <span className="mr-2">⚠</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">
              Recommendations
            </h3>
            <ul className="space-y-1">
              {recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="text-sm text-blue-700 flex items-start"
                >
                  <span className="mr-2">💡</span>
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

interface CheckSectionProps {
  title: string;
  children: React.ReactNode;
}

function CheckSection({ title, children }: CheckSectionProps) {
  return (
    <div>
      <div className="font-semibold text-gold-800 mb-3">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface CheckItemProps {
  label: string;
  passed: boolean;
}

function CheckItem({ label, passed }: CheckItemProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gold-800">{label}</span>
      <span className={passed ? 'text-gold-600' : 'text-red-600'}>
        {passed ? '✓' : '✗'}
      </span>
    </div>
  );
}
