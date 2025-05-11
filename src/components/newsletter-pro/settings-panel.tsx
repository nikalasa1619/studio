// src/components/newsletter-pro/settings-panel.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { NewsletterStyles } from './types';
import { useAuth } from '@/contexts/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { Palette, MessageSquarePlus, Droplet, UserCircle, LockKeyhole, Bell, Languages, Clock, Trash2, Upload, Info, Edit2 } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { StyleCustomizer } from "./style-customizer"; // Added import
import { BackdropCustomizer } from './backdrop-customizer';


interface SettingsPanelProps {
  initialStyles: NewsletterStyles;
  onStylesChange: (newStyles: NewsletterStyles) => void;
  isStyleChatOpen: boolean;
  onSetIsStyleChatOpen: (isOpen: boolean) => void;
  onStyleChatSubmit: (description: string) => Promise<void>;
  isLoadingStyleChat: boolean;
  isBackdropCustomizerOpen: boolean;
  onSetIsBackdropCustomizerOpen: (isOpen: boolean) => void;
}

const timezones = [
  { value: "Etc/GMT+12", label: "(GMT-12:00) International Date Line West" },
  { value: "Pacific/Midway", label: "(GMT-11:00) Midway Island, Samoa" },
  { value: "Pacific/Honolulu", label: "(GMT-10:00) Hawaii" },
  { value: "America/Anchorage", label: "(GMT-09:00) Alaska" },
  { value: "America/Los_Angeles", label: "(GMT-08:00) Pacific Time (US & Canada)" },
  { value: "America/Denver", label: "(GMT-07:00) Mountain Time (US & Canada)" },
  { value: "America/Chicago", label: "(GMT-06:00) Central Time (US & Canada)" },
  { value: "America/New_York", label: "(GMT-05:00) Eastern Time (US & Canada)" },
  { value: "Atlantic/Bermuda", label: "(GMT-04:00) Atlantic Time (Canada)" },
  { value: "Etc/GMT", label: "(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London" },
  { value: "Europe/Berlin", label: "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna" },
  { value: "Europe/Helsinki", label: "(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius" },
  { value: "Europe/Moscow", label: "(GMT+03:00) Moscow, St. Petersburg, Volgograd" },
  { value: "Asia/Dubai", label: "(GMT+04:00) Abu Dhabi, Muscat" },
  { value: "Asia/Karachi", label: "(GMT+05:00) Islamabad, Karachi, Tashkent" },
  { value: "Asia/Dhaka", label: "(GMT+06:00) Astana, Dhaka" },
  { value: "Asia/Bangkok", label: "(GMT+07:00) Bangkok, Hanoi, Jakarta" },
  { value: "Asia/Singapore", label: "(GMT+08:00) Beijing, Perth, Singapore, Hong Kong" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Osaka, Sapporo, Tokyo" },
  { value: "Australia/Sydney", label: "(GMT+10:00) Canberra, Melbourne, Sydney" },
  { value: "Pacific/Auckland", label: "(GMT+12:00) Auckland, Wellington" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español (Spanish)" },
  { value: "fr", label: "Français (French)" },
  { value: "de", label: "Deutsch (German)" },
];


export function SettingsPanel({
  initialStyles,
  onStylesChange,
  isStyleChatOpen,
  onSetIsStyleChatOpen,
  onStyleChatSubmit,
  isLoadingStyleChat,
  isBackdropCustomizerOpen,
  onSetIsBackdropCustomizerOpen,
}: SettingsPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Profile Information State
  const [fullName, setFullName] = useState(user?.displayName || "");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.photoURL || "");
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);

  // Account Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Notifications State
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);

  // Preferences State
  const [selectedTimezone, setSelectedTimezone] = useState(timezones[0].value);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0].value);
  
  useEffect(() => {
    if (user) {
        setFullName(user.displayName || "");
        setContactEmail(user.email || "");
        setProfilePictureUrl(user.photoURL || "");
    }
  }, [user]);

  const handleProfileInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for actual API call
    console.log("Profile Info Submitted:", { fullName, contactEmail, profilePictureFile });
    toast({ title: "Profile Updated", description: "Your profile information has been saved (simulated)." });
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Password Mismatch", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    // Placeholder
    console.log("Password Change Submitted:", { currentPassword, newPassword });
    toast({ title: "Password Changed", description: "Your password has been updated (simulated)." });
  };
  
  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        toast({ title: "File too large", description: "Profile picture must be under 2MB.", variant: "destructive"});
        return;
      }
      setProfilePictureFile(file);
      setProfilePictureUrl(URL.createObjectURL(file)); // Preview
    }
  };

  const handleLogoutAllDevices = () => {
    // Placeholder
    console.log("Logout All Devices Requested");
    toast({ title: "Logged Out Everywhere", description: "You have been logged out from all other devices (simulated)." });
  };
  
  const handleAccountDeletion = () => {
    // Placeholder
    console.log("Account Deletion Confirmed");
    toast({ title: "Account Deleted", description: "Your account has been scheduled for deletion (simulated)." });
    // Ideally, call signOutUser here and redirect
  };


  return (
    <div className="flex-1 h-full bg-background">
      <ScrollArea className="h-full">
        <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8">
          
          <div className="pt-4 sm:pt-6">
             <h1 className="text-2xl sm:text-3xl font-bold text-primary">Settings</h1>
             <p className="text-muted-foreground mt-1">Manage your newsletter appearance and account preferences.</p>
          </div>

          {/* Profile Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserCircle size={22} /> Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileInfoSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={profilePictureUrl || undefined} alt={fullName || user?.displayName || "User"} data-ai-hint="placeholder avatar" />
                        <AvatarFallback>{(fullName || user?.displayName || "U").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <Label htmlFor="profilePicture" className="text-sm font-medium">Profile Picture (Optional)</Label>
                        <Input id="profilePicture" type="file" accept="image/jpeg, image/png" onChange={handleProfilePictureChange} className="mt-1"/>
                        <p className="text-xs text-muted-foreground mt-1">Max 2MB. JPG or PNG.</p>
                    </div>
                </div>
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={100} required />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} required />
                </div>
                <Button type="submit">Save Profile</Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <LockKeyhole size={22} /> Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 border-b pb-6 mb-6">
                <p className="text-md font-medium">Change Password</p>
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} required />
                </div>
                <div>
                  <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                  <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} minLength={8} required />
                </div>
                <Button type="submit">Change Password</Button>
              </form>
              <div>
                <p className="text-md font-medium mb-2">Active Sessions</p>
                <Button variant="outline" onClick={handleLogoutAllDevices}>Log Out of All Other Devices</Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bell size={22} /> Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications" className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                        Receive critical system emails.
                    </p>
                </div>
                <Switch
                    id="emailNotifications"
                    checked={emailNotificationsEnabled}
                    onCheckedChange={setEmailNotificationsEnabled}
                    aria-label="Toggle email notifications"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Preferences & Localization */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Languages size={22} /> Preferences & Localization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={selectedTimezone} onValueChange={setSelectedTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map(tz => <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
               <Button onClick={() => toast({title: "Preferences Saved (Simulated)"})}>Save Preferences</Button>
            </CardContent>
          </Card>

          {/* Newsletter Styling (Existing) */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Palette size={22} /> Newsletter Styling
              </CardTitle>
              <CardDescription>
                Customize the visual appearance of your newsletter content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <StyleCustomizer initialStyles={initialStyles} onStylesChange={onStylesChange}>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Edit2 className="mr-2 h-4 w-4" /> Open Style Editor
                </Button>
              </StyleCustomizer>
              <Button variant="outline" onClick={() => onSetIsStyleChatOpen(true)} className="w-full sm:w-auto">
                <MessageSquarePlus className="mr-2 h-4 w-4" /> Chat for Styling
              </Button>
            </CardContent>
          </Card>

          {/* Workspace Backdrop (Existing) */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Droplet size={22} /> Workspace Backdrop
              </CardTitle>
              <CardDescription>
                Personalize the background of your main content generation area.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <BackdropCustomizer 
                    isOpen={isBackdropCustomizerOpen} 
                    onOpenChange={onSetIsBackdropCustomizerOpen}
                    initialStyles={initialStyles}
                    onStylesChange={onStylesChange}
                >
                    <Button variant="outline" className="w-full sm:w-auto">
                        <Droplet className="mr-2 h-4 w-4" /> Customize Backdrop
                    </Button>
                </BackdropCustomizer>
            </CardContent>
          </Card>
          
          {/* Privacy & Data */}
          <Card className="shadow-lg border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-destructive">
                <Trash2 size={22} /> Privacy & Data
              </CardTitle>
            </CardHeader>
            <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleAccountDeletion}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </CardContent>
          </Card>

        </div>
      </ScrollArea>
    </div>
  );
}
