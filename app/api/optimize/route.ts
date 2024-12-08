import { NextResponse } from 'next/server';
import { optimizeQuestion } from '@/lib/utils/openai';
import type { OPTIMIZATION_PROMPTS } from '@/lib/utils/openai';

export async function POST(request: Request) {
  try {
    const { question, occupation } = await request.json();

    console.log('Optimize request:', { question, occupation });

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

    console.log('Optimized result:', optimizedQuestion);

    return NextResponse.json({ optimizedQuestion });
  } catch (error) {
    console.error('Error in optimize route:', error);
    return NextResponse.json(
      { error: 'Failed to optimize question' }, 
      { status: 500 }
    );
  }
} 