/**
 * SaveResumeModal Component
 * Modal that appears after PDF download to save resume with metadata
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Tag } from 'lucide-react';
import { GoldButton } from '@/components/ui/gold-button';
import { generateSuggestedFilename } from '@/lib/utils/filename-generator';
import type { UserProfile, JDInsights } from '@/lib/types';

interface SaveResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (metadata: ResumeMetadata) => Promise<void>;
  userProfile?: UserProfile;
  jdInsights?: JDInsights;
}

export interface ResumeMetadata {
  firstName: string;
  lastName: string;
  jobTitle: string;
  companyName: string;
  tags: string[];
  filename: string;
}

export function SaveResumeModal({
  isOpen,
  onClose,
  onSave,
  userProfile,
  jdInsights,
}: SaveResumeModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [suggestedFilename, setSuggestedFilename] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize fields when modal opens
  useEffect(() => {
    if (isOpen && userProfile) {
      // Extract name parts
      const nameParts = userProfile.name?.split(' ') || [];
      const first = nameParts[0] || '';
      const last = nameParts[nameParts.length - 1] || '';

      setFirstName(first);
      setLastName(last);
    }

    if (isOpen && jdInsights) {
      setJobTitle(jdInsights.title || '');
      setCompanyName(jdInsights.company || '');
    }
  }, [isOpen, userProfile, jdInsights]);

  // Update suggested filename when fields change
  useEffect(() => {
    if (firstName && lastName) {
      const filename = generateSuggestedFilename(firstName, lastName, jobTitle);
      setSuggestedFilename(filename);
    }
  }, [firstName, lastName, jobTitle]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!firstName || !lastName) {
      alert('Please enter first and last name');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        firstName,
        lastName,
        jobTitle,
        companyName,
        tags,
        filename: suggestedFilename,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save resume:', error);
      alert('Failed to save resume. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-gold-500/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gold-400">Save Resume for Future Use</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 bg-black/40 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
              placeholder="Senior Software Engineer"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Company</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
              placeholder="Google Inc"
            />
          </div>

          {/* Suggested Filename */}
          <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-1">Save as:</p>
            <p className="text-gold-400 font-mono">{suggestedFilename}</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
              <Tag size={16} />
              Tags (optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 bg-black/40 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
                placeholder="e.g., Software, Engineering"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/50 rounded-lg text-gold-400 transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gold-500/20 border border-gold-500/50 rounded-full text-sm text-gold-400"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleSkip}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors disabled:opacity-50"
          >
            Skip
          </button>
          <GoldButton
            onClick={handleSave}
            disabled={saving || !firstName || !lastName}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Resume
              </>
            )}
          </GoldButton>
        </div>
      </div>
    </div>
  );
}
