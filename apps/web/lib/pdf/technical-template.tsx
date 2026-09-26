/**
 * Technical/Engineering PDF Template
 * Dense layout with skills-first approach, optimized for technical roles
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
    padding: '0.5in',
    fontFamily: 'Courier',
    fontSize: 10,
    lineHeight: 1.25,
    color: '#000000',
  },
  header: {
    marginBottom: 10,
    borderBottom: '2pt solid #000000',
    paddingBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#000000',
    fontFamily: 'Helvetica-Bold',
  },
  contact: {
    fontSize: 9,
    color: '#000000',
    fontFamily: 'Courier',
  },
  contactRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  contactItem: {
    color: '#000000',
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
    backgroundColor: '#000000',
    color: '#ffffff',
    padding: '2 4',
    fontFamily: 'Helvetica-Bold',
  },
  summary: {
    fontSize: 9.5,
    lineHeight: 1.3,
    color: '#000000',
    marginBottom: 2,
  },
  skillsGrid: {
    fontSize: 9.5,
    lineHeight: 1.4,
  },
  skillCategory: {
    marginBottom: 3,
  },
  skillLabel: {
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  experienceItem: {
    marginBottom: 6,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Helvetica-Bold',
  },
  dates: {
    fontSize: 9,
    color: '#000000',
  },
  company: {
    fontSize: 9.5,
    marginBottom: 2,
    color: '#000000',
  },
  bulletList: {
    marginTop: 2,
  },
  bullet: {
    fontSize: 9.5,
    marginLeft: 10,
    marginBottom: 2,
    lineHeight: 1.3,
    color: '#000000',
  },
  bulletSymbol: {
    position: 'absolute',
    left: 0,
  },
  educationItem: {
    marginBottom: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  degree: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Helvetica-Bold',
  },
  school: {
    fontSize: 9.5,
    color: '#000000',
  },
  year: {
    fontSize: 9,
    color: '#000000',
  },
  projectItem: {
    marginBottom: 5,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    fontFamily: 'Helvetica-Bold',
  },
  projectTech: {
    fontSize: 8.5,
    color: '#333333',
    marginTop: 1,
  },
  certRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  certName: {
    fontSize: 9.5,
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  certIssuer: {
    fontSize: 9,
    color: '#000000',
  },
});

interface TechnicalTemplateProps {
  resume: ResumeSections;
}

export const TechnicalTemplate: React.FC<TechnicalTemplateProps> = ({ resume }) => {
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
            {resume.contact.github && (
              <Text style={styles.contactItem}> | github.com/{resume.contact.github}</Text>
            )}
          </View>
        </View>

        {/* Technical Skills - FIRST for engineering roles */}
        {resume.skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TECHNICAL SKILLS</Text>
            {typeof resume.skills === 'object' && !Array.isArray(resume.skills) ? (
              <View style={styles.skillsGrid}>
                {resume.skills.technical && (
                  <View style={styles.skillCategory}>
                    <Text>
                      <Text style={styles.skillLabel}>Languages/Frameworks: </Text>
                      {resume.skills.technical.join(', ')}
                    </Text>
                  </View>
                )}
                {resume.skills.tools && (
                  <View style={styles.skillCategory}>
                    <Text>
                      <Text style={styles.skillLabel}>Tools/Platforms: </Text>
                      {resume.skills.tools.join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Text style={styles.skillsGrid}>
                {Array.isArray(resume.skills) ? resume.skills.join(' • ') : ''}
              </Text>
            )}
          </View>
        )}

        {/* Summary */}
        {resume.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SUMMARY</Text>
            <Text style={styles.summary}>{resume.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {resume.experience && resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>EXPERIENCE</Text>
            {resume.experience.map((exp, idx) => (
              <View key={idx} style={styles.experienceItem}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{exp.title}</Text>
                  <Text style={styles.dates}>
                    {exp.start_date} - {exp.end_date}
                  </Text>
                </View>
                {(exp.company || exp.location) && (
                  <Text style={styles.company}>
                    {[exp.company, exp.location].filter(Boolean).join(' | ')}
                  </Text>
                )}
                <View style={styles.bulletList}>
                  {exp.bullets.map((bullet, bIdx) => (
                    <View key={bIdx} style={{ flexDirection: 'row', position: 'relative' }}>
                      <Text style={styles.bulletSymbol}>{'>'}</Text>
                      <Text style={styles.bullet}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {resume.projects && resume.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROJECTS</Text>
            {resume.projects.map((proj, idx) => (
              <View key={idx} style={styles.projectItem}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{proj.name}</Text>
                  {proj.link && (
                    <Link src={proj.link} style={{ fontSize: 8, color: '#000000' }}>
                      [link]
                    </Link>
                  )}
                </View>
                {proj.technologies && proj.technologies.length > 0 && (
                  <Text style={styles.projectTech}>
                    Tech: {proj.technologies.join(', ')}
                  </Text>
                )}
                <View style={styles.bulletList}>
                  {proj.bullets.map((bullet, bIdx) => (
                    <View key={bIdx} style={{ flexDirection: 'row', position: 'relative' }}>
                      <Text style={styles.bulletSymbol}>{'>'}</Text>
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
            <Text style={styles.sectionTitle}>EDUCATION</Text>
            {resume.education.map((edu, idx) => (
              <View key={idx}>
                <View style={styles.educationItem}>
                  <View>
                    <Text style={styles.degree}>{edu.degree}</Text>
                    <Text style={styles.school}>{edu.school}</Text>
                  </View>
                  <Text style={styles.year}>{edu.graduation_year}</Text>
                </View>
                {edu.gpa && (
                  <Text style={{ fontSize: 9, marginTop: 1 }}>GPA: {edu.gpa}</Text>
                )}
                {edu.honors && (
                  <Text style={{ fontSize: 9, marginTop: 1 }}>{edu.honors}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
            {resume.certifications.map((cert, idx) => (
              <View key={idx} style={styles.certRow}>
                <Text style={styles.certName}>{cert.name}</Text>
                <Text style={styles.certIssuer}>
                  {cert.issuer} | {cert.date}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
