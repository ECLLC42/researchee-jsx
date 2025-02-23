import { NextRequest, NextResponse } from 'next/server';
import { extractKeywords } from '@/lib/utils/keywords';

export const maxDuration = 300;
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  console.log('[Keywords API] POST request started');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log('[Keywords API] Aborting request due to timeout');
    controller.abort();
  }, 58000);

  try {
    const { optimizedQuestion } = await request.json();
    console.log('[Keywords API] Received optimized question:', optimizedQuestion);

    if (!optimizedQuestion) {
      console.warn('[Keywords API] Missing optimized question');
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'Optimized question is required' }, 
        { status: 400 }
      );
    }

    console.log('[Keywords API] Extracting keywords...');
    const keywords = await extractKeywords(optimizedQuestion);
    console.log('[Keywords API] Keywords extracted:', keywords);
    clearTimeout(timeoutId);
    return NextResponse.json({ keywords });
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[Keywords API] Request aborted due to timeout');
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
    }
    console.error('[Keywords API] Failed to extract keywords:', error);
    return NextResponse.json(
      { error: 'Failed to extract keywords' }, 
      { status: 500 }
    );
  }
} 