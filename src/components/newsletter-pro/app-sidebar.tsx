
"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
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
import { FolderKanban, PlusCircle, Edit3, Trash2, FileText, Bookmark, Palette, MessageSquarePlus, History, Users, Lightbulb, Wrench, Newspaper, Podcast as PodcastIconLucide, Droplet } from "lucide-react";
import type { Project, NewsletterStyles } from "./types";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth-button"; 
import { ThemeToggleButton } from "@/components/theme-toggle-button"; 
import { StyleCustomizer } from "./style-customizer";
import { StyleChatDialog } from "./style-chat-dialog";
import { cn } from "@/lib/utils";
import { BackdropCustomizer } from "./backdrop-customizer";

interface AppSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectSavedItemsView: () => void;
  isSavedItemsActive: boolean;
  // Props for style customization
  initialStyles: NewsletterStyles;
  onStylesChange: (newStyles: NewsletterStyles) => void;
  isStyleChatOpen: boolean;
  onSetIsStyleChatOpen: (isOpen: boolean) => void;
  onStyleChatSubmit: (description: string) => Promise<void>;
  isLoadingStyleChat: boolean;
  isBackdropCustomizerOpen: boolean;
  onSetIsBackdropCustomizerOpen: (isOpen: boolean) => void;

}

const getProjectGroup = (project: Project): 'Recent' | 'Yesterday' | 'Older' => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  if (now - project.lastModified < oneHour) {
    return 'Recent';
  }

  const projectDate = new Date(project.lastModified);
  const today = new Date();
  today.setHours(0,0,0,0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  if (projectDate >= yesterday && projectDate < today) {
    return 'Yesterday';
  }
  
  return 'Older';
};


export function AppSidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onRenameProject,
  onDeleteProject,
  onSelectSavedItemsView,
  isSavedItemsActive,
  initialStyles,
  onStylesChange,
  isStyleChatOpen,
  onSetIsStyleChatOpen,
  onStyleChatSubmit,
  isLoadingStyleChat,
  isBackdropCustomizerOpen,
  onSetIsBackdropCustomizerOpen,
}: AppSidebarProps) {

  const groupedProjects = projects.reduce((acc, project) => {
    const group = getProjectGroup(project);
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(project);
    return acc;
  }, {} as Record<'Recent' | 'Yesterday' | 'Older', Project[]>);

  const projectGroupsOrder: Array<'Recent' | 'Yesterday' | 'Older'> = ['Recent', 'Yesterday', 'Older'];


  return (
    <Sidebar side="left" collapsible="icon" className="border-r" variant="floating">
      <SidebarHeader className="p-2 flex items-center justify-between border-b h-14">
        {/* Placeholder for potential logo or title if sidebar is expanded */}
        <div className="flex-grow group-data-[collapsible=icon]:hidden">
          {/* <span className="font-semibold text-lg">NewsLetterPro</span> */}
        </div>
        <SidebarTrigger className="ml-auto"/>
      </SidebarHeader>
      <SidebarContent className="flex flex-col justify-between">
        <ScrollArea className="h-[calc(100vh-200px)] group-data-[collapsible=icon]:h-[calc(100vh-160px)]"> {/* Adjusted height for more footer items */}
          <SidebarGroup>
            <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-2 pt-1 text-base font-semibold">Library</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={onSelectSavedItemsView}
                  isActive={isSavedItemsActive}
                  tooltip="Saved Items"
                  className="w-full justify-start text-base"
                  size="default"
                >
                  <Bookmark size={16} />
                  <span className="group-data-[collapsible=icon]:hidden">Saved Items</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <div className="flex items-center justify-between px-2 pt-2">
              <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-base font-semibold">Projects</SidebarGroupLabel>
              <SidebarGroupAction asChild className="group-data-[collapsible=icon]:hidden">
                <Button variant="ghost" size="icon" onClick={onNewProject} aria-label="New Project">
                  <PlusCircle size={16} /> {/* Standardized icon size */}
                </Button>
              </SidebarGroupAction>
              {/* Container for collapsed "New Project" button */}
              <div className="hidden group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10">
                <SidebarMenuButton
                  onClick={onNewProject}
                  tooltip="New Project"
                  size="default" // Ensure it uses default sizing which handles collapsed state
                  className="p-0" // Parent div handles size, button itself is flexible
                >
                  <PlusCircle size={16} />
                </SidebarMenuButton>
              </div>
            </div>
            
            {projectGroupsOrder.map(groupName => (
              groupedProjects[groupName] && groupedProjects[groupName].length > 0 && (
                <React.Fragment key={groupName}>
                  <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-2 pt-3 text-xs text-muted-foreground uppercase tracking-wider">{groupName}</SidebarGroupLabel>
                  <SidebarMenu>
                    {groupedProjects[groupName].map((project) => (
                      <SidebarMenuItem key={project.id}>
                        <SidebarMenuButton
                          onClick={() => onSelectProject(project.id)}
                          isActive={activeProjectId === project.id && !isSavedItemsActive}
                          tooltip={project.name}
                          className="justify-start w-full text-base" 
                          size="default"
                        >
                          <FileText size={16} />
                          <span className="truncate group-data-[collapsible=icon]:hidden">{project.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </React.Fragment>
              )
            ))}
            
            {projects.length === 0 && (
              <SidebarMenuItem>
                <p className="p-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden text-center">No projects yet. Click '+' to create one.</p>
              </SidebarMenuItem>
            )}
          </SidebarGroup>
        </ScrollArea>

        <SidebarFooter className="mt-auto p-2 border-t">
           <SidebarMenu>
             <SidebarMenuItem>
                <StyleCustomizer initialStyles={initialStyles} onStylesChange={onStylesChange}>
                    <SidebarMenuButton tooltip="Customize Styles" className="w-full justify-start text-base" size="default">
                        <Palette size={16} />
                        <span className="group-data-[collapsible=icon]:hidden">Customize Styles</span>
                    </SidebarMenuButton>
                </StyleCustomizer>
             </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton tooltip="Chat for Styling" onClick={() => onSetIsStyleChatOpen(true)} className="w-full justify-start text-base" size="default">
                    <MessageSquarePlus size={16} />
                    <span className="group-data-[collapsible=icon]:hidden">Chat for Styling</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
                <BackdropCustomizer isOpen={isBackdropCustomizerOpen} onOpenChange={onSetIsBackdropCustomizerOpen} initialStyles={initialStyles} onStylesChange={onStylesChange}>
                    <SidebarMenuButton tooltip="Customize Backdrop" className="w-full justify-start text-base" size="default">
                        <Droplet size={16} />
                        <span className="group-data-[collapsible=icon]:hidden">Customize Backdrop</span>
                    </SidebarMenuButton>
                </BackdropCustomizer>
             </SidebarMenuItem>
             <SidebarMenuItem>
                <ThemeToggleButton />
             </SidebarMenuItem>
             <SidebarMenuItem>
                <AuthButton />
             </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
      <StyleChatDialog
        isOpen={isStyleChatOpen}
        onOpenChange={onSetIsStyleChatOpen}
        onSubmit={onStyleChatSubmit}
        isLoading={isLoadingStyleChat}
      />
    </Sidebar>
  );
}

