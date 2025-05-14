
// src/components/newsletter-pro/settings/settings-panel.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit2, Palette, MessageSquarePlus, Layers, Trash2, Save, ImageUp, Upload, ShieldCheck, Bell, Globe, UserCircle, LogOut, KeyRound } from 'lucide-react';
import type { NewsletterStyles, PersonalizationSettings, UserProfile } from '../types';
import { StyleCustomizer } from '../style-customizer';
import { BackdropCustomizer } from '../backdrop-customizer'; 
import { StyleChatDialog } from '../style-chat-dialog'; 


// Default User Profile for placeholder if needed
const defaultUserProfile: UserProfile = {
  fullName: '',
  contactEmail: '',
  profilePictureUrl: '',
  emailNotificationsEnabled: true,
  timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC', // Auto-detect, fallback for server
  language: 'en', // Default language
};


interface SettingsPanelProps {
  initialStyles: NewsletterStyles;
  onStylesChange: (newStyles: NewsletterStyles) => void;
  personalizationSettings: PersonalizationSettings;
  onPersonalizationChange: (settings: PersonalizationSettings) => void;
  onResetAllData: () => void;
  onStyleChatSubmit: (description: string) => Promise<void>;
  isLoadingStyleChat: boolean;
  isStyleChatOpen: boolean;
  onSetIsStyleChatOpen: (isOpen: boolean) => void;
  isBackdropCustomizerOpen: boolean;
  onSetIsBackdropCustomizerOpen: (isOpen: boolean) => void;
}

