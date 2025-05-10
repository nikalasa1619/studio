import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a more common professional font
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans', // Standard variable name for sans-serif
});

export const metadata: Metadata = {
  title: 'NewsLetterPro',
  description: 'Generate professional newsletters with AI assistance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
