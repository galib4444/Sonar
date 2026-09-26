/**
 * Edit Page - Rich Text Resume Editor with Split View
 * Features: TipTap editor, drag-and-drop sections, auto-save, live preview
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { GoldButton } from '@/components/ui/gold-button';
import { SortableSections, ResumeSection } from '@/components/resume/SortableSections';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Save, Download, Eye, EyeOff, Plus, CheckCircle } from 'lucide-react';
import type { UserProfile, JDInsights, ResumeSections } from '@/lib/types';

export default function EditPage() {
  const router = useRouter();

  // State
  const [jdInsights, setJdInsights] = useState<JDInsights | null>(null);
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [originalResume, setOriginalResume] = useState<ResumeSections | null>(null);
  const [selectedFormat] = useState<'classic' | 'modern' | 'technical'>('classic');
  const [showPreview, setShowPreview] = useState(true);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto-save hook
  const { lastSaved, isSaving, saveNow } = useAutoSave({
    data: sections,
    onSave: handleAutoSave,
    interval: 30000, // 30 seconds
    enabled: sections.length > 0,
  });

  // Load data on mount
  useEffect(() => {
    loadResumeData();
  }, []);

  async function loadResumeData() {
    try {
      const storedProfile = sessionStorage.getItem('user_profile');
      const storedInsights = sessionStorage.getItem('jd_insights');
      const storedResume = sessionStorage.getItem('tailored_resume');

      if (!storedProfile) {
        router.push('/dashboard');
        return;
      }

      const profile = JSON.parse(storedProfile);

      if (storedInsights) {
        setJdInsights(JSON.parse(storedInsights));
      }

      // Initialize sections from stored resume or profile
      if (storedResume) {
        const resume = JSON.parse(storedResume);
        setOriginalResume(resume);
        initializeSectionsFromResume(resume);
      } else {
        initializeSectionsFromProfile(profile);
      }
    } catch (error) {
      console.error('Failed to load resume data:', error);
    } finally {
      setLoading(false);
    }
  }

  function initializeSectionsFromProfile(profile: UserProfile) {
    const newSections: ResumeSection[] = [];

    // Summary section
    if (profile.summary) {
      newSections.push({
        id: 'summary',
        name: 'Professional Summary',
        content: `<p>${profile.summary}</p>`,
      });
    }

    // Experience section
    if (profile.experience && profile.experience.length > 0) {
      const experienceHTML = profile.experience
        .map(
          (exp) =>
            `<h3>${exp.title} | ${exp.company}</h3>
            <p>${exp.location} | ${exp.start_date} - ${exp.end_date || 'Present'}</p>
            <ul>
              ${exp.bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
            </ul>`
        )
        .join('');

      newSections.push({
        id: 'experience',
        name: 'Work Experience',
        content: experienceHTML,
      });
    }

    // Education section
    if (profile.education && profile.education.length > 0) {
      const educationHTML = profile.education
        .map(
          (edu) =>
            `<h3>${edu.degree} | ${edu.school}</h3>
            <p>Graduated: ${edu.graduation_year}</p>
            ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ''}`
        )
        .join('');

      newSections.push({
        id: 'education',
        name: 'Education',
        content: educationHTML,
      });
    }

    // Skills section
    if (profile.skills && profile.skills.length > 0) {
      const skillsHTML = `<p>${profile.skills.join(', ')}</p>`;
      newSections.push({
        id: 'skills',
        name: 'Skills',
        content: skillsHTML,
      });
    }

    // Projects section
    if (profile.projects && profile.projects.length > 0) {
      const projectsHTML = profile.projects
        .map(
          (proj) =>
            `<h3>${proj.name}</h3>
            <p>${proj.description || ''}</p>
            ${proj.technologies ? `<p><strong>Technologies:</strong> ${proj.technologies.join(', ')}</p>` : ''}`
        )
        .join('');

      newSections.push({
        id: 'projects',
        name: 'Projects',
        content: projectsHTML,
      });
    }

    setSections(newSections);
  }

  function initializeSectionsFromResume(resume: ResumeSections) {
    const newSections: ResumeSection[] = [];

    // Summary section
    if (resume.summary) {
      newSections.push({
        id: 'summary',
        name: 'Professional Summary',
        content: `<p>${resume.summary}</p>`,
      });
    }

    // Experience section
    if (resume.experience && resume.experience.length > 0) {
      const experienceHTML = resume.experience
        .map(
          (exp) =>
            `<h3>${exp.title} | ${exp.company || ''}</h3>
            <p>${exp.location || ''} | ${exp.start_date} - ${exp.end_date || 'Present'}</p>
            <ul>
              ${exp.bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
            </ul>`
        )
        .join('');

      newSections.push({
        id: 'experience',
        name: 'Work Experience',
        content: experienceHTML,
      });
    }

    // Projects section
    if (resume.projects && resume.projects.length > 0) {
      const projectsHTML = resume.projects
        .map(
          (proj) =>
            `<h3>${proj.name}</h3>
            ${proj.link ? `<p><a href="${proj.link}">${proj.link}</a></p>` : ''}
            <ul>
              ${proj.bullets.map((bullet) => `<li>${bullet}</li>`).join('')}
            </ul>`
        )
        .join('');

      newSections.push({
        id: 'projects',
        name: 'Projects',
        content: projectsHTML,
      });
    }

    // Education section
    if (resume.education && resume.education.length > 0) {
      const educationHTML = resume.education
        .map(
          (edu) =>
            `<h3>${edu.degree} | ${edu.school}</h3>
            <p>Graduated: ${edu.graduation_year}</p>
            ${edu.gpa ? `<p>GPA: ${edu.gpa}</p>` : ''}`
        )
        .join('');

      newSections.push({
        id: 'education',
        name: 'Education',
        content: educationHTML,
      });
    }

    // Skills section
    if (resume.skills) {
      const skillsArray = Array.isArray(resume.skills)
        ? resume.skills
        : resume.skills.technical || [];
      const skillsHTML = `<p>${skillsArray.join(', ')}</p>`;
      newSections.push({
        id: 'skills',
        name: 'Skills',
        content: skillsHTML,
      });
    }

    // Certifications section
    if (resume.certifications && resume.certifications.length > 0) {
      const certsHTML = resume.certifications
        .map(
          (cert) =>
            `<h3>${cert.name}</h3>
            <p>${cert.issuer} | ${cert.date}</p>`
        )
        .join('');

      newSections.push({
        id: 'certifications',
        name: 'Certifications',
        content: certsHTML,
      });
    }

    setSections(newSections);
  }

  async function handleAutoSave(data: ResumeSection[]) {
    console.log('Auto-saving resume...', data);
    // Save to sessionStorage for now
    sessionStorage.setItem('edited_resume_sections', JSON.stringify(data));
  }

  function handleSectionContentChange(id: string, content: string) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, content } : section
      )
    );
  }

  function handleSectionsReorder(reorderedSections: ResumeSection[]) {
    setSections(reorderedSections);
  }

  function handleDeleteSection(id: string) {
    setSections((prev) => prev.filter((section) => section.id !== id));
  }

  function handleAddSection() {
    const newSection: ResumeSection = {
      id: `custom-${Date.now()}`,
      name: 'New Section',
      content: '<p>Start typing...</p>',
    };
    setSections((prev) => [...prev, newSection]);
  }

  async function handleDownloadPDF() {
    if (!originalResume) {
      alert('No resume data available');
      return;
    }

    setDownloadingPDF(true);
    try {
      // Use the original resume structure (edits are already in sections,
      // but for PDF we'll use the structured format which is more reliable)
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_sections: originalResume,
          metadata: {
            company: jdInsights?.company,
          },
          format: selectedFormat,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const data = await response.json();

      // Download the PDF
      const link = document.createElement('a');
      link.href = data.pdf_url;
      link.download = data.filename || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show save prompt after successful download
      setShowSavePrompt(true);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  }

  function handleSaveResume() {
    if (!originalResume) {
      alert('No resume data to save');
      return;
    }

    try {
      // Get existing saved resumes
      const existingResumes = JSON.parse(sessionStorage.getItem('saved_resumes') || '[]');

      // Create new saved resume entry
      const savedResume = {
        id: Date.now().toString(),
        name: `Resume - ${jdInsights?.company || 'Custom'} - ${new Date().toLocaleDateString()}`,
        resume_sections: originalResume,
        jd_insights: jdInsights,
        saved_at: new Date().toISOString(),
        format: selectedFormat,
      };

      // Add to array
      existingResumes.push(savedResume);

      // Save back to sessionStorage
      sessionStorage.setItem('saved_resumes', JSON.stringify(existingResumes));

      // Show success
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Close save prompt if open
      setShowSavePrompt(false);
    } catch (error) {
      console.error('Failed to save resume:', error);
      alert('Failed to save resume. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gold-400 mb-2">Resume Editor</h1>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              {isSaving && (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gold-500"></div>
                  Saving...
                </span>
              )}
              {lastSaved && !isSaving && (
                <span className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={16} />
                  Saved {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-gray-300"
              title={showPreview ? 'Hide Preview' : 'Show Preview'}
            >
              {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>

            <button
              onClick={saveNow}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-gray-300 disabled:opacity-50"
              title="Auto-save to session"
            >
              <Save size={18} />
              Save Now
            </button>

            <GoldButton onClick={handleSaveResume} className="flex items-center gap-2">
              <CheckCircle size={18} />
              Save Resume
            </GoldButton>

            <GoldButton
              onClick={handleDownloadPDF}
              disabled={downloadingPDF}
              className="flex items-center gap-2"
            >
              {downloadingPDF ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download PDF
                </>
              )}
            </GoldButton>
          </div>
        </div>

        {/* Split View Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Pane (Left) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-300">Edit Sections</h2>
              <button
                onClick={handleAddSection}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500/20 hover:bg-gold-500/30 transition-colors text-gold-400"
              >
                <Plus size={18} />
                Add Section
              </button>
            </div>

            <SortableSections
              sections={sections}
              onSectionsChange={handleSectionsReorder}
              onSectionContentChange={handleSectionContentChange}
              onDeleteSection={handleDeleteSection}
            />
          </div>

          {/* Preview Pane (Right) */}
          {showPreview && (
            <div className="lg:sticky lg:top-6 h-fit">
              <GlassCard className="p-6">
                <h2 className="text-xl font-semibold text-gray-300 mb-4">Live Preview</h2>
                <div className="bg-white rounded-lg p-8 shadow-xl">
                  {/* Render preview based on sections */}
                  <div className="space-y-6 text-black">
                    {sections.map((section) => (
                      <div key={section.id}>
                        <h3 className="text-lg font-bold mb-2 uppercase border-b-2 border-black pb-1">
                          {section.name}
                        </h3>
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: section.content }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>

        {/* Success Toast */}
        {saveSuccess && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
            <GlassCard className="p-4 bg-green-500/20 border-green-500/50">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-400" size={24} />
                <div>
                  <p className="font-semibold text-green-300">Resume Saved!</p>
                  <p className="text-sm text-green-200">
                    Your resume has been saved to your library
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}

        {/* Save Prompt Modal */}
        {showSavePrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <GlassCard className="max-w-md w-full mx-4 p-6">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-gold-500/20 rounded-full">
                    <CheckCircle className="text-gold-400" size={40} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gold-400 mb-2">
                  PDF Downloaded!
                </h3>
                <p className="text-gray-300 mb-6">
                  Would you like to save this version to your resume library for future use?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowSavePrompt(false)}
                    className="px-6 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-gray-300"
                  >
                    Skip
                  </button>
                  <GoldButton onClick={handleSaveResume} className="px-6 py-2">
                    Save to Library
                  </GoldButton>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
