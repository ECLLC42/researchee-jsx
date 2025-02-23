// app/api/arxiv/route.ts
import { NextResponse } from 'next/server';
import { fetchArxiv } from '@/lib/utils/arxiv';

export async function GET(req: Request) {
  console.log('[arXiv API] GET request started. URL:', req.url);
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    console.warn('[arXiv API] Missing query parameter');
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    console.log('[arXiv API] Fetching articles for query:', query);
    const articles = await fetchArxiv(query);
    console.log(`[arXiv API] Successfully returned ${articles.length} articles for query: "${query}"`);
    return NextResponse.json(articles);
  } catch (error) {
    console.error('[arXiv API] Failed to fetch data:', error);
    return NextResponse.json({ error: 'Failed to fetch data from arXiv' }, { status: 500 });
  }
}