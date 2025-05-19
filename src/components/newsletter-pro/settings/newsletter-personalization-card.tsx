
// src/components/newsletter-pro/settings/newsletter-personalization-card.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save } from 'lucide-react';
import type { PersonalizationSettings, NewsletterStyles } from '../types';

interface NewsletterPersonalizationCardProps {
  personalizationSettings: PersonalizationSettings;
  defaultTextualStyles: NewsletterStyles; // For placeholders
  onPersonalizationChange: (field: keyof PersonalizationSettings, value: string | boolean) => void;
  onSavePersonalization: () => void;
}

export function NewsletterPersonalizationCard({
  personalizationSettings,
  defaultTextualStyles,
  onPersonalizationChange,
  onSavePersonalization,
}: NewsletterPersonalizationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Newsletter Textual Personalization</CardTitle>
        <CardDescription>Guide the AI's tone and content generation by providing context about your newsletter and audience. These settings also allow manual overrides for generated text like subject lines and headings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="settingsNewsletterDescription">Newsletter Description (for AI context)</Label>
          <Textarea id="settingsNewsletterDescription" value={personalizationSettings.newsletterDescription || ''} onChange={(e) => onPersonalizationChange('newsletterDescription', e.target.value)} placeholder="e.g., Weekly tips on sustainable living and eco-friendly products." />
        </div>
        <div>
          <Label htmlFor="settingsTargetAudience">Target Audience (for AI context)</Label>
          <Input id="settingsTargetAudience" value={personalizationSettings.targetAudience || ''} onChange={(e) => onPersonalizationChange('targetAudience', e.target.value)} placeholder="e.g., Eco-conscious millennials, busy professionals." />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="settingsGenerateSubjectLine" className="text-sm font-medium">Generate Subject Line with AI</Label>
            <p className="text-xs text-muted-foreground">Let AI craft a subject line based on newsletter content and topic.</p>
          </div>
          <Switch id="settingsGenerateSubjectLine" checked={!!personalizationSettings.generateSubjectLine} onCheckedChange={(checked) => onPersonalizationChange('generateSubjectLine', checked)} />
        </div>
        {!personalizationSettings.generateSubjectLine && (
          <div className="ml-4">
            <Label htmlFor="settingsCustomSubjectLine">Custom Subject Line</Label>
            <Input id="settingsCustomSubjectLine" value={personalizationSettings.subjectLine || ''} onChange={(e) => onPersonalizationChange('subjectLine', e.target.value)} placeholder="Enter your custom subject line" />
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="settingsGenerateIntroText" className="text-sm font-medium">Generate Introductory Text with AI</Label>
            <p className="text-xs text-muted-foreground">Let AI write an engaging introduction for your newsletter.</p>
          </div>
          <Switch id="settingsGenerateIntroText" checked={!!personalizationSettings.generateIntroText} onCheckedChange={(checked) => onPersonalizationChange('generateIntroText', checked)} />
        </div>
        {!personalizationSettings.generateIntroText && (
          <div className="ml-4">
            <Label htmlFor="settingsCustomIntroText">Custom Introductory Text</Label>
            <Textarea id="settingsCustomIntroText" value={personalizationSettings.introText || ''} onChange={(e) => onPersonalizationChange('introText', e.target.value)} placeholder="Enter your custom introductory text" rows={3} />
          </div>
        )}

        <h4 className="text-md font-medium pt-2">Custom Section Headings (Override Defaults)</h4>
        {[
          { key: 'authorsHeading', defaultKey: 'authorsHeadingText', label: 'Authors & Quotes Heading' },
          { key: 'factsHeading', defaultKey: 'factsHeadingText', label: 'Facts Heading' },
          { key: 'toolsHeading', defaultKey: 'toolsHeadingText', label: 'Tools Heading' },
          { key: 'newslettersHeading', defaultKey: 'newslettersHeadingText', label: 'Newsletters Heading' },
          { key: 'podcastsHeading', defaultKey: 'podcastsHeadingText', label: 'Podcasts Heading' },
        ].map(item => {
          const fieldKey = item.key as keyof PersonalizationSettings;
          return (
            <div key={fieldKey}>
              <Label htmlFor={`settings${fieldKey}`}>{item.label}</Label>
              <Input id={`settings${fieldKey}`} value={personalizationSettings[fieldKey] as string || ''} onChange={(e) => onPersonalizationChange(fieldKey, e.target.value)} placeholder={`Default: "${defaultTextualStyles[item.defaultKey as keyof NewsletterStyles] || item.label.replace(' Heading', '')}"`} />
            </div>
          );
        })}
        <div className="flex justify-end">
          <Button onClick={onSavePersonalization}><Save className="mr-2 h-4 w-4" />Save Personalization Settings</Button>
        </div>
      </CardContent>
    </Card>
  );
}
