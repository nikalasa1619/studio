
"use client";

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Info, MessageSquare, XCircle } from 'lucide-react';
import type { LogEntry, LogEntryType } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityLogPanelProps {
  logEntries: LogEntry[];
}

const getLogIcon = (type: LogEntryType) => {
  switch (type) {
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'error':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    default:
      return <MessageSquare className="h-4 w-4 text-muted-foreground" />;
  }
};

const getLogTextColor = (type: LogEntryType) => {
  switch (type) {
    case 'info':
      return "text-blue-700 dark:text-blue-400";
    case 'error':
      return "text-red-700 dark:text-red-400";
    case 'success':
      return "text-green-700 dark:text-green-400";
    case 'warning':
      return "text-yellow-700 dark:text-yellow-400";
    default:
      return "text-muted-foreground";
  }
};

export function ActivityLogPanel({ logEntries }: ActivityLogPanelProps) {
  return (
    <div className="mt-auto h-48 flex-shrink-0 border-t bg-background/80 backdrop-blur-sm p-3 shadow-inner">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-sm font-semibold text-foreground">Activity Log</h3>
        {/* Add clear log button or other controls here if needed */}
      </div>
      <ScrollArea className="h-[calc(100%-2.5rem)] pr-2">
        {logEntries.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No activity yet.</p>
        ) : (
          <div className="space-y-2">
            {logEntries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-start gap-2 p-1.5 rounded-md text-xs animate-fadeInUp",
                  // entry.type === 'error' ? 'bg-red-50 dark:bg-red-900/30' : 
                  // entry.type === 'success' ? 'bg-green-50 dark:bg-green-900/30' :
                  // entry.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-900/30' :
                  // 'bg-muted/50 dark:bg-muted/30'
                )}
              >
                <div className="flex-shrink-0 mt-0.5">{getLogIcon(entry.type)}</div>
                <div className="flex-grow">
                  <p className={cn("font-medium break-words", getLogTextColor(entry.type))}>
                    {entry.message}
                  </p>
                  <p className="text-xs text-muted-foreground/80">
                    {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
