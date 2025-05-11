
// src/components/auth-button.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogIn, LogOut, User as UserIcon, Loader2, AlertTriangle, UserPlus, Settings2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export function AuthButton() {
  const { user, isLoading, signOutUser, isAuthAvailable } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { state: sidebarState } = useSidebar(); 

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const buttonBaseClasses = "h-10 w-full justify-start p-2 text-base gap-2";
  const collapsedButtonClasses = "group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2";

  if (!mounted) {
    return (
      <Button variant="ghost" className={cn(buttonBaseClasses, collapsedButtonClasses)} disabled>
        <Loader2 className="h-4 w-4 animate-spin group-data-[collapsible=icon]:mr-0 mr-2" />
        <span className="group-data-[collapsible=icon]:hidden">Loading...</span>
      </Button>
    );
  }


  if (!isAuthAvailable) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" disabled className={cn("cursor-not-allowed", buttonBaseClasses, collapsedButtonClasses)}>
              <AlertTriangle className="h-4 w-4 text-destructive group-data-[collapsible=icon]:mr-0 mr-2" />
              <span className="group-data-[collapsible=icon]:hidden text-destructive">Auth N/A</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" className={cn(sidebarState === "expanded" ? "hidden": "")}>
            <p>Auth unavailable. Check Firebase config.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (isLoading && !user) { 
    return (
      <Button variant="ghost" className={cn(buttonBaseClasses, collapsedButtonClasses)} disabled>
        <Loader2 className="h-4 w-4 animate-spin group-data-[collapsible=icon]:mr-0 mr-2" />
         <span className="group-data-[collapsible=icon]:hidden">Loading...</span>
      </Button>
    );
  }

  if (user) {
    const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : <UserIcon size={18}/>);
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={cn("relative", buttonBaseClasses, collapsedButtonClasses)}>
            <Avatar className="h-6 w-6 group-data-[collapsible=icon]:mr-0 mr-2">
              {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || "User"} />}
              <AvatarFallback className="text-xs">{userInitial}</AvatarFallback>
            </Avatar>
            <span className="truncate group-data-[collapsible=icon]:hidden text-base">{user.displayName || user.email}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" side="right" sideOffset={sidebarState === 'collapsed' ? 10 : 5}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none truncate">{user.displayName || user.email || "Authenticated User"}</p>
              {user.email && !user.displayName && <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOutUser} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className={cn(buttonBaseClasses, collapsedButtonClasses)}>
          <LogIn className="group-data-[collapsible=icon]:mr-0 mr-2 h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">Sign In</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin"><LogIn className="mr-2 h-4 w-4" />Sign In</TabsTrigger>
            <TabsTrigger value="signup"><UserPlus className="mr-2 h-4 w-4" />Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInForm onSuccess={() => setIsDialogOpen(false)} />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm onSuccess={() => setIsDialogOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

    

    