
"use client";

import React from 'react';
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
}: TopicInputSectionProps) {

    const getSelectAllLabel = () => {
        if (currentTopic !== activeProjectTopic) return "All Types"; // Topic changed, allow selecting all
        const ungeneratedTypes = ALL_CONTENT_TYPES.filter(type => !activeProjectGeneratedContentTypes.includes(type));
        if (ungeneratedTypes.length === 0 && ALL_CONTENT_TYPES.length > 0) return "All Types (Regenerate)";
        return "All New (Ungenerated)";
    }
    
    const isAllUngeneratedSelected = useMemo(() => {
        if (currentTopic !== activeProjectTopic) return isAllContentTypesForGenerationSelected; // If topic changed, rely on standard "all selected"
        const ungenerated = ALL_CONTENT_TYPES.filter(type => !activeProjectGeneratedContentTypes.includes(type));
        if (ungenerated.length === 0 && ALL_CONTENT_TYPES.length > 0) return isAllContentTypesForGenerationSelected; // All generated, check if all are selected for regen
        return ungenerated.every(type => selectedContentTypesForGeneration.includes(type)) && ungenerated.length > 0;
    }, [selectedContentTypesForGeneration, activeProjectGeneratedContentTypes, isAllContentTypesForGenerationSelected, currentTopic, activeProjectTopic]);


    const handleSelectAllChange = (checked: boolean) => {
        if (currentTopic !== activeProjectTopic) { // If topic changed, select/deselect all types
            onSelectAllContentTypesForGeneration(checked);
        } else { // If topic is same, select/deselect only ungenerated types
            const ungenerated = ALL_CONTENT_TYPES.filter(type => !activeProjectGeneratedContentTypes.includes(type));
            if (checked) {
                setSelectedContentTypesForGeneration(prev => {
                    const newSelection = new Set([...prev, ...ungenerated]);
                    return Array.from(newSelection);
                });
            } else {
                 setSelectedContentTypesForGeneration(prev => prev.filter(t => !ungenerated.includes(t)));
            }
        }
    };
    
    // Helper to determine selected dropdown label
    const getDropdownLabel = () => {
        if (selectedContentTypesForGeneration.length === 0) return "Select Content Types";
        if (isAllContentTypesForGenerationSelected) return getSelectAllLabel();
        if (selectedContentTypesForGeneration.length === 1) return contentTypeToLabel(selectedContentTypesForGeneration[0]);
        return `${selectedContentTypesForGeneration.length} Types Selected`;
    };


    return (
        <Card className="p-4 sm:p-6 rounded-lg shadow-xl bg-card/90 backdrop-blur-sm">
            <CardHeader className="p-0 pb-4 mb-4 border-b">
                <CardTitle className="text-xl text-primary">Content Generation</CardTitle>
                <CardDescription>
                    Enter your main topic and select the types of content you want to generate.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                    <Input
                        id="globalTopic"
                        type="text"
                        value={currentTopic}
                        onChange={(e) => onCurrentTopicChange(e.target.value)}
                        placeholder="Enter topic (e.g. AI in marketing, Sustainable Energy)"
                        className="flex-grow text-sm sm:text-base py-2.5"
                        disabled={isGenerating}
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-full sm:w-auto min-w-[180px] sm:min-w-[200px] justify-between py-2.5" disabled={isGenerating}>
                                {getDropdownLabel()}
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-60 sm:w-64 z-50">
                            <DropdownMenuLabel>Select Content Types</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                checked={isAllUngeneratedSelected}
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
                                    disabled={currentTopic === activeProjectTopic && activeProjectGeneratedContentTypes.includes(type)}
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
                        {!currentTopic.trim() && <Alert variant="destructive" className="mt-3"><Info className="h-4 w-4" /><AlertDescription>Please enter a topic to start.</AlertDescription></Alert>}
                        {currentTopic.trim() && selectedContentTypesForGeneration.length === 0 && !(activeProjectGeneratedContentTypes.length > 0 && currentTopic === activeProjectTopic) && <Alert variant="destructive" className="mt-3"><Info className="h-4 w-4" /><AlertDescription>Please select at least one content type to generate.</AlertDescription></Alert>}
                        {currentTopic.trim() && isGenerateButtonDisabled && selectedContentTypesForGeneration.length > 0 && (
                             <Alert variant="default" className="mt-3 bg-muted/50">
                                <Info className="h-4 w-4 text-primary" />
                                <AlertDescription>
                                  {activeProjectGeneratedContentTypes.length === ALL_CONTENT_TYPES.length && currentTopic === activeProjectTopic
                                    ? "All content types have been generated for this project topic."
                                    : (selectedContentTypesForGeneration.every(type => activeProjectGeneratedContentTypes.includes(type)) && currentTopic === activeProjectTopic
                                      ? "All selected content types have already been generated for this topic. Choose different types or start a new project."
                                      : "Ready to generate content!")}
                                </AlertDescription>
                              </Alert>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// Helper to get selected types for the dropdown label more consistently
function setSelectedContentTypesForGeneration(arg0: (prev: ContentType[]) => ContentType[]) {
    throw new Error('Function not implemented.');
}
