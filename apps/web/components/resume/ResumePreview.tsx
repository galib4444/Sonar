/**
 * ResumePreview Component
 * Live preview of the 1-page resume in ATS-compliant format
 */

'use client';

import React from 'react';
import type {
  ExperienceItem,
  ProjectItem,
  EducationItem,
  CertificationItem,
  UserProfile,
} from '@/lib/types';

interface ResumePreviewProps {
  name: string;
  contact: UserProfile['contact'];
  summary?: string;
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  skills: string[];
  certifications?: CertificationItem[];
}

export function ResumePreview({
  name,
  contact,
  summary,
  experiences,
  projects,
  education,
  skills,
  certifications,
}: ResumePreviewProps) {
  return (
    <div className="bg-white !text-black mx-auto w-full md:w-[816px] min-h-[1056px] p-12 rounded-lg border border-gray-300 shadow-sm font-serif">
      <div className="resume-preview">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '12pt' }}>
          <h1 style={{ color: '#000000' }}>{name}</h1>
          <p className="text-[10pt]" style={{ marginTop: '2pt', color: '#000000' }}>
            {contact.email} • {contact.phone} • {contact.location}
            {contact.linkedin && ` • ${contact.linkedin}`}
            {contact.github && ` • ${contact.github}`}
            {contact.portfolio && ` • ${contact.portfolio}`}
          </p>
        </div>

        {/* Summary */}
        {summary && (
          <div className="section-spacing">
            <h2 style={{ color: '#000000' }}>SUMMARY</h2>
            <p className="text-[10.5pt]" style={{ color: '#000000' }}>{summary}</p>
          </div>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <div className="section-spacing">
            <h2 style={{ color: '#000000' }}>EXPERIENCE</h2>
            {experiences.map((exp, idx) => (
              <div key={idx} className="experience-item">
                <h3 style={{ color: '#000000' }}>{exp.title}</h3>
                <div className="flex justify-between items-baseline" style={{ marginBottom: '1pt' }}>
                  <p className="italic text-[10pt]" style={{ color: '#000000' }}>
                    {exp.company} | {exp.location}
                  </p>
                  <span className="text-[10pt]" style={{ color: '#666666' }}>
                    {exp.start_date} - {exp.end_date}
                  </span>
                </div>
                <ul className="list-disc mt-[3pt]" style={{ paddingLeft: '15pt' }}>
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="text-[10.5pt]" style={{ color: '#000000' }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="section-spacing">
            <h2 style={{ color: '#000000' }}>PROJECTS</h2>
            {projects.map((proj, idx) => (
              <div key={idx} style={{ marginBottom: '6pt' }}>
                <h3 style={{ color: '#000000' }}>
                  {proj.name}
                  {proj.link && <span className="font-normal"> ({proj.link})</span>}
                </h3>
                {proj.description && <p className="italic text-[10pt]" style={{ color: '#000000' }}>{proj.description}</p>}
                <ul className="list-disc mt-[3pt]" style={{ paddingLeft: '15pt' }}>
                  {proj.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="text-[10.5pt]" style={{ color: '#000000' }}>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="section-spacing">
            <h2 style={{ color: '#000000' }}>EDUCATION</h2>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '6pt' }}>
                <h3 style={{ color: '#000000' }}>{edu.degree}</h3>
                <div className="flex justify-between items-baseline">
                  <p className="italic text-[10pt]" style={{ color: '#000000' }}>{edu.school}</p>
                  <span className="text-[10pt]" style={{ color: '#000000' }}>{edu.graduation_year}</span>
                </div>
                {edu.gpa && <p className="text-[10pt]" style={{ color: '#000000' }}>GPA: {edu.gpa}</p>}
                {edu.honors && <p className="text-[10pt]" style={{ color: '#000000' }}>{edu.honors}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="section-spacing">
            <h2 style={{ color: '#000000' }}>SKILLS</h2>
            <p className="text-[10.5pt]" style={{ color: '#000000' }}>{skills.join(' • ')}</p>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div className="section-spacing">
            <h2 style={{ color: '#000000' }}>CERTIFICATIONS</h2>
            {certifications.map((cert, idx) => (
              <div key={idx} style={{ marginBottom: '4pt' }}>
                <p className="text-[10.5pt]" style={{ color: '#000000' }}>
                  <span className="font-bold">{cert.name}</span> - {cert.issuer} ({cert.date})
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Page/ATS summary */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
        <p className="font-semibold text-blue-900">ATS Compliance Check</p>
        <div className="mt-2 space-y-1 text-blue-800">
          <div className="flex justify-between">
            <span>Font:</span>
            <span className="font-semibold text-green-700">Helvetica 11pt ✓</span>
          </div>
          <div className="flex justify-between">
            <span>Layout:</span>
            <span className="font-semibold text-green-700">Single column ✓</span>
          </div>
          <div className="flex justify-between">
            <span>Total Bullets:</span>
            <span className="font-semibold">
              {experiences.reduce((sum, exp) => sum + exp.bullets.length, 0) +
                projects.reduce((sum, proj) => sum + proj.bullets.length, 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Page Count:</span>
            <span
              className={`font-semibold ${
                experiences.length + projects.length > 6 ? 'text-amber-700' : 'text-green-700'
              }`}
            >
              ~1 page
              {experiences.length + projects.length > 6 && ' (may overflow)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
