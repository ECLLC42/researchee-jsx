// lib/utils/arxiv.ts
import { parseStringPromise } from 'xml2js';

export async function fetchArxiv(query: string) {
  try {
    const apiUrl = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=10`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch from arXiv');
    }
    const xml = await response.text();
    const parsed = await parseStringPromise(xml, { explicitArray: false });
    const entries = parsed.feed.entry;
    if (!entries) return [];
    const entryArray = Array.isArray(entries) ? entries : [entries];
    const articles = entryArray.map((entry: any) => {
      const title = entry.title ? entry.title.trim() : '';
      const abstract = entry.summary ? entry.summary.trim() : '';
      let authors: string[] = [];
      if (entry.author) {
        if (Array.isArray(entry.author)) {
          authors = entry.author.map((a: any) => a.name ? a.name.trim() : '');
        } else if (entry.author.name) {
          authors = [entry.author.name.trim()];
        }
      }
      const publishedYear = entry.published ? entry.published.substring(0, 4) : 'Unknown';
      return {
        title,
        abstract,
        authors,
        published: publishedYear,
        url: '', // If desired, you can set a URL here later
        source: 'arXiv'
      };
    });
    
    console.log(`[arXiv] Found ${articles.length} articles for query: "${query}"`);
    return articles;
  } catch (error) {
    console.error('[arXiv] Error fetching data:', error);
    throw error;
  }
}

export async function searchArxiv(query: string) {
  try {
    const response = await fetch('/api/arxiv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      console.error('[arXiv] Search failed:', response.status, await response.text());
      return [];
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('[arXiv] Search error:', error);
    return [];
  }
}