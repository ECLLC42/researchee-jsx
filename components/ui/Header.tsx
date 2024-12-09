'use client';

import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-2">
        <SparklesIcon className="h-6 w-6 text-blue-400" />
        <Link href="/" className="text-gray-200 text-xl font-bold">
          Brilliance
        </Link>
        <span className="text-gray-400 text-sm ml-4">
          Your Research & Clinical Insights Companion
        </span>
      </div>
    </header>
  );
} 