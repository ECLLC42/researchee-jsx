import { NextResponse } from 'next/server';
import { getResearchData } from '@/lib/utils/storage';

interface RouteParams {
  params: {
    questionId: string;
  };
}

export async function GET(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { questionId } = params;
    
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