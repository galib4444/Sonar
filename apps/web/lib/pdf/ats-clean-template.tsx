/**
 * ATS-Clean PDF Template
 * Single-column, ATS-compliant resume template
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

// Using built-in Helvetica for ATS compliance
const styles = StyleSheet.create({
  page: {
    padding: '0.5in',
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.3,
    color: '#000000',
  },
  header: {
    marginBottom: 12,
    textAlign: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#000000',
  },
  contact: {
    fontSize: 10,
    color: '#333333',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  contactItem: {
    marginHorizontal: 4,
    color: '#000000',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    borderBottom: '1pt solid #000000',
    paddingBottom: 2,
    color: '#000000',
  },
  summary: {
    fontSize: 10.5,
    lineHeight: 1.4,
    color: '#000000',
  },
  experienceItem: {
    marginBottom: 8,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  company: {
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 1,
    color: '#000000',
  },
  dates: {
    fontSize: 10,
    color: '#666666',
  },
  bulletList: {
    marginTop: 3,
  },
  bullet: {
    fontSize: 10.5,
    marginLeft: 15,
    marginBottom: 3,
    lineHeight: 1.3,
    color: '#000000',
  },
  bulletSymbol: {
    position: 'absolute',
    left: 0,
  },
  educationItem: {
    marginBottom: 6,
  },
  degree: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  school: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#000000',
  },
  skills: {
    fontSize: 10.5,
    lineHeight: 1.4,
    color: '#000000',
  },
  skillCategory: {
    marginBottom: 4,
  },
  skillLabel: {
    fontWeight: 'bold',
  },
  projectItem: {
    marginBottom: 6,
  },
  projectName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  projectLink: {
    fontSize: 9,
    color: '#0066cc',
  },
});

interface ATSCleanTemplateProps {
  resume: ResumeSections;
}

export const ATSCleanTemplate: React.FC<ATSCleanTemplateProps> = ({ resume }) => {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{resume.name.toUpperCase()}</Text>
          <View style={styles.contactRow}>
            <Text style={styles.contactItem}>
              {[resume.contact.email, resume.contact.phone, resume.contact.location]
                .filter(Boolean)
                .join(' | ')}
            </Text>
          </View>
          {(resume.contact.linkedin || resume.contact.github || resume.contact.portfolio) && (
            <View style={styles.contactRow}>
              {resume.contact.linkedin && (
                <>
                  <Link src={`https://${resume.contact.linkedin}`} style={styles.contactItem}>
                    <Text style={styles.projectLink}>{resume.contact.linkedin}</Text>
                  </Link>
                  {(resume.contact.github || resume.contact.portfolio) && (
                    <Text style={styles.contactItem}>|</Text>
                  )}
                </>
              )}
              {resume.contact.github && (
                <>
                  <Link src={`https://${resume.contact.github}`} style={styles.contactItem}>
                    <Text style={styles.projectLink}>{resume.contact.github}</Text>
                  </Link>
                  {resume.contact.portfolio && <Text style={styles.contactItem}>|</Text>}
                </>
              )}
              {resume.contact.portfolio && (
                <Link src={`https://${resume.contact.portfolio}`} style={styles.contactItem}>
                  <Text style={styles.projectLink}>{resume.contact.portfolio}</Text>
                </Link>
              )}
            </View>
          )}
        </View>

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
            {resume.experience.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
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
                  {exp.bullets.map((bullet, bulletIndex) => (
                    <View key={bulletIndex} style={{ position: 'relative' }}>
                      <Text style={styles.bullet}>• {bullet}</Text>
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
            {resume.projects.map((project, index) => (
              <View key={index} style={styles.projectItem}>
                <Text style={styles.projectName}>{project.name}</Text>
                {project.link && (
                  <Link src={`https://${project.link}`}>
                    <Text style={styles.projectLink}>{project.link}</Text>
                  </Link>
                )}
                <View style={styles.bulletList}>
                  {project.bullets.map((bullet, bulletIndex) => (
                    <View key={bulletIndex} style={{ position: 'relative' }}>
                      <Text style={styles.bullet}>• {bullet}</Text>
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
            {resume.education.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <Text style={styles.degree}>{edu.degree}</Text>
                <Text style={styles.school}>
                  {edu.school} | {edu.graduation_year}
                </Text>
                {edu.gpa && (
                  <Text style={{ fontSize: 10, color: '#000000' }}>GPA: {edu.gpa}</Text>
                )}
                {edu.highlights && edu.highlights.length > 0 && (
                  <View style={styles.bulletList}>
                    {edu.highlights.map((highlight, hIndex) => (
                      <Text key={hIndex} style={styles.bullet}>
                        • {highlight}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {resume.skills && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SKILLS</Text>
            {resume.skills.technical && resume.skills.technical.length > 0 && (
              <Text style={styles.skills}>
                {resume.skills.technical.join(', ')}
              </Text>
            )}
            {resume.skills.grouped &&
              Object.entries(resume.skills.grouped).map(([category, skillList], index) => (
                <View key={index} style={styles.skillCategory}>
                  <Text style={styles.skills}>
                    <Text style={styles.skillLabel}>{category}:</Text> {skillList.join(', ')}
                  </Text>
                </View>
              ))}
          </View>
        )}

        {/* Certifications */}
        {resume.certifications && resume.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
            {resume.certifications.map((cert, index) => (
              <View key={index} style={{ marginBottom: 4 }}>
                <Text style={styles.degree}>{cert.name}</Text>
                <Text style={{ fontSize: 10, color: '#000000' }}>
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
