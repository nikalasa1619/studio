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
import { Button } from "@/components/ui/button"; 

interface AppSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onRenameProject: (projectId: string, newName: string) => void; 
  onDeleteProject: (projectId: string) => void; 
}

export function AppSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onRenameProject, 
  onDeleteProject, 
}: AppSidebarProps) {
  return (
    <Sidebar side="left" collapsible="icon" className="border-r" variant="floating">
      <SidebarHeader className="p-2 flex items-center justify-between border-b">
        <h2 className="text-lg font-semibold text-primary group-data-[collapsible=icon]:hidden ml-2">NewsLetterPro</h2>
        <SidebarTrigger className="mr-1"/>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 pt-2">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Projects</SidebarGroupLabel>
            <SidebarGroupAction asChild className="group-data-[collapsible=icon]:hidden">
              <Button variant="ghost" size="icon" onClick={onNewProject} aria-label="New Project">
                <PlusCircle size={18} />
              </Button>
            </SidebarGroupAction>
            {/* Tooltip for icon-only mode */}
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

          <ScrollArea className="h-[calc(100vh-180px)] group-data-[collapsible=icon]:h-[calc(100vh-120px)]"> {/* Adjusted height */}
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
                    {/* Action buttons (implement later if needed)
                    <div className="flex items-center gap-1 opacity-0 group-hover/menu-item:opacity-100 group-data-[collapsible=icon]:hidden">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); 
                        const newName = prompt("Enter new project name:", project.name);
                        if (newName) onRenameProject(project.id, newName);
                      }}>
                        <Edit3 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); 
                        if(confirm(`Are you sure you want to delete "${project.name}"?`)) onDeleteProject(project.id); 
                      }}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    */}
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
      </SidebarContent>
    </Sidebar>
  );
}
