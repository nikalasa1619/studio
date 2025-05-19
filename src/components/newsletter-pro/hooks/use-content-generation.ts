
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
    if (!activeProject || !activeProject.id) {
      toast({ title: "No Active Project", description: "Please select or create a project to generate content.", variant: "destructive" });
      addLogEntry("Content generation failed: No active project.", "error");
      return;
    }
     if (selectedContentTypesForGeneration.length === 0 &&
        !(activeProject.personalization.generateSubjectLine || activeProject.personalization.generateIntroText)) {
      toast({ title: "Missing Selections", description: "Please select content types or enable header generation.", variant: "destructive" });
      addLogEntry("Content generation failed: No content types selected and header generation is off.", "error");
      return;
    }


    const typesToActuallyGenerate = selectedContentTypesForGeneration.filter(
      type => !activeProject.generatedContentTypes.includes(type)
    );

    const topicChanged = actualCurrentTopic !== activeProject.topic;
    const finalTypesToGenerate = topicChanged ? selectedContentTypesForGeneration : typesToActuallyGenerate;
    
    const headerGenerationNeeded = !!(activeProject.personalization.generateSubjectLine || activeProject.personalization.generateIntroText);

    if (finalTypesToGenerate.length === 0 && !headerGenerationNeeded && !topicChanged) {
        toast({ title: "Content Already Generated", description: "All selected content types have already been generated for this topic, and header generation is off. Choose different types, change the topic, or start a new project.", variant: "default" });
        addLogEntry("Content already generated for selected types and topic. Header generation off.", "info");
        return;
    }
    
    setIsGenerating(true);
    addLogEntry(`Starting content generation for topic: "${actualCurrentTopic}". Selected types: ${finalTypesToGenerate.join(', ') || 'None (Header only)'}.`, "info");
    
    if (topicChanged) {
        updateProjectData(activeProject.id, 'topic', actualCurrentTopic);
        // If topic changed, also reset generated content types list
        updateProjectData(activeProject.id, 'generatedContentTypes', []);
        addLogEntry(`Topic changed to "${actualCurrentTopic}". Generated content types reset.`, "info");
    }


    if (activeProject.name.startsWith("Untitled Project") && actualCurrentTopic.trim()) {
        const newProjectName = actualCurrentTopic.length > 25 ? actualCurrentTopic.substring(0, 22) + "..." : actualCurrentTopic;
        handleRenameProject(activeProject.id, newProjectName);
        addLogEntry(`Project renamed to "${newProjectName}" based on topic.`, "info");
    }

    const totalSteps = (finalTypesToGenerate.length * 3) + (headerGenerationNeeded ? 3 : 0);
    let completedSteps = 0;
    let hasErrors = false;

    setGenerationProgress(0);
    setCurrentGenerationMessage("Initializing content generation...");
    addLogEntry("Initializing content generation process...", "info");

    let accumulatedSuccessfullyGeneratedTypesThisRun = topicChanged ? [] : [...(activeProject.generatedContentTypes || [])];

    const typesToResetForNewTopic = topicChanged ? ALL_CONTENT_TYPES : [];
    const typesToResetForReGeneration = finalTypesToGenerate.filter(type => !typesToResetForNewTopic.includes(type));

    typesToResetForNewTopic.forEach(type => {
        switch(type) {
            case 'authors': updateProjectData(activeProject.id, 'authors', []); break;
            case 'facts': updateProjectData(activeProject.id, 'funFacts', []); break;
            case 'tools': updateProjectData(activeProject.id, 'tools', []); break;
            case 'newsletters': updateProjectData(activeProject.id, 'newsletters', []); break;
            case 'podcasts': updateProjectData(activeProject.id, 'podcasts', []); break;
        }
    });
     if (typesToResetForNewTopic.length > 0) {
      addLogEntry(`Reset content for types: ${typesToResetForNewTopic.join(', ')} due to topic change.`, "info");
    }
    
    typesToResetForReGeneration.forEach(type => {
         switch(type) {
            case 'authors': updateProjectData(activeProject.id, 'authors', []); break;
            case 'facts': updateProjectData(activeProject.id, 'funFacts', []); break;
            case 'tools': updateProjectData(activeProject.id, 'tools', []); break;
            case 'newsletters': updateProjectData(activeProject.id, 'newsletters', []); break;
            case 'podcasts': updateProjectData(activeProject.id, 'podcasts', []); break;
        }
    });
    if (typesToResetForReGeneration.length > 0) {
        addLogEntry(`Reset content for re-generating types: ${typesToResetForReGeneration.join(', ')}.`, "info");
    }


    const updateProgress = (message: string, incrementStep: boolean = true, type: LogEntryType = 'info') => {
      setCurrentGenerationMessage(message);
      addLogEntry(message, type);
      if (incrementStep && totalSteps > 0) { // Ensure totalSteps is not zero to prevent division by zero
        completedSteps++;
      }
      setGenerationProgress(totalSteps > 0 ? (completedSteps / totalSteps) * 100 : (headerGenerationNeeded && finalTypesToGenerate.length === 0 ? 100 : 0));
    };

    if (headerGenerationNeeded) {
        updateProgress("Generating newsletter header...", true);
        try {
            const contentSummaryParts: string[] = [];
            finalTypesToGenerate.forEach(type => {
                switch(type) {
                    case 'authors': contentSummaryParts.push("author quotes"); break;
                    case 'facts': contentSummaryParts.push("fun/science facts"); break;
                    case 'tools': contentSummaryParts.push("productivity tools"); break;
                    case 'newsletters': contentSummaryParts.push("newsletter recommendations"); break;
                    case 'podcasts': contentSummaryParts.push("podcast recommendations"); break;
                }
            });
            const contentSummary = contentSummaryParts.length > 0 ? `Includes: ${contentSummaryParts.join(', ')}.` : "Content is being curated for the newsletter.";

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
            const errorMessage = err.message || "An unknown error occurred during header generation";
            console.error("Header Generation Failed:", errorMessage, err);
            toast({ title: "Header Generation Failed", description: `Details: ${errorMessage}`, variant: "destructive"});
            hasErrors = true;
            completedSteps += (3 - (completedSteps % 3 === 0 && totalSteps > 0 ? 3 : completedSteps % 3)); // Adjust step accounting for failure
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
            const errorMessage = err.message || `An unknown error occurred during ${action.name} generation`;
            console.error(`${action.name} Generation Failed:`, errorMessage, err);
            toast({ title: `${action.name} Generation Failed`, description: `Details: ${errorMessage}`, variant: "destructive"});
            hasErrors = true;
            completedSteps += (3 - (completedSteps % 3 === 0 && totalSteps > 0 ? 3 : completedSteps % 3)); // Adjust step accounting for failure
            updateProgress(`${action.name} generation failed: ${errorMessage}`, false, "error");
        }
    }

    if (activeProject?.id) {
        const finalGeneratedTypesSet = Array.from(new Set(accumulatedSuccessfullyGeneratedTypesThisRun)).sort();
        // Get the current project's generatedContentTypes to compare accurately
        const currentProjectState = JSON.parse(localStorage.getItem("newsletterProProjects") || "[]").find((p:Project) => p.id === activeProject.id);
        const currentProjectGeneratedTypesSet = (currentProjectState?.generatedContentTypes || []).sort();

        if (JSON.stringify(finalGeneratedTypesSet) !== JSON.stringify(currentProjectGeneratedTypesSet)) {
            updateProjectData(activeProject.id, 'generatedContentTypes', finalGeneratedTypesSet);
        }
    }


    if (!hasErrors && (totalSteps > 0 || (finalTypesToGenerate.length === 0 && headerGenerationNeeded))) { // Check if any work was actually done
      updateProgress("All content generated successfully!", false, "success");
      toast({ title: "Content Generation Complete!", description: "All selected content has been fetched."});
    } else if (totalSteps > 0 || (finalTypesToGenerate.length === 0 && headerGenerationNeeded)) { // Check if any work was actually done before declaring errors
      updateProgress("Generation complete with some errors.", false, "warning");
       toast({ title: "Generation Finished with Errors", description: "Some content generation tasks failed. Please check the activity log and individual error messages.", variant: "default" });
    } else {
      updateProgress("No new content was selected for generation.", false);
       // No toast here, as initial checks should have caught this.
    }

    // Ensure progress is 100% if there was any task, even if it failed or completed.
    // If totalSteps was 0 (e.g. only header and it failed, or no tasks at all), this avoids NaN.
    setGenerationProgress(totalSteps > 0 || (finalTypesToGenerate.length === 0 && headerGenerationNeeded) ? 100 : 0);

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
        if (activeProject && actualCurrentTopic === activeProject.topic) {
            // If topic hasn't changed, select all ungenerated or all if everything is already generated (for re-generation)
            const ungeneratedTypes = ALL_CONTENT_TYPES.filter(type => !activeProject.generatedContentTypes.includes(type));
            if (ungeneratedTypes.length === 0 && ALL_CONTENT_TYPES.length > 0) {
                 setSelectedContentTypesForGeneration(ALL_CONTENT_TYPES); // Select all for re-generation
            } else {
                setSelectedContentTypesForGeneration(Array.from(new Set([...selectedContentTypesForGeneration, ...ungeneratedTypes])));
            }
        } else {
             setSelectedContentTypesForGeneration(ALL_CONTENT_TYPES); // Topic changed or no active project, select all
        }
    } else {
      setSelectedContentTypesForGeneration([]);
    }
  };


  const isAllContentTypesForGenerationSelected = useMemo(() => {
    if (!activeProject) return selectedContentTypesForGeneration.length === ALL_CONTENT_TYPES.length;

    if (actualCurrentTopic !== activeProject.topic) {
      // If topic has changed, "select all" means selecting all available types
      return ALL_CONTENT_TYPES.every(type => selectedContentTypesForGeneration.includes(type));
    }

    // If topic is the same, "select all" means selecting all *ungenerated* types
    // OR if all are generated, it means selecting all for re-generation
    const ungeneratedTypes = ALL_CONTENT_TYPES.filter(type => !activeProject.generatedContentTypes.includes(type));
    if (ungeneratedTypes.length === 0 && ALL_CONTENT_TYPES.length > 0) {
      return selectedContentTypesForGeneration.length === ALL_CONTENT_TYPES.length; // All selected for potential re-generation
    }
    return ungeneratedTypes.length > 0 && ungeneratedTypes.every(type => selectedContentTypesForGeneration.includes(type));
  }, [selectedContentTypesForGeneration, activeProject, actualCurrentTopic]);


  const isGenerateButtonDisabled = useMemo(() => {
    if (isGenerating) return true;
    if (!activeProject) return true;
    // Allow clicking generate even if topic is empty to trigger the animation/toast
    // if (!actualCurrentTopic.trim()) return true;

    const headerGenerationEnabled = activeProject.personalization.generateSubjectLine || activeProject.personalization.generateIntroText;

    if (selectedContentTypesForGeneration.length === 0 && !headerGenerationEnabled) {
      return true;
    }

    // If topic is the same, and all selected types are already generated, AND header generation is off, then disable.
    if (actualCurrentTopic === activeProject.topic &&
        selectedContentTypesForGeneration.every(type => activeProject.generatedContentTypes.includes(type)) &&
        !headerGenerationEnabled) {
      return true;
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
    isGenerateButtonDisabled,
    showTopicErrorAnimation,
  };
}

