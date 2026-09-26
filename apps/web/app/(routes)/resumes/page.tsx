/**
 * Resume Library Page
 * View, search, filter, and manage saved resumes from sessionStorage
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import {
  Search,
  Download,
  Copy,
  Trash2,
  Calendar,
  Building2,
  Briefcase,
  FileText,
  Eye,
} from 'lucide-react';
import type { ResumeSections, JDInsights } from '@/lib/types';

interface SavedResume {
  id: string;
  name: string;
  resume_sections: ResumeSections;
  jd_insights: JDInsights | null;
  saved_at: string;
  format: 'classic' | 'modern' | 'technical';
}

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'name'>('date');

  useEffect(() => {
    loadResumes();
  }, [sortBy]);

  function loadResumes() {
    setLoading(true);
    try {
      // Load from sessionStorage
      const savedResumesJson = sessionStorage.getItem('saved_resumes');
      let loadedResumes: SavedResume[] = savedResumesJson ? JSON.parse(savedResumesJson) : [];

      // Sort resumes
      loadedResumes = sortResumes(loadedResumes, sortBy);

      setResumes(loadedResumes);
    } catch (error) {
      console.error('Failed to load resumes:', error);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }

  function sortResumes(resumeList: SavedResume[], sortType: 'date' | 'company' | 'name'): SavedResume[] {
    const sorted = [...resumeList];
    switch (sortType) {
      case 'date':
        return sorted.sort((a, b) => new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime());
      case 'company':
        return sorted.sort((a, b) => {
          const companyA = a.jd_insights?.company || '';
          const companyB = b.jd_insights?.company || '';
          return companyA.localeCompare(companyB);
        });
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }

  function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      // Get existing resumes from sessionStorage
      const savedResumesJson = sessionStorage.getItem('saved_resumes');
      const existingResumes: SavedResume[] = savedResumesJson ? JSON.parse(savedResumesJson) : [];

      // Filter out the resume to delete
      const updatedResumes = existingResumes.filter((r) => r.id !== id);

      // Save back to sessionStorage
      sessionStorage.setItem('saved_resumes', JSON.stringify(updatedResumes));

      // Reload resumes
      loadResumes();
    } catch (error) {
      console.error('Failed to delete resume:', error);
      alert('Failed to delete resume');
    }
  }

  function handleDuplicate(id: string) {
    try {
      // Get existing resumes from sessionStorage
      const savedResumesJson = sessionStorage.getItem('saved_resumes');
      const existingResumes: SavedResume[] = savedResumesJson ? JSON.parse(savedResumesJson) : [];

      // Find the resume to duplicate
      const resumeToDuplicate = existingResumes.find((r) => r.id === id);
      if (!resumeToDuplicate) {
        throw new Error('Resume not found');
      }

      // Create a copy with new ID and name
      const duplicatedResume: SavedResume = {
        ...resumeToDuplicate,
        id: Date.now().toString(),
        name: `${resumeToDuplicate.name} (Copy)`,
        saved_at: new Date().toISOString(),
      };

      // Add to array
      existingResumes.push(duplicatedResume);

      // Save back to sessionStorage
      sessionStorage.setItem('saved_resumes', JSON.stringify(existingResumes));

      // Reload resumes
      loadResumes();
    } catch (error) {
      console.error('Failed to duplicate resume:', error);
      alert('Failed to duplicate resume');
    }
  }

  async function handleDownload(resume: SavedResume) {
    try {
      // Generate PDF from resume sections
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_sections: resume.resume_sections,
          metadata: {
            company: resume.jd_insights?.company,
          },
          format: resume.format,
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
      link.download = data.filename || `${resume.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert(error instanceof Error ? error.message : 'Failed to download PDF. Please try again.');
    }
  }

  function handleView(resume: SavedResume) {
    // Navigate to edit page with this resume data
    sessionStorage.setItem('tailored_resume', JSON.stringify(resume.resume_sections));
    if (resume.jd_insights) {
      sessionStorage.setItem('jd_insights', JSON.stringify(resume.jd_insights));
    }
    router.push('/edit');
  }

  const filteredResumes = resumes.filter((resume) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      resume.name.toLowerCase().includes(search) ||
      resume.jd_insights?.company?.toLowerCase().includes(search) ||
      resume.jd_insights?.title?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your resumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gold-400 mb-2">Resume Library</h1>
          <p className="text-gray-400">
            Manage and reuse your tailored resumes ({resumes.length} saved)
          </p>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by name, company, or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/40 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'company' | 'name')}
              className="w-full px-4 py-2 bg-black/40 border border-gold-500/30 rounded-lg text-white focus:outline-none focus:border-gold-500"
            >
              <option value="date">Newest First</option>
              <option value="company">Company (A-Z)</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </GlassCard>

        {/* Resumes Grid/Table */}
        {filteredResumes.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <p className="text-gray-400 text-lg mb-4">No resumes found</p>
            <p className="text-gray-500">
              Create and save your first tailored resume to see it here!
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResumes.map((resume) => (
              <GlassCard key={resume.id} className="p-6 hover:border-gold-500/50 transition-all">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gold-400 mb-1">
                    {resume.name}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Format: {resume.format}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  {resume.jd_insights?.title && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Briefcase size={16} className="text-gold-400" />
                      <span>{resume.jd_insights.title}</span>
                    </div>
                  )}

                  {resume.jd_insights?.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Building2 size={16} className="text-gold-400" />
                      <span>{resume.jd_insights.company}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Calendar size={16} className="text-gold-400" />
                    <span>{new Date(resume.saved_at).toLocaleDateString()}</span>
                  </div>

                  {resume.jd_insights?.seniority && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText size={16} className="text-gold-400" />
                      <span className="text-gray-300">{resume.jd_insights.seniority}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleView(resume)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-blue-400 text-sm transition-colors"
                    title="View/Edit"
                  >
                    <Eye size={16} />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => handleDownload(resume)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gold-500/20 hover:bg-gold-500/30 border border-gold-500/50 rounded-lg text-gold-400 text-sm transition-colors"
                    title="Download PDF"
                  >
                    <Download size={16} />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(resume.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-gray-300 text-sm transition-colors"
                    title="Duplicate"
                  >
                    <Copy size={16} />
                    <span>Copy</span>
                  </button>

                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 text-sm transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
