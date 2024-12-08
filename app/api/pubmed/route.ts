import { NextRequest, NextResponse } from 'next/server';
import { searchPubMed } from '@/lib/utils/pubmed';

export async function POST(request: NextRequest) {
  try {
    const { keywords } = await request.json();

    if (!keywords?.length) {
      return NextResponse.json(
        { error: 'Keywords are required' },
        { status: 400 }
      );
    }

    const articles = await searchPubMed(keywords);
    return NextResponse.json({ articles });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to search PubMed' },
      { status: 500 }
    );
  }
}
