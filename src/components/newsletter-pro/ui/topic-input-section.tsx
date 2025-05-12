
"use client";

import React, { useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ChevronDown, Info } from "lucide-react";
import { GenerationProgressIndicator } from "../generation-progress-indicator";
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
    generationProgress: number;
    currentGenerationMessage: string;
    activeProjectGeneratedContentTypes: ContentType[];
    activeProjectTopic: string;
    isTopicLocked: boolean;
    setSelectedContentTypesForGeneration?: (value: ContentType[] | ((prevState: ContentType[]) => ContentType[])) => void;
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
    generationProgress,
    currentGenerationMessage,
    activeProjectGeneratedContentTypes,
    activeProjectTopic,
    isTopicLocked,
    setSelectedContentTypesForGeneration,
}: TopicInputSectionProps) {

    const getSelectAllLabel = () => {
        // If topic changed or topic is not locked (meaning no generation yet for this topic or it's a new project)
        if (currentTopic !== activeProjectTopic || !isTopicLocked) return "All Types"; 
        
        // If topic is the same and locked
        const ungeneratedTypes = ALL_CONTENT_TYPES.filter(type => !activeProjectGeneratedContentTypes.includes(type));
        if (ungeneratedTypes.length === 0 && ALL_CONTENT_TYPES.length > 0) return "All Types (Regenerate)"; // All are generated
        return "All New (Ungenerated)"; // Some are generated, some not
    }
    
    const isAllUngeneratedOrAllForRegenSelected = useMemo(() => {
        if (currentTopic !== activeProjectTopic && !isTopicLocked) {
            // Topic has changed or not locked: "All Types" refers to all content types
            return selectedContentTypesForGeneration.length === ALL_CONTENT_TYPES.length;
        }
        
        // Topic is the same and locked
        const ungenerated = ALL_CONTENT_TYPES.filter(type => !activeProjectGeneratedContentTypes.includes(type));
        if (ungenerated.length === 0 && ALL_CONTENT_TYPES.length > 0) {
            // All types have been generated, "All Types (Regenerate)" refers to all types
            return selectedContentTypesForGeneration.length === ALL_CONTENT_TYPES.length;
        }
        // Some types are ungenerated, "All New (Ungenerated)" refers to just those
        return ungenerated.every(type => selectedContentTypesForGeneration.includes(type)) && ungenerated.length > 0;
    }, [selectedContentTypesForGeneration, activeProjectGeneratedContentTypes, currentTopic, activeProjectTopic, isTopicLocked]);


    const handleSelectAllChange = (checked: boolean) => {
        if (setSelectedContentTypesForGeneration) {
            if (currentTopic !== activeProjectTopic && !isTopicLocked) {
                // Behavior for "All Types" when topic is new/changed
                setSelectedContentTypesForGeneration(checked ? ALL_CONTENT_TYPES : []);
            } else {
                // Behavior for "All Types (Regenerate)" or "All New (Ungenerated)"
                const ungenerated = ALL_CONTENT_TYPES.filter(type => !activeProjectGeneratedContentTypes.includes(type));
                if (ungenerated.length === 0 && ALL_CONTENT_TYPES.length > 0) { // All are generated, so it's "All Types (Regenerate)"
                     setSelectedContentTypesForGeneration(checked ? ALL_CONTENT_TYPES : []);
                } else { // Some are ungenerated, so it's "All New (Ungenerated)"
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


    return (
        <Card className={cn("p-4 sm:p-6 rounded-lg shadow-xl glassmorphic-panel")}>
            <CardHeader className="p-0 pb-4 mb-4 border-b border-white/20">
                <CardTitle className="text-xl text-foreground">Content Generation</CardTitle>
                <CardDescription className="text-foreground/80">
                    Enter your main topic and select the types of content you want to generate.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <div className="flex-grow flex items-center gap-2 w-full sm:w-auto">
                        <Input
                            id="globalTopic"
                            type="text"
                            value={currentTopic}
                            onChange={(e) => onCurrentTopicChange(e.target.value)}
                            placeholder="Enter topic (e.g. AI in marketing, Sustainable Energy)"
                            className="flex-grow text-sm sm:text-base py-2.5 bg-background/70 border-white/30 placeholder:text-foreground/60 text-foreground"
                            disabled={isGenerating || isTopicLocked} 
                        />
                        <SpeechToTextButton 
                            onTranscript={(transcript) => onCurrentTopicChange(transcript)}
                            disabled={isGenerating || isTopicLocked}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto min-w-[180px] sm:min-w-[200px] justify-between py-2.5 bg-background/70 border-white/30 hover:bg-accent/20 text-foreground" disabled={isGenerating}>
                                {getDropdownLabel()}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-60 sm:w-64 z-50 bg-popover/90 backdrop-blur-sm border-white/20 text-popover-foreground">
                            <DropdownMenuLabel>Select Content Types</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-white/20"/>
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
                                    // Disable if topic is locked AND this type is already generated
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
                <GenerationProgressIndicator
                    isVisible={isGenerating}
                    progress={generationProgress}
                    message={currentGenerationMessage}
                />
                {!isGenerating && (
                    <>
                        {!currentTopic.trim() && <Alert variant="destructive" className="mt-3 bg-destructive/80 text-destructive-foreground border-destructive-foreground/50"><Info className="h-4 w-4" /><AlertDescription>Please enter a topic to start.</AlertDescription></Alert>}
                        {currentTopic.trim() && selectedContentTypesForGeneration.length === 0 && !(activeProjectGeneratedContentTypes.length > 0 && currentTopic === activeProjectTopic) && <Alert variant="destructive" className="mt-3 bg-destructive/80 text-destructive-foreground border-destructive-foreground/50"><Info className="h-4 w-4" /><AlertDescription>Please select at least one content type to generate.</AlertDescription></Alert>}
                        {currentTopic.trim() && isGenerateButtonDisabled && selectedContentTypesForGeneration.length > 0 && (
                             <Alert variant="default" className="mt-3 bg-muted/80 backdrop-blur-sm text-muted-foreground border-border/50">
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
