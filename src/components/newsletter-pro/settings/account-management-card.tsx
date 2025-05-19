
// src/components/newsletter-pro/settings/account-management-card.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit2, Save, KeyRound } from 'lucide-react';
import type { UserProfile } from '../types';
import { useToast } from '@/hooks/use-toast';

interface AccountManagementCardProps {
  userProfile: UserProfile;
  onUserProfileChange: (field: keyof UserProfile, value: string | boolean | undefined) => void;
  onSaveProfile: () => void; // Mocked for now
  // Actual password change logic would involve backend calls
}

export function AccountManagementCard({
  userProfile,
  onUserProfileChange,
  onSaveProfile,
}: AccountManagementCardProps) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUserProfileChange('profilePictureUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Password Mismatch", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Weak Password", description: "New password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    // In a real app, you'd call an API endpoint here
    console.log('Attempting to change password with:', { currentPassword, newPassword });
    toast({ title: "Password Change Submitted", description: "Your password change request has been processed (mock). You might be prompted to log out of other devices." });
    setIsPasswordDialogOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Information</CardTitle>
        <CardDescription>Manage your personal details and password.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
          <div className="relative">
            <img data-ai-hint="profile avatar" src={userProfile.profilePictureUrl || `https://placehold.co/128x128.png`} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
            <label htmlFor="profilePictureUpload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
              <Edit2 size={14} />
              <input id="profilePictureUpload" type="file" accept="image/jpeg, image/png" className="sr-only" onChange={handleImageUpload} />
            </label>
          </div>
          <div className="flex-grow w-full space-y-3">
            <div>
              <Label htmlFor="settingsFullName">Full Name</Label>
              <Input id="settingsFullName" value={userProfile.fullName} onChange={(e) => onUserProfileChange('fullName', e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <Label htmlFor="settingsContactEmail">Contact Email</Label>
              <Input id="settingsContactEmail" type="email" value={userProfile.contactEmail} onChange={(e) => onUserProfileChange('contactEmail', e.target.value)} placeholder="your@email.com" />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onSaveProfile}><Save className="mr-2 h-4 w-4" />Save Profile Details</Button>
        </div>

        <hr className="my-6 border-border" />

        <div className="space-y-2">
          <h3 className="text-lg font-medium flex items-center gap-2"><KeyRound className="h-5 w-5 text-muted-foreground" />Password Settings</h3>
          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>Change Password</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
                <DialogDescription>
                  Enter your current password and a new password.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dialogCurrentPassword" className="text-right col-span-1">Current</Label>
                  <Input id="dialogCurrentPassword" type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dialogNewPassword" className="text-right col-span-1">New</Label>
                  <Input id="dialogNewPassword" type="password" placeholder="New password (min. 8 chars)" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dialogConfirmNewPassword" className="text-right col-span-1">Confirm</Label>
                  <Input id="dialogConfirmNewPassword" type="password" placeholder="Confirm new password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>Cancel</Button>
                <Button type="button" onClick={handleChangePassword} disabled={!currentPassword || newPassword.length < 8 || newPassword !== confirmNewPassword}>Confirm Change</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
