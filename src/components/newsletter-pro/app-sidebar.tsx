
"use client";

import React, { useState } from "react"; // Added useState
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
  SidebarSeparator,
} from "@/components/ui/left-sidebar-elements";
import { useLeftSidebar } from "@/components/ui/left-sidebar-elements"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, FileText, Bookmark, Settings, ArrowLeft, Keyboard } from "lucide-react"; // Added Keyboard
import type { Project } from "./types";
import type { MainViewMode } from "./main-workspace"; 
import { AuthButton } from "@/components/auth-button"; 
import { ThemeToggleButton } from "@/components/theme-toggle-button"; 
import { cn } from "@/lib/utils";
import { DynamicQuoteDisplay } from "./ui/dynamic-quote-display";
import { ShortcutsDialog } from "./shortcuts-dialog"; // Added import

interface AppSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onNewProject: () => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onDeleteProject: (projectId: string) => void;
  onSelectSavedItemsView: () => void;
  isSavedItemsActive: boolean;
  currentMainViewMode: MainViewMode; 
  onSetMainViewMode: (mode: MainViewMode) => void;
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
  currentMainViewMode,
  onSetMainViewMode,
}: AppSidebarProps) {
  const { state: leftSidebarState, setOpen: setLeftSidebarOpen } = useLeftSidebar();
  const [isShortcutsDialogOpen, setIsShortcutsDialogOpen] = useState(false); // State for shortcuts dialog

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
    <>
      <Sidebar 
        side="left" 
        collapsible="icon"
        className="border-r" 
        variant="floating"
      >
        <SidebarHeader className="p-2 flex items-center justify-between group-data-[collapsible=icon]:justify-center border-b h-14">
          {currentMainViewMode === 'settings' ? (
            <SidebarMenuButton 
              onClick={() => {
                onSetMainViewMode('workspace');
                setLeftSidebarOpen(false); 
              }} 
              tooltip="Back to Workspace" 
              className="w-full justify-start text-base" 
              size="default"
            >
              <ArrowLeft size={16} />
              <span className={cn("ml-2 font-semibold", leftSidebarState === 'collapsed' && "group-data-[collapsible=icon]:hidden")}>
                Settings
              </span>
            </SidebarMenuButton>
          ) : (
            <>
              <div className={cn("flex-grow", leftSidebarState === 'collapsed' && "group-data-[collapsible=icon]:hidden")}>
                 <DynamicQuoteDisplay />
              </div>
              <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
            </>
          )}
        </SidebarHeader>

        {currentMainViewMode === 'workspace' && (
          <SidebarContent className="flex flex-col justify-between">
            <ScrollArea className="h-[calc(100vh-200px)] group-data-[collapsible=icon]:h-[calc(100vh-160px)]">
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
                    <p className="p-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden text-center">No projects yet. Click 'Start new project' below.</p>
                  </SidebarMenuItem>
                )}
              </SidebarGroup>

              <SidebarSeparator />

              <SidebarGroup>
                <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-2 pt-1 text-base font-semibold">New</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={onNewProject}
                      tooltip="Start new project"
                      className="w-full justify-start text-base"
                      size="default"
                    >
                      <PlusCircle size={16} />
                      <span className="group-data-[collapsible=icon]:hidden">Start new project</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>

            </ScrollArea>
          </SidebarContent>
        )}

        {currentMainViewMode === 'settings' && (
          <SidebarContent className="flex flex-col justify-between">
             <div className="flex-grow p-4">
                <p className={cn("text-sm text-muted-foreground", leftSidebarState === 'collapsed' && "group-data-[collapsible=icon]:hidden")}>Manage your application and account settings.</p>
             </div>
          </SidebarContent>
        )}


        <SidebarFooter className="mt-auto p-2 border-t">
           <SidebarMenu>
              <SidebarMenuItem>
                <ShortcutsDialog isOpen={isShortcutsDialogOpen} onOpenChange={setIsShortcutsDialogOpen}>
                  <SidebarMenuButton 
                    tooltip="Keyboard Shortcuts" 
                    className="w-full justify-start text-base" 
                    size="default"
                  >
                      <Keyboard size={16} />
                      <span className="group-data-[collapsible=icon]:hidden">Shortcuts</span>
                  </SidebarMenuButton>
                </ShortcutsDialog>
             </SidebarMenuItem>
             <SidebarMenuItem>
                <ThemeToggleButton />
             </SidebarMenuItem>
             <SidebarMenuItem>
                <AuthButton />
             </SidebarMenuItem>
             {currentMainViewMode === 'workspace' && (
              <SidebarMenuItem>
                  <SidebarMenuButton 
                    tooltip="Settings" 
                    onClick={() => onSetMainViewMode('settings')} 
                    className="w-full justify-start text-base" 
                    size="default"
                  >
                      <Settings size={16} />
                      <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                  </SidebarMenuButton>
              </SidebarMenuItem>
             )}
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
