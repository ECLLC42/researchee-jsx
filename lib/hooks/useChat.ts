'use client';

import { useChat as useVercelChat, Message } from 'ai/react';
import { useState } from 'react';
import type { ExtendedMessage, Article, Occupation, ResponseLength } from '@/lib/types';
import { nanoid } from 'nanoid';

export function useChat() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingArticles, setIsFetchingArticles] = useState(false);

  const chatHelpers = useVercelChat({
    api: '/api/chat',
    body: {
      responseLength: 'standard',
      searchSource: 'both'
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
      
      console.log('[Chat] Response received:', { searchEnabled, id, studyCount });

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
    }
  }) => {
    e.preventDefault();
    
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
        responseLength: options?.data?.responseLength || 'standard',
        withSearch: options?.data?.withSearch,
        searchSource: options?.data?.searchSource || 'both'
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
    }
  }) => {
    if (!options?.data?.withSearch) {
      setArticles([]);
      setError(null);
      setIsFetchingArticles(false);
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
        occupation: options?.data?.occupation || 'Researcher',
        responseLength: options?.data?.responseLength || 'standard',
        withSearch: options?.data?.withSearch ?? true,
        searchSource: options?.data?.searchSource || 'both'
      }
    });
    
    // Clear the input after submission
    chatHelpers.setInput('');
  };

  return {
    ...chatHelpers,
    handleSubmit,
    submitQuery,
    articles,
    questionId,
    error,
    isFetchingArticles,
    hasArticles: articles.length > 0,
    articlesCount: articles.length,
    messagesCount: chatHelpers.messages.length
  };
}