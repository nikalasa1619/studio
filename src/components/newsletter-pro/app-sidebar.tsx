
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderKanban, PlusCircle, Edit3, Trash2, FileText } from "lucide-react";
import type { Project } from "./types";
import { Button } from "@/components/ui/button"; // For action buttons

interface AppSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onRenameProject: (projectId: string, newName: string) => void; // Placeholder for now
  onDeleteProject: (projectId: string) => void; // Placeholder for now
}

export function AppSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  // onRenameProject, // Implement later if needed
  // onDeleteProject, // Implement later if needed
}: AppSidebarProps) {
  return (
    <Sidebar side="left" collapsible="icon" className="border-r" variant="floating">
      <SidebarHeader className="p-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden">NewsLetterPro</h2>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Projects</SidebarGroupLabel>
            <SidebarGroupAction asChild className="group-data-[collapsible=icon]:hidden">
              <Button variant="ghost" size="icon" onClick={onNewProject} aria-label="New Project">
                <PlusCircle size={18} />
              </Button>
            </SidebarGroupAction>
             {/* Tooltip for icon-only mode */}
            <div className="hidden group-data-[collapsible=icon]:block">
               <SidebarMenuButton
                  onClick={onNewProject}
                  tooltip="New Project"
                  variant="ghost"
                  size="icon"
                  className="w-full"
                >
                  <PlusCircle size={18} />
               </SidebarMenuButton>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-150px)] group-data-[collapsible=icon]:h-auto"> {/* Adjust height as needed */}
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    onClick={() => onSelectProject(project.id)}
                    isActive={activeProjectId === project.id}
                    tooltip={project.name}
                    className="justify-between"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText />
                      <span className="truncate">{project.name}</span>
                    </div>
                    {/* Action buttons (implement later)
                    <div className="flex items-center gap-1 opacity-0 group-hover/menu-item:opacity-100 group-data-[collapsible=icon]:hidden">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onRenameProject(project.id, prompt("New name:") || project.name); }}>
                        <Edit3 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    */}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {projects.length === 0 && (
                 <SidebarMenuItem>
                    <p className="p-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">No projects yet. Click '+' to create one.</p>
                 </SidebarMenuItem>
              )}
            </SidebarMenu>
          </ScrollArea>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
