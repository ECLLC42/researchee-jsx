'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';
import ChatInterface from '@/components/chat/ChatInterface';

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-4">
              <SparklesIcon className="h-12 w-12 text-blue-400" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Brilliance
              </h1>
            </div>
            <div className="h-px w-3/4 bg-gradient-to-r from-blue-400/20 via-purple-400/40 to-blue-400/20 mt-6" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}