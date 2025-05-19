
// src/components/newsletter-pro/settings/settings-panel.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { UserCircle, Palette, ShieldCheck } from 'lucide-react';
import type { NewsletterStyles, PersonalizationSettings, UserProfile } from '../types';
import { useToast } from '@/hooks/use-toast';

import { AccountManagementCard } from './account-management-card';
import { NewsletterPersonalizationCard } from './newsletter-personalization-card';
import { AppPreferencesCard } from './app-preferences-card';

// Default User Profile for placeholder if needed
const defaultUserProfile: UserProfile = {
  fullName: '',
  contactEmail: '',
  profilePictureUrl: '',
  emailNotificationsEnabled: true,
  timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC',
  language: 'en',
};

interface SettingsPanelProps {
  initialStyles: NewsletterStyles; // Needed for default heading placeholders in NewsletterPersonalizationCard
  personalizationSettings: PersonalizationSettings;
  onPersonalizationChange: (settings: PersonalizationSettings) => void;
  onResetAllData: () => void;
  // onStyleChatSubmit and isLoadingStyleChat are removed as they are not directly used by SettingsPanel's subcomponents anymore
}

export function SettingsPanel({
  initialStyles,
  personalizationSettings,
  onPersonalizationChange,
  onResetAllData,
}: SettingsPanelProps) {
  const [currentPersonalization, setCurrentPersonalization] = useState<PersonalizationSettings>(personalizationSettings);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentPersonalization(personalizationSettings);
  }, [personalizationSettings]);

  const handlePersonalizationFieldChange = (field: keyof PersonalizationSettings, value: string | boolean) => {
    setCurrentPersonalization(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePersonalization = () => {
    onPersonalizationChange(currentPersonalization);
    toast({ title: "Personalization Saved", description: "Newsletter personalization settings have been updated." });
  };

  const handleUserProfileChange = (field: keyof UserProfile, value: string | boolean | undefined) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    console.log('Saving profile:', userProfile); // Mock implementation
    toast({ title: "Profile Saved", description: "Your profile details have been updated (mock)." });
  };
  
  const handleSaveLocalization = () => {
    console.log('Saving localization:', userProfile.timezone, userProfile.language); // Mock
    toast({ title: "Localization Saved", description: "Your localization preferences have been updated (mock)." });
  };


  return (
    <div className="flex-1 h-full overflow-y-auto bg-background text-foreground p-6 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Accordion type="multiple" defaultValue={['account-settings', 'newsletter-personalization']} className="w-full space-y-6">

        <AccordionItem value="account-settings">
          <AccordionTrigger className="text-xl font-semibold hover:no-underline">
            <div className="flex items-center gap-3">
              <UserCircle className="h-6 w-6 text-primary" />
              Account Management
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-6">
            <AccountManagementCard
              userProfile={userProfile}
              onUserProfileChange={handleUserProfileChange}
              onSaveProfile={handleSaveProfile}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="newsletter-personalization">
          <AccordionTrigger className="text-xl font-semibold hover:no-underline">
            <div className="flex items-center gap-3">
              <Palette className="h-6 w-6 text-primary" />
              Newsletter Personalization
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-6">
            <NewsletterPersonalizationCard
              personalizationSettings={currentPersonalization}
              defaultTextualStyles={initialStyles}
              onPersonalizationChange={handlePersonalizationFieldChange}
              onSavePersonalization={handleSavePersonalization}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="preferences-data">
          <AccordionTrigger className="text-xl font-semibold hover:no-underline">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              App Preferences & Data
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-6">
            <AppPreferencesCard
              userProfile={userProfile}
              onUserProfileChange={handleUserProfileChange}
              onSaveLocalization={handleSaveLocalization}
              onResetAllData={onResetAllData}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
