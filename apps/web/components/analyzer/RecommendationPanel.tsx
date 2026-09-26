/**
 * RecommendationPanel Component
 * Displays AI-powered recommendations with neon animations and interactive actions
 */

'use client';

import React, { useState } from 'react';
import { NeonCard, NeonBadge } from '@/components/ui/neon-card';
import { ChevronDown, ChevronUp, Plus, Minus, X, Lightbulb, AlertTriangle, Info } from 'lucide-react';

export interface Recommendation {
  id: string;
  type: 'add_experience' | 'add_skill' | 'remove_section' | 'add_keyword' | 'enhance_bullet';
  priority: 'high' | 'medium' | 'low';
  title: string;
  reason: string;
  matchScore: number;
  content?: string; // The content to add/modify
  targetSection?: string; // Which section to modify
  action: 'add' | 'replace' | 'remove';
}

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  onAccept: (recommendation: Recommendation) => void;
  onDismiss: (id: string) => void;
  className?: string;
}

export function RecommendationPanel({
  recommendations,
  onAccept,
  onDismiss,
  className,
}: RecommendationPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Group recommendations by priority
  const highPriority = recommendations.filter((r) => r.priority === 'high');
  const mediumPriority = recommendations.filter((r) => r.priority === 'medium');
  const lowPriority = recommendations.filter((r) => r.priority === 'low');

  const filteredRecommendations =
    activeSection === 'all'
      ? recommendations
      : recommendations.filter((r) => r.priority === activeSection);

  const getIcon = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <Lightbulb size={18} className="text-cyan-400" />;
      case 'medium':
        return <Info size={18} className="text-purple-400" />;
      case 'low':
        return <AlertTriangle size={18} className="text-gray-400" />;
    }
  };

  const getActionIcon = (action: 'add' | 'replace' | 'remove') => {
    switch (action) {
      case 'add':
        return <Plus size={16} />;
      case 'replace':
        return <Plus size={16} />;
      case 'remove':
        return <Minus size={16} />;
    }
  };

  const getActionText = (action: 'add' | 'replace' | 'remove') => {
    switch (action) {
      case 'add':
        return 'Add to Resume';
      case 'replace':
        return 'Replace Section';
      case 'remove':
        return 'Remove';
    }
  };

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`bg-black/40 border border-gold-500/30 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 bg-black/60 border-b border-gold-500/30 cursor-pointer hover:bg-black/70 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <Lightbulb size={24} className="text-gold-400" />
          <div>
            <h3 className="text-lg font-bold text-gold-400">AI Recommendations</h3>
            <p className="text-sm text-gray-400">
              {recommendations.length} suggestions to improve your resume
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          {isCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4">
          {/* Filter Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === 'all'
                  ? 'bg-gold-500/20 text-gold-400 border border-gold-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              All ({recommendations.length})
            </button>
            <button
              onClick={() => setActiveSection('high')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === 'high'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              High Priority ({highPriority.length})
            </button>
            <button
              onClick={() => setActiveSection('medium')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === 'medium'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              Medium ({mediumPriority.length})
            </button>
            <button
              onClick={() => setActiveSection('low')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeSection === 'low'
                  ? 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              Low ({lowPriority.length})
            </button>
          </div>

          {/* Recommendations List */}
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredRecommendations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No recommendations in this category
              </div>
            ) : (
              filteredRecommendations.map((rec) => (
                <NeonCard key={rec.id} priority={rec.priority}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        {getIcon(rec.priority)}
                        <h4 className="font-semibold text-white">{rec.title}</h4>
                        <NeonBadge priority={rec.priority}>
                          {rec.matchScore}% match
                        </NeonBadge>
                      </div>

                      {/* Reason */}
                      <p className="text-sm text-gray-300 mb-3">{rec.reason}</p>

                      {/* Content Preview */}
                      {rec.content && (
                        <div className="bg-black/40 border border-white/10 rounded p-3 mb-3">
                          <p className="text-xs text-gray-400 mb-1">Suggested content:</p>
                          <p className="text-sm text-gray-200">{rec.content}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => onAccept(rec)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            rec.priority === 'high'
                              ? 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50'
                              : rec.priority === 'medium'
                              ? 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/50'
                              : 'bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 border border-gray-500/50'
                          }`}
                        >
                          {getActionIcon(rec.action)}
                          {getActionText(rec.action)}
                        </button>

                        <button
                          onClick={() => onDismiss(rec.id)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 transition-all"
                        >
                          <X size={16} />
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </NeonCard>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
