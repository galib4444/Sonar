/**
 * Modern Minimalist PDF Template
 * Clean design with generous white space and subtle accents
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from '@react-pdf/renderer';
import type { ResumeSections } from '../types';

const styles = StyleSheet.create({
  page: {
    padding: '0.75in 0.6in',
    fontFamily: 'Helvetica',
    fontSize: 10.5,
    lineHeight: 1.4,
    color: '#2d2d2d',
  },
  header: {
    marginBottom: 20,
    borderBottom: '0.5pt solid #e0e0e0',
    paddingBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 6,
    color: '#1a1a1a',
  },
  contact: {
    fontSize: 9,
    color: '#666666',
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  contactItem: {
    color: '#666666',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    color: '#1a1a1a',
    borderBottom: '1.5pt solid #1a1a1a',
    paddingBottom: 3,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#4a4a4a',
    marginBottom: 4,
  },
  experienceItem: {
    marginBottom: 10,
  },
  jobHeader: {
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  companyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 4,
  },
  company: {
    fontSize: 10,
    color: '#4a4a4a',
  },
  dates: {
    fontSize: 9,
    color: '#999999',
  },
  bulletList: {
    marginTop: 2,
  },
  bullet: {
    fontSize: 10,
    marginLeft: 12,
    marginBottom: 3,
    lineHeight: 1.4,
    color: '#2d2d2d',
  },
  bulletSymbol: {
    position: 'absolute',
    left: 0,
    color: '#666666',
  },
  educationItem: {
    marginBottom: 8,
  },
  degree: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  schoolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  school: {
    fontSize: 10,
    color: '#4a4a4a',
  },
  year: {
    fontSize: 9,
    color: '#999999',
  },
  skills: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#2d2d2d',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillItem: {
    fontSize: 9.5,
    padding: '3 8',
    backgroundColor: '#f5f5f5',
    borderRadius: 2,
    color: '#2d2d2d',
  },
  projectItem: {
    marginBottom: 8,
  },
  projectName: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  projectLink: {
    fontSize: 8.5,
    color: '#0066cc',
    marginTop: 1,
  },
});

interface ModernMinimalistTemplateProps {
  resume: ResumeSections;
}

export const ModernMinimalistTemplate: React.FC<ModernMinimalistTemplateProps> = ({ resume }) => {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{resume.name}</Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactItem}>
              {[resume.contact.email, resume.contact.phone, resume.contact.location]
                .filter(Boolean)
                .join(' | ')}
            </Text>
            {resume.contact.linkedin && (
              <Text style={styles.contactItem}> | LinkedIn</Text>
            )}
          </View>
        </View>

        {/* Summary */}
        {resume.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Profile</Text>
            <Text style={styles.summary}>{resume.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {resume.experience.map((exp, idx) => (
              <View key={idx} style={styles.experienceItem}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{exp.title}</Text>
                </View>
                <View style={styles.companyRow}>
                  {(exp.company || exp.location) && (
                    <Text style={styles.company}>
                      {[exp.company, exp.location].filter(Boolean).join(' • ')}
                    </Text>
                  )}
                  <Text style={styles.dates}>
                    {exp.start_date} - {exp.end_date}
                  </Text>
                </View>
                <View style={styles.bulletList}>
                  {exp.bullets.map((bullet, bIdx) => (
                    <View key={bIdx} style={{ flexDirection: 'row', position: 'relative' }}>
                      <Text style={styles.bulletSymbol}>•</Text>
                      <Text style={styles.bullet}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {resume.education && resume.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {resume.education.map((edu, idx) => (
              <View key={idx} style={styles.educationItem}>
                <Text style={styles.degree}>{edu.degree}</Text>
                <View style={styles.schoolRow}>
                  <Text style={styles.school}>{edu.school}</Text>
                  <Text style={styles.year}>{edu.graduation_year}</Text>
                </View>
                {edu.gpa && (
                  <Text style={{ fontSize: 9, color: '#666666', marginTop: 1 }}>
                    GPA: {edu.gpa}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {resume.skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsGrid}>
              {Array.isArray(resume.skills)
                ? resume.skills.map((skill, idx) => (
                    <Text key={idx} style={styles.skillItem}>{skill}</Text>
                  ))
                : typeof resume.skills === 'object' && resume.skills.technical
                ? resume.skills.technical.map((skill, idx) => (
                    <Text key={idx} style={styles.skillItem}>{skill}</Text>
                  ))
                : null}
            </View>
          </View>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {resume.projects.map((proj, idx) => (
              <View key={idx} style={styles.projectItem}>
                <Text style={styles.projectName}>{proj.name}</Text>
                {proj.link && (
                  <Link src={proj.link} style={styles.projectLink}>
                    {proj.link}
                  </Link>
                )}
                <View style={styles.bulletList}>
                  {proj.bullets.map((bullet, bIdx) => (
                    <View key={bIdx} style={{ flexDirection: 'row', position: 'relative' }}>
                      <Text style={styles.bulletSymbol}>•</Text>
                      <Text style={styles.bullet}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {resume.certifications.map((cert, idx) => (
              <Text key={idx} style={{ fontSize: 10, marginBottom: 3, color: '#2d2d2d' }}>
                {cert.name} - {cert.issuer} ({cert.date})
              </Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
