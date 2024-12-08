'use client';

import { useChat } from '@/lib/hooks/useChat';
import { useResearch } from '@/lib/hooks/useResearch';
import ChatMessage from './ChatMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import { useEffect } from 'react';

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
    isFetchingArticles
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

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await optimizeAndSearch(input, 'Researcher');
      handleSubmit(e);
    } catch (error) {
      console.error('Error processing message:', error);
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
                
                {error && (
                  <div className="text-red-500 text-center p-2 bg-red-950/50 rounded-md">
                    {error}
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
        <form onSubmit={handleFormSubmit} className="p-4 border-t border-gray-800">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            disabled={isLoading || isFetchingArticles}
            className="w-full p-4 text-gray-200 bg-gray-900 rounded-lg border border-gray-800 
                     focus:border-blue-500 focus:ring-1 focus:ring-blue-500 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </form>
      </div>
    </div>
  );
}