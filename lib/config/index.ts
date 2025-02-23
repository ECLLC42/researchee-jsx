export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
    SCHOLARLY_DATABASES: {
      pubmed: {
        displayName: 'PubMed',
        endpoint: '/api/pubmed'
      },
      arxiv: {
        displayName: 'arXiv',
        endpoint: '/api/arxiv'
      }
    }
  }
};