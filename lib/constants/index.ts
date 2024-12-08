export const API_ENDPOINTS = {
    CHAT: '/api/chat',
    OPTIMIZE: '/api/optimize',
    KEYWORDS: '/api/keywords',
    PUBMED: '/api/pubmed',
    RELEVANCE: '/api/relevance',
    RESEARCH: '/api/research'
  } as const;
  
  export const MAX_RESULTS = 15;
  export const MAX_TOKENS = {
    STANDARD: 1800,
    EXTENDED: 3800
  } as const;
  
  export const STORAGE_FOLDERS = {
    HISTORY: 'history',
    CITATIONS: 'citations',
    RESEARCH: 'research',
    PDFS: 'pdfs'
  } as const;