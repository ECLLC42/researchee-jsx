'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import type { Message } from 'ai/react';
import type { Article } from '@/lib/types';

interface ChatMessageProps {
  message: Message;
  articles?: Article[];
}

type DivMotionProps = HTMLMotionProps<'div'> & 
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

export default function ChatMessage({ message, articles }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';
  
  // Skip rendering system messages containing QuestionID
  if (isSystem && message.content.startsWith('QuestionID:')) {
    return null;
  }

  const MotionDiv = motion.div as React.ComponentType<DivMotionProps>;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col gap-4 p-6 ${
        isAssistant ? 'bg-gray-900' : isSystem ? 'bg-gray-800' : 'bg-transparent'
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

        <div className="flex-1 prose prose-invert max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </MotionDiv>
  );
} 