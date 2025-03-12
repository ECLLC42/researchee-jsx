import { SemanticScholarPaper } from './types';

/**
 * Searches for papers in the Semantic Scholar database
 * @param query Search query
 * @param apiKey Optional Semantic Scholar API key for higher rate limits
 * @param maxResults Maximum number of results to return (default: 10)
 * @returns Array of paper objects
 */
export async function searchSemanticScholar(
  query: string, 
  apiKey?: string, 
  maxResults: number = 10
): Promise<SemanticScholarPaper[]> {
  console.log('🔎 SemanticScholar: Starting search', { query, maxResults });
  
  // Encode the query for URL
  const encodedQuery = encodeURIComponent(query.trim());
  const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodedQuery}&limit=${maxResults}&fields=title,abstract,authors,year,journal,externalIds,url,citationCount,influentialCitationCount`;
  
  console.log('🌐 SemanticScholar: Request URL', { url });
  
  try {
    // Fetch data from Semantic Scholar
    console.log('📡 SemanticScholar: Sending request');
    
    const headers: HeadersInit = {
      'Accept': 'application/json'
    };
    
    // Add API key if provided
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.error('❌ SemanticScholar: API request failed', { status: response.status });
      throw new Error(`Semantic Scholar API request failed with status: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    console.log('📦 SemanticScholar: Data received', { 
      total: data.total || 0,
      returnedResults: data.data?.length || 0
    });
    
    if (!data.data || data.data.length === 0) {
      console.log('⚠️ SemanticScholar: No results found');
      return [];
    }
    
    // Process the results
    const papers: SemanticScholarPaper[] = data.data.map((result: any) => {
      // Extract authors
      const authors = (result.authors || []).map((author: any) => author.name || 'Unknown Author');
      
      // Extract publication date/year
      const published = result.year ? `${result.year}` : 'Unknown date';
      
      // Extract title and abstract
      const title = result.title || 'Untitled';
      const summary = result.abstract || 'No abstract available';
      
      // Extract DOI
      const doi = result.externalIds?.DOI;
      
      // Extract paperId
      const paperId = result.paperId || '';
      
      // Extract citation count and influence score
      const citationCount = result.citationCount;
      const influenceScore = result.influentialCitationCount;
      
      // Construct URL (prefer provided URL, fall back to DOI or Semantic Scholar URL)
      const url = result.url || 
                  (doi ? `https://doi.org/${doi}` : `https://www.semanticscholar.org/paper/${paperId}`);
      
      // Extract journal
      const journal = result.journal?.name || 'Unknown Source';
      
      // Construct the paper object
      return {
        title,
        summary,
        url,
        authors: authors.length > 0 ? authors : ['Unknown Author'],
        published,
        journal,
        source: 'semanticscholar',
        doi,
        influenceScore,
        citationCount,
        paperId
      };
    });
    
    console.log('✅ SemanticScholar: Papers processed', { 
      count: papers.length, 
      titles: papers.slice(0, 2).map(p => p.title.substring(0, 30) + '...')
    });
    
    return papers;
  } catch (error) {
    console.error('❌ SemanticScholar: Error fetching data', error);
    return [];
  }
} 