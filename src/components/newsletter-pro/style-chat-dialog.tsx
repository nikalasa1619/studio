"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface StyleChatDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (description: string) => Promise<void>;
  isLoading: boolean;
}

export function StyleChatDialog({ isOpen, onOpenChange, onSubmit, isLoading }: StyleChatDialogProps) {
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!description.trim()) return;
    await onSubmit(description);
    // Optionally clear description on successful submit, or dialog closure will handle it.
    // setDescription(''); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Chat for Styling</DialogTitle>
          <DialogDescription>
            Describe the visual style you want for your newsletter. For example, "Make headings bold and dark blue, use a light font for paragraphs."
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="style-description">Style Description</Label>
            <Textarea
              id="style-description"
              placeholder="e.g., Modern look with teal accents, serif font for text..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading || !description.trim()}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Generate Styles'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
