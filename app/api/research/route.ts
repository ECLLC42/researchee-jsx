import { NextRequest, NextResponse } from 'next/server';
import { uploadResearchData } from '@/lib/utils/storage';

export const maxDuration = 300;
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  console.log('[Research API] POST request started');
  try {
    const { questionId, data } = await request.json();
    console.log('[Research API] Received payload:', { questionId, data });

    if (!questionId || !data) {
      console.warn('[Research API] Missing questionId or data');
      return NextResponse.json(
        { error: 'Question ID and data are required' },
        { status: 400 }
      );
    }

    console.log('[Research API] Uploading research data');
    await uploadResearchData(questionId, data);
    console.log('[Research API] Research data uploaded successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Research API] Error storing research data:', error);
    return NextResponse.json(
      { error: 'Failed to store research data' },
      { status: 500 }
    );
  }
} 