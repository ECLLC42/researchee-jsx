import { NextRequest, NextResponse } from 'next/server';
import { getResearchData } from '@/lib/utils/storage';

type Props = {
  params: {
    questionId: string;
  };
};

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    const { questionId } = params;
    const researchData = await getResearchData(questionId);
    
    return NextResponse.json({
      articles: researchData.articles,
      keywords: researchData.keywords,
      timestamp: researchData.timestamp,
      question: researchData.question
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch research data' },
      { status: 500 }
    );
  }
} 