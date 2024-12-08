import { NextResponse } from 'next/server';
import { extractKeywords } from '@/lib/utils/keywords';

export async function POST(request: Request) {
  try {
    const { optimizedQuestion } = await request.json();

    if (!optimizedQuestion) {
      return NextResponse.json(
        { error: 'Optimized question is required' }, 
        { status: 400 }
      );
    }

    const keywords = await extractKeywords(optimizedQuestion);

    if (!keywords.length) {
      return NextResponse.json(
        { error: 'Failed to extract keywords' }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error('Error in keywords route:', error);
    return NextResponse.json(
      { error: 'Failed to extract keywords' }, 
      { status: 500 }
    );
  }
} 