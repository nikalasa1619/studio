
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
import { Switch } from '@/components/ui/switch'; // Added Switch
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
  subjectLine: '', // Still keep this for custom input if toggle is off
  introText: '', // Still keep this for custom input if toggle is off
  generateSubjectLine: true, // Default to AI generation
  generateIntroText: true, // Default to AI generation
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
    initialSettings ? { ...defaultSettings, ...initialSettings } : defaultSettings
  );

  useEffect(() => {
    if (isOpen) {
      setSettings(initialSettings ? { ...defaultSettings, ...initialSettings } : defaultSettings);
    }
  }, [isOpen, initialSettings]);

  const handleChange = (
    field: keyof PersonalizationSettings,
    value: string | boolean
  ) => {
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
                <Label htmlFor="newsletterDescription">Newsletter Description (for AI context)</Label>
                <Textarea
                  id="newsletterDescription"
                  placeholder="Briefly describe your newsletter's purpose and typical content."
                  value={settings.newsletterDescription || ''}
                  onChange={(e) => handleChange('newsletterDescription', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience (for AI context)</Label>
                <Textarea
                  id="targetAudience"
                  placeholder="Who are you trying to reach? (e.g., marketing professionals, tech enthusiasts)"
                  value={settings.targetAudience || ''}
                  onChange={(e) => handleChange('targetAudience', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="generateSubjectLine" className="font-medium">
                    Generate Subject Line with AI
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Let AI craft a subject line based on newsletter content.
                  </p>
                </div>
                <Switch
                  id="generateSubjectLine"
                  checked={settings.generateSubjectLine}
                  onCheckedChange={(checked) => handleChange('generateSubjectLine', checked)}
                />
              </div>
              {!settings.generateSubjectLine && (
                <div className="ml-4 mt-[-10px] mb-2">
                  <Label htmlFor="subjectLine">Custom Subject Line</Label>
                  <Input
                    id="subjectLine"
                    placeholder="Enter your custom subject line"
                    value={settings.subjectLine || ''}
                    onChange={(e) => handleChange('subjectLine', e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="generateIntroText" className="font-medium">
                    Generate Introductory Text with AI
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Let AI write an engaging intro for your newsletter.
                  </p>
                </div>
                <Switch
                  id="generateIntroText"
                  checked={settings.generateIntroText}
                  onCheckedChange={(checked) => handleChange('generateIntroText', checked)}
                />
              </div>
              {!settings.generateIntroText && (
                <div className="ml-4 mt-[-10px] mb-2">
                  <Label htmlFor="introText">Custom Introductory Text</Label>
                  <Textarea
                    id="introText"
                    placeholder="Enter your custom intro paragraph."
                    value={settings.introText || ''}
                    onChange={(e) => handleChange('introText', e.target.value)}
                    rows={3}
                  />
                </div>
              )}
              
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
