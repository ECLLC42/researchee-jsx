import { NextRequest, NextResponse } from 'next/server';
import { getResearchData } from '@/lib/utils/storage';

export const maxDuration = 300;
export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const { questionId } = params;
    console.log('[Research GET API] GET request started for questionId:', questionId);
    
    const researchData = await getResearchData(questionId);
    
    if (!researchData) {
      console.warn('[Research GET API] Research data not found');
      return NextResponse.json(
        { error: 'Research data not found' },
        { status: 404 }
      );
    }
    
    console.log('[Research GET API] Returning research data');
    return NextResponse.json({
      articles: researchData.articles,
      keywords: researchData.keywords,
      timestamp: researchData.timestamp,
      question: researchData.question,
      optimizedQuestion: researchData.optimizedQuestion,
      occupation: researchData.occupation,
      answer: researchData.answer,
      citations: researchData.citations
    });
  } catch (error) {
    console.error('[Research GET API] Error in research route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research data' },
      { status: 500 }
    );
  }
} 