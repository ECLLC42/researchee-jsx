import { NextRequest, NextResponse } from 'next/server';
import { searchPubMed } from '@/lib/utils/pubmed';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 58000);

  try {
    const { keywords } = await request.json();

    if (!keywords?.length) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }

    const articles = await searchPubMed(keywords);
    clearTimeout(timeoutId);
    return NextResponse.json({ articles });
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
    }
    return NextResponse.json(
      { error: 'Failed to search PubMed' },
      { status: 500 }
    );
  }
}
