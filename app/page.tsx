'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';
import ChatInterface from '@/components/chat/ChatInterface';

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gradient-to-b from-gray-900 to-gray-950 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <SparklesIcon className="h-8 w-8 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Brilliance
            </h1>
          </div>
          <p className="text-gray-300 mb-4">
            💡 Not your standard ChatGPT. This tool refines queries, integrates PubMed abstracts, and synthesizes answers at a doctoral level.
          </p>
          <p className="text-gray-400 text-sm italic">
            Examples: <br />
            <span className="text-blue-400">"Latest breakthroughs in treatment-resistant depression?"</span><br />
            <span className="text-purple-400">"How do emerging biomarkers influence cancer immunotherapy?"</span><br />
            <span className="text-pink-400">"What paradigm shifts are occurring in neuroplasticity research?"</span>
          </p>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <ChatInterface />
      </div>
    </div>
  );
}