export function SettingsPanel({
  initialStyles,
  onStylesChange,
  personalizationSettings,
  onPersonalizationChange,
  onResetAllData,
  onStyleChatSubmit,
  isLoadingStyleChat,
  isStyleChatOpen,
  onSetIsStyleChatOpen,
  isBackdropCustomizerOpen,
  onSetIsBackdropCustomizerOpen,
}: SettingsPanelProps) {
  const [currentPersonalization, setCurrentPersonalization] = useState<PersonalizationSettings>(personalizationSettings);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile); 
  const [clientTimezone, setClientTimezone] = useState('UTC');

  // Password change fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    setCurrentPersonalization(personalizationSettings);
  }, [personalizationSettings]);

  useEffect(() => {
    setClientTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const handlePersonalizationFieldChange = (field: keyof PersonalizationSettings, value: string | boolean) => {
    setCurrentPersonalization(prev => ({ ...prev, [field]: value }));
  };

  const handleUserProfileChange = (field: keyof UserProfile, value: string | boolean | undefined) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };


  const handleSavePersonalization = () => {
    onPersonalizationChange(currentPersonalization);
  };

  const handleSaveProfile = () => {
    // Placeholder for saving profile logic (name, email, picture)
    console.log('Saving profile:', userProfile);
    // Example: await saveUserProfileAPI(userProfile);
  };
  
  const handleChangePassword = () => {
    // Placeholder for actual password change logic
    console.log('Attempting to change password with:', { currentPassword, newPassword, confirmNewPassword });
    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match."); // Replace with toast
      return;
    }
    // Example: await changePasswordAPI(currentPassword, newPassword);
    // On success, you might then prompt about logging out other devices.
    alert("Password change submitted (mock)."); // Replace with toast
  };


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUserProfileChange('profilePictureUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const timezones = typeof Intl !== 'undefined' ? (Intl as any).supportedValuesOf?.('timeZone') || [clientTimezone] : [clientTimezone];
  const languages = [{value: 'en', label: 'English'}, {value: 'es', label: 'Español'}, {value: 'fr', label: 'Français'}];


  return (
    <div className="flex-1 h-full overflow-y-auto bg-background text-foreground p-6 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <Accordion type="multiple" defaultValue={['account-settings', 'newsletter-appearance']} className="w-full space-y-6">
        
        <AccordionItem value="account-settings">
          <AccordionTrigger className="text-xl font-semibold hover:no-underline">
            <div className="flex items-center gap-3">
              <UserCircle className="h-6 w-6 text-primary" />
              Account Management
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>Manage your personal details and password.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
                  <div className="relative">
                    <img data-ai-hint="profile avatar" src={userProfile.profilePictureUrl || `https://picsum.photos/seed/${userProfile.fullName || 'user'}/128/128`} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                    <label htmlFor="profilePictureUpload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                      <Edit2 size={14} />
                      <input id="profilePictureUpload" type="file" accept="image/jpeg, image/png" className="sr-only" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <div className="flex-grow w-full space-y-3">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" value={userProfile.fullName} onChange={(e) => handleUserProfileChange('fullName', e.target.value)} placeholder="Your full name" />
                    </div>
                     <div>
                      <Label htmlFor="contactEmail">Contact Email</Label>
                      <Input id="contactEmail" type="email" value={userProfile.contactEmail} onChange={(e) => handleUserProfileChange('contactEmail', e.target.value)} placeholder="your@email.com" />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleSaveProfile}><Save className="mr-2 h-4 w-4" />Save Profile Details</Button>
                </div>

                <hr className="my-6 border-border" />
                
                <div className="space-y-4">
                    <h3 className="text-lg font-medium flex items-center gap-2"><KeyRound className="h-5 w-5 text-muted-foreground"/>Change Password</h3>
                    <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" placeholder="Enter new password (min. 8 characters)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                    </div>
                    <div>
                        <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                        <Input id="confirmNewPassword" type="password" placeholder="Confirm new password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
                    </div>
                     <div className="flex justify-end">
                        <Button onClick={handleChangePassword}>Change Password</Button>
                    </div>
                     {/* The "Log out of all other devices" functionality would be triggered after a successful password change, likely via a toast or subsequent dialog. Not a persistent button. */}
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="newsletter-appearance">
           <AccordionTrigger className="text-xl font-semibold hover:no-underline">
            <div className="flex items-center gap-3">
              <Palette className="h-6 w-6 text-primary" />
              Newsletter Appearance
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 space-y-6">
             <Card>
              <CardHeader>
                <CardTitle>Content Styling</CardTitle>
                <CardDescription>Customize fonts, colors, and overall look of your newsletter content.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StyleCustomizer initialStyles={initialStyles} onStylesChange={onStylesChange}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Edit2 className="mr-2 h-4 w-4" /> Open Full Style Editor
                  </Button>
                </StyleCustomizer>
                 <Button variant="outline" onClick={() => onSetIsStyleChatOpen(true)} className="w-full sm:w-auto">
                  <MessageSquarePlus className="mr-2 h-4 w-4" /> Chat for Quick Styling
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Workspace Backdrop</CardTitle>
                <CardDescription>Personalize the background of your main workspace area.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => onSetIsBackdropCustomizerOpen(true)} className="w-full sm:w-auto">
                  <Layers className="mr-2 h-4 w-4" /> Customize Backdrop
                </Button>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>AI Personalization</CardTitle>
                <CardDescription>Guide the AI's tone and content generation by providing context about your newsletter and audience. These settings also allow manual overrides for generated text like subject lines and headings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newsletterDescription">Newsletter Description (for AI context)</Label>
                  <Textarea id="newsletterDescription" value={currentPersonalization.newsletterDescription || ''} onChange={(e) => handlePersonalizationFieldChange('newsletterDescription', e.target.value)} placeholder="e.g., Weekly tips on sustainable living and eco-friendly products." />
                </div>
                <div>
                  <Label htmlFor="targetAudience">Target Audience (for AI context)</Label>
                  <Input id="targetAudience" value={currentPersonalization.targetAudience || ''} onChange={(e) => handlePersonalizationFieldChange('targetAudience', e.target.value)} placeholder="e.g., Eco-conscious millennials, busy professionals." />
                </div>
                
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                        <Label htmlFor="generateSubjectLine" className="text-sm font-medium">Generate Subject Line with AI</Label>
                        <p className="text-xs text-muted-foreground">Let AI craft a subject line based on newsletter content and topic.</p>
                    </div>
                    <Switch id="generateSubjectLine" checked={!!currentPersonalization.generateSubjectLine} onCheckedChange={(checked) => handlePersonalizationFieldChange('generateSubjectLine', checked)} />
                </div>
                {!currentPersonalization.generateSubjectLine && (
                  <div className="ml-4">
                    <Label htmlFor="customSubjectLine">Custom Subject Line</Label>
                    <Input id="customSubjectLine" value={currentPersonalization.subjectLine || ''} onChange={(e) => handlePersonalizationFieldChange('subjectLine', e.target.value)} placeholder="Enter your custom subject line" />
                  </div>
                )}

                <div className="flex items-center justify-between rounded-lg border p-3">
                     <div className="space-y-0.5">
                        <Label htmlFor="generateIntroText" className="text-sm font-medium">Generate Introductory Text with AI</Label>
                        <p className="text-xs text-muted-foreground">Let AI write an engaging introduction for your newsletter.</p>
                    </div>
                    <Switch id="generateIntroText" checked={!!currentPersonalization.generateIntroText} onCheckedChange={(checked) => handlePersonalizationFieldChange('generateIntroText', checked)} />
                </div>
                 {!currentPersonalization.generateIntroText && (
                  <div className="ml-4">
                    <Label htmlFor="customIntroText">Custom Introductory Text</Label>
                    <Textarea id="customIntroText" value={currentPersonalization.introText || ''} onChange={(e) => handlePersonalizationFieldChange('introText', e.target.value)} placeholder="Enter your custom introductory text" rows={3}/>
                  </div>
                )}

                <h4 className="text-md font-medium pt-2">Custom Section Headings (Override Defaults)</h4>
                {[
                    {key: 'authorsHeading', defaultKey: 'authorsHeadingText', label: 'Authors & Quotes Heading'},
                    {key: 'factsHeading', defaultKey: 'factsHeadingText', label: 'Facts Heading'},
                    {key: 'toolsHeading', defaultKey: 'toolsHeadingText', label: 'Tools Heading'},
                    {key: 'newslettersHeading', defaultKey: 'newslettersHeadingText', label: 'Newsletters Heading'},
                    {key: 'podcastsHeading', defaultKey: 'podcastsHeadingText', label: 'Podcasts Heading'},
                ].map(item => {
                    const fieldKey = item.key as keyof PersonalizationSettings;
                    return (
                        <div key={fieldKey}>
                            <Label htmlFor={fieldKey}>{item.label}</Label>
                            <Input id={fieldKey} value={currentPersonalization[fieldKey] as string || ''} onChange={(e) => handlePersonalizationFieldChange(fieldKey, e.target.value)} placeholder={`Default: "${initialStyles[item.defaultKey as keyof NewsletterStyles] || item.label.replace(' Heading', '')}"`} />
                        </div>
                    );
                })}
                <div className="flex justify-end">
                  <Button onClick={handleSavePersonalization}><Save className="mr-2 h-4 w-4" />Save Personalization Settings</Button>
                </div>
              </CardContent>
            </Card>
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
                    <Switch id="emailNotificationsEnabled" checked={userProfile.emailNotificationsEnabled} onCheckedChange={(checked) => handleUserProfileChange('emailNotificationsEnabled', checked)} />
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
                   <select id="timezone" value={userProfile.timezone || clientTimezone} onChange={(e) => handleUserProfileChange('timezone', e.target.value)} className="w-full p-2 border rounded-md bg-input text-foreground">
                    {timezones.map((tz: string) => <option key={tz} value={tz}>{tz}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="language">Language</Label>
                  <select id="language" value={userProfile.language} onChange={(e) => handleUserProfileChange('language', e.target.value)} className="w-full p-2 border rounded-md bg-input text-foreground">
                    {languages.map(lang => <option key={lang.value} value={lang.value}>{lang.label}</option>)}
                  </select>
                </div>
                 <div className="flex justify-end">
                    <Button onClick={handleSaveProfile}><Save className="mr-2 h-4 w-4" />Save Localization</Button>
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>

       <BackdropCustomizer
        isOpen={isBackdropCustomizerOpen}
        onOpenChange={onSetIsBackdropCustomizerOpen}
        initialStyles={initialStyles}
        onStylesChange={onStylesChange}
      />
      {/* StyleChatDialog is opened from MainWorkspace via prop */}
    </div>
  );
}
