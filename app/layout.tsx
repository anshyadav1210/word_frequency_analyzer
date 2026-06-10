import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Word Frequency Analyzer',
  description: 'IIT Mandi Mini Project — Analyze word frequencies with AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
