import { NextRequest, NextResponse } from 'next/server';
import { uploadResearchData } from '@/lib/utils/storage';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 58000);

  try {
    const { questionId, data } = await request.json();

    if (!questionId || !data) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'Question ID and data are required' },
        { status: 400 }
      );
    }

    await uploadResearchData(questionId, data);
    clearTimeout(timeoutId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
    }
    console.error('Error storing research data:', error);
    return NextResponse.json(
      { error: 'Failed to store research data' },
      { status: 500 }
    );
  }
} 