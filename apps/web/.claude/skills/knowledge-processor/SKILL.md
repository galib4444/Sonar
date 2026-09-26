# Knowledge Processor Skill

## Purpose
Extract, structure, and index reference materials from PDFs in the knowledge base.

## Responsibilities
- Scan and parse all PDFs in `knowledge-base/raw/`
- Extract structured data (action verbs, ATS rules, bullet examples, templates)
- Save JSON outputs to `knowledge-base/processed/`
- Build index/embeddings for RAG (optional)

## Input Schema
```typescript
interface KnowledgeProcessorInput {
  raw_pdf_dir: string;      // Default: 'knowledge-base/raw/'
  output_dir: string;        // Default: 'knowledge-base/processed/'
  create_embeddings: boolean; // Default: false
}
```

## Processing Pipeline

### 1. PDF Discovery
```typescript
// Scan knowledge-base/raw/ for all .pdf files
// Identify document type from filename:
//   - Action-Verbs-*.pdf → action verbs
//   - ATS*.pdf, *Resume-Format*.pdf → ATS rules
//   - *Template*.pdf, *Example*.pdf → templates/examples
```

### 2. Text Extraction
```typescript
// Use pdf-parse to extract text
// Preserve structure (paragraphs, lists, tables)
// Clean whitespace and encoding issues
```

### 3. Structured Extraction
Based on document type, extract specific data structures.

## Extraction Schemas

### Action Verbs
From: `Action-Verbs-Quantify-Accomplishments-for-Resume.pdf`

```typescript
interface ActionVerbs {
  leadership: string[];     // Led, Managed, Directed...
  achievement: string[];    // Achieved, Delivered, Exceeded...
  technical: string[];      // Developed, Implemented, Engineered...
  analysis: string[];       // Analyzed, Evaluated, Assessed...
  communication: string[];  // Presented, Documented, Collaborated...
  creativity: string[];     // Designed, Created, Innovated...
}

interface QuantificationPatterns {
  patterns: string[];       // "Increased X by Y%", "Managed $X budget"...
}
```

### ATS Rules
From: `Resume-Format.pdf`, `What Is an Applicant Tracking System (ATS).pdf`

```typescript
interface ATSRules {
  layout: {
    single_column: boolean;
    no_tables: boolean;
    no_text_boxes: boolean;
    no_headers_footers: boolean;
    max_pages: number;
  };
  fonts: {
    approved: string[];
    body_size: { min: number; max: number };
    header_size: { min: number; max: number };
  };
  sections: {
    required: string[];
    optional: string[];
    standard_names: Record<string, string[]>;
    order: string[];
  };
  keywords: {
    min_coverage: number;
    max_density: number;
    placement: string[];
  };
}
```

### Bullet Examples
From: Template PDFs with real examples

```typescript
interface BulletExample {
  text: string;
  category: string;         // leadership, technical, etc.
  has_quantification: boolean;
  keywords: string[];
  quality_score: number;    // 1-10
}
```

### Templates
From: Resume template PDFs

```typescript
interface Template {
  name: string;
  sections: string[];
  layout_type: 'single-column' | 'two-column';
  ats_safe: boolean;
  description: string;
}
```

## Extraction Algorithms

### Action Verb Extraction
```typescript
// 1. Find sections with headers like "Leadership", "Technical", etc.
// 2. Extract capitalized words (verbs)
// 3. Remove duplicates
// 4. Categorize by section
```

### ATS Rules Extraction
```typescript
// 1. Look for phrases like:
//    - "avoid tables"
//    - "use Arial, Calibri"
//    - "one page maximum"
//    - "10-12pt font size"
// 2. Extract rules with regex patterns
// 3. Structure into JSON schema
```

### Quantification Pattern Extraction
```typescript
// Find patterns like:
//   - "Increased [noun] by [number]%"
//   - "Reduced [noun] from [number] to [number]"
//   - "Managed $[number] budget"
//   - "Led team of [number]"
// Use regex to identify and extract
```

## Output Files

### `action-verbs.json`
```json
{
  "action_verbs": {
    "leadership": ["Led", "Managed", "Directed"],
    "technical": ["Developed", "Implemented", "Engineered"],
    ...
  },
  "quantification_patterns": [
    "Increased {metric} by {percent}%",
    "Reduced {metric} from {value1} to {value2}",
    ...
  ],
  "metadata": {
    "source": "Action-Verbs-Quantify.pdf",
    "processed_at": "2024-01-15T10:30:00Z",
    "total_verbs": 120
  }
}
```

### `ats-rules.json`
```json
{
  "layout": {
    "single_column": true,
    "no_tables": true,
    ...
  },
  "fonts": {
    "approved": ["Arial", "Calibri", "Helvetica", "Times New Roman"],
    ...
  },
  ...
}
```

### `bullet-examples.json`
```json
{
  "examples": [
    {
      "text": "Led cross-functional team of 12 to deliver product launch 2 weeks ahead of schedule",
      "category": "leadership",
      "has_quantification": true,
      "keywords": ["led", "cross-functional", "team", "product launch"],
      "quality_score": 9
    },
    ...
  ]
}
```

### `templates.json`
```json
{
  "templates": [
    {
      "name": "ATS Clean",
      "sections": ["Summary", "Experience", "Projects", "Education", "Skills"],
      "layout_type": "single-column",
      "ats_safe": true,
      "description": "Minimal single-column layout optimized for ATS"
    },
    ...
  ]
}
```

## Output Schema
```typescript
interface KnowledgeProcessorOutput {
  files_processed: string[];
  outputs_created: string[];
  errors: Array<{
    file: string;
    error: string;
  }>;
  metadata: {
    total_pdfs: number;
    successful: number;
    failed: number;
    processing_time_ms: number;
  };
}
```

## Usage Notes
- Run this skill during initial setup: `npm run process-knowledge`
- Re-run when PDFs are updated in knowledge-base/raw/
- Skills load JSON outputs at runtime
- Processing is idempotent (safe to re-run)
