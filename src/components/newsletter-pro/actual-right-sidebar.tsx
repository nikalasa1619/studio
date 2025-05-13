
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
} from "./types";
import { Palette, MessageSquarePlus, PanelRightOpen, PanelRightClose, Eye } from "lucide-react"; // Added Eye
import { useRightSidebar } from "@/components/ui/right-sidebar-elements";
import { cn } from "@/lib/utils";


interface ActualRightSidebarProps {
  initialStyles: NewsletterStyles;
  onStylesChange: (newStyles: NewsletterStyles) => void;
  selectedAuthors: Author[];
  selectedFunFacts: FunFactItem[];
  selectedTools: ToolItem[];
  selectedNewsletters: NewsletterItem[];
  selectedPodcasts: PodcastItem[];
  onSetIsStyleChatOpen: (isOpen: boolean) => void;
  projectTopic: string; // Added projectTopic
}

export function ActualRightSidebar({
  initialStyles,
  onStylesChange,
  selectedAuthors,
  selectedFunFacts,
  selectedTools,
  selectedNewsletters,
  selectedPodcasts,
  onSetIsStyleChatOpen,
  projectTopic, // Added projectTopic
}: ActualRightSidebarProps) {
  const { state: rightSidebarState, toggleSidebar: toggleRightSidebar } = useRightSidebar();

  const TriggerIcon = rightSidebarState === 'expanded' ? PanelRightClose : PanelRightOpen;

  const inlineStyles = { // Replicated from NewsletterPreview for consistency
    previewHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    previewHeaderText: {
      fontFamily: initialStyles.headingFont, // Use initialStyles from props
      color: 'hsl(var(--sidebar-foreground))',
      fontSize: '1.1em', // Adjusted size for header
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
        {/* Preview text and icon removed from here, will be part of NewsletterPreview */}
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
                    projectTopic={projectTopic}
                    onStylesChange={onStylesChange} // Pass onStylesChange
                />
            </div>
           )}
           {rightSidebarState === 'collapsed' && (
             <div className="flex items-center justify-center h-full">
                {/* Optionally show a placeholder or icon when collapsed */}
             </div>
           )}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
         <SidebarMenu>
            {/* The StyleCustomizer trigger is now part of NewsletterPreview when expanded */}
            {/* Keeping a button here for collapsed state and alternative access */}
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
