'use client';

import { useChat as useVercelChat, Message } from 'ai/react';
import { useState } from 'react';
import type { ExtendedMessage, Article, Occupation, ResponseLength } from '@/lib/types/index';
import { nanoid } from 'nanoid';

export function useChat() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingArticles, setIsFetchingArticles] = useState(false);
  const [currentOccupation, setCurrentOccupation] = useState<Occupation>('Researcher');
  const [currentResponseLength, setCurrentResponseLength] = useState<ResponseLength>('standard');
  const [showReasoning, setShowReasoning] = useState(false);

  const chatHelpers = useVercelChat({
    api: '/api/chat',
    body: {
      occupation: currentOccupation,
      responseLength: currentResponseLength,
      searchSource: 'both',
      showReasoning
    },
    onError: (error) => {
      console.error('[Chat] Error in chat response:', error);
      setError('The request timed out. Please try again.');
      setIsFetchingArticles(false);
    },
    onResponse: async (response) => {
      const searchEnabled = response.headers.get('X-Search-Enabled') === 'true';
      const id = response.headers.get('X-Question-ID');
      const studyCount = response.headers.get('X-Study-Count');
      const reasoningAvailable = response.headers.get('X-Reasoning-Available') === 'true';
      
      console.log('[Chat] Response received:', { searchEnabled, id, studyCount, reasoningAvailable });

      if (searchEnabled && id) {
        setQuestionId(id);
        setIsFetchingArticles(true);

        try {
          const researchResponse = await fetch(`/api/research/${id}`);
          const data = await researchResponse.json();
          
          if (data.articles?.length) {
            console.log(`[Chat] Loaded ${data.articles.length} articles`);
            setArticles(data.articles);
            setError(null);
          }
        } catch (error) {
          console.error('[Chat] Error fetching research data:', error);
          setError('Failed to load research articles');
        } finally {
          setIsFetchingArticles(false);
        }
      }
    },
    id: 'research-chat'
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, options?: { 
    data?: {
      occupation: Occupation;
      responseLength: ResponseLength;
      withSearch: boolean;
      searchSource: 'pubmed' | 'arxiv' | 'both';
      showReasoning?: boolean;
    }
  }) => {
    e.preventDefault();
    
    // Update current settings if provided
    if (options?.data?.occupation) {
      setCurrentOccupation(options.data.occupation);
    }
    if (options?.data?.responseLength) {
      setCurrentResponseLength(options.data.responseLength);
    }
    if (options?.data?.showReasoning !== undefined) {
      setShowReasoning(options.data.showReasoning);
    }
    
    if (!options?.data?.withSearch) {
      setArticles([]);
      setError(null);
      setIsFetchingArticles(false);
    }

    chatHelpers.append({
      id: nanoid(),
      role: 'user' as const,
      content: chatHelpers.input,
      metadata: {
        responseLength: options?.data?.responseLength || currentResponseLength,
        withSearch: options?.data?.withSearch,
        searchSource: options?.data?.searchSource || 'both',
        occupation: options?.data?.occupation || currentOccupation,
        showReasoning: options?.data?.showReasoning ?? showReasoning
      }
    } as Message);

    chatHelpers.setInput('');
  };

  // Add submitQuery function for programmatic submissions
  const submitQuery = (content: string, options?: { 
    data?: {
      occupation: Occupation;
      responseLength: ResponseLength;
      withSearch: boolean;
      searchSource: 'pubmed' | 'arxiv' | 'both';
      showReasoning?: boolean;
    }
  }) => {
    if (!options?.data?.withSearch) {
      setArticles([]);
      setError(null);
      setIsFetchingArticles(false);
    }

    // Update current settings if provided
    if (options?.data?.occupation) {
      setCurrentOccupation(options.data.occupation);
    }
    if (options?.data?.responseLength) {
      setCurrentResponseLength(options.data.responseLength);
    }
    if (options?.data?.showReasoning !== undefined) {
      setShowReasoning(options.data.showReasoning);
    }

    // First set the input content
    chatHelpers.setInput(content);
    
    // Then use the internal methods from the AI SDK
    chatHelpers.append({
      id: nanoid(),
      role: 'user',
      content: content,
      createdAt: new Date()
    });
    
    // Trigger the chat completion with proper options
    chatHelpers.reload({
      body: {
        occupation: options?.data?.occupation || currentOccupation,
        responseLength: options?.data?.responseLength || currentResponseLength,
        withSearch: options?.data?.withSearch ?? true,
        searchSource: options?.data?.searchSource || 'both',
        showReasoning: options?.data?.showReasoning ?? showReasoning
      }
    });
    
    // Clear the input after submission
    chatHelpers.setInput('');
  };

  return {
    ...chatHelpers,
    articles,
    error,
    isFetchingArticles,
    handleSubmit,
    submitQuery,
    currentOccupation,
    setCurrentOccupation,
    currentResponseLength,
    setCurrentResponseLength,
    showReasoning,
    setShowReasoning
  };
}