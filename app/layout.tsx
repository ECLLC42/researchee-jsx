import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/ui/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Brilliance Research Assistant',
  description: 'AI-powered research assistant for medical professionals and researchers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} bg-gray-950 text-gray-200 h-full`}>
        <div className="flex flex-col h-full">
          <Header />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}