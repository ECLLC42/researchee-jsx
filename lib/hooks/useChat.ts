'use client';

import { useChat as useVercelChat } from 'ai/react';
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
      responseLength: 'standard'
    },
    onFinish: async (message: ExtendedMessage) => {
      if (!questionId) return;
      
      setIsFetchingArticles(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/research/${questionId}`);
        const data = await response.json();
        
        if (data.articles?.length) {
          setArticles(data.articles);
        } else {
          setError('No articles found for this research query');
        }
      } catch (error) {
        console.error('Error fetching research data:', error);
        setError('An error occurred while loading articles');
      } finally {
        setIsFetchingArticles(false);
      }
    },
    onResponse: async (response) => {
      const id = response.headers.get('X-Question-ID');
      if (id) {
        setQuestionId(id);
        setArticles([]);
        setError(null);
      }
      
      // Clone the response since it can only be read once
      const clone = response.clone();
      // Read the response content
      const content = await clone.text();
      
      // Append the assistant's message
      chatHelpers.setMessages(prev => [...prev, {
        id: nanoid(),
        role: 'assistant',
        content
      }]);
    },
    id: 'research-chat'
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>, options?: { 
    data?: {
      occupation: Occupation;
      responseLength: ResponseLength;
    }
  }) => {
    e.preventDefault();
    
    chatHelpers.append({
      id: nanoid(),
      role: 'user',
      content: chatHelpers.input,
      metadata: {
        responseLength: options?.data?.responseLength || 'standard'
      }
    } as ExtendedMessage);
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