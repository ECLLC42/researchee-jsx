import { NextRequest, NextResponse } from 'next/server';
import { getResearchData } from '@/lib/utils/storage';

export const maxDuration = 300; // 5 minutes for research data retrieval
export const runtime = 'edge';

export async function GET(
  req: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const { questionId } = params;
    console.log('[Research API] GET request for questionId:', questionId);
    
    const researchData = await getResearchData(questionId);
    
    if (!researchData) {
      console.warn('[Research API] No research data found for questionId:', questionId);
      return NextResponse.json(
        { error: 'Research data not found' },
        { status: 404 }
      );
    }
    
    console.log('[Research API] Successfully retrieved research data for questionId:', questionId);
    return NextResponse.json(researchData);
  } catch (error) {
    console.error('[Research API] Error retrieving research data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve research data' },
      { status: 500 }
    );
  }
} 