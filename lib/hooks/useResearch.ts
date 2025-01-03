'use client';

import { useState } from 'react';
import { API_ENDPOINTS } from '@/lib/constants';
import { nanoid } from 'nanoid';

export function useResearch() {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeAndSearch = async (question: string, occupation: string) => {
    setIsOptimizing(true);
    try {
      // Generate questionId
      const questionId = nanoid();

      // Optimize question
      const optimizeRes = await fetch(API_ENDPOINTS.OPTIMIZE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, occupation })
      });
      
      if (!optimizeRes.ok) throw new Error('Failed to optimize question');
      const { optimizedQuestion } = await optimizeRes.json();
      
      // Extract keywords
      const keywordsRes = await fetch(API_ENDPOINTS.KEYWORDS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optimizedQuestion })
      });
      
      if (!keywordsRes.ok) throw new Error('Failed to extract keywords');
      const { keywords } = await keywordsRes.json();

      // Search PubMed
      const pubmedRes = await fetch(API_ENDPOINTS.PUBMED, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords })
      });

      if (!pubmedRes.ok) throw new Error('Failed to search PubMed');
      const { articles } = await pubmedRes.json();

      // Store research data
      await fetch(API_ENDPOINTS.RESEARCH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          data: {
            question,
            optimizedQuestion,
            keywords,
            articles,
            timestamp: new Date().toISOString(),
            occupation,
            answer: '',
            citations: []
          }
        })
      });

      return { questionId, optimizedQuestion };
    } catch (error) {
      console.error('Error in optimize and search:', error);
      throw error;
    } finally {
      setIsOptimizing(false);
    }
  };

  return { optimizeAndSearch, isOptimizing };
} 