'use client';

import { motion, type MotionProps } from 'framer-motion';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ExtendedMessage } from '@/lib/types';

interface ChatMessageProps {
  message: ExtendedMessage;
}

const MotionDiv = motion.div as React.ComponentType<MotionProps & React.HTMLProps<HTMLDivElement>>;

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';

  // Hide system messages that start with "QuestionID:"
  if (isSystem && message.content.startsWith('QuestionID:')) {
    return null;
  }

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex max-w-[80%] gap-3 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className="flex-shrink-0 mt-1">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <UserCircleIcon className="w-6 h-6 text-gray-300" />
            </div>
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-3 max-w-full break-words ${
            isAssistant 
              ? 'bg-gray-700 rounded-tl-sm prose-headings:text-blue-300' 
              : 'bg-blue-600 rounded-tr-sm'
          }`}
        >
          <ReactMarkdown
            className="prose prose-invert max-w-none text-sm prose-p:my-2 prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0"
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
              h1: ({ children }) => <h1 className="text-lg font-bold">{children}</h1>,
              h2: ({ children }) => <h2 className="text-md font-semibold">{children}</h2>,
              ul: ({ children }) => <ul className="list-disc ml-4 mb-3">{children}</ul>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-gray-500 pl-3 my-2 italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </MotionDiv>
  );
}