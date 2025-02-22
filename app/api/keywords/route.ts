import { NextRequest, NextResponse } from 'next/server';
import { extractKeywords } from '@/lib/utils/keywords';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 58000);

  try {
    const { optimizedQuestion } = await request.json();

    if (!optimizedQuestion) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'Optimized question is required' }, 
        { status: 400 }
      );
    }

    const keywords = await extractKeywords(optimizedQuestion);
    clearTimeout(timeoutId);
    return NextResponse.json({ keywords });
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
    }
    return NextResponse.json(
      { error: 'Failed to extract keywords' }, 
      { status: 500 }
    );
  }
} 