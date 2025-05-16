
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NewProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (newsletterDescription: string, targetAudience: string) => void;
}

export function NewProjectDialog({ isOpen, onOpenChange, onSubmit }: NewProjectDialogProps) {
  const [newsletterDescription, setNewsletterDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');

  const handleSubmit = () => {
    onSubmit(newsletterDescription, targetAudience);
    setNewsletterDescription(''); // Reset fields
    setTargetAudience('');
    onOpenChange(false); // Close dialog
  };

  // Prevent closing dialog by clicking outside or pressing Escape if it's the only way to create a project
  const handleOpenChange = (open: boolean) => {
    // This logic might be better handled in useProjectState if projects.length is needed
    // For now, assuming it can be closed if cancel is clicked or submitted.
    onOpenChange(open);
    if (!open) {
        setNewsletterDescription('');
        setTargetAudience('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Start New Project</DialogTitle>
          <DialogDescription>
            Tell us a bit about your newsletter. This context helps AI generate more relevant subject lines, intros, and quote stylings.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(70vh-180px)] pr-3"> {/* Adjusted max-h for better spacing */}
          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-project-newsletterDescription">
                Newsletter Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="new-project-newsletterDescription"
                placeholder="e.g., 'A weekly newsletter sharing insights on sustainable living and eco-friendly products for urban dwellers.'"
                value={newsletterDescription}
                onChange={(e) => setNewsletterDescription(e.target.value)}
                rows={4}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                What is your newsletter about? What kind of content do you typically share?
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-project-targetAudience">
                Target Audience <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="new-project-targetAudience"
                placeholder="e.g., 'Beginner gardeners living in apartments, environmentally conscious individuals aged 25-40.'"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                rows={4}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Who are you trying to reach? What are their interests and demographics?
              </p>
            </div>
            {/* 
            // Placeholder for future template selection functionality
            <div className="mt-4">
              <Label className="text-sm font-medium">Or Select a Template (Coming Soon)</Label>
              <div className="mt-2 p-4 border border-dashed rounded-md text-center text-muted-foreground">
                Template selection will appear here.
              </div>
            </div>
            */}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-2 pt-4 border-t">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!newsletterDescription.trim() || !targetAudience.trim()}
          >
            Create Project
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    