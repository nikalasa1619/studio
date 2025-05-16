
// src/components/newsletter-pro/ui/generation-progress-indicator.tsx
"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress'; // Assuming you might want a progress bar too
import { cn } from '@/lib/utils';

interface GenerationProgressIndicatorProps {
  generationProgress: number;
  currentGenerationMessage: string;
}

export function GenerationProgressIndicator({
  generationProgress,
  currentGenerationMessage,
}: GenerationProgressIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 bg-card/50 backdrop-blur-sm rounded-lg shadow-xl border border-border/30 animate-fadeInUp">
      <div className="relative">
        <Loader2 className="h-16 w-16 text-primary animate-spin" />
        {/* Optional: A circular progress bar if desired for more detail */}
        {/* <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-muted/30"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="text-primary"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${generationProgress}, 100`}
            strokeLinecap="round"
          />
        </svg> */}
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">Generating Content...</p>
        <p className="text-sm text-muted-foreground h-10 overflow-hidden relative">
           <span
            key={currentGenerationMessage} // Key forces re-render for animation
            className="block animate-fadeInUp"
            style={{ animationDuration: '0.3s' }}
          >
            {currentGenerationMessage}
          </span>
        </p>
      </div>
      <Progress value={generationProgress} className="w-3/4 md:w-1/2 h-2.5" />
    </div>
  );
}
