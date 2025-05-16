
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Keyboard } from 'lucide-react';

interface ShortcutsDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children?: React.ReactNode;
}

const shortcutsList = [
  { command: 'Cmd/Ctrl + Enter', description: 'Generate Content (when topic input is focused)' },
  { command: 'Cmd/Ctrl + A', description: 'Filter by Author (when Authors tab is active)' },
  { command: 'Cmd/Ctrl + S', description: 'Sort Items (context-dependent)' },
  { command: 'Cmd/Ctrl + F', description: 'Filter Fact Type (when Facts tab is active)' },
  { command: 'Cmd/Ctrl + T', description: 'Filter Tool Type (when Tools tab is active)' },
  { command: 'Cmd/Ctrl + N', description: 'Filter Newsletter Frequency (when Newsletters tab is active)' },
  { command: 'Cmd/Ctrl + P', description: 'Filter Podcast Frequency (when Podcasts tab is active)' },
  { command: 'Cmd/Ctrl + V', description: 'Toggle "Show Only Selected" filter' }, // Changed from Alt + V
  // Add more shortcuts as features are developed
];

export function ShortcutsDialog({ isOpen, onOpenChange, children }: ShortcutsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[520px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard size={20} />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Boost your productivity with these keyboard shortcuts.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-3">
          <div className="space-y-4 py-4">
            {shortcutsList.map((shortcut, index) => (
              <React.Fragment key={shortcut.command}>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground/90">{shortcut.description}</span>
                  <span className="text-sm font-mono bg-muted px-2 py-1 rounded-md text-muted-foreground">
                    {shortcut.command}
                  </span>
                </div>
                {index < shortcutsList.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </div>
        </ScrollArea>
        <DialogClose asChild>
            <Button type="button" variant="outline" className="mt-4 w-full">
                Close
            </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

