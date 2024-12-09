import { NextRequest, NextResponse } from 'next/server';
import { getResearchData } from '@/lib/utils/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;
    
    // Add retry logic with timeout
    let retries = 3;
    let researchData = null;
    
    while (retries > 0) {
      try {
        researchData = await getResearchData(questionId);
        if (researchData) break;
      } catch (error) {
        console.log(`Attempt ${4 - retries} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between retries
        retries--;
      }
    }

    if (!researchData) {
      return NextResponse.json(
        { error: 'Research data not found after multiple attempts' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      articles: researchData.articles,
      keywords: researchData.keywords,
      timestamp: researchData.timestamp,
      question: researchData.question
    });
  } catch (error) {
    console.error('Error in research route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research data' },
      { status: 500 }
    );
  }
} 