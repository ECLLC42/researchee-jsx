import { NextResponse } from 'next/server';
import { searchPubMed } from '@/lib/utils/pubmed';

export async function POST(request: Request) {
  try {
    const { keywords } = await request.json();

    if (!keywords?.length) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }

    const articles = await searchPubMed(keywords);

    if (!articles.length) {
      return NextResponse.json(
        { error: 'No articles found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error in PubMed search:', error);
    return NextResponse.json(
      { error: 'Failed to search PubMed' },
      { status: 500 }
    );
  }
}
