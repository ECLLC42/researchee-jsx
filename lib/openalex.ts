import { OpenAlexPaper } from './types';

/**
 * Searches for scholarly papers on OpenAlex
 * @param query Search query
 * @param maxResults Maximum number of results to return (default: 10)
 * @returns Array of paper objects
 */
export async function searchOpenAlex(query: string, maxResults: number = 10): Promise<OpenAlexPaper[]> {
  console.log('🔎 OpenAlex: Starting search', { query, maxResults });
  
  // Encode the query for URL
  const encodedQuery = encodeURIComponent(query.trim());
  const url = `https://api.openalex.org/works?search=${encodedQuery}&per-page=${maxResults}&sort=relevance_score:desc&filter=has_doi:true`;
  
  console.log('🌐 OpenAlex: Request URL', { url });
  
  try {
    // Fetch data from OpenAlex
    console.log('📡 OpenAlex: Sending request');
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ OpenAlex: API request failed', { status: response.status });
      throw new Error(`OpenAlex API request failed with status: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    console.log('📦 OpenAlex: Data received', { 
      resultCount: data.meta?.count || 0,
      returnedResults: data.results?.length || 0
    });
    
    // Process the results
    const papers: OpenAlexPaper[] = (data.results || []).map((result: any) => {
      // Extract authors
      const authors = (result.authorships || []).map((authorship: any) => 
        authorship.author?.display_name || 'Unknown Author'
      );
      
      // Extract publication date
      const published = result.publication_date || 'Unknown date';
      
      // Extract title and abstract
      const title = result.title || 'Untitled';
      const summary = result.abstract || 'No abstract available';
      
      // Extract DOI
      const doi = result.doi;
      
      // Extract URL (prefer DOI URL, fall back to OA URL or OpenAlex URL)
      const url = doi ? `https://doi.org/${doi.replace('https://doi.org/', '')}`
        : result.open_access?.oa_url || result.id?.replace('https://openalex.org/', 'https://explore.openalex.org/');
      
      // Extract journal information
      const journal = result.primary_location?.source?.display_name || 'Unknown Source';
      
      // Extract open access status
      const openAccess = !!result.open_access?.is_oa;
      
      // Extract citation count
      const citationCount = result.cited_by_count;
      
      return {
        title,
        summary,
        url,
        authors,
        published,
        journal,
        source: 'openalex' as const,
        doi,
        openAccess,
        citationCount
      };
    });
    
    console.log('✅ OpenAlex: Papers processed', { 
      count: papers.length, 
      titles: papers.slice(0, 2).map(p => p.title.substring(0, 30) + '...')
    });
    
    return papers;
  } catch (error) {
    console.error('❌ OpenAlex: Error fetching data', error);
    return [];
  }
} 