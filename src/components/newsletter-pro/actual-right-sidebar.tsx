
"use client";

import React from "react";
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
  PersonalizationSettings,
} from "./types";
import { Palette, MessageSquarePlus, Eye } from "lucide-react";
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
  onSetIsStyleChatOpen: (isOpen: boolean) => void;
  projectTopic: string;
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
  onSetIsStyleChatOpen,
  projectTopic,
}: ActualRightSidebarProps) {
  
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
      // Removed data-sidebar="sidebar" to avoid confusion with collapsible sidebars
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
      <div className="p-3 border-t mt-auto shrink-0 space-y-2">
          <StyleCustomizer initialStyles={initialStyles} onStylesChange={onStylesChange}>
              <Button
                  variant="outline"
                  className="w-full justify-start text-base py-2.5 h-auto hover:bg-accent/10 hover:border-primary/50"
                  size="default"
              >
                  <Palette size={16} className="mr-2"/>
                  <span>Customize Styles</span>
              </Button>
          </StyleCustomizer>
          <Button
              onClick={() => onSetIsStyleChatOpen(true)}
              variant="outline"
              className="w-full justify-start text-base py-2.5 h-auto hover:bg-accent/10 hover:border-primary/50"
              size="default"
          >
              <MessageSquarePlus size={16} className="mr-2"/>
              <span>Chat for Styling</span>
          </Button>
      </div>
    </div>
  );
}
