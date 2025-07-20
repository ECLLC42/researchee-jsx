import { NextRequest, NextResponse } from 'next/server';
import { optimizeQuestion } from '@/lib/utils/openai';
import type { OPTIMIZATION_PROMPTS } from '@/lib/utils/openai';

export const maxDuration = 300;
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  console.log('[Optimize API] POST request started');
  try {
    const { question, occupation } = await request.json();
    console.log('[Optimize API] Received payload:', { question, occupation });

    if (!question) {
      console.warn('[Optimize API] Missing question');
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[Optimize API] OpenAI API key not available, returning original question');
      return NextResponse.json({ optimizedQuestion: question });
    }

    console.log('[Optimize API] Optimizing question...');
    const optimizedQuestion = await optimizeQuestion(question, occupation);
    console.log('[Optimize API] Question optimized:', optimizedQuestion);
    return NextResponse.json({ optimizedQuestion });
  } catch (error) {
    console.error('[Optimize API] Failed to optimize question:', error);
    return NextResponse.json(
      { error: 'Failed to optimize question' },
      { status: 500 }
    );
  }
} 