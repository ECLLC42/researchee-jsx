'use client';

import { useChat as useVercelChat } from 'ai/react';
import { useState } from 'react';
import type { ExtendedMessage, Article, Occupation, ResponseLength } from '@/lib/types';
import { nanoid } from 'nanoid';
import type { Message } from 'ai';

export function useChat() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFetchingArticles, setIsFetchingArticles] = useState(false);

  const chatHelpers = useVercelChat({
    api: '/api/chat',
    body: {
      responseLength: 'standard'
    },
    onFinish: async (message: ExtendedMessage) => {
      if (!message.metadata?.withSearch) return;
      
      if (!questionId) return;
      
      setIsFetchingArticles(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/research/${questionId}`);
        const data = await response.json();
        
        if (data.articles?.length) {
          console.log(`[Chat] Loaded ${data.articles.length} articles on finish`);
          setArticles(data.articles);
        } else {
          console.warn('[Chat] No articles in research data');
          setError('No articles found for this research query');
        }
      } catch (error) {
        console.error('[Chat] Error fetching research data:', error);
        setError('An error occurred while loading articles');
      } finally {
        setIsFetchingArticles(false);
      }
    },
    onResponse: async (response) => {
      const searchEnabled = response.headers.get('X-Search-Enabled') === 'true';
      
      if (searchEnabled) {
        const id = response.headers.get('X-Question-ID');
        if (id) {
          setQuestionId(id);
          setArticles([]);
          setError(null);
          setIsFetchingArticles(true);

          try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const researchResponse = await fetch(`/api/research/${id}`);
            const data = await researchResponse.json();
            
            if (data.articles?.length) {
              console.log(`[Chat] Loaded ${data.articles.length} articles on response`);
              setArticles(data.articles);
              setError(null);
            }
          } catch (error) {
            console.error('[Chat] Error fetching research data:', error);
          } finally {
            setIsFetchingArticles(false);
          }
        }
      } else {
        setArticles([]);
        setError(null);
        setIsFetchingArticles(false);
      }
      
      const clone = response.clone();
      const content = await clone.text();
      
      chatHelpers.setMessages((prev: Message[]) => [...prev, {
        id: nanoid(),
        role: 'assistant' as const,
        content
      } as Message]);
    },
    id: 'research-chat'
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, options?: { 
    data?: {
      occupation: Occupation;
      responseLength: ResponseLength;
      withSearch: boolean;
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
        withSearch: options?.data?.withSearch
      }
    } as Message);

    chatHelpers.setInput('');
  };

  return {
    ...chatHelpers,
    handleSubmit,
    articles,
    questionId,
    error,
    isFetchingArticles,
    hasArticles: articles.length > 0,
    articlesCount: articles.length,
    messagesCount: chatHelpers.messages.length
  };
}