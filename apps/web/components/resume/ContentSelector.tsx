/**
 * ContentSelector Component
 * Allows users to select which experiences, projects, skills, and certifications
 * to include in their tailored 1-page resume
 */

'use client';

import React from 'react';
import type {
  UserProfile,
  ExperienceItem,
  ProjectItem,
  CertificationItem,
} from '@/lib/types';

interface ContentSelectorProps {
  userProfile: UserProfile;
  selectedExperiences: ExperienceItem[];
  selectedProjects: ProjectItem[];
  selectedSkills: string[];
  selectedCerts: CertificationItem[];
  onExperiencesChange: (experiences: ExperienceItem[]) => void;
  onProjectsChange: (projects: ProjectItem[]) => void;
  onSkillsChange: (skills: string[]) => void;
  onCertsChange: (certs: CertificationItem[]) => void;
}

export function ContentSelector({
  userProfile,
  selectedExperiences,
  selectedProjects,
  selectedSkills,
  selectedCerts,
  onExperiencesChange,
  onProjectsChange,
  onSkillsChange,
  onCertsChange,
}: ContentSelectorProps) {
  const isExperienceSelected = (exp: ExperienceItem) => {
    return selectedExperiences.some(
      (selected) =>
        selected.title === exp.title &&
        selected.company === exp.company &&
        selected.start_date === exp.start_date
    );
  };

  const isProjectSelected = (proj: ProjectItem) => {
    return selectedProjects.some((selected) => selected.name === proj.name);
  };

  const isSkillSelected = (skill: string) => {
    return selectedSkills.includes(skill);
  };

  const isCertSelected = (cert: CertificationItem) => {
    return selectedCerts.some((selected) => selected.name === cert.name);
  };

  const toggleExperience = (exp: ExperienceItem) => {
    if (isExperienceSelected(exp)) {
      onExperiencesChange(
        selectedExperiences.filter(
          (selected) =>
            !(
              selected.title === exp.title &&
              selected.company === exp.company &&
              selected.start_date === exp.start_date
            )
        )
      );
    } else {
      onExperiencesChange([...selectedExperiences, exp]);
    }
  };

  const toggleProject = (proj: ProjectItem) => {
    if (isProjectSelected(proj)) {
      onProjectsChange(selectedProjects.filter((selected) => selected.name !== proj.name));
    } else {
      onProjectsChange([...selectedProjects, proj]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (isSkillSelected(skill)) {
      onSkillsChange(selectedSkills.filter((s) => s !== skill));
    } else {
      onSkillsChange([...selectedSkills, skill]);
    }
  };

  const toggleCert = (cert: CertificationItem) => {
    if (isCertSelected(cert)) {
      onCertsChange(selectedCerts.filter((selected) => selected.name !== cert.name));
    } else {
      onCertsChange([...selectedCerts, cert]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Experiences */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">
            Experience ({selectedExperiences.length}/{userProfile.experience.length})
          </h3>
          <span className="text-xs text-blue-600 font-medium">AI-selected based on match</span>
        </div>
        <div className="space-y-3">
          {userProfile.experience.map((exp, idx) => {
            const selected = isExperienceSelected(exp);
            return (
              <div
                key={idx}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => toggleExperience(exp)}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleExperience(exp)}
                    className="mt-1 h-4 w-4 text-blue-600 rounded"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-gray-900">{exp.title}</p>
                    <p className="text-xs text-gray-600">
                      {exp.company} • {exp.start_date} - {exp.end_date}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{exp.bullets.length} bullets</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Projects */}
      {userProfile.projects.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Projects ({selectedProjects.length}/{userProfile.projects.length})
          </h3>
          <div className="space-y-3">
            {userProfile.projects.map((proj, idx) => {
              const selected = isProjectSelected(proj);
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => toggleProject(proj)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleProject(proj)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-gray-900">{proj.name}</p>
                      {proj.description && (
                        <p className="text-xs text-gray-600 mt-1">{proj.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{proj.bullets.length} bullets</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Skills */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">
          Skills ({selectedSkills.length}/{userProfile.skills.length})
        </h3>
        <p className="text-xs text-gray-600 mb-3">
          Select relevant skills for this position (aim for 12-16 total)
        </p>
        <div className="flex flex-wrap gap-2">
          {userProfile.skills.map((skill, idx) => {
            const selected = isSkillSelected(skill);
            return (
              <button
                key={idx}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selected
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Certifications */}
      {userProfile.certifications && userProfile.certifications.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Certifications ({selectedCerts.length}/{userProfile.certifications.length})
          </h3>
          <div className="space-y-3">
            {userProfile.certifications.map((cert, idx) => {
              const selected = isCertSelected(cert);
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => toggleCert(cert)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleCert(cert)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold text-gray-900">{cert.name}</p>
                      <p className="text-xs text-gray-600">
                        {cert.issuer} • {cert.date}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-sm text-gray-900 mb-2">Selection Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
          <div>
            <span className="font-medium">{selectedExperiences.length}</span> experiences
          </div>
          <div>
            <span className="font-medium">{selectedProjects.length}</span> projects
          </div>
          <div>
            <span className="font-medium">{selectedSkills.length}</span> skills
          </div>
          <div>
            <span className="font-medium">{selectedCerts.length}</span> certifications
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {selectedExperiences.reduce((sum, exp) => sum + exp.bullets.length, 0) +
            selectedProjects.reduce((sum, proj) => sum + proj.bullets.length, 0)}{' '}
          total bullets selected
        </p>
      </div>
    </div>
  );
}
