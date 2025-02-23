import type { PubMedArticle } from './pubmed';
import type { Article } from '@/lib/types';

export function filterRelevantArticles(
  query: string,
  articles: (PubMedArticle | Article)[],
  maxResults: number = 10
): Article[] {
  // Convert query to lowercase terms set
  const queryTerms = new Set(
    query.toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 1) // Allow shorter relevant terms
  );

  // Score and sort articles by relevance
  const scoredArticles = articles.map(article => {
    const titleTerms = new Set(article.title.toLowerCase().split(/\s+/));
    const abstractTerms = new Set(article.abstract.toLowerCase().split(/\s+/));

    // Calculate matches in title and abstract
    const titleMatches = new Set(Array.from(queryTerms).filter(term => titleTerms.has(term)));
    const abstractMatches = new Set(Array.from(queryTerms).filter(term => abstractTerms.has(term)));

    // Score calculation with additional factors
    let score = (titleMatches.size * 2) + abstractMatches.size;
    
    // Add partial matching
    const partialMatchScore = calculatePartialMatchScore(article, query);
    score += partialMatchScore;

    // Add recency bonus
    const currentYear = new Date().getFullYear();
    const articleYear = parseInt(article.published);
    if (currentYear - articleYear <= 10) {
      score += 1;
    }
    
    // Add source-specific bonuses
    if ('source' in article) {
      // Boost arXiv papers for theoretical/mathematical queries
      if (article.source === 'arxiv' && 
          (query.toLowerCase().includes('theory') || 
           query.toLowerCase().includes('mathematical'))) {
        score *= 1.2;
      }
      // Boost PubMed papers for medical/clinical queries
      if (article.source === 'pubmed' && 
          (query.toLowerCase().includes('clinical') || 
           query.toLowerCase().includes('medical'))) {
        score *= 1.2;
      }
    }

    return {
      article,
      score,
      matches: {
        title: Array.from(titleMatches),
        abstract: Array.from(abstractMatches)
      }
    };
  });

  // Sort by score and return top N articles
  return scoredArticles
    .filter(item => item.score > 0.1) // Much lower threshold for matches
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.article);
}

export async function checkArticleRelevance(article: PubMedArticle, query: string) {
  // Adjust relevance thresholds
  const TITLE_RELEVANCE_THRESHOLD = 0.5;  // Lower threshold for title matching
  const ABSTRACT_RELEVANCE_THRESHOLD = 0.4; // Lower threshold for abstract matching
  
  // Consider more factors in relevance calculation
  const titleRelevance = calculateRelevanceScore(article.title, query);
  const abstractRelevance = calculateRelevanceScore(article.abstract, query);
  
  // Add weight to newer articles (within last 5 years)
  const currentYear = new Date().getFullYear();
  const articleYear = parseInt(article.published);
  const recencyBonus = (currentYear - articleYear <= 5) ? 0.1 : 0;
  
  // More nuanced relevance scoring
  const relevanceScore = Math.max(
    titleRelevance,
    abstractRelevance * 0.8  // Give slightly less weight to abstract matches
  ) + recencyBonus;
  
  return relevanceScore > TITLE_RELEVANCE_THRESHOLD;
}

function calculateRelevanceScore(text: string, query: string) {
  // Consider partial matches more generously
  const words = query.toLowerCase().split(' ');
  const textLower = text.toLowerCase();
  
  // Calculate word match ratio
  const matchCount = words.filter(word => textLower.includes(word)).length;
  const wordMatchScore = matchCount / words.length;
  
  // Combine with existing similarity metrics
  return Math.max(
    wordMatchScore * 0.8  // Give partial matches significant weight
  );
}

function calculatePartialMatchScore(article: Article, query: string): number {
  let score = 0;
  const queryWords = query.toLowerCase().split(/\s+/);
  const titleWords = article.title.toLowerCase();
  const abstractWords = article.abstract.toLowerCase();
  
  for (const word of queryWords) {
    if (word.length < 4) continue;
    if (titleWords.includes(word)) score += 0.5;
    if (abstractWords.includes(word)) score += 0.3;
  }
  
  return score;
} 