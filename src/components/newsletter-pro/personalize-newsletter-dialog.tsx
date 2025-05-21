
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
import { Switch } from '@/components/ui/switch'; 
import type { PersonalizationSettings } from './types';
import { cn } from '@/lib/utils'; 

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
  generateSubjectLine: true, 
  generateIntroText: true, 
  authorsHeading: '',
  factsHeading: '',
  toolsHeading: '',
  newslettersHeading: '',
  podcastsHeading: '',
};

type PersonalizationTab = 'aiContext' | 'newsletterStructure';

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
  const [activePersonalizationTab, setActivePersonalizationTab] = useState<PersonalizationTab>('aiContext');

  useEffect(() => {
    if (isOpen) {
      setSettings(initialSettings ? { ...defaultSettings, ...initialSettings } : defaultSettings);
      setActivePersonalizationTab('aiContext'); 
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

  const tabButtonClasses = (tabName: PersonalizationTab) =>
    cn(
      "px-4 py-2 rounded-t-md border-b-2 text-sm font-medium transition-colors duration-150",
      activePersonalizationTab === tabName
        ? "border-primary text-primary bg-primary/10"
        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
    );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col"> {/* Changed from sm:max-w-[600px] */}
        <DialogHeader>
          <DialogTitle>Personalize Your Newsletter</DialogTitle>
          <DialogDescription>
            Tailor the tone, voice, and specific text elements of your newsletter.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex border-b mb-4">
          <button
            type="button"
            className={tabButtonClasses('aiContext')}
            onClick={() => setActivePersonalizationTab('aiContext')}
          >
            AI Context
          </button>
          <button
            type="button"
            className={tabButtonClasses('newsletterStructure')}
            onClick={() => setActivePersonalizationTab('newsletterStructure')}
          >
            Newsletter Structure
          </button>
        </div>

        <ScrollArea className="flex-grow overflow-y-auto max-h-[calc(70vh-180px)]">
          <form onSubmit={handleFormSubmit} className="space-y-6 py-1 px-1 pr-4">
            {activePersonalizationTab === 'aiContext' && (
              <div className="space-y-4 animate-fadeInUp">
                <p className="text-xs text-muted-foreground mb-3">
                  Provide details to help the AI understand your newsletter's purpose and audience for better content generation.
                </p>
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
              </div>
            )}

            {activePersonalizationTab === 'newsletterStructure' && (
              <div className="space-y-4 animate-fadeInUp">
                <p className="text-xs text-muted-foreground mb-3">
                  Control how the subject, intro, and section headings are generated or set them manually.
                </p>
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
                
                <h4 className="text-md font-semibold mt-4 mb-2 text-foreground">Custom Section Headings (Optional)</h4>

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
            )}
          </form>
        </ScrollArea>
        <DialogFooter className="mt-auto pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleFormSubmit}>Save Personalization</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

