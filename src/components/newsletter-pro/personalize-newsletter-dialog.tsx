
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PersonalizationSettings } from './types';

interface PersonalizeNewsletterDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  initialSettings?: PersonalizationSettings;
  onSubmit: (settings: PersonalizationSettings) => void;
  children?: React.ReactNode;
}

const defaultSettings: PersonalizationSettings = {
  newsletterDescription: '',
  targetAudience: '',
  subjectLine: '',
  introText: '',
  authorsHeading: '',
  factsHeading: '',
  toolsHeading: '',
  newslettersHeading: '',
  podcastsHeading: '',
};

export function PersonalizeNewsletterDialog({
  isOpen,
  onOpenChange,
  initialSettings,
  onSubmit,
  children,
}: PersonalizeNewsletterDialogProps) {
  const [settings, setSettings] = useState<PersonalizationSettings>(
    initialSettings || defaultSettings
  );

  useEffect(() => {
    if (isOpen) {
      setSettings(initialSettings || defaultSettings);
    }
  }, [isOpen, initialSettings]);

  const handleChange = (field: keyof PersonalizationSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(settings);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Personalize Your Newsletter</DialogTitle>
          <DialogDescription>
            Tailor the tone, voice, and specific text elements of your newsletter.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleFormSubmit}>
          <ScrollArea className="max-h-[calc(70vh-120px)]">
            <div className="grid gap-6 py-4 px-1 pr-4">
              <div>
                <Label htmlFor="newsletterDescription">Newsletter Description</Label>
                <Textarea
                  id="newsletterDescription"
                  placeholder="Briefly describe your newsletter's purpose and typical content."
                  value={settings.newsletterDescription || ''}
                  onChange={(e) => handleChange('newsletterDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Textarea
                  id="targetAudience"
                  placeholder="Who are you trying to reach? (e.g., marketing professionals, tech enthusiasts)"
                  value={settings.targetAudience || ''}
                  onChange={(e) => handleChange('targetAudience', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="subjectLine">Custom Subject Line</Label>
                <Input
                  id="subjectLine"
                  placeholder="Optional: Override default subject line"
                  value={settings.subjectLine || ''}
                  onChange={(e) => handleChange('subjectLine', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="introText">Custom Introductory Text</Label>
                <Textarea
                  id="introText"
                  placeholder="Optional: Add a custom intro paragraph before the main content."
                  value={settings.introText || ''}
                  onChange={(e) => handleChange('introText', e.target.value)}
                  rows={3}
                />
              </div>
              
              <h3 className="text-md font-semibold mt-2 mb-0 text-foreground">Custom Section Headings (Optional)</h3>

              <div>
                <Label htmlFor="authorsHeading">Authors & Quotes Heading</Label>
                <Input
                  id="authorsHeading"
                  placeholder="e.g., Words of Wisdom"
                  value={settings.authorsHeading || ''}
                  onChange={(e) => handleChange('authorsHeading', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="factsHeading">Facts Heading</Label>
                <Input
                  id="factsHeading"
                  placeholder="e.g., Fascinating Facts"
                  value={settings.factsHeading || ''}
                  onChange={(e) => handleChange('factsHeading', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="toolsHeading">Tools Heading</Label>
                <Input
                  id="toolsHeading"
                  placeholder="e.g., Tools to Boost Productivity"
                  value={settings.toolsHeading || ''}
                  onChange={(e) => handleChange('toolsHeading', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="newslettersHeading">Newsletters Heading</Label>
                <Input
                  id="newslettersHeading"
                  placeholder="e.g., Stay Informed"
                  value={settings.newslettersHeading || ''}
                  onChange={(e) => handleChange('newslettersHeading', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="podcastsHeading">Podcasts Heading</Label>
                <Input
                  id="podcastsHeading"
                  placeholder="e.g., Listen & Learn"
                  value={settings.podcastsHeading || ''}
                  onChange={(e) => handleChange('podcastsHeading', e.target.value)}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Personalization</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
