'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { MatchScoreDisplay } from '@/components/analyzer/MatchScoreDisplay';
import { ATSChecklist } from '@/components/analyzer/ATSChecklist';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { FormatSelector, ResumeFormat } from '@/components/resume/FormatSelector';
import { GlassCard } from '@/components/ui/glass-card';
import { GoldButton } from '@/components/ui/gold-button';
import { Download, Eye, Edit3, FileText } from 'lucide-react';

function ResultPageContent() {
  const router = useRouter();
  const [jdInsights, setJdInsights] = React.useState<any>(null);
  const [tailoredResume, setTailoredResume] = React.useState<any>(null);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [starAnswers, setStarAnswers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [generatingStars, setGeneratingStars] = React.useState(false);
  const [showResumePreview, setShowResumePreview] = React.useState(false);
  const [downloadingPDF, setDownloadingPDF] = React.useState(false);
  const [selectedFormat, setSelectedFormat] = React.useState<ResumeFormat>('classic');
  const [showFormatSelector, setShowFormatSelector] = React.useState(false);

  React.useEffect(() => {
    // Load all data from sessionStorage
    try {
      const storedInsights = sessionStorage.getItem('jd_insights');
      const storedResume = sessionStorage.getItem('tailored_resume');
      const storedProfile = sessionStorage.getItem('user_profile');

      if (storedInsights) setJdInsights(JSON.parse(storedInsights));
      if (storedResume) setTailoredResume(JSON.parse(storedResume));
      if (storedProfile) setUserProfile(JSON.parse(storedProfile));
    } catch (error) {
      console.error('Failed to parse stored data:', error);
    }
    setLoading(false);
  }, []);

  const handleGenerateStarAnswers = async () => {
    if (!jdInsights || !userProfile) return;

    setGeneratingStars(true);
    try {
      const response = await fetch('/api/star', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jd_insights: jdInsights,
          user_profile: userProfile,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate STAR answers');
      }

      const data = await response.json();
      setStarAnswers(data.answers || []);
    } catch (error) {
      console.error('Failed to generate STAR answers:', error);
    } finally {
      setGeneratingStars(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!tailoredResume) {
      console.error('No resume data available');
      return;
    }

    setDownloadingPDF(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_sections: tailoredResume,
          metadata: {
            company: jdInsights?.company,
          },
          format: selectedFormat, // Include selected format
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PDF');
      }

      const data = await response.json();

      // Download the PDF using the data URL
      const link = document.createElement('a');
      link.href = data.pdf_url;
      link.download = data.filename || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen relative overflow-hidden pb-24 flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="text-center relative z-10">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gold-200 mb-4">Loading Results...</h1>
        </div>
      </main>
    );
  }

  if (!jdInsights) {
    return (
      <main className="min-h-screen relative overflow-hidden pb-24 flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="text-center relative z-10">
          <h1 className="text-2xl font-bold text-gold-200 mb-4">No Data Found</h1>
          <p className="text-gray-600 mb-6">
            Please submit a job description to generate a tailored resume.
          </p>
          <GoldButton onClick={() => (window.location.href = '/dashboard')}>
            Go to Dashboard
          </GoldButton>
        </div>
      </main>
    );
  }

  // Mock match score and ATS validation for now
  const match_score = {
    total_score: 85,
    breakdown: {
      skill_overlap: 42,
      must_have_coverage: 18,
      seniority_fit: 13,
      evidence_score: 12,
    },
    matched_skills: jdInsights.skills_extracted?.slice(0, 5).map((s: any) => s.name) || [],
    gaps: [],
    recommendations: ['Great match! Your skills align well with the requirements.'],
  };

  const ats_validation = {
    valid: true,
    score: 95,
    checks: {
      layout: {
        single_column: true,
        no_tables: true,
        no_text_boxes: true,
        no_images: true,
      },
      fonts: {
        approved_fonts: true,
        body_size_ok: true,
        header_size_ok: true,
      },
      sections: {
        standard_headings: true,
        required_present: true,
        logical_order: true,
      },
      keywords: {
        coverage: 8,
        density_ok: true,
        placement_ok: true,
      },
      page_count: {
        is_one_page: true,
        line_count: 45,
        estimated_height: 10.5,
      },
    },
    issues: [],
    warnings: [],
    recommendations: ['Great ATS compliance! Your resume should pass all systems.'],
  };

  return (
    <main className="min-h-screen relative overflow-hidden pb-24">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gold-200">
                Job Analysis Complete!
              </h1>
              <p className="text-gray-600 mt-2">
                {jdInsights.title} at {jdInsights.company}
              </p>
            </div>
            <GoldButton onClick={() => (window.location.href = '/dashboard')}>
              New Application
            </GoldButton>
          </div>
        </div>

        {/* Download Section */}
        <GlassCard variant="cream" className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Your Tailored Resume
              </h2>
              <p className="text-gray-600">
                ATS-optimized, one-page resume ready to download
              </p>
            </div>
            <div className="flex gap-3">
              <GoldButton
                onClick={() => setShowFormatSelector(!showFormatSelector)}
                className="flex items-center gap-2"
              >
                <FileText size={16} />
                {showFormatSelector ? 'Hide Formats' : 'Choose Format'}
              </GoldButton>
              <GoldButton
                onClick={() => setShowResumePreview(!showResumePreview)}
                className="flex items-center gap-2"
              >
                <Eye size={16} />
                {showResumePreview ? 'Hide Preview' : 'Preview Resume'}
              </GoldButton>
              <GoldButton
                onClick={() => router.push('/edit')}
                className="flex items-center gap-2"
              >
                <Edit3 size={16} />
                Edit Resume
              </GoldButton>
              <GoldButton
                onClick={handleDownloadPDF}
                disabled={downloadingPDF || !tailoredResume}
                className="flex items-center gap-2"
              >
                {downloadingPDF ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Download PDF ({selectedFormat})
                  </>
                )}
              </GoldButton>
            </div>
          </div>
        </GlassCard>

        {/* Format Selector */}
        {showFormatSelector && (
          <div className="mb-6">
            <FormatSelector
              selectedFormat={selectedFormat}
              onFormatChange={setSelectedFormat}
              onApply={() => setShowFormatSelector(false)}
            />
          </div>
        )}

        {/* Resume Preview (Collapsible) */}
        {showResumePreview && tailoredResume && (
          <GlassCard variant="cream" className="p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Preview</h3>
            <ResumePreview
              name={tailoredResume.name}
              contact={tailoredResume.contact}
              summary={tailoredResume.summary}
              experiences={tailoredResume.experience || []}
              projects={tailoredResume.projects || []}
              education={tailoredResume.education || []}
              skills={tailoredResume.skills?.technical || []}
              certifications={tailoredResume.certifications || []}
            />
          </GlassCard>
        )}

        {/* Results Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Match Score */}
          {match_score && <MatchScoreDisplay matchScore={match_score} />}

          {/* ATS Validation */}
          {ats_validation && <ATSChecklist atsValidation={ats_validation} />}
        </div>

        {/* Job Insights */}
        <GlassCard variant="cream" className="p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Analysis</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Top Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {jdInsights.keywords_top_10?.map((kw: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gold/10 text-gold-800 rounded-full text-sm"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {jdInsights.must_haves && jdInsights.must_haves.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">
                  Must-Have Requirements
                </h4>
                <ul className="space-y-1">
                  {jdInsights.must_haves.map((req: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Seniority Level
              </h4>
              <span className="inline-block px-3 py-1 bg-gold-200/20 text-gold-800 rounded-full text-sm capitalize">
                {jdInsights.seniority}
              </span>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-2">
                Location & Remote Policy
              </h4>
              <p className="text-sm text-gray-700">
                {jdInsights.location} • {jdInsights.remote_policy}
              </p>
            </div>
          </div>
        </GlassCard>

        {/* STAR Interview Answers */}
        <GlassCard variant="cream" className="p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Interview Preparation</h3>
              <p className="text-sm text-gray-600 mt-1">
                Behavioral interview answers tailored to this role
              </p>
            </div>
            {starAnswers.length === 0 && (
              <GoldButton
                onClick={handleGenerateStarAnswers}
                disabled={generatingStars}
              >
                {generatingStars ? 'Generating...' : 'Generate STAR Answers'}
              </GoldButton>
            )}
          </div>
          {starAnswers.length > 0 && (
            <div className="space-y-4">
              {starAnswers.map((answer: any, idx: number) => (
                <div key={idx} className="p-4 bg-white/50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">{answer.question}</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-semibold text-gold-700">Situation:</span>{' '}
                      <span className="text-gray-700">{answer.star.situation}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gold-600">Task:</span>{' '}
                      <span className="text-gray-700">{answer.star.task}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gold-500">Action:</span>{' '}
                      <span className="text-gray-700">{answer.star.action}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gold-400">Result:</span>{' '}
                      <span className="text-gray-700">{answer.star.result}</span>
                    </div>
                  </div>
                  {answer.keywords_used && answer.keywords_used.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      <span className="text-xs text-gray-600">Keywords:</span>
                      {answer.keywords_used.map((kw: string, kwIdx: number) => (
                        <span
                          key={kwIdx}
                          className="px-2 py-0.5 bg-gold/10 text-gold-800 rounded text-xs"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            💡 Tip: Review the match score and ATS checklist before applying
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Loading...</div>}>
      <ResultPageContent />
    </Suspense>
  );
}
