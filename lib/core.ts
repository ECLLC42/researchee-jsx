import { CorePaper } from './types';

/**
 * Searches for papers in the CORE database
 * @param query Search query
 * @param apiKey CORE API key
 * @param maxResults Maximum number of results to return (default: 10)
 * @returns Array of paper objects
 */
export async function searchCore(query: string, apiKey: string, maxResults: number = 10): Promise<CorePaper[]> {
  console.log('🔎 CORE: Starting search', { query, maxResults });
  
  if (!apiKey) {
    console.error('❌ CORE: API key is required');
    return [];
  }
  
  // Encode the query for URL
  const encodedQuery = encodeURIComponent(query.trim());
  const url = 'https://api.core.ac.uk/v3/search/works';
  
  console.log('🌐 CORE: Request URL', { url, query: encodedQuery });
  
  const searchParams = {
    q: query,
    limit: maxResults,
    offset: 0
  };
  
  try {
    // Fetch data from CORE
    console.log('📡 CORE: Sending request');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(searchParams)
    });
    
    if (!response.ok) {
      console.error('❌ CORE: API request failed', { status: response.status });
      throw new Error(`CORE API request failed with status: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    console.log('📦 CORE: Data received', { 
      totalHits: data.totalHits || 0,
      returnedResults: data.results?.length || 0
    });
    
    if (!data.results || data.results.length === 0) {
      console.log('⚠️ CORE: No results found');
      return [];
    }
    
    // Process the results
    const papers: CorePaper[] = data.results.map((result: any) => {
      // Extract authors
      const authors = (result.authors || []).map((author: any) => {
        if (typeof author === 'string') return author;
        return author.name || 'Unknown Author';
      });
      
      // Extract publication date
      const published = result.publishedDate || 'Unknown date';
      
      // Extract title and abstract
      const title = result.title || 'Untitled';
      const summary = result.abstract || result.description || 'No abstract available';
      
      // Extract DOI
      const doi = result.doi;
      
      // Extract download URL
      const downloadUrl = result.downloadUrl;
      
      // Extract repository information
      const repositoryName = result.repositoryName;
      
      // Extract URL (prefer download URL, fall back to landing page or DOI)
      const url = result.downloadUrl || result.sourceFulltextUrls?.[0] || result.sourceUrls?.[0] || 
                  (doi ? `https://doi.org/${doi}` : `https://core.ac.uk/works/${result.id}`);
      
      // Construct the paper object
      return {
        title,
        summary,
        url,
        authors: authors.length > 0 ? authors : ['Unknown Author'],
        published,
        journal: result.publisher || 'Unknown Source',
        source: 'core',
        doi,
        downloadUrl,
        repositoryName
      };
    });
    
    console.log('✅ CORE: Papers processed', { 
      count: papers.length, 
      titles: papers.slice(0, 2).map(p => p.title.substring(0, 30) + '...')
    });
    
    return papers;
  } catch (error) {
    console.error('❌ CORE: Error fetching data', error);
    return [];
  }
} 