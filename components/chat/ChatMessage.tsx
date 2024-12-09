'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ExtendedMessage } from '@/lib/types';

interface ChatMessageProps {
  message: ExtendedMessage;
}

type DivMotionProps = HTMLMotionProps<'div'> & 
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';
  const MotionDiv = motion.div as React.ComponentType<DivMotionProps>;

  // Hide system messages that start with "QuestionID:"
  if (isSystem && message.content.startsWith('QuestionID:')) {
    return null;
  }

  const MessageContent = ({ content }: { content: string }) => (
    <ReactMarkdown
      className="prose prose-invert max-w-none whitespace-pre-wrap"
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-4 whitespace-pre-wrap">{children}</p>,
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-4 ${
        isAssistant ? 'bg-gray-900' : isSystem ? 'bg-gray-800' : 'bg-gray-850'
      }`}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
          ) : isSystem ? (
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-white text-xs">SYS</span>
            </div>
          ) : (
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
          )}
        </div>

        <div className="flex-1">
          <MessageContent content={message.content} />
        </div>
      </div>
    </MotionDiv>
  );
} 