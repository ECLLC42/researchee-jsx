'use client';

import { motion, type MotionProps } from 'framer-motion';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { SparklesIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ExtendedMessage } from '@/lib/types/index';

interface ChatMessageProps {
  message: ExtendedMessage;
}

const MotionDiv = motion.div as React.ComponentType<MotionProps & React.HTMLProps<HTMLDivElement>>;

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';
  const hasReasoning = message.metadata?.reasoning;

  // Hide system messages that start with "QuestionID:"
  if (isSystem && message.content.startsWith('QuestionID:')) {
    return null;
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-6`}
    >
      <div className={`flex max-w-[85%] gap-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shadow-lg">
              <UserCircleIcon className="w-5 h-5 text-gray-300" />
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 max-w-full break-words shadow-sm ${
            isAssistant 
              ? 'bg-gray-800 border border-gray-700 rounded-tl-sm' 
              : 'bg-blue-600 rounded-tr-sm'
          }`}
        >
          {/* Reasoning Section */}
          {isAssistant && hasReasoning && (
            <div className="mb-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <LightBulbIcon className="w-4 h-4 text-purple-300" />
                <h4 className="text-sm font-medium text-purple-300">Reasoning Process</h4>
              </div>
              <div className="text-sm text-purple-200 leading-relaxed">
                {hasReasoning}
              </div>
            </div>
          )}

          {/* Main Content */}
          <ReactMarkdown
            className="prose prose-invert max-w-none text-sm prose-p:my-2 prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0"
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed text-gray-200">{children}</p>,
              h1: ({ children }) => <h1 className="text-lg font-bold text-blue-300 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-md font-semibold text-blue-300 mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-semibold text-blue-300 mb-1">{children}</h3>,
              ul: ({ children }) => <ul className="list-disc ml-4 mb-3 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-4 mb-3 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-gray-200">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-blue-500 pl-3 my-2 italic text-gray-300 bg-blue-500/10 py-2 rounded-r">
                  {children}
                </blockquote>
              ),
              code: ({ children, className }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="bg-gray-700 px-1 py-0.5 rounded text-sm text-blue-300">
                    {children}
                  </code>
                ) : (
                  <pre className="bg-gray-900 border border-gray-700 rounded-lg p-3 overflow-x-auto">
                    <code className="text-sm text-gray-200">{children}</code>
                  </pre>
                );
              },
              a: ({ children, href }) => (
                <a 
                  href={href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>

          {/* Message Metadata */}
          {(message.metadata?.searchSource || message.metadata?.citations || hasReasoning) && (
            <div className="mt-3 pt-3 border-t border-gray-700/50">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-3">
                  {message.metadata?.searchSource && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      {message.metadata.searchSource}
                    </span>
                  )}
                  {message.metadata?.citations && message.metadata.citations > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {message.metadata.citations} citation{message.metadata.citations !== 1 ? 's' : ''}
                    </span>
                  )}
                  {hasReasoning && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      Reasoning
                    </span>
                  )}
                </div>
                <span className="text-gray-500">
                  {isAssistant ? 'AI Assistant' : 'You'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </MotionDiv>
  );
}