"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { UsersRound, Lightbulb, Wrench, Newspaper, Settings } from "lucide-react"; // Added Newspaper

export type ActiveView = 'authors' | 'facts' | 'tools' | 'newsletters';

interface AppSidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

export function AppSidebar({ activeView, setActiveView }: AppSidebarProps) {
  return (
    <Sidebar side="left" collapsible="icon" className="border-r">
      <SidebarHeader className="p-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">NewsLetterPro</h2>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView('authors')}
              isActive={activeView === 'authors'}
              tooltip="Authors & Quotes"
            >
              <UsersRound />
              <span>Authors & Quotes</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView('facts')}
              isActive={activeView === 'facts'}
              tooltip="Fun Facts"
            >
              <Lightbulb />
              <span>Fun Facts</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView('tools')}
              isActive={activeView === 'tools'}
              tooltip="Tool Recommender"
            >
              <Wrench />
              <span>Tool Recommender</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView('newsletters')}
              isActive={activeView === 'newsletters'}
              tooltip="Newsletter Finder"
            >
              <Newspaper />
              <span>Newsletter Finder</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      {/* Optionally, add a SidebarFooter for settings or user profile later */}
      {/* <SidebarFooter className="mt-auto p-2">
        <SidebarMenuButton tooltip="Settings">
            <Settings />
            <span>Settings</span>
        </SidebarMenuButton>
      </SidebarFooter> */}
    </Sidebar>
  );
}
