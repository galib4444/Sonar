# PDF Generator Skill

## Purpose
Generate ATS-compliant PDF resumes from structured resume data using @react-pdf/renderer.

## Responsibilities
- Render resume data as PDF using React components
- Apply ATS-clean template (single column, approved fonts)
- Add QR code linking to live version (optional)
- Ensure 1-page limit
- Generate download URL or return buffer

## Input Schema
```typescript
interface PDFGeneratorInput {
  resume_sections: ResumeSections;
  metadata: {
    match_score: number;
    ats_score: number;
    qr_url?: string; // Link to live version
  };
  template: 'ats-clean' | 'ats-modern'; // Default: ats-clean
}
```

## Template: ATS Clean
Located at: `.claude/skills/pdf-generator/templates/ats-clean.tsx`

### Specifications
- **Font**: Helvetica (built-in to @react-pdf/renderer)
- **Size**: 11pt body, 14pt name, 12pt section headers
- **Margins**: 0.5" all sides
- **Layout**: Single column, no tables
- **Spacing**: 1.3 line height
- **Colors**: Black text, minimal use of gray for dates

### Structure
```
┌────────────────────────────────────┐
│         [NAME - 14pt bold]         │
│   email | phone | location | link  │
├────────────────────────────────────┤
│ SUMMARY (optional)                 │
│ 2-3 sentence summary...            │
├────────────────────────────────────┤
│ EXPERIENCE                         │
│ Job Title                          │
│ Company | Location                 │
│ Jan 2020 - Present                 │
│ • Bullet point 1                   │
│ • Bullet point 2                   │
│                                    │
│ Previous Job Title                 │
│ ...                                │
├────────────────────────────────────┤
│ PROJECTS (optional)                │
│ Project Name | Link                │
│ • Bullet point 1                   │
├────────────────────────────────────┤
│ EDUCATION                          │
│ Degree Name                        │
│ School Name | Graduation Year      │
├────────────────────────────────────┤
│ SKILLS                             │
│ Category: skill1, skill2, skill3   │
└────────────────────────────────────┘
```

## React-PDF Example
```tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: '0.5in',
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.3,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    borderBottom: '1pt solid black',
    marginBottom: 6,
    marginTop: 12,
  },
  bullet: {
    fontSize: 11,
    marginLeft: 12,
    marginBottom: 3,
  },
});

const ATSCleanTemplate = ({ resume }) => (
  <Document>
    <Page size="LETTER" style={styles.page}>
      <Text style={styles.name}>{resume.name}</Text>
      {/* ... sections ... */}
    </Page>
  </Document>
);
```

## Output Schema
```typescript
interface PDFGeneratorOutput {
  pdf_url: string;           // Signed URL or base64
  pdf_buffer: Buffer;        // Raw PDF data
  metadata: {
    file_size_bytes: number;
    page_count: number;       // Should always be 1
    line_count: number;
    generation_time_ms: number;
  };
}
```

## Page Overflow Handling
```typescript
// If content exceeds 1 page:
// 1. Remove summary section
// 2. Reduce oldest experience bullets
// 3. Condense spacing slightly (1.3 -> 1.2 line height)
// 4. If still over, reduce font to 10.5pt (minimum)
// 5. If still over, show error to user
```

## QR Code Integration
```typescript
// Add QR code to bottom-right corner (optional)
// Links to: https://hustlerai.tech/resume/{resume_id}
// Size: 0.75" x 0.75"
// Only include if qr_url provided
```

## File Naming Convention
```
{firstName}_{lastName}_Resume_{CompanyName}.pdf
Example: John_Doe_Resume_Google.pdf
```

## Usage Notes
- Run after ats-validator to ensure compliance
- PDF generation is synchronous and fast (< 500ms)
- Always validate page count = 1 before returning
- Store PDFs temporarily (1 hour) or return as base64
