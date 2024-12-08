'use client';

import { useChat } from '@/lib/hooks/useChat';
import { ArticleCard } from '@/components/ui/ArticleCard';
import { SparklesIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { uploadFile } from '@/lib/utils/blob';
import { useState } from 'react';

export default function ArticlesPage() {
  const { articles } = useChat();
  const hasArticles = articles && articles.length > 0;
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSave = async () => {
    if (!articles || articles.length === 0) return;
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const content = JSON.stringify({ articles, timestamp: Date.now() }, null, 2);
      const key = `research/articles_${Date.now()}.json`;
      const { url } = await uploadFile(key, content, { access: 'public' });
      setSaveMessage(`Articles saved successfully! Access at: ${url}`);
    } catch (error) {
      console.error('Error saving articles:', error);
      setSaveMessage('Failed to save articles.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-200 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-blue-400" />
            Research Articles
          </h1>
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-gray-300"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Chat
          </Link>
        </div>

        {/* Save Button */}
        {hasArticles && (
          <div className="mb-4 flex items-center justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isSaving 
                  ? 'bg-gray-600 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}

        {saveMessage && (
          <div className="mb-4 text-sm text-gray-300">
            {saveMessage}
          </div>
        )}

        {/* Articles Grid */}
        {hasArticles ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <ArticleCard
                key={`${article.title}-${index}`}
                {...article}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            No articles available. Start a research chat to see articles here.
          </div>
        )}
      </div>
    </main>
  );
} 