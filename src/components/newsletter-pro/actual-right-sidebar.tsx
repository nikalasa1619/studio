
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
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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
import { Palette, MessageSquarePlus, PanelRightOpen, PanelRightClose } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
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
}: ActualRightSidebarProps) {
  const { open: isRightSidebarOpen, toggleSidebar: toggleRightSidebar, isMobile, state: rightSidebarState } = useSidebar();

  return (
    <Sidebar 
      side="right" 
      variant="floating" 
      collapsible="icon" 
      className="border-l"
    >
      <SidebarHeader className="p-2 flex items-center justify-between group-data-[collapsible=icon]:justify-center border-b h-14">
        <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden pl-1">Preview</span>
        <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
      </SidebarHeader>
      <SidebarContent className="p-0">
        <ScrollArea className="h-[calc(100vh-120px)] group-data-[collapsible=icon]:h-[calc(100vh-80px)]">
           <div className="p-3 group-data-[collapsible=icon]:p-1.5">
            <NewsletterPreview
                selectedAuthors={selectedAuthors}
                selectedFunFacts={selectedFunFacts}
                selectedTools={selectedTools}
                selectedAggregatedContent={selectedNewsletters}
                selectedPodcasts={selectedPodcasts}
                styles={initialStyles}
            />
           </div>
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
