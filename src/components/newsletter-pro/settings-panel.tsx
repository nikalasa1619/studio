// src/components/newsletter-pro/settings-panel.tsx
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { NewsletterStyles } from './types';
import { StyleCustomizer } from './style-customizer';
// StyleChatDialog and BackdropCustomizer dialogs are managed by MainWorkspace,
// but their triggers will be here.
import { Palette, MessageSquarePlus, Droplet, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


interface SettingsPanelProps {
  initialStyles: NewsletterStyles;
  onStylesChange: (newStyles: NewsletterStyles) => void;
  isStyleChatOpen: boolean;
  onSetIsStyleChatOpen: (isOpen: boolean) => void;
  onStyleChatSubmit: (description: string) => Promise<void>; // Passed to StyleChatDialog if rendered here, or just trigger
  isLoadingStyleChat: boolean; // Passed to StyleChatDialog
  isBackdropCustomizerOpen: boolean;
  onSetIsBackdropCustomizerOpen: (isOpen: boolean) => void;
}

export function SettingsPanel({
  initialStyles,
  onStylesChange,
  isStyleChatOpen, // Maintained in MainWorkspace
  onSetIsStyleChatOpen, // Maintained in MainWorkspace
  onStyleChatSubmit, // Maintained in MainWorkspace
  isLoadingStyleChat, // Maintained in MainWorkspace
  isBackdropCustomizerOpen, // Maintained in MainWorkspace
  onSetIsBackdropCustomizerOpen, // Maintained in MainWorkspace
}: SettingsPanelProps) {
  return (
    <div className="flex-1 h-full bg-background">
      <ScrollArea className="h-full">
        <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8">
          
          <div className="pt-4 sm:pt-6">
             <h1 className="text-2xl sm:text-3xl font-bold text-primary">Settings</h1>
             <p className="text-muted-foreground mt-1">Manage your newsletter appearance and account preferences.</p>
          </div>

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
                  <Palette className="mr-2 h-4 w-4" /> Open Style Editor
                </Button>
              </StyleCustomizer>
              <Button variant="outline" onClick={() => onSetIsStyleChatOpen(true)} className="w-full sm:w-auto">
                <MessageSquarePlus className="mr-2 h-4 w-4" /> Chat for Styling
              </Button>
            </CardContent>
          </Card>

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
               <Button variant="outline" onClick={() => onSetIsBackdropCustomizerOpen(true)} className="w-full sm:w-auto">
                <Droplet className="mr-2 h-4 w-4" /> Customize Backdrop
              </Button>
            </CardContent>
          </Card>
          
          {/* Placeholder for Account Management Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                 <UsersIcon size={22} /> Account
              </CardTitle>
              <CardDescription>
                Manage your account details and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant="default" className="bg-muted/50">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle>Coming Soon!</AlertTitle>
                    <AlertDescription>
                        Account management features like profile updates, password changes, and subscription details will be available here.
                    </AlertDescription>
                </Alert>
            </CardContent>
          </Card>

        </div>
      </ScrollArea>
    </div>
  );
}

// Placeholder UserIcon if not imported from lucide or similar
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
