"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";

interface GenerationProgressIndicatorProps {
  progress: number;
  message: string;
  isVisible: boolean;
}

export function GenerationProgressIndicator({ progress, message, isVisible }: GenerationProgressIndicatorProps) {
  if (!isVisible || !message) {
    return null;
  }

  return (
    <div className="w-full my-4 space-y-2">
      <p key={message} className="text-sm text-left text-primary animate-fadeInUp">
        {message}
      </p>
      <Progress value={progress} className="w-full h-2" />
    </div>
  );
}
