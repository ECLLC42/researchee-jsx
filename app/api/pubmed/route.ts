import { NextRequest, NextResponse } from 'next/server';
import { searchPubMed } from '@/lib/utils/pubmed';

export const maxDuration = 300;
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  console.log('[PubMed API] POST request started');
  try {
    const { keywords } = await request.json();
    console.log('[PubMed API] Received keywords:', keywords);

    if (!keywords?.length) {
      console.warn('[PubMed API] No keywords provided');
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }

    console.log('[PubMed API] Initiating PubMed search...');
    const articles = await searchPubMed(keywords);
    console.log('[PubMed API] PubMed search completed. Articles found:', articles.length);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('[PubMed API] Failed to search PubMed:', error);
    return NextResponse.json(
      { error: 'Failed to search PubMed' },
      { status: 500 }
    );
  }
}
