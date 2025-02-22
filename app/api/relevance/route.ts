import { NextResponse } from 'next/server';
import { checkArticleRelevance } from '@/lib/utils/relevance';
import type { PubMedArticle } from '@/lib/utils/pubmed';

export async function POST(request: Request) {
  try {
    const { query, articles } = await request.json();

    if (!query || !articles?.length) {
      return NextResponse.json(
        { error: 'Query and articles are required' },
        { status: 400 }
      );
    }

    const relevantArticles = checkArticleRelevance(
      query,
      articles as PubMedArticle[],
      25
    );

    if (!relevantArticles.length) {
      return NextResponse.json(
        { error: 'No relevant articles found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ articles: relevantArticles });
  } catch (error) {
    console.error('Error checking article relevance:', error);
    return NextResponse.json(
      { error: 'Failed to check article relevance' },
      { status: 500 }
    );
  }
} 