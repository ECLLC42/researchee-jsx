import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  themeColor: '#1e40af',
}

export const metadata: Metadata = {
  title: 'Brilliance Research Assistant',
  description: 'AI-powered research assistant for medical professionals and researchers',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <div className="h-screen bg-gray-950">
          <main className="h-full overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
