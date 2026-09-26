# ATS Validator Skill

## Purpose
Validate resume compliance with ATS (Applicant Tracking System) requirements to ensure maximum parseability.

## Responsibilities
- Validate layout (single column, no tables, no text boxes)
- Check font compliance (approved fonts, sizes)
- Verify section structure (standard headings, order)
- Check keyword coverage and density
- Validate page count (strict 1-page limit)
- Score overall ATS compliance (0-100)

## Input Schema
```typescript
interface ATSValidatorInput {
  resume_sections: ResumeSections;
  pdf_buffer?: Buffer; // If validating PDF
  jd_keywords?: string[]; // For keyword coverage check
  ats_rules: ATSRules; // From knowledge base
}
```

## Validation Checks

### 1. Layout Validation (30 points)
```typescript
{
  single_column: boolean;     // 10 pts
  no_tables: boolean;          // 10 pts
  no_text_boxes: boolean;      // 5 pts
  no_images: boolean;          // 5 pts
}
```

### 2. Font Validation (20 points)
```typescript
{
  approved_fonts: boolean;     // 10 pts - Arial, Calibri, Helvetica, Times
  body_size_ok: boolean;       // 5 pts - 10.5-11.5pt
  header_size_ok: boolean;     // 5 pts - 12-14pt
}
```

### 3. Section Validation (20 points)
```typescript
{
  standard_headings: boolean;  // 10 pts - EXPERIENCE, EDUCATION, SKILLS
  required_present: boolean;   // 10 pts - All required sections exist
  logical_order: boolean;      // 0 pts - Suggested but not required
}
```

### 4. Keyword Validation (20 points)
```typescript
{
  coverage: number;            // 0-10 keywords matched = 0-20 pts
  density_ok: boolean;         // Keyword density < 3%
  placement_ok: boolean;       // Keywords in summary, bullets, skills
}
```

### 5. Page Count Validation (10 points)
```typescript
{
  is_one_page: boolean;        // 10 pts
  line_count: number;          // For debugging
  estimated_height: number;    // In inches
}
```

## ATS Rules
Loaded from `knowledge-base/processed/ats-rules.json`:

```json
{
  "layout": {
    "single_column": true,
    "no_tables": true,
    "no_text_boxes": true,
    "no_headers_footers": true,
    "max_pages": 1
  },
  "fonts": {
    "approved": ["Arial", "Calibri", "Helvetica", "Times New Roman"],
    "body_size": { "min": 10.5, "max": 11.5 },
    "header_size": { "min": 12, "max": 14 }
  },
  "sections": {
    "required": ["Experience", "Education", "Skills"],
    "optional": ["Summary", "Projects", "Certifications"],
    "standard_names": {
      "Experience": ["Experience", "Work Experience", "Professional Experience"],
      "Education": ["Education"],
      "Skills": ["Skills", "Technical Skills"]
    }
  },
  "keywords": {
    "min_coverage": 8,
    "max_density": 0.03,
    "placement": ["summary", "experience_bullets", "skills"]
  }
}
```

## Output Schema
```typescript
interface ATSValidationResult {
  valid: boolean;              // True if score >= 90
  score: number;               // 0-100
  checks: {
    layout: LayoutChecks;
    fonts: FontChecks;
    sections: SectionChecks;
    keywords: KeywordChecks;
    page_count: PageCountChecks;
  };
  issues: string[];            // Critical problems
  warnings: string[];          // Suggestions
  recommendations: string[];   // How to improve score
}
```

## Common Issues and Fixes

| Issue | Fix |
|-------|-----|
| Multi-column layout | Use single column only |
| Tables detected | Convert to text with simple formatting |
| Non-ATS font (e.g., Georgia) | Switch to Arial or Calibri |
| 2+ pages | Reduce bullets, tighten spacing |
| Keyword coverage < 8 | Incorporate more JD keywords in bullets |
| Keyword density > 3% | Remove keyword stuffing |
| Non-standard section names | Use "EXPERIENCE" not "Work History" |

## Keyword Density Calculation
```typescript
// total_keywords_count / total_words * 100 < 3%
// Example: 50 keyword mentions in 2000 words = 2.5% ✓
```

## Page Count Estimation
```typescript
// Count lines of text across all sections
// Estimate: 11pt font, 1.2 line height, 1" margins
// Max lines for 1 page: ~50-55 lines
// Flag if > 52 lines
```

## Usage Notes
- Run after bullet-rewriter to validate final resume
- If validation fails, provide specific recommendations
- ATS score should be displayed to user with issues
- Target score: ≥ 95 for maximum ATS compatibility
