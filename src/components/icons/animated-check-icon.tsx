// src/components/icons/animated-check-icon.tsx
"use client";

import type React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCheckIconProps {
  className?: string;
}

export const AnimatedCheckIcon: React.FC<AnimatedCheckIconProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5" /* Slightly thicker for better visibility */
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animated-check-icon h-4 w-4", className)} /* Base classes */
    >
      <path d="M20 6 L9 17 L4 12" />
    </svg>
  );
};
