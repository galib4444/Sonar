'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/glass-card';
import { GoldButton } from '@/components/ui/gold-button';
import { BulletEditor } from '@/components/resume/BulletEditor';
import { ResumePreview } from '@/components/resume/ResumePreview';
import { ContentSelector } from '@/components/resume/ContentSelector';
import { RecommendationPanel, Recommendation } from '@/components/analyzer/RecommendationPanel';
import { GlobeLoader } from '@/components/ui/globe-loader';
import { CheckCircle, ArrowRight } from 'lucide-react';
import type {
  UserProfile,
  JDInsights,
  ExperienceItem,
  ProjectItem,
  CertificationItem,
  ResumeSections
} from '@/lib/types';

export default function TailorPage() {
  const router = useRouter();

  // State from previous page
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [jdInsights, setJdInsights] = useState<JDInsights | null>(null);

  // AI-generated suggestions
  const [selectedExperiences, setSelectedExperiences] = useState<ExperienceItem[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<ProjectItem[]>([]);
  const [selectedCerts, setSelectedCerts] = useState<CertificationItem[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [bulletSuggestions, setBulletSuggestions] = useState<Map<string, string>>(new Map());

  // Recommendations
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'select' | 'edit' | 'preview'>('select');

  useEffect(() => {
    // Load data from sessionStorage
    try {
      const storedProfile = sessionStorage.getItem('user_profile');
      const storedJdText = sessionStorage.getItem('jd_text');
      const storedInsights = sessionStorage.getItem('jd_insights');

      if (!storedProfile || !storedJdText) {
        router.push('/');
        return;
      }

      const profile = JSON.parse(storedProfile);
      setUserProfile(profile);

      if (storedInsights) {
        setJdInsights(JSON.parse(storedInsights));
      }

      // Generate initial selections
      generateInitialSelections(profile, storedJdText);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load your data. Please start over.');
      setLoading(false);
    }
  }, [router]);

  const generateInitialSelections = async (profile: UserProfile, jd: string) => {
    try {
      // Call the tailor API to get AI suggestions
      const response = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jd_text: jd,
          user_profile: profile,
        }),
      });

      if (!response.ok) {
        let serverMsg = 'Failed to generate tailored content';
        try {
          const err = await response.json();
          console.error('❌ [TAILOR PAGE] Server error:', err);
          serverMsg = err.details ? `${err.error}: ${err.details}` : (err.error || serverMsg);
        } catch (parseErr) {
          console.error('❌ [TAILOR PAGE] Could not parse error response');
        }
        throw new Error(serverMsg);
      }

      const data = await response.json();

      // Store insights if we got them
      if (data.jd_insights) {
        setJdInsights(data.jd_insights);
        sessionStorage.setItem('jd_insights', JSON.stringify(data.jd_insights));
      }

      // Set initial selections from tailored resume
      if (data.tailored_resume) {
        setSelectedExperiences(data.tailored_resume.experience || []);
        setSelectedProjects(data.tailored_resume.projects || []);
        setSelectedCerts(data.tailored_resume.certifications || []);

        // Flatten skills
        const allSkills = data.tailored_resume.skills?.technical || [];
        setSelectedSkills(allSkills);

        // Store for later use
        sessionStorage.setItem('match_score', JSON.stringify(data.match_score));
        sessionStorage.setItem('ats_validation', JSON.stringify(data.ats_validation));
      }

      // Set recommendations if available
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error generating selections:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content');
      setLoading(false);
    }
  };

  const handleBulletChange = (experienceIndex: number, bulletIndex: number, newBullet: string) => {
    const updated = [...selectedExperiences];
    updated[experienceIndex].bullets[bulletIndex] = newBullet;
    setSelectedExperiences(updated);
  };

  const handleAcceptSuggestion = (key: string, suggestion: string) => {
    // Find and update the bullet
    const [expIdx, bullIdx] = key.split('-').map(Number);
    handleBulletChange(expIdx, bullIdx, suggestion);

    // Remove from suggestions
    const newSuggestions = new Map(bulletSuggestions);
    newSuggestions.delete(key);
    setBulletSuggestions(newSuggestions);
  };

  const handleAcceptRecommendation = (recommendation: Recommendation) => {
    console.log('Accepting recommendation:', recommendation);

    switch (recommendation.type) {
      case 'add_keyword':
      case 'add_skill':
        // Add to skills if not already present
        if (recommendation.content && !selectedSkills.includes(recommendation.content)) {
          setSelectedSkills([...selectedSkills, recommendation.content]);
        }
        break;

      case 'add_experience':
      case 'enhance_bullet':
        // This would require more complex logic to add/enhance experience
        // For now, just show an alert
        alert(`Please manually add: "${recommendation.content || recommendation.title}"`);
        break;

      case 'remove_section':
        // Could remove oldest experience
        if (selectedExperiences.length > 2) {
          setSelectedExperiences(selectedExperiences.slice(0, -1));
        }
        break;
    }

    // Remove the recommendation after accepting
    handleDismissRecommendation(recommendation.id);
  };

  const handleDismissRecommendation = (id: string) => {
    setRecommendations(recommendations.filter((r) => r.id !== id));
  };

  const handleFinalize = () => {
    if (!userProfile) return;

    // Build final resume sections
    const resumeSections: ResumeSections = {
      name: userProfile.name,
      contact: userProfile.contact,
      summary: userProfile.summary,
      experience: selectedExperiences,
      projects: selectedProjects,
      education: userProfile.education,
      skills: {
        technical: selectedSkills,
      },
      certifications: selectedCerts,
    };

    // Store in sessionStorage
    sessionStorage.setItem('tailored_resume', JSON.stringify(resumeSections));

    // Navigate to result page
    router.push('/result');
  };

  if (loading) {
    return <GlobeLoader text="Analyzing job description and selecting best content..." />;
  }

  if (error || !userProfile) {
    return (
      <main className="min-h-screen relative overflow-hidden pb-24 flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <GlassCard variant="cream" className="max-w-md p-8 text-center relative z-10">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error || 'No data found'}</p>
          <GoldButton onClick={() => router.push('/dashboard')}>Back to Dashboard</GoldButton>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden pb-24">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gold-200">Tailor Your Resume</h1>
              <p className="text-gray-600 mt-1">
                {jdInsights?.title || 'Job Position'} at {jdInsights?.company || 'Company'}
              </p>
            </div>
            <GoldButton variant="outline" onClick={() => router.push('/dashboard')}>
              Start Over
            </GoldButton>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center text-sm font-bold">
                <CheckCircle size={16} />
              </div>
              <span className="text-sm text-gray-600">Upload</span>
            </div>
            <div className="h-1 w-12 bg-gold"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="text-sm font-semibold text-gold">Tailor</span>
            </div>
            <div className="h-1 w-12 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm text-gray-600">Review</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('select')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'select'
                ? 'bg-white/70 text-gray-900 shadow-md'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            1. Select Content
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'edit'
                ? 'bg-white/70 text-gray-900 shadow-md'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            2. Edit Bullets
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'preview'
                ? 'bg-white/70 text-gray-900 shadow-md'
                : 'bg-white/50 text-gray-600 hover:bg-white/80'
            }`}
          >
            3. Preview
          </button>
        </div>

        {/* AI Recommendations Panel */}
        {recommendations.length > 0 && (
          <div className="mb-6">
            <RecommendationPanel
              recommendations={recommendations}
              onAccept={handleAcceptRecommendation}
              onDismiss={handleDismissRecommendation}
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Original Content */}
          <GlassCard variant="cream" className="lg:col-span-1 !text-gray-900">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Your Full Resume</h3>
              <p className="text-sm text-gray-600 mb-4">
                {userProfile.experience.length} experiences • {userProfile.projects.length} projects • {userProfile.skills.length} skills
              </p>
              <div className="max-h-[800px] overflow-y-auto">
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Experience</h4>
                    {userProfile.experience.map((exp, idx) => (
                      <div key={idx} className="mb-3 pb-3 border-b last:border-b-0">
                        <p className="font-medium !text-gray-900">{exp.title}</p>
                        <p className="text-xs text-gray-600">{exp.company} • {exp.start_date} - {exp.end_date}</p>
                        <ul className="mt-1 space-y-1">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-xs text-gray-800 ml-4">• {bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  {userProfile.projects.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Projects</h4>
                      {userProfile.projects.map((proj, idx) => (
                        <div key={idx} className="mb-2 text-xs">
                          <p className="font-medium !text-gray-900">{proj.name}</p>
                          {proj.bullets.map((bullet, bIdx) => (
                            <p key={bIdx} className="text-gray-800 ml-4">• {bullet}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Skills ({userProfile.skills.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {userProfile.skills.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Middle Column: Active Tab Content */}
          <GlassCard variant="cream" className="lg:col-span-1 bg-gradient-to-br from-gold-50/20 to-gold-100/30 border-gold-200/40">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {activeTab === 'select' && 'AI-Selected Content'}
                {activeTab === 'edit' && 'Improve Bullets'}
                {activeTab === 'preview' && 'Resume Preview'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {activeTab === 'select' && 'Top items selected based on job match'}
                {activeTab === 'edit' && 'ATS-optimized suggestions for your bullets'}
                {activeTab === 'preview' && 'How your 1-page resume will look'}
              </p>
              <div className="max-h-[800px] overflow-y-auto">
                {activeTab === 'select' && (
                  <ContentSelector
                    userProfile={userProfile}
                    selectedExperiences={selectedExperiences}
                    selectedProjects={selectedProjects}
                    selectedSkills={selectedSkills}
                    selectedCerts={selectedCerts}
                    onExperiencesChange={setSelectedExperiences}
                    onProjectsChange={setSelectedProjects}
                    onSkillsChange={setSelectedSkills}
                    onCertsChange={setSelectedCerts}
                  />
                )}

                {activeTab === 'edit' && (
                  <BulletEditor
                    experiences={selectedExperiences}
                    jdInsights={jdInsights}
                    onBulletChange={handleBulletChange}
                    onAcceptSuggestion={handleAcceptSuggestion}
                  />
                )}

                {activeTab === 'preview' && (
                  <ResumePreview
                    name={userProfile.name}
                    contact={userProfile.contact}
                    summary={userProfile.summary}
                    experiences={selectedExperiences}
                    projects={selectedProjects}
                    education={userProfile.education}
                    skills={selectedSkills}
                    certifications={selectedCerts}
                  />
                )}
              </div>
            </div>
          </GlassCard>

          {/* Right Column: Tips & Actions */}
          <GlassCard variant="cream" className="lg:col-span-1">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">ATS Tips</h3>
              <div className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-gradient-to-br from-gold-50 to-gold-100 rounded-xl border border-gold-200 shadow-sm">
                    <h4 className="font-semibold text-gold-800 mb-2">Target Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {jdInsights?.keywords_top_10?.slice(0, 8).map((kw, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gold-200 text-gold-800 rounded text-xs font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gold-700 mt-2">Include 8+ of these in your resume</p>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-gold-100 to-gold-200 rounded-xl border border-gold-300 shadow-sm">
                    <h4 className="font-semibold text-gold-800 mb-2">Must-Have Skills</h4>
                    <ul className="space-y-1">
                      {jdInsights?.must_haves?.slice(0, 5).map((mh, idx) => (
                        <li key={idx} className="text-xs text-gold-800">✓ {mh}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-gold-200 to-gold-300 rounded-xl border border-gold-400 shadow-sm">
                    <h4 className="font-semibold text-gold-800 mb-2">ATS Rules</h4>
                    <ul className="space-y-1 text-xs text-gold-800">
                      <li className="text-xs text-gold-800">✓ Keep to 1 page</li>
                      <li className="text-xs text-gold-800">✓ Use standard fonts</li>
                      <li className="text-xs text-gold-800">✓ Single column layout</li>
                      <li className="text-xs text-gold-800">✓ No images or tables</li>
                      <li className="text-xs text-gold-800">✓ Include metrics in bullets</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-gold-300 to-gold-400 rounded-xl border border-gold-500 shadow-sm">
                    <h4 className="font-semibold text-gold-800 mb-2">Current Status</h4>
                    <div className="space-y-2 text-xs text-gold-800">
                      <div className="flex justify-between">
                        <span>Experiences:</span>
                        <span className="font-semibold">{selectedExperiences.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Projects:</span>
                        <span className="font-semibold">{selectedProjects.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Skills:</span>
                        <span className="font-semibold">{selectedSkills.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Bullets:</span>
                        <span className="font-semibold">
                          {selectedExperiences.reduce((sum, exp) => sum + exp.bullets.length, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <GoldButton
                    onClick={handleFinalize}
                    className="w-full flex items-center justify-center gap-2"
                    disabled={selectedExperiences.length === 0}
                  >
                    Finalize Resume
                    <ArrowRight size={16} />
                  </GoldButton>
                  <p className="text-xs text-center text-gray-500">
                    Review match score and download PDF on next page
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
