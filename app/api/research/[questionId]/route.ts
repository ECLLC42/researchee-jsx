import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getResearchData } from '@/lib/utils/storage';

export async function GET(
  request: NextRequest,
  context: { params: { questionId: string } }
) {
  try {
    const { questionId } = context.params;
    
    if (!questionId) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    const researchData = await getResearchData(questionId);
    
    return NextResponse.json({
      articles: researchData.articles,
      keywords: researchData.keywords,
      timestamp: researchData.timestamp,
      question: researchData.question
    });

  } catch (error) {
    console.error('Error fetching research data:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: 'Research data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch research data' },
      { status: 500 }
    );
  }
} 