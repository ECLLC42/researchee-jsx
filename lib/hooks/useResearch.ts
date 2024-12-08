'use client';

import { useState } from 'react';
import { API_ENDPOINTS } from '@/lib/constants';

export function useResearch() {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizeAndSearch = async (question: string, occupation: string) => {
    setIsOptimizing(true);
    try {
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
      
      return optimizedQuestion;
    } catch (error) {
      console.error('Error in optimize and search:', error);
      throw error;
    } finally {
      setIsOptimizing(false);
    }
  };

  return { optimizeAndSearch, isOptimizing };
} 