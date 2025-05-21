
"use client";

import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Label } from "@/components/ui/label"; 
import { NewsletterPreview } from "./newsletter-preview";
import type {
  Author,
  FunFactItem,
  ToolItem,
  NewsletterItem,
  PodcastItem,
  NewsletterStyles,
  PersonalizationSettings,
} from "./types";
import { Eye, MessageSquarePlus, Send, Loader2 } from "lucide-react"; // Edit2 removed
import { cn } from "@/lib/utils";
import { useRightSidebar } from "@/components/ui/right-sidebar-elements";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/right-sidebar-elements";

interface ActualRightSidebarProps {
  initialStyles: NewsletterStyles;
  personalizationSettings: PersonalizationSettings;
  selectedAuthors: Author[];
  selectedFunFacts: FunFactItem[];
  selectedTools: ToolItem[];
  selectedNewsletters: NewsletterItem[];
  selectedPodcasts: PodcastItem[];
  projectTopic: string;
  onStyleChatSubmit: (description: string, setIsLoading: (loading: boolean) => void) => Promise<void>; 
  isLoadingStyleChatGlobal: boolean; 
  // onSetIsPersonalizeDialogOpen: (isOpen: boolean) => void; // Prop removed
}

export function ActualRightSidebar({
  initialStyles,
  personalizationSettings,
  selectedAuthors,
  selectedFunFacts,
  selectedTools,
  selectedNewsletters,
  selectedPodcasts,
  projectTopic,
  onStyleChatSubmit,
  isLoadingStyleChatGlobal,
  // onSetIsPersonalizeDialogOpen, // Prop removed
}: ActualRightSidebarProps) {
  
  const [styleChatInputValue, setStyleChatInputValue] = useState("");
  const [isSubmittingStyleChat, setIsSubmittingStyleChat] = useState(false);
  const { state: rightSidebarState, isMobile } = useRightSidebar();

  const handleInlineStyleChatSubmit = async () => {
    if (!styleChatInputValue.trim()) return;
    await onStyleChatSubmit(styleChatInputValue, setIsSubmittingStyleChat);
    // Optionally clear input after submit: setStyleChatInputValue("");
  };

  const inlineStyles = {
    previewHeader: {
      fontFamily: initialStyles.headingFont,
      color: 'hsl(var(--card-foreground))', 
      fontSize: '1.1em',
      fontWeight: '600' as '600',
    },
    previewHeaderIcon: {
      color: 'hsl(var(--card-foreground))',
    },
  };

  return (
    <Sidebar 
      side="right" 
      variant="floating" 
      collapsible="icon" 
      className="border-l"
    >
      <SidebarHeader className="p-3 flex items-center justify-between border-b h-14 shrink-0">
        <div className={cn(
            "flex items-center gap-2",
            (rightSidebarState === 'collapsed' && !isMobile) && "group-data-[collapsible=icon]:hidden"
          )}
        >
          <Eye size={20} style={inlineStyles.previewHeaderIcon} />
          <span style={inlineStyles.previewHeaderText} className="text-foreground">
            Preview
          </span>
        </div>
        <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0"/>
      </SidebarHeader>
      <SidebarContent className={cn((rightSidebarState === 'collapsed' && !isMobile) && "group-data-[collapsible=icon]:hidden")}>
        <ScrollArea className="flex-grow p-3">
          <NewsletterPreview
              selectedAuthors={selectedAuthors}
              selectedFunFacts={selectedFunFacts}
              selectedTools={selectedTools}
              selectedAggregatedContent={selectedNewsletters}
              selectedPodcasts={selectedPodcasts}
              styles={initialStyles}
              personalizationSettings={personalizationSettings}
              projectTopic={projectTopic}
          />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className={cn(
          "p-3 border-t mt-auto shrink-0 space-y-3",
          (rightSidebarState === 'collapsed' && !isMobile) && "group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:space-y-0" 
        )}
      >
          <div className={cn("space-y-2", (rightSidebarState === 'collapsed' && !isMobile) && "group-data-[collapsible=icon]:hidden")}>
            <Label htmlFor="style-chat-input" className={cn("text-sm font-medium text-foreground/90 flex items-center")}>
              <MessageSquarePlus size={16} className="mr-2 text-primary"/>
              Describe Desired Styles
            </Label>
            <div className={cn("flex items-center gap-2")}>
              <Input
                id="style-chat-input"
                placeholder="e.g., Modern look, teal accents..."
                value={styleChatInputValue}
                onChange={(e) => setStyleChatInputValue(e.target.value)}
                className="flex-grow text-sm"
                disabled={isLoadingStyleChatGlobal || isSubmittingStyleChat}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoadingStyleChatGlobal && !isSubmittingStyleChat && styleChatInputValue.trim()) {
                    handleInlineStyleChatSubmit();
                  }
                }}
              />
              <Button
                onClick={handleInlineStyleChatSubmit}
                disabled={isLoadingStyleChatGlobal || isSubmittingStyleChat || !styleChatInputValue.trim()}
                size="icon"
                aria-label="Generate Styles with AI"
              >
                {isLoadingStyleChatGlobal || isSubmittingStyleChat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
              </Button>
            </div>
          </div>
          {/* Personalize Text Button Removed from here */}
      </SidebarFooter>
    </Sidebar>
  );
}
