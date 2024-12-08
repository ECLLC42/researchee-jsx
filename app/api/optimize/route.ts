import { NextRequest, NextResponse } from 'next/server';
import { optimizeQuestion } from '@/lib/utils/openai';
import type { OPTIMIZATION_PROMPTS } from '@/lib/utils/openai';

export async function POST(request: NextRequest) {
  try {
    const { question, occupation } = await request.json();

    if (!question || !occupation) {
      return NextResponse.json(
        { error: 'Question and occupation are required' }, 
        { status: 400 }
      );
    }

    const optimizedQuestion = await optimizeQuestion(
      question, 
      occupation as keyof typeof OPTIMIZATION_PROMPTS
    );

    return NextResponse.json({ optimizedQuestion });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to optimize question' }, 
      { status: 500 }
    );
  }
} 