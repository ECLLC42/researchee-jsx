import { parseStringPromise } from 'xml2js';
import { BasePaper } from './types';

export interface ArxivPaper extends BasePaper {
  source: 'arxiv';
  // Any arXiv-specific properties can be added here
}

/**
 * Fetches relevant papers from arXiv based on a search query
 * @param query The search query
 * @param maxResults Maximum number of results to return (default: 10)
 * @returns An array of ArxivPaper objects
 */
export async function searchArxiv(query: string, maxResults: number = 10): Promise<ArxivPaper[]> {
  console.log('🔎 arXiv: Starting search', { query, maxResults });
  
  // Encode the query for URL
  const encodedQuery = encodeURIComponent(query.trim());
  
  // Build the arXiv API URL
  const url = `http://export.arxiv.org/api/query?search_query=all:${encodedQuery}&start=0&max_results=${maxResults}&sortBy=relevance`;
  console.log('🌐 arXiv: Request URL', { url });
  
  try {
    // Fetch data from arXiv
    console.log('📡 arXiv: Sending request');
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('❌ arXiv: API request failed', { status: response.status });
      throw new Error(`ArXiv API request failed with status: ${response.status}`);
    }
    
    // Get the XML response as text
    const xmlData = await response.text();
    console.log('📦 arXiv: XML data received', { 
      bytes: xmlData.length,
      snippet: xmlData.substring(0, 100) + '...' 
    });
    
    // Parse the XML
    console.log('🔄 arXiv: Parsing XML');
    const result = await parseStringPromise(xmlData, { explicitArray: false });
    
    // Extract and format paper data
    const entries = Array.isArray(result.feed.entry) 
      ? result.feed.entry 
      : result.feed.entry 
        ? [result.feed.entry] 
        : [];
    
    console.log('📊 arXiv: Found entries', { count: entries.length });
    
    const papers = entries.map((entry: any): ArxivPaper => {
      // Extract authors (handle both single and multiple authors)
      let authors: string[] = [];
      if (entry.author) {
        if (Array.isArray(entry.author)) {
          authors = entry.author.map((author: any) => author.name);
        } else {
          authors = [entry.author.name];
        }
      }
      
      return {
        title: entry.title.replace(/\s+/g, ' ').trim(),
        summary: entry.summary.replace(/\s+/g, ' ').trim(),
        url: entry.id,
        authors,
        published: entry.published,
        source: 'arxiv'
      };
    });
    
    console.log('✅ arXiv: Papers processed', { 
      count: papers.length, 
      titles: papers.slice(0, 2).map(p => p.title.substring(0, 30) + '...') 
    });
    
    return papers;
  } catch (error) {
    console.error('❌ arXiv: Error fetching data', error);
    return [];
  }
} 