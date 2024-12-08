import { NextRequest, NextResponse } from 'next/server';
import { extractKeywords } from '@/lib/utils/keywords';

export async function POST(request: NextRequest) {
  try {
    const { optimizedQuestion } = await request.json();

    if (!optimizedQuestion) {
      return NextResponse.json(
        { error: 'Optimized question is required' }, 
        { status: 400 }
      );
    }

    const keywords = await extractKeywords(optimizedQuestion);
    return NextResponse.json({ keywords });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to extract keywords' }, 
      { status: 500 }
    );
  }
} 