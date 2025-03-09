'use client';

import { useChat } from '@/lib/hooks/useChat';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { SaveSessionDialog } from '../ui/SaveSessionDialog';

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
  } = useChat();

  // Add logging
  console.log('[Chat] State:', { isLoading, messages, articles });

  const hasArticles = Array.isArray(articles) && articles.length > 0;

  const handleSaveSession = () => {
    // Add save logic here
    console.log('Saving session...');
  };

  return (
    <div className="flex flex-col w-full">
      {/* Messages Container */}
      <div className="mb-6">
        {(messages.length > 0 || isLoading) && (
          <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-blue-900/40 backdrop-blur-sm rounded-2xl p-6 mb-4 shadow-lg border border-purple-800/30">
            <div className="space-y-6">
              <div className="space-y-8">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                  />
                ))}

                {isLoading && (
                  <div className="flex items-center justify-center gap-3 text-gray-400 py-4">
                    <LoadingSpinner className="w-5 h-5" />
                    <span>Generating response...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Articles Section */}
        {hasArticles && (
          <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-blue-900/40 backdrop-blur-sm rounded-2xl p-6 mb-4 shadow-lg border border-purple-800/30">
            <h3 className="text-lg font-medium text-gray-200 mb-4">Research Articles</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article, index) => (
                <ArticleCard
                  key={`${article.title}-${index}`}
                  {...article}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Section - Centered */}
      <div className="w-full">
        <ChatInput
          onSend={handleSubmit}
          input={input}
          handleInputChange={handleInputChange}
          disabled={isLoading || isFetchingArticles}
          saveSessionButton={<SaveSessionDialog onConfirm={handleSaveSession} />}
        />
      </div>
    </div>
  );
}