'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';
import ChatInterface from '@/components/chat/ChatInterface';

export default function Home() {
  return (
    <main className="flex h-screen bg-gray-950">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="text-center py-8 bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="flex items-center justify-between px-8 mb-4">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="h-8 w-8 text-blue-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Brilliance
              </h1>
            </div>
          </div>
          
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-xl text-purple-300 mb-4">
              💡 This is not your standard ChatGPT. 💡
            </h2>
            
            <p className="text-gray-300 mb-6">
              This education tool is designed for precise clinical and research inquiries. 
              Toggle 'With Search Enabled' to switch between research and chat modes.
            </p>
            
            <div className="space-y-2 text-sm text-gray-400 italic">
              <p className="text-blue-400">&quot;What are the latest breakthrough treatments for treatment-resistant depression?&quot;</p>
              <p className="text-purple-400">&quot;How do emerging biomarkers influence cancer immunotherapy outcomes?&quot;</p>
              <p className="text-pink-400">&quot;What paradigm shifts are occurring in neuroplasticity research?&quot;</p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </div>
    </main>
  );
}
