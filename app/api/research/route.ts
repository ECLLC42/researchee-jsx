import { NextRequest, NextResponse } from 'next/server';
import { uploadResearchData } from '@/lib/utils/storage';

export async function POST(request: NextRequest) {
  try {
    const { questionId, data } = await request.json();

    if (!questionId || !data) {
      return NextResponse.json(
        { error: 'Question ID and data are required' },
        { status: 400 }
      );
    }

    await uploadResearchData(questionId, data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error storing research data:', error);
    return NextResponse.json(
      { error: 'Failed to store research data' },
      { status: 500 }
    );
  }
} 