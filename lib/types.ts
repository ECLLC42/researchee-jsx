import { ArxivPaper } from './arxiv';
import { PubMedPaper } from './pubmed';

// Base paper interface that all sources will implement
export interface BasePaper {
  title: string;
  summary: string;
  url: string;
  authors: string[];
  published: string;
  source: 'arxiv' | 'pubmed' | 'openalex' | 'unpaywall' | 'core' | 'semanticscholar';
  journal?: string;
}

// Type for OpenAlex papers
export interface OpenAlexPaper extends BasePaper {
  source: 'openalex';
  doi?: string;
  openAccess: boolean;
  citationCount?: number;
}

// Type for Unpaywall papers
export interface UnpaywallPaper extends BasePaper {
  source: 'unpaywall';
  doi: string;
  openAccess: boolean;
  pdfUrl?: string;
}

// Type for CORE papers
export interface CorePaper extends BasePaper {
  source: 'core';
  doi?: string;
  downloadUrl?: string;
  repositoryName?: string;
}

// Type for Semantic Scholar papers
export interface SemanticScholarPaper extends BasePaper {
  source: 'semanticscholar';
  doi?: string;
  influenceScore?: number;
  citationCount?: number;
  paperId: string;
}

// Union type for all paper sources
export type Paper = ArxivPaper | PubMedPaper | OpenAlexPaper | UnpaywallPaper | CorePaper | SemanticScholarPaper;

// Type alias for Article to maintain compatibility with code that uses this term
export type Article = Paper;

// Helper functions to identify paper sources
export function isPubMedPaper(paper: Paper): paper is PubMedPaper {
  return paper.source === 'pubmed';
}

export function isArxivPaper(paper: Paper): paper is ArxivPaper {
  return paper.source === 'arxiv';
}

export function isOpenAlexPaper(paper: Paper): paper is OpenAlexPaper {
  return paper.source === 'openalex';
}

export function isUnpaywallPaper(paper: Paper): paper is UnpaywallPaper {
  return paper.source === 'unpaywall';
}

export function isCorePaper(paper: Paper): paper is CorePaper {
  return paper.source === 'core';
}

export function isSemanticScholarPaper(paper: Paper): paper is SemanticScholarPaper {
  return paper.source === 'semanticscholar';
} 