
"use client";

import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import type { ContentType } from "../types";
import { contentTypeToIcon, contentTypeToLabel } from "../utils/workspace-helpers";
import { cn } from '@/lib/utils';

interface ContentDisplayTabsProps {
    activeUITab: ContentType;
    onActiveUITabChange: (tab: ContentType) => void;
    displayableTabs: ContentType[];
}

export function ContentDisplayTabs({
    activeUITab,
    onActiveUITabChange,
    displayableTabs,
}: ContentDisplayTabsProps) {
    
    if (displayableTabs.length === 0) {
        return (
             <div 
                className="px-3 animate-fadeInUp"
                style={{ animationDelay: '100ms' }}
            >
                <p className="text-sm text-muted-foreground p-2">
                    No content generated or saved yet. Enter a topic above and click "Generate" or check your saved items.
                </p>
            </div>
        );
    }

    return (
        <div 
            className="px-3 animate-fadeInUp"
            style={{ animationDelay: '100ms' }}
        >
            <Tabs 
                value={activeUITab} 
                onValueChange={(value) => onActiveUITabChange(value as ContentType)} 
                className="w-full flex flex-col" // Ensure Tabs component expands vertically with content
            >
                <TooltipProvider>
                    <TabsList className={cn(
                        "flex flex-wrap gap-2 sm:gap-3 py-1.5 !bg-transparent !p-0 justify-start"
                    )}>
                        {displayableTabs.map(type => (
                            <Tooltip key={type} delayDuration={300}>
                                <TooltipTrigger asChild>
                                    <TabsTrigger
                                        value={type}
                                        className={cn(
                                            "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 !shadow-none",
                                            "bg-card text-foreground border-border hover:bg-accent/10 gap-1.5 sm:gap-2",
                                            activeUITab === type ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/50"
                                        )}
                                    >
                                        {contentTypeToIcon(type)}
                                        <span className="hidden sm:inline">{contentTypeToLabel(type)}</span>
                                    </TabsTrigger>
                                </TooltipTrigger>
                                <TooltipContent className="sm:hidden">
                                    {contentTypeToLabel(type)}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TabsList>
                </TooltipProvider>
            </Tabs>
        </div>
    );
}

