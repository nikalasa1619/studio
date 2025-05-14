
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Project, ContentType, Author, FunFactItem, ToolItem, NewsletterItem, PodcastItem } from "../types";
import {
  getAuthorsAndQuotesAction,
  generateFunFactsAction,
  recommendToolsAction,
  fetchNewslettersAction,
  fetchPodcastsAction,
} from "@/actions/newsletter-actions";
import type {
  FetchAuthorsAndQuotesOutput,
} from "@/ai/flows/fetch-authors-and-quotes";
import type {
  GenerateFunFactsOutput,
} from "@/ai/flows/generate-fun-facts";
import type {
  RecommendProductivityToolsOutput,
} from "@/ai/flows/recommend-productivity-tools";
import type {
  FetchNewslettersOutput,
} from "@/ai/flows/fetch-newsletters";
import type {
  FetchPodcastsOutput,
} from "@/ai/flows/fetch-podcasts";
import { ALL_CONTENT_TYPES } from "../types";
import type { ToastSignature } from "@/hooks/use-toast";


export function useContentGeneration(
    activeProject: Project | null,
    updateProjectData: <K extends keyof Project>(projectId: string, key: K, data: Project[K]) => void,
    handleRenameProject: (projectId: string, newName: string) => void,
    toast: ToastSignature,
) {
  const [actualCurrentTopic, setActualCurrentTopic] = useState<string>(activeProject?.topic || "");
  const [selectedContentTypesForGeneration, setSelectedContentTypesForGeneration] = useState<ContentType[]>(ALL_CONTENT_TYPES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGenerationMessage, setCurrentGenerationMessage] = useState("");
  const [isStyleChatLoading, setIsStyleChatLoading] = useState(false); 
  const [showTopicErrorAnimation, setShowTopicErrorAnimation] = useState(false);

  const setCurrentTopic = (topic: string) => {
    setActualCurrentTopic(topic);
    if (showTopicErrorAnimation && topic.trim() !== "") { 
        setShowTopicErrorAnimation(false);
    }
  };


  const handleAuthorsData = useCallback((data: FetchAuthorsAndQuotesOutput) => {
    if (!activeProject?.id) return;
    const amazonBaseUrl = "https://www.amazon.com/s";
    const amazonTrackingTag = "growthshuttle-20";
    const newAuthorItems: Author[] = data.authors.flatMap(fetchedAuthorEntry =>
      fetchedAuthorEntry.quotes.map((quoteObj, quoteIndex) => ({
        id: `author-${fetchedAuthorEntry.name.replace(/\s+/g, '-')}-quote-${quoteIndex}-${Date.now()}`,
        name: fetchedAuthorEntry.name,
        titleOrKnownFor: fetchedAuthorEntry.titleOrKnownFor,
        quote: quoteObj.quote.replace(/^"+|"+$/g, ''), // Ensure single quotes
        relevanceScore: quoteObj.relevanceScore,
        quoteSource: fetchedAuthorEntry.source,
        imported: false,
        saved: false,
        amazonLink: `${amazonBaseUrl}?k=${encodeURIComponent(fetchedAuthorEntry.source)}&tag=${amazonTrackingTag}`,
        authorNameKey: fetchedAuthorEntry.name,
      }))
    );
    updateProjectData(activeProject.id, 'authors', newAuthorItems);
  }, [activeProject, updateProjectData]);

  const handleFunFactsData = useCallback((data: GenerateFunFactsOutput) => {
    if (!activeProject?.id) return;
    const newFunFacts: FunFactItem[] = [
      ...data.funFacts.map((fact, index) => ({ id: `fun-${index}-${Date.now()}`, text: fact.text, type: "fun" as const, selected: false, relevanceScore: fact.relevanceScore, sourceLink: fact.sourceLink, saved: false })),
      ...data.scienceFacts.map((fact, index) => ({ id: `science-${index}-${Date.now()}`, text: fact.text, type: "science" as const, selected: false, relevanceScore: fact.relevanceScore, sourceLink: fact.sourceLink, saved: false }))
    ];
    updateProjectData(activeProject.id, 'funFacts', newFunFacts);
  }, [activeProject, updateProjectData]);

  const handleToolsData = useCallback((data: RecommendProductivityToolsOutput) => {
    if (!activeProject?.id) return;
    const newTools: ToolItem[] = [
      ...data.freeTools.map((tool, index) => ({ id: `free-tool-${index}-${Date.now()}`, name: tool.name, type: "free" as const, selected: false, relevanceScore: tool.relevanceScore, freeTrialPeriod: tool.freeTrialPeriod, saved: false })),
      ...data.paidTools.map((tool, index) => ({ id: `paid-tool-${index}-${Date.now()}`, name: tool.name, type: "paid" as const, selected: false, relevanceScore: tool.relevanceScore, freeTrialPeriod: tool.freeTrialPeriod, saved: false }))
    ];
    updateProjectData(activeProject.id, 'tools', newTools);
  }, [activeProject, updateProjectData]);

  const handleNewslettersData = useCallback((data: FetchNewslettersOutput) => {
    if (!activeProject?.id) return;
    const newNewsletters: NewsletterItem[] = data.newsletters.map((nl, index) => ({
      ...nl, id: `newsletter-${index}-${Date.now()}`, selected: false, saved: false,
      frequency: nl.frequency, coveredTopics: nl.coveredTopics,
    }));
    updateProjectData(activeProject.id, 'newsletters', newNewsletters);
  }, [activeProject, updateProjectData]);

  const handlePodcastsData = useCallback((data: FetchPodcastsOutput) => {
    if (!activeProject?.id) return;
    const newPodcasts: PodcastItem[] = data.podcasts.map((podcast, index) => ({
      ...podcast, id: `podcast-${index}-${Date.now()}`, selected: false, saved: false,
      frequency: podcast.frequency, topics: podcast.topics,
    }));
    updateProjectData(activeProject.id, 'podcasts', newPodcasts);
  }, [activeProject, updateProjectData]);


 const handleGenerateContent = useCallback(async () => {
    if (!actualCurrentTopic.trim()) {
        setShowTopicErrorAnimation(true);
        setTimeout(() => setShowTopicErrorAnimation(false), 600); // Duration of border-flash animation
        toast({ title: "Missing Topic", description: "Please enter a topic to generate content.", variant: "destructive" });
        return;
    }
    if (selectedContentTypesForGeneration.length === 0 || !activeProject || !activeProject.id) {
      toast({ title: "Missing Information", description: "Please select content types to generate.", variant: "destructive" });
      return;
    }

    const typesToActuallyGenerate = selectedContentTypesForGeneration.filter(
      type => !activeProject.generatedContentTypes.includes(type)
    );

    if (typesToActuallyGenerate.length === 0 && actualCurrentTopic === activeProject.topic) {
        toast({ title: "Content Already Generated", description: "All selected content types have already been generated for this topic. Choose different types or start a new project.", variant: "default" });
        return;
    }
    
    const finalTypesToGenerate = actualCurrentTopic !== activeProject.topic ? selectedContentTypesForGeneration : typesToActuallyGenerate;

    if (finalTypesToGenerate.length === 0) {
        toast({ title: "No New Content to Generate", description: "All selected types are already generated for the current topic.", variant: "default" });
        return;
    }

    setIsGenerating(true);
    updateProjectData(activeProject.id, 'topic', actualCurrentTopic);

    if (activeProject.name.startsWith("Untitled Project") && actualCurrentTopic.trim()) {
        handleRenameProject(activeProject.id, actualCurrentTopic);
    }

    const totalSteps = finalTypesToGenerate.length * 3; 
    let completedSteps = 0;
    let hasErrors = false;

    setGenerationProgress(0);
    setCurrentGenerationMessage("Initializing content generation...");
    
    const initialGeneratedTypesForThisRun = [...(activeProject.generatedContentTypes || [])];
    let accumulatedSuccessfullyGeneratedTypesThisRun = [...initialGeneratedTypesForThisRun];


    finalTypesToGenerate.forEach(type => {
        switch(type) {
            case 'authors': updateProjectData(activeProject.id, 'authors', []); break;
            case 'facts': updateProjectData(activeProject.id, 'funFacts', []); break;
            case 'tools': updateProjectData(activeProject.id, 'tools', []); break;
            case 'newsletters': updateProjectData(activeProject.id, 'newsletters', []); break;
            case 'podcasts': updateProjectData(activeProject.id, 'podcasts', []); break;
        }
    });

    const updateProgress = (message: string, incrementStep: boolean = true) => {
      setCurrentGenerationMessage(message);
      if (incrementStep) {
        completedSteps++;
      }
      setGenerationProgress(totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 100);
    };

    const actionsMap: Record<ContentType, { task: () => Promise<any>, handler: (data: any) => void, name: string }> = {
      authors: { task: () => getAuthorsAndQuotesAction({ topic: actualCurrentTopic }), handler: handleAuthorsData, name: "Authors & Quotes" },
      facts: { task: () => generateFunFactsAction({ topic: actualCurrentTopic }), handler: handleFunFactsData, name: "Fun Facts" },
      tools: { task: () => recommendToolsAction({ topic: actualCurrentTopic }), handler: handleToolsData, name: "Productivity Tools" },
      newsletters: { task: () => fetchNewslettersAction({ topic: actualCurrentTopic }), handler: handleNewslettersData, name: "Newsletters" },
      podcasts: { task: () => fetchPodcastsAction({ topic: actualCurrentTopic }), handler: handlePodcastsData, name: "Podcasts" },
    };

    for (const contentType of finalTypesToGenerate) {
        const action = actionsMap[contentType];
        if (!action) continue;

        updateProgress(`Fetching ${action.name}...`, true); 
        try {
            const data = await action.task();
            updateProgress(`Validating ${action.name} data...`, true); 
            action.handler(data);
            updateProgress(`${action.name} processed successfully!`, true); 
            if (!accumulatedSuccessfullyGeneratedTypesThisRun.includes(contentType)) {
                accumulatedSuccessfullyGeneratedTypesThisRun.push(contentType);
            }
        } catch (err: any) {
            const errorMessage = err.message || "An unknown error occurred";
            console.error(`${contentType} Generation Failed:`, errorMessage, err); 
            toast({ title: `${action.name} Generation Failed`, description: `Details: ${errorMessage}`, variant: "destructive"});
            hasErrors = true;
            completedSteps += (3 - (completedSteps % 3 === 0 ? 3 : completedSteps % 3)); 
            updateProgress(`${action.name} generation failed.`, false); 
        }
    }
    
    if (activeProject?.id) {
        const finalGeneratedTypes = Array.from(new Set(accumulatedSuccessfullyGeneratedTypesThisRun)).sort();
        const currentProjectGeneratedTypes = (activeProject.generatedContentTypes || []).sort();
        
        if (JSON.stringify(finalGeneratedTypes) !== JSON.stringify(currentProjectGeneratedTypes)) {
            updateProjectData(activeProject.id, 'generatedContentTypes', finalGeneratedTypes);
        }
    }


    if (!hasErrors && totalSteps > 0 && finalTypesToGenerate.length > 0) {
      updateProgress("All content generated successfully!", false);
      toast({ title: "Content Generation Complete!", description: "All selected content has been fetched."});
    } else if (totalSteps > 0 && finalTypesToGenerate.length > 0) {
      updateProgress("Generation complete with some errors.", false);
       toast({ title: "Generation Finished with Errors", description: "Some content generation tasks failed. Please check individual error messages.", variant: "default" }); 
    } else {
      updateProgress("No new content types selected for generation.", false);
    }

    setGenerationProgress(100); 

    setTimeout(() => {
      setIsGenerating(false);
      setCurrentGenerationMessage(""); 
    }, 3000); 
  }, [
    actualCurrentTopic, 
    selectedContentTypesForGeneration, 
    activeProject, 
    updateProjectData, 
    handleRenameProject, 
    toast,
    handleAuthorsData,
    handleFunFactsData,
    handleToolsData,
    handleNewslettersData,
    handlePodcastsData
  ]);


  const toggleContentTypeForGeneration = (contentType: ContentType) => {
    setSelectedContentTypesForGeneration(prev =>
      prev.includes(contentType)
        ? prev.filter(item => item !== contentType)
        : [...prev, contentType]
    );
  };

  const handleSelectAllContentTypesForGeneration = (checked: boolean) => {
    if (checked) {
      setSelectedContentTypesForGeneration(ALL_CONTENT_TYPES);
    } else {
      setSelectedContentTypesForGeneration([]);
    }
  };

  const isAllContentTypesForGenerationSelected = useMemo(() => {
    if (!activeProject) return ALL_CONTENT_TYPES.every(type => selectedContentTypesForGeneration.includes(type));
    if (actualCurrentTopic !== activeProject.topic) return ALL_CONTENT_TYPES.every(type => selectedContentTypesForGeneration.includes(type));
    
    const ungeneratedTypes = ALL_CONTENT_TYPES.filter(type => !activeProject.generatedContentTypes.includes(type));
    if (ungeneratedTypes.length === 0 && ALL_CONTENT_TYPES.length > 0) return selectedContentTypesForGeneration.length === ALL_CONTENT_TYPES.length; 
    return ungeneratedTypes.every(type => selectedContentTypesForGeneration.includes(type)) && ungeneratedTypes.length > 0;
  }, [selectedContentTypesForGeneration, activeProject, actualCurrentTopic]);

  const isGenerateButtonDisabled = useMemo(() => {
    if (isGenerating || selectedContentTypesForGeneration.length === 0) {
        return true;
    }
    if (activeProject && actualCurrentTopic === activeProject.topic &&
        selectedContentTypesForGeneration.every(type => activeProject.generatedContentTypes.includes(type))) {
        return true; // All selected types already generated for the *current unchanged* topic
    }
    return false;
  }, [isGenerating, actualCurrentTopic, selectedContentTypesForGeneration, activeProject]);


  return {
    currentTopic: actualCurrentTopic,
    setCurrentTopic,
    selectedContentTypesForGeneration,
    setSelectedContentTypesForGeneration,
    isGenerating,
    generationProgress,
    currentGenerationMessage,
    handleGenerateContent,
    toggleContentTypeForGeneration,
    handleSelectAllContentTypesForGeneration,
    isAllContentTypesForGenerationSelected,
    isStyleChatLoading,
    setIsStyleChatLoading,
    isGenerateButtonDisabled,
    showTopicErrorAnimation,
  };
}

