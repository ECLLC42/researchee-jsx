import type { PubMedArticle } from './pubmed';

export function checkArticleRelevance(
  query: string,
  articles: PubMedArticle[],
  maxResults: number = 10
): PubMedArticle[] {
  // Convert query to lowercase terms set
  const queryTerms = new Set(
    query.toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2) // Filter out very short words
  );

  // Score and sort articles by relevance
  const scoredArticles = articles.map(article => {
    const titleTerms = new Set(article.title.toLowerCase().split(/\s+/));
    const abstractTerms = new Set(article.abstract.toLowerCase().split(/\s+/));

    // Calculate matches in title and abstract
    const titleMatches = new Set(Array.from(queryTerms).filter(term => titleTerms.has(term)));
    const abstractMatches = new Set(Array.from(queryTerms).filter(term => abstractTerms.has(term)));

    // Score calculation: title matches count more than abstract matches
    const score = (titleMatches.size * 2) + abstractMatches.size;

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
    .filter(item => item.score > 0) // Only keep articles with matches
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.article);
} 