/**
 * FormatSelector Component
 * Allows users to choose between different resume formats
 */

'use client';

import React from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { GoldButton } from '@/components/ui/gold-button';
import { Check, FileText } from 'lucide-react';

export type ResumeFormat = 'classic' | 'modern' | 'technical';

interface FormatOption {
  id: ResumeFormat;
  name: string;
  description: string;
  features: string[];
  preview: string;
  bestFor: string;
}

const formatOptions: FormatOption[] = [
  {
    id: 'classic',
    name: 'Classic Professional',
    description: 'Traditional single-column layout with horizontal lines',
    features: ['Helvetica font', 'Bold section headers', 'Horizontal dividers', 'Centered header'],
    preview: '/format-previews/classic.png',
    bestFor: 'Traditional industries, corporate roles',
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    description: 'Clean design with generous white space and subtle accents',
    features: ['Clean layout', 'Tag-style skills', 'Generous spacing', 'Modern typography'],
    preview: '/format-previews/modern.png',
    bestFor: 'Startups, creative roles, modern companies',
  },
  {
    id: 'technical',
    name: 'Technical/Engineering',
    description: 'Dense, skills-first layout optimized for technical roles',
    features: ['Courier font', 'Skills at top', 'Dense information', 'Black headers'],
    preview: '/format-previews/technical.png',
    bestFor: 'Engineering, software development, technical roles',
  },
];

interface FormatSelectorProps {
  selectedFormat: ResumeFormat;
  onFormatChange: (format: ResumeFormat) => void;
  onApply?: () => void;
  className?: string;
}

