
"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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

  useEffect(() => {
    if (activeProject) {
      setActualCurrentTopic(activeProject.topic || "");
    } else {
      setActualCurrentTopic(""); 
    }
  }, [activeProject]);


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
        quoteCardHeadline: quoteObj.quoteCardHeadline,
        relevanceScore: quoteObj.relevanceScore,
        quoteSource: fetchedAuthorEntry.source,
        imported: false,
        saved: false,
        amazonLink: `${amazonBaseUrl}?k=${encodeURIComponent(fetchedAuthorEntry.source)}&tag=${amazonTrackingTag}`,
        authorNameKey: fetchedAuthorEntry.name,
        publicationYear: quoteObj.publicationYear,
        pageNumber: quoteObj.pageNumber,
        contextSentence: quoteObj.contextSentence,
        themeTags: quoteObj.themeTags,
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

 const handleApiKeyError = (error: any, defaultMessage: string, contentType?: string): string => {
    let detailedErrorMessage = `${contentType ? `[${contentType}] ` : ''}${defaultMessage}`;
    const consoleErrorPrefix = contentType ? `[${contentType} Action Error]` : "[Action Error]";

    const geminiApiKeyMissing = typeof process !== 'undefined' && !process.env.GEMINI_API_KEY;

    if (geminiApiKeyMissing) {
      detailedErrorMessage = `${contentType ? `[${contentType}] ` : ''}Configuration Error: The GEMINI_API_KEY is not set. Please add it to your .env file, ensure it's correctly loaded, rebuild (if necessary), and restart the development server. This key is required for AI features to function.`;
      console.error(`${consoleErrorPrefix} Critical: GEMINI_API_KEY is missing from server environment variables.`);
    }
    else if (error.message && (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID") || error.message.includes("permission_denied") || error.message.includes("PERMISSION_DENIED"))) {
      detailedErrorMessage = `${contentType ? `[${contentType}] ` : ''}API Key Error: The GEMINI_API_KEY provided to Google is not valid or is missing permissions. Please verify the key in your .env file, ensure it's enabled for the Gemini API in Google Cloud Console, and has the correct permissions. Original Google Error: ${error.message}`;
      console.error(`${consoleErrorPrefix} Invalid API Key or insufficient permissions reported by Google:`, error.message);
    }
    else if (error.message) {
      detailedErrorMessage = `${defaultMessage} Details: ${error.message}`;
      console.error(`${consoleErrorPrefix} - ${defaultMessage}: Message: ${error.message}`, error.stack);
    } else if (typeof error === 'string') {
      detailedErrorMessage = `${defaultMessage} Details: ${error}`;
      console.error(`${consoleErrorPrefix} - ${defaultMessage}: Received string error:`, error);
    } else {
      detailedErrorMessage = `${defaultMessage} An unexpected error occurred. Check server logs for more details.`;
      console.error(`${consoleErrorPrefix} - ${defaultMessage}: Unknown error structure:`, error);
    }

    return detailedErrorMessage;
  };


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
    const headerGenerationEnabled = activeProject.personalization.generateSubjectLine || activeProject.personalization.generateIntroText;
    if (selectedContentTypesForGeneration.length === 0 && !headerGenerationEnabled) {
      toast({ title: "Missing Selections", description: "Please select content types or enable header generation.", variant: "destructive" });
      addLogEntry("Content generation failed: No content types selected and header generation is off.", "error");
      return;
    }

    const topicChanged = actualCurrentTopic !== activeProject.topic;
    const typesToActuallyGenerate = topicChanged ? selectedContentTypesForGeneration : selectedContentTypesForGeneration.filter(
      type => !activeProject.generatedContentTypes.includes(type)
    );

    const finalTypesToGenerate = typesToActuallyGenerate;

    if (finalTypesToGenerate.length === 0 && !headerGenerationEnabled && !topicChanged) {
        toast({ title: "Content Already Generated", description: "All selected content types have already been generated for this topic, and header generation is off. Choose different types, change the topic, or start a new project.", variant: "default" });
        addLogEntry("Content already generated for selected types and topic. Header generation off.", "info");
        return;
    }

    setIsGenerating(true);
    addLogEntry(`Starting content generation for topic: "${actualCurrentTopic}". Selected types: ${finalTypesToGenerate.join(', ') || 'None (Header only)'}.`, "info");

    if (topicChanged) {
        updateProjectData(activeProject.id, 'topic', actualCurrentTopic);
        ALL_CONTENT_TYPES.forEach(type => {
            switch(type) {
                case 'authors': updateProjectData(activeProject.id, 'authors', []); break;
                case 'facts': updateProjectData(activeProject.id, 'funFacts', []); break;
                case 'tools': updateProjectData(activeProject.id, 'tools', []); break;
                case 'newsletters': updateProjectData(activeProject.id, 'newsletters', []); break;
                case 'podcasts': updateProjectData(activeProject.id, 'podcasts', []); break;
            }
        });
        updateProjectData(activeProject.id, 'generatedContentTypes', []);
        addLogEntry(`Topic changed to "${actualCurrentTopic}". All content types reset for new generation.`, "info");
    } else {
        finalTypesToGenerate.forEach(type => {
            switch(type) {
                case 'authors': updateProjectData(activeProject.id, 'authors', []); break;
                case 'facts': updateProjectData(activeProject.id, 'funFacts', []); break;
                case 'tools': updateProjectData(activeProject.id, 'tools', []); break;
                case 'newsletters': updateProjectData(activeProject.id, 'newsletters', []); break;
                case 'podcasts': updateProjectData(activeProject.id, 'podcasts', []); break;
            }
        });
        if (finalTypesToGenerate.length > 0) {
          addLogEntry(`Resetting content for re-generating types: ${finalTypesToGenerate.join(', ')}.`, "info");
        }
    }

    if (activeProject.name.startsWith("Untitled Project") && actualCurrentTopic.trim()) {
        const newProjectName = actualCurrentTopic.length > 25 ? actualCurrentTopic.substring(0, 22) + "..." : actualCurrentTopic;
        handleRenameProject(activeProject.id, newProjectName);
        addLogEntry(`Project renamed to "${newProjectName}" based on topic.`, "info");
    }

    const totalSteps = (finalTypesToGenerate.length * 3) + (headerGenerationEnabled ? 3 : 0);
    let completedSteps = 0;
    let hasErrors = false;

    setGenerationProgress(0);
    setCurrentGenerationMessage("Initializing generation...");
    addLogEntry("Initializing content generation process...", "info");

    let accumulatedSuccessfullyGeneratedTypesThisRun = topicChanged ? [] : [...(activeProject.generatedContentTypes || [])];

    const updateProgress = (message: string, isMajorStep: boolean = true, type: LogEntryType = 'info') => {
      setCurrentGenerationMessage(message);
      addLogEntry(message, type);
      if (isMajorStep && totalSteps > 0) {
        completedSteps += 3;
      }
      setGenerationProgress(totalSteps > 0 ? Math.min((completedSteps / totalSteps) * 100, 100) : 0);
    };
     const updateMinorProgress = (message: string, type: LogEntryType = 'info') => {
      setCurrentGenerationMessage(message);
      addLogEntry(message, type);
      if (totalSteps > 0) {
        completedSteps++;
      }
      setGenerationProgress(totalSteps > 0 ? Math.min((completedSteps / totalSteps) * 100, 100) : 0);
    };


    if (headerGenerationEnabled) {
        updateMinorProgress("Generating newsletter header (subject & intro)...");
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
            updateMinorProgress("Validating header...", 'info');
            const updatedPersonalization: PersonalizationSettings = {
                ...activeProject.personalization,
                subjectLine: activeProject.personalization.generateSubjectLine ? headerResult.subjectLine : activeProject.personalization.subjectLine,
                introText: activeProject.personalization.generateIntroText ? headerResult.introText : activeProject.personalization.introText,
            };
            updateProjectData(activeProject.id, 'personalization', updatedPersonalization);
            updateProgress("Newsletter header generated!", true, "success");
        } catch (err: any) {
            const errorMessage = handleApiKeyError(err, "Failed to generate newsletter header.", "Newsletter Header");
            toast({ title: "Header Generation Failed", description: errorMessage, variant: "destructive"});
            hasErrors = true;
            completedSteps += (3 - (completedSteps % 3 === 0 && totalSteps > 0 ? 0 : completedSteps % 3));
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

        updateMinorProgress(`Fetching ${action.name}...`);
        try {
            const data = await action.task();
            updateMinorProgress(`Validating ${action.name} data...`);
            action.handler(data);
            updateProgress(`${action.name} processed successfully!`, true, "success");
            if (!accumulatedSuccessfullyGeneratedTypesThisRun.includes(contentType)) {
                accumulatedSuccessfullyGeneratedTypesThisRun.push(contentType);
            }
        } catch (err: any) {
            const errorMessage = handleApiKeyError(err, `Failed to generate ${action.name}.`, action.name);
            toast({ title: `${action.name} Generation Failed`, description: errorMessage, variant: "destructive"});
            hasErrors = true;
            completedSteps += (3 - (completedSteps % 3 === 0 && totalSteps > 0 ? 0 : completedSteps % 3)); 
            updateProgress(`${action.name} generation failed: ${errorMessage}`, false, "error");
        }
    }

    if (activeProject?.id) {
        const finalGeneratedTypesSet = Array.from(new Set(accumulatedSuccessfullyGeneratedTypesThisRun)).sort();
        updateProjectData(activeProject.id, 'generatedContentTypes', finalGeneratedTypesSet);
    }


    if (!hasErrors && (finalTypesToGenerate.length > 0 || headerGenerationEnabled)) {
      updateProgress("All content generated successfully!", false, "success");
      toast({ title: "Content Generation Complete!", description: "All selected content has been fetched."});
    } else if (finalTypesToGenerate.length > 0 || headerGenerationEnabled) {
      updateProgress("Generation complete with some errors.", false, "warning");
       toast({ title: "Generation Finished with Errors", description: "Some content generation tasks failed. Please check the activity log and individual error messages.", variant: "default" });
    } else {
      updateProgress("No new content was selected for generation.", false);
    }

    setGenerationProgress(100);


    setTimeout(() => {
      setIsGenerating(false);
      setCurrentGenerationMessage("");
      setGenerationProgress(0);
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

  const isTopicLocked = useMemo(() => {
    if (!activeProject) return false;
    // Topic is locked if it's set in the project as the generated topic,
    // content has actually been generated for it,
    // AND the current input topic (actualCurrentTopic) matches this project's generated topic.
    // This ensures that if the user types a new topic in the input, the field unlocks for new generation.
    // If generation completes for a topic, actualCurrentTopic is updated to match activeProject.topic,
    // and if content was generated, this hook re-evaluates to true, locking the input.
    return activeProject.topic.trim() !== "" &&
           activeProject.generatedContentTypes.length > 0 &&
           actualCurrentTopic === activeProject.topic;
  }, [activeProject, actualCurrentTopic]);

  const handleSelectAllContentTypesForGeneration = (checked: boolean) => {
    if (!activeProject) {
      setSelectedContentTypesForGeneration(checked ? ALL_CONTENT_TYPES : []);
      return;
    }

    if (actualCurrentTopic !== activeProject.topic || !isTopicLocked) {
        setSelectedContentTypesForGeneration(checked ? ALL_CONTENT_TYPES : []);
    } else {
        const ungeneratedTypes = ALL_CONTENT_TYPES.filter(type => !activeProject.generatedContentTypes.includes(type));
        if (ungeneratedTypes.length === 0 && ALL_CONTENT_TYPES.length > 0) {
            setSelectedContentTypesForGeneration(checked ? ALL_CONTENT_TYPES : []);
        } else {
            if (checked) {
                setSelectedContentTypesForGeneration(Array.from(new Set([...selectedContentTypesForGeneration, ...ungeneratedTypes])));
            } else {
                setSelectedContentTypesForGeneration(prev => prev.filter(t => !ungeneratedTypes.includes(t)));
            }
        }
    }
  };


  const isAllContentTypesForGenerationSelected = useMemo(() => {
    if (!activeProject) return selectedContentTypesForGeneration.length === ALL_CONTENT_TYPES.length;

    if (actualCurrentTopic !== activeProject.topic && !isTopicLocked) {
      return ALL_CONTENT_TYPES.every(type => selectedContentTypesForGeneration.includes(type));
    }

    const ungeneratedTypes = ALL_CONTENT_TYPES.filter(type => !activeProject.generatedContentTypes.includes(type));
    if (ungeneratedTypes.length === 0 && ALL_CONTENT_TYPES.length > 0) { 
      return selectedContentTypesForGeneration.length === ALL_CONTENT_TYPES.length;
    }
    return ungeneratedTypes.length > 0 && ungeneratedTypes.every(type => selectedContentTypesForGeneration.includes(type));
  }, [selectedContentTypesForGeneration, activeProject, actualCurrentTopic, isTopicLocked]);


  const isGenerateButtonDisabled = useMemo(() => {
    if (isGenerating) return true;
    if (!activeProject) return true;

    const headerGenerationEnabled = activeProject.personalization.generateSubjectLine || activeProject.personalization.generateIntroText;

    if (!actualCurrentTopic.trim()) {
      return true; 
    }

    if (selectedContentTypesForGeneration.length === 0 && !headerGenerationEnabled) {
      return true; 
    }

    if (isTopicLocked &&
        selectedContentTypesForGeneration.every(type => activeProject.generatedContentTypes.includes(type)) &&
        !headerGenerationEnabled) {
      return true;
    }

    return false;
  }, [isGenerating, actualCurrentTopic, selectedContentTypesForGeneration, activeProject, isTopicLocked]);

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
    isTopicLocked,
  };
}

