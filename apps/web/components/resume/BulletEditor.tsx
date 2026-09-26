/**
 * BulletEditor Component
 * Shows ATS-optimized bullet point suggestions and allows users to accept or edit them
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { ExperienceItem, JDInsights } from '@/lib/types';

interface BulletEditorProps {
  experiences: ExperienceItem[];
  jdInsights: JDInsights | null;
  onBulletChange: (experienceIndex: number, bulletIndex: number, newBullet: string) => void;
  onAcceptSuggestion: (key: string, suggestion: string) => void;
}

interface BulletSuggestion {
  original: string;
  suggested: string;
  reason: string;
  keywordsAdded: string[];
}

export function BulletEditor({
  experiences,
  jdInsights,
  onBulletChange,
  onAcceptSuggestion,
}: BulletEditorProps) {
  const [suggestions, setSuggestions] = useState<Map<string, BulletSuggestion>>(new Map());
  const [generating, setGenerating] = useState(false);
  const [editingBullet, setEditingBullet] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    // Generate suggestions for all bullets
    generateSuggestions();
  }, [experiences, jdInsights]);

  const generateSuggestions = async () => {
    if (!jdInsights || experiences.length === 0) return;

    setGenerating(true);
    const newSuggestions = new Map<string, BulletSuggestion>();

    // Generate suggestions for each bullet
    experiences.forEach((exp, expIdx) => {
      exp.bullets.forEach((bullet, bulletIdx) => {
        const key = `${expIdx}-${bulletIdx}`;

        // Simple keyword injection for now (in production, call AI API)
        const keywords = jdInsights.keywords_top_10 || [];
        const keywordsToAdd = keywords.filter(
          (kw) => !bullet.toLowerCase().includes(kw.toLowerCase())
        ).slice(0, 2);

        if (keywordsToAdd.length > 0) {
          // Create a simple suggestion by adding keywords naturally
          const suggested = improveBullet(bullet, keywordsToAdd);

          newSuggestions.set(key, {
            original: bullet,
            suggested,
            reason: `Added keywords: ${keywordsToAdd.join(', ')}`,
            keywordsAdded: keywordsToAdd,
          });
        }
      });
    });

    setSuggestions(newSuggestions);
    setGenerating(false);
  };

  const improveBullet = (original: string, keywords: string[]): string => {
    // Simple improvement logic - in production, use AI
    let improved = original;

    // If bullet doesn't start with action verb, keep it as is
    // Just try to naturally incorporate keywords

    // If the bullet has metrics, try to add keywords near them
    if (improved.match(/\d+%|\d+\+|increased|decreased|reduced|improved/i)) {
      // Add keyword before the metric if possible
      if (keywords.length > 0) {
        improved = improved.replace(
          /(?:increased|decreased|reduced|improved)/i,
          (match) => `${match} ${keywords[0]}`
        );
      }
    } else {
      // Add keywords at the end
      improved = `${improved} using ${keywords.join(' and ')}`;
    }

    return improved;
  };

  const handleEdit = (expIdx: number, bulletIdx: number, currentBullet: string) => {
    const key = `${expIdx}-${bulletIdx}`;
    setEditingBullet(key);
    setEditText(currentBullet);
  };

  const handleSaveEdit = (expIdx: number, bulletIdx: number) => {
    onBulletChange(expIdx, bulletIdx, editText);
    setEditingBullet(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingBullet(null);
    setEditText('');
  };

  const handleAccept = (key: string, suggestion: string) => {
    onAcceptSuggestion(key, suggestion);
    // Remove from suggestions
    const newSuggestions = new Map(suggestions);
    newSuggestions.delete(key);
    setSuggestions(newSuggestions);
  };

  if (experiences.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="mb-2">No experiences selected yet</p>
        <p className="text-sm">Go to the Select Content tab to choose experiences</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            {suggestions.size} bullet{suggestions.size !== 1 ? 's' : ''} with suggestions
          </p>
        </div>
        {generating && (
          <div className="text-xs text-blue-600">
            <span className="animate-pulse">Generating suggestions...</span>
          </div>
        )}
      </div>

      {/* Bullets by Experience */}
      {experiences.map((exp, expIdx) => (
        <div key={expIdx} className="space-y-3">
          <div className="pb-2 border-b border-gray-200">
            <h4 className="font-semibold text-sm text-gray-900">{exp.title}</h4>
            <p className="text-xs text-gray-600">{exp.company}</p>
          </div>

          {exp.bullets.map((bullet, bulletIdx) => {
            const key = `${expIdx}-${bulletIdx}`;
            const suggestion = suggestions.get(key);
            const isEditing = editingBullet === key;

            return (
              <div
                key={bulletIdx}
                className={`p-4 rounded-lg border-2 ${
                  suggestion
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {/* Original Bullet */}
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      {suggestion ? 'Current' : 'Bullet'}
                    </span>
                    {!isEditing && !suggestion && (
                      <button
                        onClick={() => handleEdit(expIdx, bulletIdx, bullet)}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(expIdx, bulletIdx)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-900">• {bullet}</p>
                  )}
                </div>

                {/* Suggestion */}
                {suggestion && !isEditing && (
                  <>
                    <div className="mb-3">
                      <div className="flex items-start justify-between mb-1">
                        <span className="text-xs font-semibold text-green-700 uppercase">
                          ATS Suggestion
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {suggestion.keywordsAdded.map((kw, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs"
                            >
                              +{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-900 font-medium">• {suggestion.suggested}</p>
                      <p className="text-xs text-gray-600 mt-1">{suggestion.reason}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(key, suggestion.suggested)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(expIdx, bulletIdx, suggestion.suggested)}
                      >
                        Edit Suggestion
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newSuggestions = new Map(suggestions);
                          newSuggestions.delete(key);
                          setSuggestions(newSuggestions);
                        }}
                      >
                        Keep Original
                      </Button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* ATS Tips */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-sm text-blue-900 mb-2">Bullet Point Best Practices</h4>
        <ul className="space-y-1 text-xs text-blue-800">
          <li>✓ Start with strong action verbs (Led, Developed, Implemented)</li>
          <li>✓ Include quantifiable metrics (%, $, numbers)</li>
          <li>✓ Incorporate job description keywords naturally</li>
          <li>✓ Keep bullets concise (1-2 lines max)</li>
          <li>✓ Focus on impact and results, not just tasks</li>
        </ul>
      </div>
    </div>
  );
}
