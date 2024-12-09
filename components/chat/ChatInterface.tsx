'use client';

import { useChat } from '@/lib/hooks/useChat';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

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

  const hasArticles = Array.isArray(articles) && articles.length > 0;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="h-full px-4 py-4">
          <div className="max-w-4xl mx-auto space-y-4">
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
                  />
                ))}

                {isLoading && (
                  <div className="flex items-center justify-center gap-3 text-gray-400 py-4">
                    <LoadingSpinner className="w-5 h-5" />
                    <span>Generating response...</span>
                  </div>
                )}

                <div className="mt-4 space-y-2 text-center">
                  {isFetchingArticles && (
                    <div className="text-gray-400 flex items-center justify-center gap-2">
                      <LoadingSpinner className="w-4 h-4" />
                      Searching research articles...
                    </div>
                  )}

                  {error && (
                    <div className="text-red-500 p-2 bg-red-950/50 rounded-md">
                      {error}
                    </div>
                  )}

                  {hasArticles && (
                    <Link 
                      href="/articles" 
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span className="text-sm">View {articles.length} Research Articles</span>
                      <span className="text-xs">(PubMed)</span>
                    </Link>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0">
        <ChatInput
          onSend={handleSubmit}
          input={input}
          handleInputChange={handleInputChange}
          disabled={isLoading || isFetchingArticles}
        />
      </div>
    </div>
  );
}