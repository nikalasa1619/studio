
// src/components/newsletter-pro/settings/app-preferences-card.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Save } from 'lucide-react';
import type { UserProfile } from '../types';

interface AppPreferencesCardProps {
  userProfile: UserProfile;
  onUserProfileChange: (field: keyof UserProfile, value: string | boolean | undefined) => void;
  onSaveLocalization: () => void; // Mocked for now
  onResetAllData: () => void;
}

export function AppPreferencesCard({
  userProfile,
  onUserProfileChange,
  onSaveLocalization,
  onResetAllData
}: AppPreferencesCardProps) {
  const [clientTimezone, setClientTimezone] = useState('UTC');

  useEffect(() => {
    setClientTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);
  
  const timezones = typeof Intl !== 'undefined' ? (Intl as any).supportedValuesOf?.('timeZone') || [clientTimezone] : [clientTimezone];
  const languages = [{value: 'en', label: 'English'}, {value: 'es', label: 'Español'}, {value: 'fr', label: 'Français'}];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage how you receive updates from us.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotificationsEnabled" className="text-sm font-medium">Email Notifications</Label>
              <p className="text-xs text-muted-foreground">Receive important updates, news, and promotions via email.</p>
            </div>
            <Switch id="emailNotificationsEnabled" checked={userProfile.emailNotificationsEnabled} onCheckedChange={(checked) => onUserProfileChange('emailNotificationsEnabled', checked)} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Localization</CardTitle>
          <CardDescription>Set your preferred timezone and language for the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="timezone">Timezone</Label>
            <select id="timezone" value={userProfile.timezone || clientTimezone} onChange={(e) => onUserProfileChange('timezone', e.target.value)} className="w-full p-2 border rounded-md bg-input text-foreground">
              {timezones.map((tz: string) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="language">Language</Label>
            <select id="language" value={userProfile.language} onChange={(e) => onUserProfileChange('language', e.target.value)} className="w-full p-2 border rounded-md bg-input text-foreground">
              {languages.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
            </select>
          </div>
          <div className="flex justify-end">
            <Button onClick={onSaveLocalization}><Save className="mr-2 h-4 w-4" />Save Localization</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage your application data.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" /> Reset All Application Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete ALL your projects, custom styles, personalization settings, and saved items. Your account will NOT be deleted, but all its associated NewsLetterPro data will be cleared.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onResetAllData} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Reset All Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </>
  );
}
