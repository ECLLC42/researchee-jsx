import { parseStringPromise } from 'xml2js';
import { BasePaper } from './types';

export interface PubMedPaper extends BasePaper {
  source: 'pubmed';
  pmid: string;
  // Any PubMed-specific properties can be added here
}

/**
 * Fetches relevant papers from PubMed based on a search query
 * @param query The search query
 * @param maxResults Maximum number of results to return (default: 10)
 * @returns An array of PubMedPaper objects
 */
export async function searchPubMed(query: string, maxResults: number = 10): Promise<PubMedPaper[]> {
  console.log('🔎 PubMed: Starting search', { query, maxResults });
  
  // Encode the query for URL
  const encodedQuery = encodeURIComponent(query.trim());
  
  try {
    // Step 1: Search PubMed to get IDs
    console.log('🔍 PubMed: Searching for article IDs');
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodedQuery}&retmax=${maxResults}&sort=relevance`;
    console.log('🌐 PubMed: Search URL', { url: searchUrl });
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      console.error('❌ PubMed: Search API request failed', { status: searchResponse.status });
      throw new Error(`PubMed search API request failed with status: ${searchResponse.status}`);
    }
    
    const searchXml = await searchResponse.text();
    console.log('📦 PubMed: Search XML received', { bytes: searchXml.length });
    
    const searchResult = await parseStringPromise(searchXml, { explicitArray: false });
    const idList = searchResult.eSearchResult?.IdList?.Id || [];
    
    const ids = Array.isArray(idList) ? idList : [idList];
    console.log('🔢 PubMed: Article IDs found', { count: ids.length });
    
    if (ids.length === 0) {
      console.log('⚠️ PubMed: No article IDs found');
      return [];
    }
    
    // Step 2: Fetch article details using the IDs
    const idString = Array.isArray(ids) ? ids.join(',') : ids;
    const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${idString}&retmode=xml`;
    console.log('🌐 PubMed: Fetch URL', { url: fetchUrl });
    
    const fetchResponse = await fetch(fetchUrl);
    if (!fetchResponse.ok) {
      console.error('❌ PubMed: Fetch API request failed', { status: fetchResponse.status });
      throw new Error(`PubMed fetch API request failed with status: ${fetchResponse.status}`);
    }
    
    const fetchXml = await fetchResponse.text();
    console.log('📦 PubMed: Article data XML received', { bytes: fetchXml.length });
    
    const fetchResult = await parseStringPromise(fetchXml, { explicitArray: false });
    const articles = fetchResult.PubmedArticleSet?.PubmedArticle || [];
    
    const articleList = Array.isArray(articles) ? articles : [articles];
    console.log('📄 PubMed: Articles found', { count: articleList.length });
    
    // Parse articles into a more usable format
    const papers = articleList.map((article: any): PubMedPaper => {
      const medlineCitation = article.MedlineCitation;
      const articleData = medlineCitation.Article;
      
      // Extract PMID
      const pmid = medlineCitation.PMID?._; 
      
      // Extract title
      const title = articleData.ArticleTitle || 'No title available';
      
      // Extract abstract
      let summary = 'No abstract available';
      if (articleData.Abstract && articleData.Abstract.AbstractText) {
        if (Array.isArray(articleData.Abstract.AbstractText)) {
          summary = articleData.Abstract.AbstractText.map((text: any) => {
            if (typeof text === 'string') return text;
            return text._ || '';
          }).join(' ');
        } else {
          summary = articleData.Abstract.AbstractText._ || articleData.Abstract.AbstractText;
        }
      }
      
      // Extract authors
      let authors: string[] = [];
      if (articleData.AuthorList && articleData.AuthorList.Author) {
        const authorList = Array.isArray(articleData.AuthorList.Author) 
          ? articleData.AuthorList.Author 
          : [articleData.AuthorList.Author];
          
        authors = authorList.map((author: any) => {
          if (author.LastName && author.ForeName) {
            return `${author.LastName} ${author.ForeName}`;
          } else if (author.LastName) {
            return author.LastName;
          } else if (author.CollectiveName) {
            return author.CollectiveName;
          }
          return 'Unknown Author';
        });
      }
      
      // Extract journal information
      const journal = articleData.Journal?.Title || 'Unknown Journal';
      
      // Extract publication date
      let published = 'Unknown date';
      if (articleData.Journal?.JournalIssue?.PubDate) {
        const pubDate = articleData.Journal.JournalIssue.PubDate;
        const year = pubDate.Year || '';
        const month = pubDate.Month || '';
        const day = pubDate.Day || '';
        published = [year, month, day].filter(Boolean).join(' ');
      }
      
      // Generate a URL
      const url = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
      
      return {
        title,
        summary: summary.replace(/\s+/g, ' ').trim(),
        url,
        authors,
        published,
        journal,
        pmid,
        source: 'pubmed'
      };
    });
    
    console.log('✅ PubMed: Papers processed', { 
      count: papers.length, 
      titles: papers.slice(0, 2).map(p => p.title.substring(0, 30) + '...') 
    });
    
    return papers;
    
  } catch (error) {
    console.error('❌ PubMed: Error fetching data', error);
    return [];
  }
} 