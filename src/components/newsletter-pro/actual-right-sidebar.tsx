
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
} from "@/components/ui/right-sidebar-elements";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NewsletterPreview } from "./newsletter-preview";
import { StyleCustomizer } from "./style-customizer";
import type {
  Author,
  FunFactItem,
  ToolItem,
  NewsletterItem,
  PodcastItem,
  NewsletterStyles,
  PersonalizationSettings, // Added
} from "./types";
import { Palette, MessageSquarePlus, PanelRightOpen, PanelRightClose, Eye } from "lucide-react";
import { useRightSidebar } from "@/components/ui/right-sidebar-elements";
import { cn } from "@/lib/utils";


interface ActualRightSidebarProps {
  initialStyles: NewsletterStyles;
  onStylesChange: (newStyles: NewsletterStyles) => void;
  personalizationSettings: PersonalizationSettings; // Added
  onPersonalizationChange: (settings: PersonalizationSettings) => void; // Added
  selectedAuthors: Author[];
  selectedFunFacts: FunFactItem[];
  selectedTools: ToolItem[];
  selectedNewsletters: NewsletterItem[];
  selectedPodcasts: PodcastItem[];
  onSetIsStyleChatOpen: (isOpen: boolean) => void;
  projectTopic: string;
}

export function ActualRightSidebar({
  initialStyles,
  onStylesChange,
  personalizationSettings, // Added
  onPersonalizationChange, // Added
  selectedAuthors,
  selectedFunFacts,
  selectedTools,
  selectedNewsletters,
  selectedPodcasts,
  onSetIsStyleChatOpen,
  projectTopic,
}: ActualRightSidebarProps) {
  const { state: rightSidebarState, toggleSidebar: toggleRightSidebar } = useRightSidebar();

  const TriggerIcon = rightSidebarState === 'expanded' ? PanelRightClose : PanelRightOpen;

  const inlineStyles = { 
    previewHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    previewHeaderText: {
      fontFamily: initialStyles.headingFont, 
      color: 'hsl(var(--sidebar-foreground))',
      fontSize: '1.1em', 
      fontWeight: '600' as '600',
    },
    previewHeaderIcon: {
      color: 'hsl(var(--sidebar-foreground))',
    },
  };


  return (
    <Sidebar
      side="right"
      variant="floating"
      collapsible="icon"
      className="border-l"
    >
      <SidebarHeader className="p-2 flex items-center justify-between group-data-[collapsible=icon]:justify-center border-b h-14">
        <SidebarTrigger
          className="ml-auto group-data-[collapsible=icon]:ml-0"
          icon={<TriggerIcon size={16} />}
          aria-label={rightSidebarState === 'expanded' ? "Collapse preview sidebar" : "Expand preview sidebar"}
        />
      </SidebarHeader>
      <SidebarContent className="p-0">
        <ScrollArea className="h-[calc(100vh-120px)] group-data-[collapsible=icon]:h-[calc(100vh-80px)]">
           {rightSidebarState === 'expanded' && (
            <div className="p-3">
                <NewsletterPreview
                    selectedAuthors={selectedAuthors}
                    selectedFunFacts={selectedFunFacts}
                    selectedTools={selectedTools}
                    selectedAggregatedContent={selectedNewsletters}
                    selectedPodcasts={selectedPodcasts}
                    styles={initialStyles}
                    personalizationSettings={personalizationSettings} // Pass personalization
                    onPersonalizationChange={onPersonalizationChange} // Pass handler
                    projectTopic={projectTopic}
                    onStylesChange={onStylesChange} 
                />
            </div>
           )}
           {rightSidebarState === 'collapsed' && (
             <div className="flex items-center justify-center h-full">
             </div>
           )}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
         <SidebarMenu>
            <SidebarMenuItem>
                <StyleCustomizer initialStyles={initialStyles} onStylesChange={onStylesChange}>
                    <SidebarMenuButton
                        tooltip="Customize Styles"
                        className="w-full justify-start text-base"
                        size="default"
                    >
                        <Palette size={16}/>
                        <span className="group-data-[collapsible=icon]:hidden">Customize Styles</span>
                    </SidebarMenuButton>
                </StyleCustomizer>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => onSetIsStyleChatOpen(true)}
                    tooltip="Chat for Styling"
                    className="w-full justify-start text-base"
                    size="default"
                >
                    <MessageSquarePlus size={16}/>
                    <span className="group-data-[collapsible=icon]:hidden">Chat for Styling</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
