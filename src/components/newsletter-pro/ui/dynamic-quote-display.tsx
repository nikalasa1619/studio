// src/components/newsletter-pro/ui/dynamic-quote-display.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const placeholderQuotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Strive not to be a success, but rather to be of value.", author: "Albert Einstein" },
  { text: "The mind is everything. What you think you become.", author: "Buddha" },
  { text: "Your time is limited, so don’t waste it living someone else’s life.", author: "Steve Jobs" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
];

interface DynamicQuoteDisplayProps {
  className?: string;
}

export function DynamicQuoteDisplay({ className }: DynamicQuoteDisplayProps) {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [displayQuote, setDisplayQuote] = useState(placeholderQuotes[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsFading(true); // Start fade out
      setTimeout(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % placeholderQuotes.length);
        setIsFading(false); // Start fade in with new quote
      }, 500); // Duration of fade-out animation
    }, 15000); // 15 seconds

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // This effect runs when currentQuoteIndex changes, after the fade-out timeout
    if (!isFading) {
      setDisplayQuote(placeholderQuotes[currentQuoteIndex]);
    }
  }, [currentQuoteIndex, isFading]);

  return (
    <div className={cn("text-sm text-muted-foreground italic text-center p-2 overflow-hidden h-12 flex items-center justify-center", className)}>
      <div
        className={cn(
          "transition-all duration-500",
          isFading ? 'quote-fade-exit-active' : 'quote-fade-enter-active'
        )}
      >
        &ldquo;{displayQuote.text}&rdquo;
        {/* <span className="block text-xs text-right mt-1 not-italic">- {displayQuote.author}</span> */}
      </div>
    </div>
  );
}
