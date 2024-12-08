import { XMLParser } from 'fast-xml-parser';
import type { Article } from '@/lib/types';

const NCBI_BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/";
const NUM_RESULTS = 15;

export interface PubMedArticle extends Article {
  source: 'PubMed';
}

export async function searchPubMed(keywords: string[]): Promise<PubMedArticle[]> {
  if (!keywords.length) {
    console.warn("No keywords for PubMed search.");
    return [];
  }

  try {
    // Calculate date range
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 4;
    const query = `${keywords.join(' ')} AND ${startYear}:${currentYear}[pdat]`;

    // Create XML parser
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text"
    });

    // ESearch with XML
    const esearchUrl = `${NCBI_BASE_URL}esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${NUM_RESULTS}&retmode=xml`;
    const esearchResp = await fetch(esearchUrl);
    const esearchXml = await esearchResp.text();
    const esearchData = parser.parse(esearchXml);
    
    const idList = esearchData?.eSearchResult?.IdList?.Id || [];
    if (!Array.isArray(idList)) return [];

    // EFetch with XML
    const efetchUrl = `${NCBI_BASE_URL}efetch.fcgi?db=pubmed&id=${idList.join(',')}&retmode=xml`;
    const efetchResp = await fetch(efetchUrl);
    const efetchXml = await efetchResp.text();
    
    const xmlData = parser.parse(efetchXml);
    const articles = xmlData.PubmedArticleSet.PubmedArticle;

    return articles.map((article: any) => {
      const medlineCitation = article.MedlineCitation;
      const articleData = medlineCitation.Article;
      
      // Extract abstract
      let abstract = 'No abstract available';
      if (articleData.Abstract?.AbstractText) {
        if (Array.isArray(articleData.Abstract.AbstractText)) {
          abstract = articleData.Abstract.AbstractText
            .map((part: any) => part['#text'] || part)
            .join(' ');
        } else {
          abstract = articleData.Abstract.AbstractText['#text'] || articleData.Abstract.AbstractText;
        }
      }

      // Extract authors
      const authors = [];
      if (articleData.AuthorList?.Author) {
        const authorList = Array.isArray(articleData.AuthorList.Author) 
          ? articleData.AuthorList.Author 
          : [articleData.AuthorList.Author];

        for (const author of authorList) {
          if (author.LastName && author.ForeName) {
            authors.push(`${author.LastName} ${author.ForeName}`);
          }
        }
      }

      return {
        title: articleData.ArticleTitle['#text'] || articleData.ArticleTitle,
        abstract,
        authors,
        published: articleData.Journal?.JournalIssue?.PubDate?.Year || 'Unknown',
        source: 'PubMed' as const,
        url: `https://pubmed.ncbi.nlm.nih.gov/${medlineCitation.PMID['#text']}/`
      };
    });

  } catch (error) {
    console.error('Error processing PubMed articles:', error);
    return [];
  }
} 