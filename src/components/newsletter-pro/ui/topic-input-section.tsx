
"use client";

import React, { useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ChevronDown, Info } from "lucide-react";
import type { ContentType } from "../types";
import { ALL_CONTENT_TYPES } from "../types";
import { contentTypeToLabel } from "../utils/workspace-helpers";
import { cn } from '@/lib/utils';
import { SpeechToTextButton } from './speech-to-text-button';


interface TopicInputSectionProps {
    currentTopic: string;
    onCurrentTopicChange: (topic: string) => void;
    selectedContentTypesForGeneration: ContentType[];
    onToggleContentTypeForGeneration: (type: ContentType) => void;
    onSelectAllContentTypesForGeneration: (checked: boolean) => void;
    isAllContentTypesForGenerationSelected: boolean;
    onGenerateContent: () => void;
    isGenerating: boolean;
    isGenerateButtonDisabled: boolean;
    activeProjectGeneratedContentTypes: ContentType[];
    activeProjectTopic: string;
    isTopicLocked: boolean;
    setSelectedContentTypesForGeneration?: (value: ContentType[] | ((prevState: ContentType[]) => ContentType[])) => void;
    generationProgress: number;
    currentGenerationMessage: string;
    showTopicErrorAnimation: boolean;
}

export function TopicInputSection({
    currentTopic,
    onCurrentTopicChange,
    selectedContentTypesForGeneration,
    onToggleContentTypeForGeneration,
    onSelectAllContentTypesForGeneration,
    isAllContentTypesForGenerationSelected,
    onGenerateContent,
    isGenerating,
    isGenerateButtonDisabled,
    activeProjectGeneratedContentTypes,
    activeProjectTopic,
    isTopicLocked,
    setSelectedContentTypesForGeneration,
    generationProgress,
    currentGenerationMessage,
    showTopicErrorAnimation,
}: TopicInputSectionProps) {

    const getSelectAllLabel = () => {
        if (currentTopic !== activeProjectTopic || !isTopicLocked) return "All Types"; 
        
        const ungeneratedTypes = ALL_CONTENT_TYPES.filter(type => !activeProjectGeneratedContentTypes.includes(type));
        if (ungeneratedTypes.length === 0 && ALL_CONTENT_TYPES.length > 0) return "All Types (Regenerate)";
        return "All New (Ungenerated)";
    }
    
    const isAllUngeneratedOrAllForRegenSelected = useMemo(() => {
        if (currentTopic !== activeProjectTopic && !isTopicLocked) {
            return selectedContentTypesForGeneration.length === ALL_CONTENT_TYPES.length;
        }
        
        const ungenerated = ALL_CONTENT_TYPES.filter(type => !activeProjectGeneratedContentTypes.includes(type));
        if (ungenerated.length === 0 && ALL_CONTENT_TYPES.length > 0) {
            return selectedContentTypesForGeneration.length === ALL_CONTENT_TYPES.length;
        }
        return ungenerated.every(type => selectedContentTypesForGeneration.includes(type)) && ungenerated.length > 0;
    }, [selectedContentTypesForGeneration, activeProjectGeneratedContentTypes, currentTopic, activeProjectTopic, isTopicLocked, ALL_CONTENT_TYPES]);


    const handleSelectAllChange = (checked: boolean) => {
        if (setSelectedContentTypesForGeneration) {
            if (currentTopic !== activeProjectTopic && !isTopicLocked) {
                setSelectedContentTypesForGeneration(checked ? ALL_CONTENT_TYPES : []);
            } else {
                const ungenerated = ALL_CONTENT_TYPES.filter(type => !activeProjectGeneratedContentTypes.includes(type));
                if (ungenerated.length === 0 && ALL_CONTENT_TYPES.length > 0) { 
                     setSelectedContentTypesForGeneration(checked ? ALL_CONTENT_TYPES : []);
                } else { 
                    if (checked) {
                        setSelectedContentTypesForGeneration(prev => Array.from(new Set([...prev, ...ungenerated])));
                    } else {
                        setSelectedContentTypesForGeneration(prev => prev.filter(t => !ungenerated.includes(t)));
                    }
                }
            }
        }
    };
    
    const getDropdownLabel = () => {
        if (selectedContentTypesForGeneration.length === 0) return "Select Content Types";
        if (isAllContentTypesForGenerationSelected && selectedContentTypesForGeneration.length === ALL_CONTENT_TYPES.length) return getSelectAllLabel();
        if (selectedContentTypesForGeneration.length === 1) return contentTypeToLabel(selectedContentTypesForGeneration[0]);
        return `${selectedContentTypesForGeneration.length} Types Selected`;
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
          event.preventDefault(); // Prevent default form submission if any
          if (!isGenerateButtonDisabled) { // Check if the button would be enabled
            onGenerateContent();
          }
        }
    };


    return (
        <Card className={cn("p-4 sm:p-6 rounded-lg shadow-xl bg-card/80 backdrop-blur-sm border border-border/50 animate-fadeInUp", "glassmorphic-panel")}>
            <CardHeader className="p-0 pb-4 mb-4 border-b border-foreground/10">
                <CardTitle className="text-xl text-foreground">Content Generation</CardTitle>
                <CardDescription className="text-foreground/70">
                    Enter your main topic and select the types of content you want to generate.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <div className="flex-grow w-full">
                      <div className="flex items-center gap-2">
                        <Input
                            id="globalTopic"
                            type="text"
                            value={currentTopic}
                            onChange={(e) => onCurrentTopicChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter topic (e.g. AI in marketing, Sustainable Energy)"
                            className={cn(
                                "flex-grow text-sm sm:text-base py-2.5 bg-background/70 border-input placeholder:text-muted-foreground text-foreground",
                                showTopicErrorAnimation && "animate-border-flash-error"
                            )}
                            disabled={isGenerating || isTopicLocked} 
                        />
                        <SpeechToTextButton 
                            onTranscript={(transcript) => onCurrentTopicChange(transcript)}
                            disabled={isGenerating || isTopicLocked}
                        />
                      </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto min-w-[180px] sm:min-w-[200px] justify-between py-2.5 bg-background/70 border-input hover:bg-accent/20 text-foreground" disabled={isGenerating}>
                                {getDropdownLabel()}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-60 sm:w-64 z-50 bg-popover/90 backdrop-blur-sm border-popover-border text-popover-foreground">
                            <DropdownMenuLabel>Select Content Types</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border/50"/>
                            <DropdownMenuCheckboxItem
                                checked={isAllUngeneratedOrAllForRegenSelected}
                                onCheckedChange={handleSelectAllChange}
                                onSelect={(e) => e.preventDefault()}
                            >
                                {getSelectAllLabel()}
                            </DropdownMenuCheckboxItem>
                            {ALL_CONTENT_TYPES.map(type => (
                                <DropdownMenuCheckboxItem
                                    key={type}
                                    checked={selectedContentTypesForGeneration.includes(type)}
                                    onCheckedChange={() => onToggleContentTypeForGeneration(type)}
                                    disabled={isTopicLocked && activeProjectGeneratedContentTypes.includes(type)}
                                    onSelect={(e) => e.preventDefault()}
                                >
                                    {contentTypeToLabel(type)}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        onClick={onGenerateContent}
                        disabled={isGenerateButtonDisabled}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground py-2.5"
                    >
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate
                    </Button>
                </div>

                {!isGenerating && (
                    <>
                      {/* Removed the explicit "Topic is required" message. Button disable logic handles this. */}
                      {currentTopic.trim() && selectedContentTypesForGeneration.length === 0 && !(activeProjectGeneratedContentTypes.length > 0 && currentTopic === activeProjectTopic) && (
                        <Alert variant="destructive" className="mt-3 bg-destructive/80 text-destructive-foreground border-destructive-foreground/50">
                            <Info className="h-4 w-4" />
                            <AlertDescription>Please select at least one content type to generate.</AlertDescription>
                        </Alert>
                      )}
                      {currentTopic.trim() && isGenerateButtonDisabled && selectedContentTypesForGeneration.length > 0 && (
                           <Alert variant="default" className="mt-3 bg-muted/50 backdrop-blur-sm text-muted-foreground border-border/30">
                              <Info className="h-4 w-4 text-primary" />
                              <AlertDescription>
                                {isTopicLocked && activeProjectGeneratedContentTypes.length === ALL_CONTENT_TYPES.length
                                  ? "All content types have been generated for this project topic."
                                  : (isTopicLocked && selectedContentTypesForGeneration.every(type => activeProjectGeneratedContentTypes.includes(type)))
                                    ? "All selected content types have already been generated for this topic. To regenerate, change the topic or create a new project."
                                    : "Ready to generate content!"}
                              </AlertDescription>
                            </Alert>
                      )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

