'use client';

import { useChat } from '@/lib/hooks/useChat';
import { useResearch } from '@/lib/hooks/useResearch';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Occupation, ResponseLength } from '@/lib/types';

export default function ChatInterface() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    articles,
    questionId,
    error,
    isFetchingArticles,
    setInput
  } = useChat();

  const { optimizeAndSearch } = useResearch();
  const hasArticles = Array.isArray(articles) && articles.length > 0;

  // Debug logging
  useEffect(() => {
    console.log('Chat Interface State:', {
      hasArticles,
      articlesCount: articles?.length,
      questionId,
      error,
      isLoading,
      isFetchingArticles,
      messagesCount: messages.length
    });
  }, [articles, questionId, error, isLoading, isFetchingArticles, messages.length, hasArticles]);

  const [errorState, setError] = useState('');

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>, options?: { 
    data?: {
      occupation: Occupation;
      responseLength: ResponseLength;
    }
  }) => {
    e.preventDefault();
    try {
      setInput('');
      
      const result = await optimizeAndSearch(input, options?.data?.occupation || 'Researcher');
      
      if (result?.questionId) {
        handleSubmit(e, {
          data: {
            occupation: options?.data?.occupation || 'Researcher',
            responseLength: options?.data?.responseLength || 'standard'
          }
        });
      } else {
        console.error('Research optimization failed - no questionId returned');
        setError('Failed to process research query');
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setError('An error occurred while processing your request');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-4xl mx-auto py-4">
          {messages.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              Start a conversation...
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage 
                  key={message.id} 
                  message={message}
                  articles={message.role === 'assistant' ? articles : undefined}
                />
              ))}
              
              {/* Status Messages */}
              <div className="mt-4 space-y-2">
                {isFetchingArticles && (
                  <div className="text-gray-400 text-center flex items-center justify-center gap-2">
                    <LoadingSpinner className="w-4 h-4" />
                    Searching research articles...
                  </div>
                )}
                
                {errorState && (
                  <div className="text-red-500 text-center p-2 bg-red-950/50 rounded-md">
                    {errorState}
                  </div>
                )}
                
                {hasArticles && (
                  <div className="text-center">
                    <Link 
                      href="/articles" 
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span className="text-sm">View {articles.length} Research Articles</span>
                      <span className="text-xs">(PubMed)</span>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute right-8 bottom-20">
            <LoadingSpinner />
          </div>
        )}
        <ChatInput
          onSend={handleFormSubmit}
          input={input}
          handleInputChange={handleInputChange}
          disabled={isLoading || isFetchingArticles}
        />
      </div>
    </div>
  );
}