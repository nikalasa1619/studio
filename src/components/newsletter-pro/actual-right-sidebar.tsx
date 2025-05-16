
"use client";

import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Added Input
import { Label } from "@/components/ui/label"; // Added Label
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
import { Eye, MessageSquarePlus, Palette, Sparkles, Send, Loader2 } from "lucide-react"; // Added Send and Loader2
import { cn } from "@/lib/utils";

interface ActualRightSidebarProps {
  initialStyles: NewsletterStyles;
  onStylesChange: (newStyles: NewsletterStyles) => void;
  personalizationSettings: PersonalizationSettings;
  onPersonalizationChange: (settings: PersonalizationSettings) => void;
  selectedAuthors: Author[];
  selectedFunFacts: FunFactItem[];
  selectedTools: ToolItem[];
  selectedNewsletters: NewsletterItem[];
  selectedPodcasts: PodcastItem[];
  projectTopic: string;
  onStyleChatSubmit: (description: string, setIsLoading: (loading: boolean) => void) => Promise<void>; // Updated prop
  isLoadingStyleChatGlobal: boolean; // Renamed to avoid conflict if local loading is also used
}

export function ActualRightSidebar({
  initialStyles,
  onStylesChange,
  personalizationSettings,
  onPersonalizationChange,
  selectedAuthors,
  selectedFunFacts,
  selectedTools,
  selectedNewsletters,
  selectedPodcasts,
  projectTopic,
  onStyleChatSubmit,
  isLoadingStyleChatGlobal,
}: ActualRightSidebarProps) {
  
  const [styleChatInputValue, setStyleChatInputValue] = useState("");
  const [isSubmittingStyleChat, setIsSubmittingStyleChat] = useState(false);

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
    <div className={cn(
        "h-full flex flex-col border-l bg-card text-card-foreground p-0 md:p-0",
        "glassmorphic-panel" 
      )}
    >
      <div className="p-3 flex items-center justify-between border-b h-14 shrink-0">
        <div className="flex items-center gap-2">
          <Eye size={20} style={inlineStyles.previewHeaderIcon} />
          <span style={inlineStyles.previewHeaderText}>
            Preview
          </span>
        </div>
      </div>
      <ScrollArea className="flex-grow p-3">
        <NewsletterPreview
            selectedAuthors={selectedAuthors}
            selectedFunFacts={selectedFunFacts}
            selectedTools={selectedTools}
            selectedAggregatedContent={selectedNewsletters}
            selectedPodcasts={selectedPodcasts}
            styles={initialStyles}
            personalizationSettings={personalizationSettings}
            onPersonalizationChange={onPersonalizationChange}
            projectTopic={projectTopic}
            onStylesChange={onStylesChange} 
        />
      </ScrollArea>
      <div className="p-3 border-t mt-auto shrink-0 space-y-3">
          {/* Removed StyleCustomizer and original Chat for Styling button */}
          <div className="space-y-2">
            <Label htmlFor="style-chat-input" className="text-sm font-medium text-foreground/90 flex items-center">
              <MessageSquarePlus size={16} className="mr-2 text-primary"/>
              Describe Desired Styles
            </Label>
            <div className="flex items-center gap-2">
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
      </div>
    </div>
  );
}
