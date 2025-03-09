'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';
import ChatInterface from '@/components/chat/ChatInterface';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full px-4 py-6 flex flex-col">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-4">
              <SparklesIcon className="h-10 w-10 text-blue-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Brilliance
              </h1>
            </div>
            <p className="text-gray-400 mt-3">
              Your Research & Clinical Insights Companion
            </p>
          </div>
        </div>
        
        <div className="flex-1">
          <ChatInterface />
        </div>
      </div>
    </div>
  );
}