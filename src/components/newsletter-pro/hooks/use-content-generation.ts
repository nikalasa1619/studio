

"use client";

import { useState, useMemo, useCallback } from "react";
import type { Project, ContentType, Author, FunFactItem, ToolItem, NewsletterItem, PodcastItem, PersonalizationSettings, LogEntryType } from "../types";
import {
  getAuthorsAndQuotesAction,
  generateFunFactsAction,
  recommendToolsAction,
  fetchNewslettersAction,
  fetchPodcastsAction,
  generateNewsletterHeaderAction,
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
import type { GenerateNewsletterHeaderOutput } from "@/ai/flows/generate-newsletter-header-flow";
import { ALL_CONTENT_TYPES } from "../types";
import type { ToastSignature } from "@/hooks/use-toast";


export function useContentGeneration(
    activeProject: Project | null,
    updateProjectData: <K extends keyof Project>(projectId: string, key: K, data: Project[K]) => void,
    handleRenameProject: (projectId: string, newName: string) => void,
    toast: ToastSignature,
    addLogEntry: (message: string, type?: LogEntryType) => void,
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
        quote: quoteObj.quote.replace(/^"+|"+$/g, ''), 
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
        setTimeout(() => setShowTopicErrorAnimation(false), 600); 
        toast({ title: "Missing Topic", description: "Please enter a topic to generate content.", variant: "destructive" });
        addLogEntry("Content generation failed: Topic is missing.", "error");
        return;
    }
    if (selectedContentTypesForGeneration.length === 0 || !activeProject || !activeProject.id) {
      toast({ title: "Missing Information", description: "Please select content types to generate.", variant: "destructive" });
      addLogEntry("Content generation failed: No content types selected or no active project.", "error");
      return;
    }

    const typesToActuallyGenerate = selectedContentTypesForGeneration.filter(
      type => !activeProject.generatedContentTypes.includes(type)
    );

    if (typesToActuallyGenerate.length === 0 && actualCurrentTopic === activeProject.topic) {
        toast({ title: "Content Already Generated", description: "All selected content types have already been generated for this topic. Choose different types or start a new project.", variant: "default" });
        addLogEntry("Content already generated for selected types and topic.", "info");
        return;
    }
    
    const finalTypesToGenerate = actualCurrentTopic !== activeProject.topic ? selectedContentTypesForGeneration : typesToActuallyGenerate;

    if (finalTypesToGenerate.length === 0 && !(activeProject.personalization.generateSubjectLine || activeProject.personalization.generateIntroText)) {
        toast({ title: "No New Content to Generate", description: "All selected types are already generated for the current topic, and header generation is off.", variant: "default" });
        addLogEntry("No new content to generate for current selections.", "info");
        return;
    }

    setIsGenerating(true);
    addLogEntry(`Starting content generation for topic: "${actualCurrentTopic}". Selected types: ${finalTypesToGenerate.join(', ')}.`, "info");
    updateProjectData(activeProject.id, 'topic', actualCurrentTopic);

    if (activeProject.name.startsWith("Untitled Project") && actualCurrentTopic.trim()) {
        handleRenameProject(activeProject.id, actualCurrentTopic);
        addLogEntry(`Project renamed to "${actualCurrentTopic}" based on topic.`, "info");
    }
    
    const headerGenerationNeeded = !!(activeProject.personalization.generateSubjectLine || activeProject.personalization.generateIntroText);
    const totalSteps = (finalTypesToGenerate.length * 3) + (headerGenerationNeeded ? 3 : 0);
    let completedSteps = 0;
    let hasErrors = false;

    setGenerationProgress(0);
    setCurrentGenerationMessage("Initializing content generation...");
    addLogEntry("Initializing content generation process...", "info");
    
    const initialGeneratedTypesForThisRun = [...(activeProject.generatedContentTypes || [])];
    let accumulatedSuccessfullyGeneratedTypesThisRun = [...initialGeneratedTypesForThisRun];

    const typesToReset = actualCurrentTopic !== activeProject.topic ? ALL_CONTENT_TYPES : finalTypesToGenerate;
    typesToReset.forEach(type => {
        switch(type) {
            case 'authors': updateProjectData(activeProject.id, 'authors', []); break;
            case 'facts': updateProjectData(activeProject.id, 'funFacts', []); break;
            case 'tools': updateProjectData(activeProject.id, 'tools', []); break;
            case 'newsletters': updateProjectData(activeProject.id, 'newsletters', []); break;
            case 'podcasts': updateProjectData(activeProject.id, 'podcasts', []); break;
        }
    });
    if (typesToReset.length > 0) {
      addLogEntry(`Reset content for types: ${typesToReset.join(', ')} due to topic change or re-generation.`, "info");
    }
    
    const updateProgress = (message: string, incrementStep: boolean = true, type: LogEntryType = 'info') => {
      setCurrentGenerationMessage(message);
      addLogEntry(message, type);
      if (incrementStep) {
        completedSteps++;
      }
      setGenerationProgress(totalSteps > 0 ? (completedSteps / totalSteps) * 100 : (totalSteps === 0 ? 100 : 0));
    };

    if (headerGenerationNeeded) {
        updateProgress("Generating newsletter header...", true);
        try {
            const contentSummaryParts: string[] = [];
            if (finalTypesToGenerate.includes('authors')) contentSummaryParts.push(`author quotes`);
            if (finalTypesToGenerate.includes('facts')) contentSummaryParts.push(`fun/science facts`);
            if (finalTypesToGenerate.includes('tools')) contentSummaryParts.push(`productivity tools`);
            if (finalTypesToGenerate.includes('newsletters')) contentSummaryParts.push(`newsletter recommendations`);
            if (finalTypesToGenerate.includes('podcasts')) contentSummaryParts.push(`podcast recommendations`);
            const contentSummary = contentSummaryParts.length > 0 ? `Includes: ${contentSummaryParts.join(', ')}.` : "Content is being curated.";

            const headerResult: GenerateNewsletterHeaderOutput = await generateNewsletterHeaderAction({
                topic: actualCurrentTopic,
                newsletterDescription: activeProject.personalization.newsletterDescription,
                targetAudience: activeProject.personalization.targetAudience,
                contentSummary: contentSummary,
                generateSubjectLine: !!activeProject.personalization.generateSubjectLine,
                generateIntroText: !!activeProject.personalization.generateIntroText,
            });
            updateProgress("Validating header...", true);
            const updatedPersonalization: PersonalizationSettings = {
                ...activeProject.personalization,
                subjectLine: activeProject.personalization.generateSubjectLine ? headerResult.subjectLine : activeProject.personalization.subjectLine,
                introText: activeProject.personalization.generateIntroText ? headerResult.introText : activeProject.personalization.introText,
            };
            updateProjectData(activeProject.id, 'personalization', updatedPersonalization);
            updateProgress("Newsletter header generated!", true, "success");
        } catch (err: any) {
            const errorMessage = err.message || "An unknown error occurred";
            console.error("Header Generation Failed:", errorMessage, err); 
            toast({ title: "Header Generation Failed", description: `Details: ${errorMessage}`, variant: "destructive"});
            hasErrors = true;
            completedSteps += (3 - (completedSteps % 3 === 0 ? 3 : completedSteps % 3)); 
            updateProgress(`Header generation failed: ${errorMessage}`, false, "error"); 
        }
    }


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
            updateProgress(`${action.name} processed successfully!`, true, "success"); 
            if (!accumulatedSuccessfullyGeneratedTypesThisRun.includes(contentType)) {
                accumulatedSuccessfullyGeneratedTypesThisRun.push(contentType);
            }
        } catch (err: any) {
            const errorMessage = err.message || "An unknown error occurred";
            console.error(`${contentType} Generation Failed:`, errorMessage, err); 
            toast({ title: `${action.name} Generation Failed`, description: `Details: ${errorMessage}`, variant: "destructive"});
            hasErrors = true;
            completedSteps += (3 - (completedSteps % 3 === 0 ? 3 : completedSteps % 3)); 
            updateProgress(`${action.name} generation failed: ${errorMessage}`, false, "error"); 
        }
    }
    
    if (activeProject?.id) {
        const finalGeneratedTypesSet = Array.from(new Set(accumulatedSuccessfullyGeneratedTypesThisRun)).sort();
        const currentProjectGeneratedTypesSet = (activeProject.generatedContentTypes || []).sort();
        
        if (JSON.stringify(finalGeneratedTypesSet) !== JSON.stringify(currentProjectGeneratedTypesSet)) {
            updateProjectData(activeProject.id, 'generatedContentTypes', finalGeneratedTypesSet);
        }
    }


    if (!hasErrors && totalSteps > 0 && (finalTypesToGenerate.length > 0 || headerGenerationNeeded)) {
      updateProgress("All content generated successfully!", false, "success");
      toast({ title: "Content Generation Complete!", description: "All selected content has been fetched."});
    } else if (totalSteps > 0 && (finalTypesToGenerate.length > 0 || headerGenerationNeeded)) {
      updateProgress("Generation complete with some errors.", false, "warning");
       toast({ title: "Generation Finished with Errors", description: "Some content generation tasks failed. Please check individual error messages.", variant: "default" }); 
    } else {
      updateProgress("No new content selected for generation.", false);
    }

    setGenerationProgress(100); 

    setTimeout(() => {
      setIsGenerating(false);
      setCurrentGenerationMessage(""); 
      addLogEntry("Content generation process finished.", "info");
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
    handlePodcastsData,
    addLogEntry,
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
    if (isGenerating) return true;
    if (!activeProject) return true;
    if (!actualCurrentTopic.trim()) return true;
    
    if (selectedContentTypesForGeneration.length === 0 && 
        !(activeProject.personalization.generateSubjectLine || activeProject.personalization.generateIntroText)) {
      return true;
    }

    if (actualCurrentTopic === activeProject.topic &&
        selectedContentTypesForGeneration.every(type => activeProject.generatedContentTypes.includes(type)) &&
        !(activeProject.personalization.generateSubjectLine || activeProject.personalization.generateIntroText)) {
      return true; 
    }
    
    return false;
  }, [isGenerating, actualCurrentTopic, selectedContentTypesForGeneration, activeProject]);


  return {
    currentTopic,
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

