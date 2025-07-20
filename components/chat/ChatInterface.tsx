'use client';

import { useChat } from '@/lib/hooks/useChat';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { SaveSessionDialog } from '../ui/SaveSessionDialog';
import { useState, useRef, useEffect } from 'react';

export default function ChatInterface() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    articles,
    error,
    isFetchingArticles,
    currentOccupation,
    setCurrentOccupation,
    currentResponseLength,
    setCurrentResponseLength,
    showReasoning,
    setShowReasoning
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Show scroll button when scrolled up
  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.messages-container');
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        setShowScrollButton(scrollTop + clientHeight < scrollHeight - 100);
      }
    };

    const container = document.querySelector('.messages-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const hasArticles = Array.isArray(articles) && articles.length > 0;

  const handleSaveSession = () => {
    console.log('Saving session...');
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Brilliance Research</h1>
              <p className="text-sm text-gray-400">AI-Powered Research Assistant</p>
            </div>
          </div>
          <SaveSessionDialog onConfirm={handleSaveSession} />
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto messages-container px-6 py-4 space-y-6">
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">B</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Welcome to Brilliance</h2>
                  <p className="text-gray-400 max-w-md">
                    I&apos;m your AI research assistant. Ask me anything about research, medicine, or psychology, 
                    and I&apos;ll help you find the latest insights and evidence.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
              />
            ))}

            {isLoading && (
              <div className="flex items-center space-x-3 text-gray-400 py-4">
                <LoadingSpinner className="w-5 h-5" />
                <span>Analyzing your question...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-300">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom button */}
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-20 right-6 p-3 rounded-full bg-gray-800/90 border border-gray-700 text-gray-300 hover:bg-gray-700/90 transition-all duration-200 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Articles Section */}
      {hasArticles && (
        <div className="border-t border-gray-800 bg-gray-900/50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Research Articles</h3>
              <span className="text-sm text-gray-400">{articles.length} found</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-h-64 overflow-y-auto">
              {articles.map((article, index) => (
                <ArticleCard
                  key={`${article.title}-${index}`}
                  {...article}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="border-t border-gray-800 bg-gray-900/95 backdrop-blur-sm">
        <ChatInput
          onSend={handleSubmit}
          input={input}
          handleInputChange={handleInputChange}
          disabled={isLoading || isFetchingArticles}
          currentOccupation={currentOccupation}
          currentResponseLength={currentResponseLength}
          currentShowReasoning={showReasoning}
          onOccupationChange={setCurrentOccupation}
          onResponseLengthChange={setCurrentResponseLength}
          onShowReasoningChange={setShowReasoning}
        />
      </div>
    </div>
  );
}