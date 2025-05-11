
"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter, // Added SidebarFooter
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderKanban, PlusCircle, Edit3, Trash2, FileText, Bookmark } from "lucide-react";
import type { Project } from "./types";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth-button"; // Import AuthButton
import { ThemeToggleButton } from "@/components/theme-toggle-button"; // Import ThemeToggleButton
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectSavedItemsView: () => void;
  isSavedItemsActive: boolean;
}

export function AppSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onRenameProject,
  onDeleteProject,
  onSelectSavedItemsView,
  isSavedItemsActive,
}: AppSidebarProps) {
  return (
    <Sidebar side="left" collapsible="icon" className="border-r" variant="floating">
      <SidebarHeader className="p-2 flex items-center justify-end border-b h-14"> {/* Adjusted: justify-end, fixed height */}
        {/* NewsLetterPro title removed */}
        <SidebarTrigger className="mr-1"/>
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-between">
        <div>
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-2 pt-1 text-base font-semibold">Library</SidebarGroupLabel> {/* Increased font size */}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onSelectSavedItemsView}
                  isActive={isSavedItemsActive}
                  tooltip="Saved Items"
                >
                  <Bookmark />
                  <span className="group-data-[collapsible=icon]:hidden">Saved Items</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <div className="flex items-center justify-between px-2 pt-2">
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-base font-semibold">Projects</SidebarGroupLabel> {/* Increased font size */}
              <SidebarGroupAction asChild className="group-data-[collapsible=icon]:hidden">
                <Button variant="ghost" size="icon" onClick={onNewProject} aria-label="New Project">
                  <PlusCircle size={18} />
                </Button>
              </SidebarGroupAction>
              <div className="hidden group-data-[collapsible=icon]:block w-full px-0">
                <SidebarMenuButton
                  onClick={onNewProject}
                  tooltip="New Project"
                  variant="ghost"
                  size="icon"
                  className="w-full h-8"
                >
                  <PlusCircle size={18} />
                </SidebarMenuButton>
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-320px)] group-data-[collapsible=icon]:h-[calc(100vh-260px)]"> {/* Adjusted height for footer */}
              <SidebarMenu>
                {projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      onClick={() => onSelectProject(project.id)}
                      isActive={activeProjectId === project.id && !isSavedItemsActive}
                      tooltip={project.name}
                      className="justify-between"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText />
                        <span className="truncate">{project.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                {projects.length === 0 && (
                  <SidebarMenuItem>
                    <p className="p-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden text-center">No projects yet. Click '+' to create one.</p>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </ScrollArea>
          </SidebarGroup>
        </div>

        <SidebarFooter className="mt-auto p-2 border-t">
          <div className={cn(
            "flex flex-col gap-2",
            "group-data-[collapsible=icon]:gap-2 group-data-[collapsible=icon]:items-center"
          )}>
            <ThemeToggleButton />
            <AuthButton />
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}

    