
// src/components/newsletter-pro/settings/settings-panel.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { AccountManagementCard } from './account-management-card';
import { AppPreferencesCard } from './app-preferences-card';
import type { UserProfile } from '../types';
import { useToast } from '@/hooks/use-toast';

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
  activeProject: Project | null; // To pass to potential project-specific settings if re-integrated
  onResetAllData: () => void;
}

type SettingsTab = 'accountManagement' | 'appPreferences';

export function SettingsPanel({
  activeProject,
  onResetAllData,
}: SettingsPanelProps) {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const { toast } = useToast();
  const [activeSettingsTab, setActiveSettingsTab] = useState<SettingsTab>('accountManagement');

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

  const tabButtonClasses = (tabName: SettingsTab) =>
    cn(
      "px-4 py-2 rounded-t-md border-b-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background",
      activeSettingsTab === tabName
        ? "border-primary text-primary bg-primary/10"
        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
    );

  return (
    <div className="flex-1 h-full flex flex-col bg-background text-foreground">
      <div className="p-6 md:p-8 border-b">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>

      <div className="flex border-b px-6 md:px-8">
        <button
          type="button"
          className={tabButtonClasses('accountManagement')}
          onClick={() => setActiveSettingsTab('accountManagement')}
        >
          Account Management
        </button>
        <button
          type="button"
          className={tabButtonClasses('appPreferences')}
          onClick={() => setActiveSettingsTab('appPreferences')}
        >
          App Preferences & Data
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
        {activeSettingsTab === 'accountManagement' && (
          <AccountManagementCard
            userProfile={userProfile}
            onUserProfileChange={handleUserProfileChange}
            onSaveProfile={handleSaveProfile}
          />
        )}

        {activeSettingsTab === 'appPreferences' && (
          <AppPreferencesCard
            userProfile={userProfile}
            onUserProfileChange={handleUserProfileChange}
            onSaveLocalization={handleSaveLocalization}
            onResetAllData={onResetAllData}
          />
        )}
      </div>
    </div>
  );
}


    