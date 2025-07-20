import { NextRequest, NextResponse } from 'next/server';
import { optimizeQuestion } from '@/lib/utils/openai';
import type { OPTIMIZATION_PROMPTS } from '@/lib/utils/openai';

export const maxDuration = 300; // 5 minutes for complex optimization tasks
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { question, occupation = 'Researcher' } = await req.json();
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    console.log('[Optimize API] Optimizing question:', { question, occupation });
    
    const optimizedQuestion = await optimizeQuestion(question, occupation);
    
    console.log('[Optimize API] Optimization result:', optimizedQuestion);
    
    return NextResponse.json({ optimizedQuestion });
  } catch (error) {
    console.error('[Optimize API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize question' },
      { status: 500 }
    );
  }
} 