export function FormatSelector({
  selectedFormat,
  onFormatChange,
  onApply,
  className,
}: FormatSelectorProps) {
  return (
    <div className={className}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gold-400 mb-2">Choose Resume Format</h3>
        <p className="text-gray-400">
          All formats are 100% ATS-compliant and optimized for applicant tracking systems
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {formatOptions.map((format) => (
          <div
            key={format.id}
            onClick={() => onFormatChange(format.id)}
          >
            <GlassCard
              className={`p-6 cursor-pointer transition-all hover:scale-[1.02] ${
                selectedFormat === format.id
                  ? 'border-2 border-gold-500 bg-gold-500/10'
                  : 'border border-white/10 hover:border-gold-500/50'
              }`}
            >
            {/* Selection Indicator */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-white mb-1">{format.name}</h4>
                <p className="text-sm text-gray-400">{format.description}</p>
              </div>
              {selectedFormat === format.id && (
                <div className="flex-shrink-0 ml-3 w-6 h-6 rounded-full bg-gold-500 flex items-center justify-center">
                  <Check size={16} className="text-black" />
                </div>
              )}
            </div>

            {/* Preview Thumbnail */}
            <div className="mb-4 aspect-[8.5/11] bg-white border border-white/10 rounded-lg overflow-hidden">
              {/* Visual Preview */}
              {format.id === 'classic' && (
                <div className="p-3 h-full text-black" style={{ fontSize: '4px', lineHeight: '1.2' }}>
                  <div className="text-center mb-2 pb-1 border-b-2 border-black">
                    <div className="font-bold mb-0.5" style={{ fontSize: '5px' }}>JOHN DOE</div>
                    <div style={{ fontSize: '3px' }}>email@example.com | (555) 123-4567</div>
                  </div>
                  <div className="mb-2">
                    <div className="font-bold mb-0.5 text-center">EXPERIENCE</div>
                    <div className="space-y-1">
                      <div>
                        <div className="font-bold" style={{ fontSize: '4px' }}>Senior Engineer</div>
                        <div style={{ fontSize: '3px' }}>Company • 2020-Present</div>
                        <div style={{ fontSize: '3px', marginLeft: '2px' }}>• Achievement line one</div>
                        <div style={{ fontSize: '3px', marginLeft: '2px' }}>• Achievement line two</div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="font-bold mb-0.5 text-center">EDUCATION</div>
                    <div style={{ fontSize: '3px' }}>Bachelor&apos;s Degree</div>
                    <div style={{ fontSize: '3px' }}>University Name</div>
                  </div>
                  <div>
                    <div className="font-bold mb-0.5 text-center">SKILLS</div>
                    <div style={{ fontSize: '3px' }}>JavaScript, React, Node.js, Python</div>
                  </div>
                </div>
              )}
              {format.id === 'modern' && (
                <div className="p-3 h-full text-black" style={{ fontSize: '4px', lineHeight: '1.4' }}>
                  <div className="mb-2">
                    <div className="font-bold mb-0.5" style={{ fontSize: '6px', letterSpacing: '0.3px' }}>John Doe</div>
                    <div style={{ fontSize: '3px' }}>email@example.com • (555) 123-4567</div>
                  </div>
                  <div className="mb-2">
                    <div className="font-bold mb-0.5" style={{ fontSize: '4px', color: '#333' }}>EXPERIENCE</div>
                    <div className="space-y-1">
                      <div>
                        <div className="flex justify-between">
                          <div className="font-bold" style={{ fontSize: '4px' }}>Senior Engineer</div>
                          <div style={{ fontSize: '3px' }}>2020-Present</div>
                        </div>
                        <div style={{ fontSize: '3px', color: '#555' }}>Company Name</div>
                        <div style={{ fontSize: '3px', marginLeft: '2px', marginTop: '1px' }}>• Achievement one</div>
                        <div style={{ fontSize: '3px', marginLeft: '2px' }}>• Achievement two</div>
                      </div>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="font-bold mb-0.5" style={{ fontSize: '4px', color: '#333' }}>SKILLS</div>
                    <div className="flex flex-wrap gap-0.5">
                      <span className="bg-gray-200 px-1 rounded" style={{ fontSize: '3px' }}>JavaScript</span>
                      <span className="bg-gray-200 px-1 rounded" style={{ fontSize: '3px' }}>React</span>
                      <span className="bg-gray-200 px-1 rounded" style={{ fontSize: '3px' }}>Python</span>
                    </div>
                  </div>
                </div>
              )}
              {format.id === 'technical' && (
                <div className="p-3 h-full text-black" style={{ fontSize: '4px', lineHeight: '1.2', fontFamily: 'monospace' }}>
                  <div className="mb-2 pb-1 border-b-2 border-black">
                    <div className="font-bold" style={{ fontSize: '5px' }}>JOHN DOE</div>
                    <div style={{ fontSize: '3px' }}>email@example.com | github.com/user</div>
                  </div>
                  <div className="mb-2">
                    <div className="bg-black text-white px-1 font-bold mb-0.5" style={{ fontSize: '4px' }}>SKILLS</div>
                    <div style={{ fontSize: '3px' }}>
                      <span className="font-bold">Languages:</span> Python, C++, JavaScript
                    </div>
                    <div style={{ fontSize: '3px' }}>
                      <span className="font-bold">Tools:</span> Docker, Git, AWS
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="bg-black text-white px-1 font-bold mb-0.5" style={{ fontSize: '4px' }}>EXPERIENCE</div>
                    <div className="space-y-1">
                      <div>
                        <div className="flex justify-between">
                          <div className="font-bold" style={{ fontSize: '4px' }}>Software Engineer</div>
                          <div style={{ fontSize: '3px' }}>2020-Present</div>
                        </div>
                        <div style={{ fontSize: '3px', marginLeft: '2px' }}>&gt; Built scalable systems</div>
                        <div style={{ fontSize: '3px', marginLeft: '2px' }}>&gt; Optimized performance by 40%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 mb-2">Features:</p>
              <ul className="space-y-1">
                {format.features.map((feature, idx) => (
                  <li key={idx} className="text-xs text-gray-300 flex items-center gap-2">
                    <span className="w-1 h-1 bg-gold-500 rounded-full"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Best For */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-gray-400">
                <span className="font-semibold">Best for:</span> {format.bestFor}
              </p>
            </div>
          </GlassCard>
          </div>
        ))}
      </div>

      {onApply && (
        <div className="flex justify-end">
          <GoldButton onClick={onApply} className="px-8">
            Apply Format & Regenerate PDF
          </GoldButton>
        </div>
      )}

      {/* Format Comparison Info */}
      <GlassCard className="mt-6 p-4 bg-blue-500/10 border-blue-500/30">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <FileText size={16} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <h5 className="text-sm font-semibold text-blue-300 mb-1">
              All formats pass ATS screening
            </h5>
            <p className="text-xs text-blue-200/80">
              Each template is designed to be parsed correctly by Applicant Tracking Systems.
              They all use ATS-friendly fonts, single-column layouts, and proper heading structure.
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
