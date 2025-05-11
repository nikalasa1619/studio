// src/components/newsletter-pro/main-workspace.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { ContentItemCard } from "./content-item-card";
import { NewsletterPreview } from "./newsletter-preview";
import { AppSidebar } from "./app-sidebar";
import { GenerationProgressIndicator } from "./generation-progress-indicator";
import { useSidebar } from "@/components/ui/sidebar";
import type {
  Author,
  FunFactItem,
  ToolItem,
  NewsletterItem,
  PodcastItem,
  NewsletterStyles,
  Project,
  ContentType,
  AuthorSortOption,
  WorkspaceView,
  GeneratedContent,
} from "./types";
import { ALL_CONTENT_TYPES } from "./types";

import {
  getAuthorsAndQuotesAction,
  generateFunFactsAction,
  recommendToolsAction,
  fetchNewslettersAction,
  fetchPodcastsAction,
  generateStylesFromChatAction,
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
import type { GenerateNewsletterStylesOutput } from "@/ai/flows/generate-newsletter-styles-flow";

import { useToast } from "@/hooks/use-toast";
import { Loader2, UsersRound, Lightbulb, Wrench, Newspaper, Podcast as PodcastIconLucide, ChevronDown, Filter, ArrowUpDown, Bookmark, Info, Palette, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StyleCustomizer } from "./style-customizer";
import { StyleChatDialog } from "./style-chat-dialog";


const initialStyles: NewsletterStyles = {
  headingFont: "Inter, sans-serif",
  paragraphFont: "Inter, sans-serif",
  hyperlinkFont: "Inter, sans-serif",
  headingColor: "#111827",
  paragraphColor: "#374151",
  hyperlinkColor: "#008080",
  backgroundColor: "#FFFFFF",
};


const STATIC_INITIAL_PROJECT_ID = "project-initial-ssr-1";

const createNewProject = (idSuffix: string, topic: string = ""): Project => ({
  id: idSuffix === STATIC_INITIAL_PROJECT_ID ? STATIC_INITIAL_PROJECT_ID : `project-${idSuffix}-${Date.now()}`,
  name: topic ? `${topic.substring(0, 20)}${topic.length > 20 ? '...' : ''}` : `Untitled Project ${idSuffix === STATIC_INITIAL_PROJECT_ID ? '1' : idSuffix.substring(0,4)}`,
  topic: topic,
  authors: [],
  funFacts: [],
  tools: [],
  newsletters: [],
  podcasts: [],
  styles: { ...initialStyles },
  lastModified: Date.now(),
  generatedContentTypes: [],
});


export function MainWorkspace() {
  const [isClientHydrated, setIsClientHydrated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentGenerationMessage, setCurrentGenerationMessage] = useState("");

  const initialDefaultProject = useMemo(() => createNewProject(STATIC_INITIAL_PROJECT_ID, "Welcome Project"), []);

  const [projects, setProjects] = useState<Project[]>([initialDefaultProject]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null); 
  const [currentTopic, setCurrentTopic] = useState<string>(""); 
  const [selectedContentTypesForGeneration, setSelectedContentTypesForGeneration] = useState<ContentType[]>(ALL_CONTENT_TYPES);

  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<string>("all");
  const [authorSortOption, setAuthorSortOption] = useState<AuthorSortOption>("relevance_desc");

  const [isStyleChatOpen, setIsStyleChatOpen] = useState(false);
  const [isStyleChatLoading, setIsStyleChatLoading] = useState(false);


  const [currentWorkspaceView, setCurrentWorkspaceView] = useState<WorkspaceView>('authors');
  const [activeUITab, setActiveUITab] = useState<ContentType>(ALL_CONTENT_TYPES[0]);
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  const { toast } = useToast();
  const { state: sidebarState, isMobile, toggleSidebar: toggleAppSidebar } = useSidebar();

  const activeProject = useMemo(() => {
    if (!activeProjectId) return null; 
    return projects.find(p => p.id === activeProjectId);
  }, [projects, activeProjectId]);

   const displayableTabs = useMemo(() => {
    if (!activeProject) return [];

    let sourceItemsFunction: (type: ContentType) => GeneratedContent[] = () => [];

    if (currentWorkspaceView === 'savedItems') {
        sourceItemsFunction = (type) => {
            switch (type) {
                case 'authors': return activeProject.authors.filter(a => a.saved);
                case 'facts': return activeProject.funFacts.filter(f => f.saved);
                case 'tools': return activeProject.tools.filter(t => t.saved);
                case 'newsletters': return activeProject.newsletters.filter(n => n.saved);
                case 'podcasts': return activeProject.podcasts.filter(p => p.saved);
                default: return [];
            }
        };
    } else { 
        sourceItemsFunction = (type) => {
             if (!activeProject.generatedContentTypes.includes(type)) return [];
            switch (type) {
                case 'authors': return activeProject.authors;
                case 'facts': return activeProject.funFacts;
                case 'tools': return activeProject.tools;
                case 'newsletters': return activeProject.newsletters;
                case 'podcasts': return activeProject.podcasts;
                default: return [];
            }
        };
    }

    return ALL_CONTENT_TYPES.filter(type => {
        let items = sourceItemsFunction(type);
        if (showOnlySelected) {
            items = items.filter(item => 'imported' in item ? item.imported : ('selected' in item ? item.selected : false));
        }
        return items.length > 0;
    });
  }, [activeProject, currentWorkspaceView, showOnlySelected]);

  useEffect(() => {
    if (displayableTabs.length > 0 && !displayableTabs.includes(activeUITab)) {
      setActiveUITab(displayableTabs[0]);
    } else if (displayableTabs.length === 0 && activeProject?.generatedContentTypes && activeProject.generatedContentTypes.length > 0) {
       setActiveUITab(activeProject.generatedContentTypes[0]);
    } else if (displayableTabs.length === 0 && (!activeProject?.generatedContentTypes || activeProject.generatedContentTypes.length === 0)) {
      // setActiveUITab(ALL_CONTENT_TYPES[0]); // Keep previous or default if no content
    }
  }, [displayableTabs, activeUITab, activeProject]);


  useEffect(() => {
    const storedProjectsString = localStorage.getItem('newsletterProProjects');
    let projectsToLoad: Project[] = [];
    let activeIdToLoad: string | null = null;

    if (storedProjectsString) {
      try {
        const parsedProjects = JSON.parse(storedProjectsString);
        if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
          projectsToLoad = parsedProjects.map((p: any) => ({ 
            ...createNewProject(''), // Ensures all default fields are present
            ...p,
            styles: {...initialStyles, ...p.styles}, // Merge with defaults
            generatedContentTypes: p.generatedContentTypes || [], // Ensure array exists
             // Ensure saved and imported/selected fields exist with defaults
            authors: p.authors?.map((a: any) => ({ ...a, saved: a.saved ?? false, imported: a.imported ?? false })) || [],
            funFacts: p.funFacts?.map((f: any) => ({ ...f, saved: f.saved ?? false, selected: f.selected ?? false })) || [],
            tools: p.tools?.map((t: any) => ({ ...t, saved: t.saved ?? false, selected: t.selected ?? false })) || [],
            newsletters: p.newsletters?.map((n: any) => ({ ...n, saved: n.saved ?? false, selected: n.selected ?? false })) || [],
            podcasts: p.podcasts?.map((pc: any) => ({ ...pc, saved: pc.saved ?? false, selected: pc.selected ?? false })) || [],
          }));
        }
      } catch (e) {
        console.error("Failed to parse projects from localStorage", e);
        // projectsToLoad will remain empty, new logic below handles this
      }
    }

    if (projectsToLoad.length === 0) { // If no projects from storage or parsing failed
        const newFirstProject = createNewProject(`local-${Date.now().toString().slice(-5)}`, "My First Project");
        projectsToLoad = [newFirstProject];
        activeIdToLoad = newFirstProject.id; // Activate the new project
    }

    const sortedProjects = projectsToLoad.sort((a,b) => b.lastModified - a.lastModified);
    setProjects(sortedProjects);

    const storedActiveId = localStorage.getItem('newsletterProActiveProjectId');
    if (storedActiveId && sortedProjects.find(p => p.id === storedActiveId)) {
      activeIdToLoad = storedActiveId;
    } else if (sortedProjects.length > 0 && !activeIdToLoad) { // Ensure activeIdToLoad is set if not already
      activeIdToLoad = sortedProjects[0].id;
    }
    setActiveProjectId(activeIdToLoad);
    if(activeIdToLoad) { // Set initial topic from loaded active project
        const initialActiveProj = sortedProjects.find(p => p.id === activeIdToLoad);
        if(initialActiveProj) setCurrentTopic(initialActiveProj.topic);
    }
    setIsClientHydrated(true);
  }, [initialDefaultProject]); // Run once on mount


  useEffect(() => {
    if (isClientHydrated) {
      localStorage.setItem('newsletterProProjects', JSON.stringify(projects));
      if(activeProjectId) {
        localStorage.setItem('newsletterProActiveProjectId', activeProjectId);
      } else {
        localStorage.removeItem('newsletterProActiveProjectId');
      }
    }
  }, [projects, activeProjectId, isClientHydrated]);

  const updateProjectData = useCallback(<K extends keyof Project>(projectId: string, key: K, data: Project[K]) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? { ...p, [key]: data, lastModified: Date.now() } : p
      ).sort((a,b) => b.lastModified - a.lastModified)
    );
  }, []);

  const handleNewProject = useCallback(() => {
    const newP = createNewProject(`${projects.length + 1}-${Date.now().toString().slice(-5)}`);
    const updatedProjects = [newP, ...projects].sort((a,b) => b.lastModified - a.lastModified);
    setProjects(updatedProjects);
    setActiveProjectId(newP.id);
    setCurrentTopic(""); // Reset topic for new project
    setSelectedContentTypesForGeneration(ALL_CONTENT_TYPES); // Reset selections
    setCurrentWorkspaceView('authors'); // Default view for new project
    setActiveUITab(ALL_CONTENT_TYPES[0]); // Default tab
    setShowOnlySelected(false); // Reset filter
    // Initialize content arrays for the new project
    updateProjectData(newP.id, 'authors', []);
    updateProjectData(newP.id, 'funFacts', []);
    updateProjectData(newP.id, 'tools', []);
    updateProjectData(newP.id, 'newsletters', []);
    updateProjectData(newP.id, 'podcasts', []);
    updateProjectData(newP.id, 'styles', { ...initialStyles });
    updateProjectData(newP.id, 'generatedContentTypes', []);
  }, [projects, updateProjectData]);


  useEffect(() => {
    if (!isClientHydrated) return;

    if (activeProject) {
      setCurrentTopic(activeProject.topic); // Sync topic input with active project's topic
      // Ensure styles and generatedContentTypes arrays are initialized
      if (!activeProject.styles || Object.keys(activeProject.styles).length === 0) {
          updateProjectData(activeProject.id, 'styles', {...initialStyles});
      }
      if (!activeProject.generatedContentTypes) { // Ensure array exists
          updateProjectData(activeProject.id, 'generatedContentTypes', []);
      }

      // Ensure saved and imported/selected fields are initialized for all items
      ['authors', 'funFacts', 'tools', 'newsletters', 'podcasts'].forEach(contentTypeKey => {
        const key = contentTypeKey as keyof Pick<Project, 'authors'|'funFacts'|'tools'|'newsletters'|'podcasts'>;
        if (activeProject[key] && Array.isArray(activeProject[key])) {
            const items = activeProject[key] as GeneratedContent[];
             // Check if any item is missing the 'saved' or 'imported'/'selected' property
            const needsUpdate = items.some(item => item.saved === undefined || ('imported' in item && item.imported === undefined) || ('selected' in item && item.selected === undefined) );
            if (needsUpdate) {
                updateProjectData(activeProject.id, key, items.map(item => ({
                    ...item,
                    saved: item.saved ?? false, // Default to false if undefined
                    imported: 'imported' in item ? (item.imported ?? false) : undefined, // Default imported
                    selected: 'selected' in item ? (item.selected ?? false) : undefined, // Default selected
                })) as any); // Type assertion as mapping preserves specific types
            }
        }
      });


    } else if (projects.length > 0 && !activeProjectId && isClientHydrated) {
        // If no active project but projects exist, activate the most recent one
        setActiveProjectId(projects[0].id);
        setCurrentTopic(projects[0].topic);
    } else if (projects.length === 0 && isClientHydrated) {
        // If no projects at all, create and activate a new one
        handleNewProject();
    }
  }, [activeProject, projects, activeProjectId, isClientHydrated, updateProjectData, handleNewProject]);


  const handleRenameProject = (projectId: string, newName: string) => {
     if (newName.trim() === "") return;
     const finalName = newName.length > 20 ? `${newName.substring(0, 20)}...` : newName;
     updateProjectData(projectId, 'name', finalName);
  };

  const handleAuthorsData = (data: FetchAuthorsAndQuotesOutput) => {
    if (!activeProjectId) return;
    const amazonBaseUrl = "https://www.amazon.com/s";
    const amazonTrackingTag = "growthshuttle-20";
    const newAuthorItems: Author[] = data.authors.flatMap(fetchedAuthorEntry =>
      fetchedAuthorEntry.quotes.map((quoteObj, quoteIndex) => ({
        id: `author-${fetchedAuthorEntry.name.replace(/\s+/g, '-')}-quote-${quoteIndex}-${Date.now()}`,
        name: fetchedAuthorEntry.name,
        titleOrKnownFor: fetchedAuthorEntry.titleOrKnownFor,
        quote: quoteObj.quote,
        relevanceScore: quoteObj.relevanceScore,
        quoteSource: fetchedAuthorEntry.source,
        imported: false,
        saved: false,
        amazonLink: `${amazonBaseUrl}?k=${encodeURIComponent(fetchedAuthorEntry.source)}&tag=${amazonTrackingTag}`,
        authorNameKey: fetchedAuthorEntry.name, // Store original name for filtering
      }))
    );
    updateProjectData(activeProjectId, 'authors', newAuthorItems);
    setSelectedAuthorFilter("all"); // Reset filter when new authors are loaded
  };

  const handleFunFactsData = (data: GenerateFunFactsOutput) => {
    if (!activeProjectId) return;
    const newFunFacts: FunFactItem[] = [
      ...data.funFacts.map((fact, index) => ({ id: `fun-${index}-${Date.now()}`, text: fact.text, type: "fun" as const, selected: false, relevanceScore: fact.relevanceScore, sourceLink: fact.sourceLink, saved: false })),
      ...data.scienceFacts.map((fact, index) => ({ id: `science-${index}-${Date.now()}`, text: fact.text, type: "science" as const, selected: false, relevanceScore: fact.relevanceScore, sourceLink: fact.sourceLink, saved: false }))
    ];
    updateProjectData(activeProjectId, 'funFacts', newFunFacts);
  };

  const handleToolsData = (data: RecommendProductivityToolsOutput) => {
    if (!activeProjectId) return;
    const newTools: ToolItem[] = [
      ...data.freeTools.map((tool, index) => ({ id: `free-tool-${index}-${Date.now()}`, name: tool.name, type: "free" as const, selected: false, relevanceScore: tool.relevanceScore, freeTrialPeriod: tool.freeTrialPeriod, saved: false })),
      ...data.paidTools.map((tool, index) => ({ id: `paid-tool-${index}-${Date.now()}`, name: tool.name, type: "paid" as const, selected: false, relevanceScore: tool.relevanceScore, freeTrialPeriod: tool.freeTrialPeriod, saved: false }))
    ];
    updateProjectData(activeProjectId, 'tools', newTools);
  };

  const handleNewslettersData = (data: FetchNewslettersOutput) => {
    if (!activeProjectId) return;
    const newNewsletters: NewsletterItem[] = data.newsletters.map((nl, index) => ({
      ...nl, id: `newsletter-${index}-${Date.now()}`, selected: false, saved: false,
      frequency: nl.frequency, coveredTopics: nl.coveredTopics,
    }));
    updateProjectData(activeProjectId, 'newsletters', newNewsletters);
  };

  const handlePodcastsData = (data: FetchPodcastsOutput) => {
    if (!activeProjectId) return;
    const newPodcasts: PodcastItem[] = data.podcasts.map((podcast, index) => ({
      ...podcast, id: `podcast-${index}-${Date.now()}`, selected: false, saved: false,
      frequency: podcast.frequency, topics: podcast.topics,
    }));
    updateProjectData(activeProjectId, 'podcasts', newPodcasts);
  };

 const handleGenerateContent = async () => {
    if (!currentTopic.trim() || selectedContentTypesForGeneration.length === 0 || !activeProject || !activeProjectId) {
      toast({ title: "Missing Information", description: "Please enter a topic and select content types to generate.", variant: "destructive" });
      return;
    }

    // Filter out already generated types for the current active project
    const typesToActuallyGenerate = selectedContentTypesForGeneration.filter(
      type => !activeProject.generatedContentTypes.includes(type)
    );

    if (typesToActuallyGenerate.length === 0) {
        toast({ title: "Content Already Generated", description: "All selected content types have already been generated for this topic. Choose different types or start a new project.", variant: "default" });
        return;
    }

    setIsGenerating(true);
    updateProjectData(activeProjectId, 'topic', currentTopic); // Update project topic
    // Set active tab to the first *newly* generated type, or first displayable if none new
    if (typesToActuallyGenerate.length > 0 && !displayableTabs.includes(typesToActuallyGenerate[0])) {
        setCurrentWorkspaceView(typesToActuallyGenerate[0]); // Set view type
        setActiveUITab(typesToActuallyGenerate[0]); // Set UI tab
    } else if (displayableTabs.length > 0) {
        setCurrentWorkspaceView(displayableTabs[0]);
        setActiveUITab(displayableTabs[0]);
    } else {
         setCurrentWorkspaceView('authors'); // Fallback
         setActiveUITab('authors'); // Fallback
    }


    // Rename project if it's an untitled one and a topic is entered
    if (activeProject.name.startsWith("Untitled Project") && currentTopic.trim()) {
        handleRenameProject(activeProjectId, currentTopic);
    }

    const totalSteps = typesToActuallyGenerate.length * 3; // Fetching, Validating, Processing
    let completedSteps = 0;
    let hasErrors = false;

    setGenerationProgress(0);
    setCurrentGenerationMessage("Initializing content generation...");

    // Clear previous content for types being regenerated FOR THIS PROJECT
    typesToActuallyGenerate.forEach(type => {
        switch(type) {
            case 'authors': updateProjectData(activeProjectId, 'authors', []); break;
            case 'facts': updateProjectData(activeProjectId, 'funFacts', []); break;
            case 'tools': updateProjectData(activeProjectId, 'tools', []); break;
            case 'newsletters': updateProjectData(activeProjectId, 'newsletters', []); break;
            case 'podcasts': updateProjectData(activeProjectId, 'podcasts', []); break;
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
      authors: { task: () => getAuthorsAndQuotesAction({ topic: currentTopic }), handler: handleAuthorsData, name: "Authors & Quotes" },
      facts: { task: () => generateFunFactsAction({ topic: currentTopic }), handler: handleFunFactsData, name: "Fun Facts" },
      tools: { task: () => recommendToolsAction({ topic: currentTopic }), handler: handleToolsData, name: "Productivity Tools" },
      newsletters: { task: () => fetchNewslettersAction({ topic: currentTopic }), handler: handleNewslettersData, name: "Newsletters" },
      podcasts: { task: () => fetchPodcastsAction({ topic: currentTopic }), handler: handlePodcastsData, name: "Podcasts" },
    };

    for (const contentType of typesToActuallyGenerate) {
        const action = actionsMap[contentType];
        if (!action) continue;

        updateProgress(`Fetching ${action.name}...`, true);
        try {
            const data = await action.task();
            updateProgress(`Validating ${action.name} data...`, true); // Step for validation/assessment
            action.handler(data);
            updateProgress(`${action.name} processed successfully!`, true); // Step for processing/storing
            // Add to generatedContentTypes for the current project
            if (activeProjectId && activeProject) { // Re-check activeProject as it might update
              const currentGenerated = projects.find(p => p.id === activeProjectId)?.generatedContentTypes || [];
              if (!currentGenerated.includes(contentType)) {
                updateProjectData(activeProjectId, 'generatedContentTypes', [...currentGenerated, contentType]);
              }
            }
        } catch (err: any) {
            const errorMessage = err.message || "An unknown error occurred";
            console.error(`${contentType} Generation Failed:`, errorMessage, err); 
            toast({ title: `${action.name} Generation Failed`, description: `Details: ${errorMessage}`, variant: "destructive"});
            hasErrors = true;
            // Advance steps to reflect failure but complete the type's progress segment
            completedSteps += (3 - (completedSteps % 3 === 0 ? 3 : completedSteps % 3)); 
            updateProgress(`${action.name} generation failed.`, false); // Update message without incrementing step count
        }
    }

    if (!hasErrors && totalSteps > 0 && typesToActuallyGenerate.length > 0) {
      updateProgress("All content generated successfully!", false);
      toast({ title: "Content Generation Complete!", description: "All selected content has been fetched."});
    } else if (totalSteps > 0 && typesToActuallyGenerate.length > 0) { // Some errors occurred
      updateProgress("Generation complete with some errors.", false);
       toast({ title: "Generation Finished with Errors", description: "Some content generation tasks failed. Please check individual error messages.", variant: "default" }); // Changed to default for less alarm
    } else {
      // This case should be rare now due to initial check for typesToActuallyGenerate
      updateProgress("No new content types selected for generation.", false);
    }

    // Ensure progress bar completes
    setGenerationProgress(100);

    // Hide progress indicator after a delay
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentGenerationMessage(""); // Clear message
      // Potentially reset progress to 0 if preferred for next run
      // setGenerationProgress(0); 
    }, 3000); // Keep message and progress for 3 seconds after completion/error
  };


  const toggleContentTypeForGeneration = (contentType: ContentType) => {
    setSelectedContentTypesForGeneration(prev =>
      prev.includes(contentType)
        ? prev.filter(item => item !== contentType)
        : [...prev, contentType]
    );
  };

  // Modified to select all *ungenerated* types
  const handleSelectAllContentTypesForGeneration = (checked: boolean) => {
    if (checked) {
      // Select all types that are NOT YET in activeProject.generatedContentTypes
      const ungeneratedTypes = ALL_CONTENT_TYPES.filter(type => !activeProject?.generatedContentTypes.includes(type));
      setSelectedContentTypesForGeneration(ungeneratedTypes);
    } else {
      setSelectedContentTypesForGeneration([]);
    }
  };

  // Modified to check if all *ungenerated* types are selected
  const isAllContentTypesForGenerationSelected = useMemo(() => {
    if (!activeProject) return false; // No active project, can't determine
    const ungeneratedTypes = ALL_CONTENT_TYPES.filter(type => !activeProject.generatedContentTypes.includes(type));
    if (ungeneratedTypes.length === 0) return true; // All types already generated, so "all new" is effectively selected (as there are no new)
    return ungeneratedTypes.every(type => selectedContentTypesForGeneration.includes(type));
  }, [selectedContentTypesForGeneration, activeProject]);


  const toggleItemImportStatus = (itemId: string, imported: boolean, type: ContentType) => {
    if (!activeProject || !activeProjectId) return;
    let updatedItems;
    switch (type) {
      case 'authors':
        updatedItems = activeProject.authors.map(item => item.id === itemId ? { ...item, imported } : item);
        updateProjectData(activeProjectId, 'authors', updatedItems as Author[]);
        break;
      case 'facts':
        updatedItems = activeProject.funFacts.map(item => item.id === itemId ? { ...item, selected: imported } : item);
        updateProjectData(activeProjectId, 'funFacts', updatedItems as FunFactItem[]);
        break;
      case 'tools':
        updatedItems = activeProject.tools.map(item => item.id === itemId ? { ...item, selected: imported } : item);
        updateProjectData(activeProjectId, 'tools', updatedItems as ToolItem[]);
        break;
      case 'newsletters':
        updatedItems = activeProject.newsletters.map(item => item.id === itemId ? { ...item, selected: imported } : item);
        updateProjectData(activeProjectId, 'newsletters', updatedItems as NewsletterItem[]);
        break;
      case 'podcasts':
        updatedItems = activeProject.podcasts.map(item => item.id === itemId ? { ...item, selected: imported } : item);
        updateProjectData(activeProjectId, 'podcasts', updatedItems as PodcastItem[]);
        break;
    }
  };

  const handleToggleItemSavedStatus = (itemId: string, saved: boolean, type: ContentType) => {
    if (!activeProject || !activeProjectId) return;
    let updatedItems;
    switch (type) {
        case 'authors':
            updatedItems = activeProject.authors.map(item => item.id === itemId ? { ...item, saved } : item);
            updateProjectData(activeProjectId, 'authors', updatedItems as Author[]);
            break;
        case 'facts':
            updatedItems = activeProject.funFacts.map(item => item.id === itemId ? { ...item, saved } : item);
            updateProjectData(activeProjectId, 'funFacts', updatedItems as FunFactItem[]);
            break;
        case 'tools':
            updatedItems = activeProject.tools.map(item => item.id === itemId ? { ...item, saved } : item);
            updateProjectData(activeProjectId, 'tools', updatedItems as ToolItem[]);
            break;
        case 'newsletters':
            updatedItems = activeProject.newsletters.map(item => item.id === itemId ? { ...item, saved } : item);
            updateProjectData(activeProjectId, 'newsletters', updatedItems as NewsletterItem[]);
            break;
        case 'podcasts':
            updatedItems = activeProject.podcasts.map(item => item.id === itemId ? { ...item, saved } : item);
            updateProjectData(activeProjectId, 'podcasts', updatedItems as PodcastItem[]);
            break;
    }
    toast({ title: saved ? "Item Saved!" : "Item Unsaved", variant: "default" });
  };


  const importedAuthors = useMemo(() => activeProject?.authors.filter(author => author.imported) || [], [activeProject]);
  const selectedFunFacts = useMemo(() => activeProject?.funFacts.filter(item => item.selected) || [], [activeProject]);
  const selectedTools = useMemo(() => activeProject?.tools.filter(item => item.selected) || [], [activeProject]);
  const selectedNewsletters = useMemo(() => activeProject?.newsletters.filter(item => item.selected) || [], [activeProject]);
  const selectedPodcasts = useMemo(() => activeProject?.podcasts.filter(item => item.selected) || [], [activeProject]);


  // Centralized filter logic
  const baseContentFilter = (items: GeneratedContent[]) => {
    if (!activeProject) return []; // Ensure activeProject is available
    let filtered = items;
    if (currentWorkspaceView === 'savedItems') {
      filtered = filtered.filter(item => item.saved);
    }
    if (showOnlySelected) { // "Show Only Selected" filter
      // 'imported' for authors, 'selected' for others
      filtered = filtered.filter(item => 'imported' in item ? item.imported : ('selected' in item ? item.selected : false));
    }
    return filtered;
  };

  const uniqueAuthorNamesForFilter = useMemo(() => {
    if (!activeProject) return [];
    // Apply base filters (saved/selected) before extracting unique names
    const authorsToConsider = baseContentFilter(activeProject.authors) as Author[];
    const names = new Set(authorsToConsider.map(author => author.authorNameKey));
    return Array.from(names);
  }, [activeProject, currentWorkspaceView, showOnlySelected]); // Depends on these states

  const sortedAndFilteredAuthors = useMemo(() => {
    if (!activeProject) return [];
    let tempAuthors = baseContentFilter(activeProject.authors) as Author[];

    if (selectedAuthorFilter !== "all" && selectedAuthorFilter) {
      tempAuthors = tempAuthors.filter(author => author.authorNameKey === selectedAuthorFilter);
    }
    // Default sort is relevance_desc now set in useState
    switch (authorSortOption) {
      case "relevance_desc": tempAuthors.sort((a, b) => b.relevanceScore - a.relevanceScore); break;
      case "relevance_asc": tempAuthors.sort((a, b) => a.relevanceScore - b.relevanceScore); break;
      case "name_asc": tempAuthors.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name_desc": tempAuthors.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: tempAuthors.sort((a, b) => b.relevanceScore - a.relevanceScore); break; // Should match default state
    }
    return tempAuthors;
  }, [activeProject, selectedAuthorFilter, authorSortOption, currentWorkspaceView, showOnlySelected]); // Recalculate if these change

  const filteredFunFacts = useMemo(() => {
    if(!activeProject) return [];
    let facts = baseContentFilter(activeProject.funFacts) as FunFactItem[];
    facts.sort((a,b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)); // Default sort
    return facts;
  }, [activeProject, currentWorkspaceView, showOnlySelected]);

  const filteredTools = useMemo(() => {
    if(!activeProject) return [];
    let tools = baseContentFilter(activeProject.tools) as ToolItem[];
    tools.sort((a,b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)); // Default sort
    return tools;
  }, [activeProject, currentWorkspaceView, showOnlySelected]);

  const filteredNewsletters = useMemo(() => {
     if(!activeProject) return [];
    let newsletters = baseContentFilter(activeProject.newsletters) as NewsletterItem[];
    newsletters.sort((a,b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)); // Default sort
    return newsletters;
  }, [activeProject, currentWorkspaceView, showOnlySelected]);

  const filteredPodcasts = useMemo(() => {
     if(!activeProject) return [];
    let podcasts = baseContentFilter(activeProject.podcasts) as PodcastItem[];
    podcasts.sort((a,b) => (b.relevanceScore || 0) - (a.relevanceScore || 0)); // Default sort
    return podcasts;
  }, [activeProject, currentWorkspaceView, showOnlySelected]);


  const handleStylesChange = (newStyles: NewsletterStyles) => {
    if (!activeProjectId || !activeProject) return;
    updateProjectData(activeProjectId, 'styles', newStyles);
  };

   const handleStyleChatSubmit = async (description: string) => {
    if (!activeProjectId || !activeProject) {
      toast({ title: "Error", description: "No active project selected.", variant: "destructive" });
      return;
    }
    setIsStyleChatLoading(true);
    try {
      const newStylesOutput = await generateStylesFromChatAction({ styleDescription: description });
      const updatedStyles = { ...activeProject.styles, ...newStylesOutput.styles }; // Merge, new takes precedence
      handleStylesChange(updatedStyles); // Update project state
      toast({ title: "Styles Updated!", description: "Newsletter styles have been updated based on your description." });
      setIsStyleChatOpen(false); // Close dialog on success
    } catch (err: any) {
      toast({ title: "Style Generation Failed", description: err.message || "Could not update styles.", variant: "destructive" });
    } finally {
      setIsStyleChatLoading(false);
    }
  };


  // Helper functions for UI rendering
  const contentTypeToIcon = (type: ContentType | 'savedItems') => {
    if (type === 'savedItems') return <Bookmark size={16} />; // Icon for Saved Items view
    switch (type) {
      case 'authors': return <UsersRound size={16} />;
      case 'facts': return <Lightbulb size={16} />;
      case 'tools': return <Wrench size={16} />;
      case 'newsletters': return <Newspaper size={16} />;
      case 'podcasts': return <PodcastIconLucide size={16} />;
      default: return null;
    }
  }
  const contentTypeToLabel = (type: ContentType | 'savedItems') => {
     if (type === 'savedItems') return "Saved Items";
     switch (type) {
      case 'authors': return "Authors & Quotes";
      case 'facts': return "Fun Facts";
      case 'tools': return "Productivity Tools";
      case 'newsletters': return "Newsletters";
      case 'podcasts': return "Podcasts";
      default: return "";
    }
  }

  // Determine if generate button should be disabled
  const allProjectTypesGenerated = activeProject && ALL_CONTENT_TYPES.every(type => activeProject.generatedContentTypes.includes(type));
  // Check if selected types for generation are ALL among those already generated
  const noNewTypesSelectedForGeneration = activeProject && selectedContentTypesForGeneration.length > 0 && selectedContentTypesForGeneration.every(type => activeProject.generatedContentTypes.includes(type));

  const isGenerateButtonDisabled =
    isGenerating || // Disabled if already generating
    !currentTopic.trim() || // Disabled if no topic
    selectedContentTypesForGeneration.length === 0 || // Disabled if no content types selected
    (currentWorkspaceView !== 'savedItems' && (allProjectTypesGenerated || noNewTypesSelectedForGeneration)); // Disabled if all types are generated OR all selected types are already generated


  if (!isClientHydrated || !activeProject) { // Show loading state until client is hydrated and active project is determined
    return (
      <div className="flex h-screen items-center justify-center p-6 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mr-4" />
        <p className="text-xl text-muted-foreground">
          {isClientHydrated && projects.length === 0 ? "Creating initial project..." : "Loading project data..."}
        </p>
      </div>
    );
  }

  const projectToRender = activeProject; // Ensure we use the derived activeProject for rendering

  // Fallback if for some reason activeProject is null after hydration (should be handled by useEffect)
  if (!projectToRender) {
      return (
          <div className="flex h-screen items-center justify-center p-6">
              <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4"/>
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>Could not load project data. Please refresh.</AlertDescription>
              </Alert>
          </div>
      )
  }


  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => {
            if (projects.find(p => p.id === id)) {
              setActiveProjectId(id);
              setCurrentWorkspaceView('authors'); // Reset to default view for the project
              setActiveUITab('authors'); // Reset tab
               setShowOnlySelected(false); // Reset filter
            } else {
              // Handle case where project ID is not found (e.g., after deletion)
              if (projects.length > 0) {
                setActiveProjectId(projects[0].id);
                setCurrentWorkspaceView('authors');
                setActiveUITab('authors');
                setShowOnlySelected(false);
              }
              else setActiveProjectId(null); // No projects left
            }
          }}
          onNewProject={handleNewProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={(projectId) => {
              setProjects(prev => {
                  const remainingProjects = prev.filter(p => p.id !== projectId);
                  if (activeProjectId === projectId) { // If active project is deleted
                      if (remainingProjects.length > 0) {
                          setActiveProjectId(remainingProjects[0].id); // Activate the new first one
                          setCurrentWorkspaceView('authors'); // Reset view
                          setActiveUITab('authors');
                           setShowOnlySelected(false);
                      } else {
                          setActiveProjectId(null); // No projects left
                      }
                  }
                  return remainingProjects;
              });
              toast({title: "Project Deleted"});
          }}
          onSelectSavedItemsView={() => {
            setCurrentWorkspaceView('savedItems');
            setShowOnlySelected(false); // Reset show selected filter for saved items view
            // Set active tab to the first type that has saved items, or default
            const firstSavedType = ALL_CONTENT_TYPES.find(type => {
                switch (type) {
                    case 'authors': return projectToRender.authors.some(a=>a.saved);
                    case 'facts': return projectToRender.funFacts.some(f=>f.saved);
                    case 'tools': return projectToRender.tools.some(t=>t.saved);
                    case 'newsletters': return projectToRender.newsletters.some(n=>n.saved);
                    case 'podcasts': return projectToRender.podcasts.some(p=>p.saved);
                    default: return false;
                }
            }) || 'authors'; // Default to authors if no saved items
            setActiveUITab(firstSavedType);
          }}
          isSavedItemsActive={currentWorkspaceView === 'savedItems'}
          // Style related props passed to AppSidebar, then to StyleCustomizer/ChatDialog
          initialStyles={projectToRender.styles}
          onStylesChange={handleStylesChange}
          isStyleChatOpen={isStyleChatOpen}
          onSetIsStyleChatOpen={setIsStyleChatOpen}
          onStyleChatSubmit={handleStyleChatSubmit}
          isLoadingStyleChat={isStyleChatLoading}
        />

        {/* Main Content Area (Center + Right Preview) */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Dimmer for expanded sidebar overlay (desktop floating variant) */}
          {!isMobile && sidebarState === 'expanded' && (
            <div
              className="absolute inset-0 bg-black/30 dark:bg-black/50 z-30 transition-opacity duration-300"
              onClick={() => toggleAppSidebar()}
            />
          )}
          
          {/* Center Column */}
          <ScrollArea className="flex-1 h-full" id="center-column-scroll">
            <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-6">

              {/* Project Title */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 sm:pt-6 gap-3">
                <div className="flex-grow min-w-0"> {/* Added min-w-0 for better truncation */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary truncate" title={projectToRender.name}>
                      {projectToRender.name}
                    </h1>
                </div>
              </div>

              {/* Content Generation Section - Only if not in 'savedItems' view */}
              {currentWorkspaceView !== 'savedItems' && (
                <Card className="p-4 sm:p-6 rounded-lg shadow-xl bg-card">
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
                        onChange={(e) => setCurrentTopic(e.target.value)}
                        placeholder="Enter topic (e.g. AI in marketing, Sustainable Energy)"
                        className="flex-grow text-sm sm:text-base py-2.5" // Adjusted padding
                        disabled={isGenerating}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full sm:w-auto min-w-[180px] sm:min-w-[200px] justify-between py-2.5" disabled={isGenerating}>
                            {selectedContentTypesForGeneration.length === 0
                              ? "Select Content Types"
                              : selectedContentTypesForGeneration.length === 1
                                ? contentTypeToLabel(selectedContentTypesForGeneration[0])
                                : selectedContentTypesForGeneration.length === ALL_CONTENT_TYPES.filter(type => !projectToRender.generatedContentTypes.includes(type)).length && selectedContentTypesForGeneration.length > 0
                                  ? "All New Types"
                                  : `${selectedContentTypesForGeneration.length} Types Selected`}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-60 sm:w-64 z-50"> {/* Increased z-index */}
                          <DropdownMenuLabel>Select Content Types</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={isAllContentTypesForGenerationSelected}
                            onCheckedChange={handleSelectAllContentTypesForGeneration}
                            onSelect={(e) => e.preventDefault()} // Prevent closing on select
                            disabled={ALL_CONTENT_TYPES.every(type => projectToRender.generatedContentTypes.includes(type))} // Disable if all types already generated
                          >
                            All New (Ungenerated)
                          </DropdownMenuCheckboxItem>
                          {ALL_CONTENT_TYPES.map(type => (
                            <DropdownMenuCheckboxItem
                              key={type}
                              checked={selectedContentTypesForGeneration.includes(type)}
                              onCheckedChange={() => toggleContentTypeForGeneration(type)}
                              disabled={projectToRender.generatedContentTypes.includes(type)} // Disable if already generated
                              onSelect={(e) => e.preventDefault()} // Prevent closing on select
                            >
                              {contentTypeToLabel(type)}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Button
                        onClick={handleGenerateContent}
                        disabled={isGenerateButtonDisabled}
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground py-2.5"
                      >
                        {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Generate
                      </Button>
                    </div>
                    {/* Generation Progress Indicator and Messages */}
                    <GenerationProgressIndicator
                      isVisible={isGenerating}
                      progress={generationProgress}
                      message={currentGenerationMessage}
                    />
                    {/* User guidance messages when not generating */}
                    {!isGenerating && (
                      <>
                        {!currentTopic.trim() && <Alert variant="destructive" className="mt-3"><Info className="h-4 w-4" /><AlertDescription>Please enter a topic to start.</AlertDescription></Alert>}
                        {currentTopic.trim() && selectedContentTypesForGeneration.length === 0 && <Alert variant="destructive" className="mt-3"><Info className="h-4 w-4" /><AlertDescription>Please select at least one content type to generate.</AlertDescription></Alert>}
                        {currentTopic.trim() && selectedContentTypesForGeneration.length > 0 && isGenerateButtonDisabled && (
                            <Alert variant="default" className="mt-3 bg-muted/50">
                                <Info className="h-4 w-4 text-primary" />
                                <AlertDescription>
                                    {allProjectTypesGenerated ? "All content types have been generated for this project." : (noNewTypesSelectedForGeneration ? "All selected content types have already been generated. Choose different types or start a new project." : "Ready to generate content!")}
                                </AlertDescription>
                            </Alert>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              <Separator className="my-6 sm:my-8" />

              {/* Content Type Tabs & Filters */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-4">
                  <div className="flex-grow w-full md:w-auto relative">
                      {/* Tabs for content types - show only if not generating OR generation is fully complete */}
                      {(!isGenerating || generationProgress === 100) && displayableTabs.length > 0 && (
                          <Tabs value={activeUITab} onValueChange={(value) => setActiveUITab(value as ContentType)} className="w-full">
                             <TabsList className={cn("flex flex-wrap gap-2 sm:gap-3 py-1.5 !bg-transparent !p-0 justify-start")}>
                                  {displayableTabs.map(type => (
                                    <TooltipProvider key={type} delayDuration={300}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <TabsTrigger
                                              value={type}
                                              disabled={isGenerating} // Disable tabs during generation
                                              className={cn(
                                                  "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border !shadow-none bg-card text-foreground border-border hover:bg-accent/10 gap-1.5 sm:gap-2",
                                                  activeUITab === type ? "bg-primary text-primary-foreground border-2 border-accent hover:bg-primary/90" : "hover:border-primary"
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
                                    </TooltipProvider>
                                  ))}
                              </TabsList>
                          </Tabs>
                      )}
                  </div>
                  {/* "Show Only Selected" Filter - show only if not generating OR generation is fully complete AND there's content */}
                  {(!isGenerating || generationProgress === 100) && (activeProject?.generatedContentTypes.length > 0 || (currentWorkspaceView === 'savedItems' && (projectToRender.authors.some(a=>a.saved) || projectToRender.funFacts.some(f=>f.saved) || projectToRender.tools.some(t=>t.saved) || projectToRender.newsletters.some(n=>n.saved) || projectToRender.podcasts.some(p=>p.saved) ) ) ) && (
                    <div className="flex items-center space-x-2 self-center md:self-end flex-shrink-0 mt-2 md:mt-0">
                      <Switch
                        id="show-selected-filter"
                        checked={showOnlySelected}
                        onCheckedChange={setShowOnlySelected}
                        aria-label="Show only selected items"
                      />
                      <Label htmlFor="show-selected-filter" className="text-sm">Show Only Selected</Label>
                    </div>
                  )}
              </div>

              {/* Authors Section */}
              {activeUITab === 'authors' && (!isGenerating || generationProgress === 100) && ( (currentWorkspaceView === 'savedItems' || displayableTabs.includes('authors')) && sortedAndFilteredAuthors.length > 0 ) && (
                <>
                  {/* Author Filters - Show if multiple authors or sort option changed */}
                  {(uniqueAuthorNamesForFilter.length > 0 || authorSortOption !== 'relevance_desc') && (
                    <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-3 sm:gap-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between py-2 sm:py-2.5">
                            <Filter className="mr-2 h-4 w-4" />
                            {selectedAuthorFilter === "all" ? "All Authors" : selectedAuthorFilter}
                            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="z-50"> {/* Ensure dropdown is above other content */}
                          <DropdownMenuCheckboxItem
                            checked={selectedAuthorFilter === "all"}
                            onCheckedChange={() => setSelectedAuthorFilter("all")}
                            onSelect={(e) => e.preventDefault()}
                          >
                            All Authors
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuSeparator />
                          {uniqueAuthorNamesForFilter.map(name => (
                            <DropdownMenuCheckboxItem
                              key={name}
                              checked={selectedAuthorFilter === name}
                              onCheckedChange={() => setSelectedAuthorFilter(name)}
                              onSelect={(e) => e.preventDefault()}
                            >
                              {name}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between py-2 sm:py-2.5">
                            <ArrowUpDown className="mr-2 h-4 w-4" /> Sort By
                            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50"> {/* Ensure dropdown is above */}
                          {[
                            { value: "relevance_desc", label: "Relevance (High-Low)" },
                            { value: "relevance_asc", label: "Relevance (Low-High)" },
                            { value: "name_asc", label: "Name (A-Z)" },
                            { value: "name_desc", label: "Name (Z-A)" },
                          ].map(option => (
                            <DropdownMenuCheckboxItem
                              key={option.value}
                              checked={authorSortOption === option.value}
                              onCheckedChange={() => setAuthorSortOption(option.value as AuthorSortOption)}
                              onSelect={(e) => e.preventDefault()}
                            >
                              {option.label}
                            </DropdownMenuCheckboxItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                  <ScrollArea className="h-[calc(100vh-500px)] sm:h-[calc(100vh-450px)] min-h-[300px] p-0.5 -m-0.5 rounded-md border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
                      {sortedAndFilteredAuthors.map((authorItem) => (
                        <ContentItemCard
                          key={authorItem.id}
                          id={authorItem.id}
                          title={authorItem.name}
                          typeBadge="Author"
                          isImported={authorItem.imported}
                          isSaved={authorItem.saved}
                          onToggleImport={(id, imp) => toggleItemImportStatus(id, imp, 'authors')}
                          onToggleSave={(id, svd) => handleToggleItemSavedStatus(id, svd, 'authors')}
                          className="flex flex-col h-full" // Ensures cards in a row have same height
                          relevanceScore={authorItem.relevanceScore}
                          content={
                            <div className="space-y-2">
                              <p className="text-xs text-muted-foreground italic">{authorItem.titleOrKnownFor}</p>
                              <blockquote className="border-l-2 pl-3 text-sm italic">
                                "{authorItem.quote}"
                              </blockquote>
                              <p className="text-xs text-muted-foreground">
                                Source: {authorItem.quoteSource}
                              </p>
                            </div>
                          }
                          amazonLink={authorItem.amazonLink}
                          itemData={authorItem} // Pass full item data if needed by card
                        />
                      ))}
                      {/* Placeholder if no authors match filters or none generated */}
                      {sortedAndFilteredAuthors.length === 0 && (currentWorkspaceView !== 'savedItems' && !projectToRender.generatedContentTypes.includes('authors')) && (
                        <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">No authors generated yet. Try generating some!</p>
                      )}
                      {sortedAndFilteredAuthors.length === 0 && (currentWorkspaceView === 'savedItems' || projectToRender.generatedContentTypes.includes('authors')) && (
                         <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">
                           {currentWorkspaceView === 'savedItems' ? (showOnlySelected ? "No saved authors are selected." : "No authors saved." ) : (showOnlySelected ? "No generated authors are selected." : "No authors match your filters.")}
                         </p>
                      )}
                    </div>
                  </ScrollArea>
                </>
              )}

             {/* Fun Facts Section */}
             {activeUITab === 'facts' && (!isGenerating || generationProgress === 100) && ( (currentWorkspaceView === 'savedItems' || displayableTabs.includes('facts')) && filteredFunFacts.length > 0 ) && (
                 <ScrollArea className="h-[calc(100vh-500px)] sm:h-[calc(100vh-450px)] min-h-[300px] p-0.5 -m-0.5 rounded-md border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
                    {filteredFunFacts.map((fact) => (
                      <ContentItemCard
                        key={fact.id} id={fact.id} content={fact.text}
                        typeBadge={fact.type === "fun" ? "Fun Fact" : "Science Fact"}
                        isImported={fact.selected} // Use 'selected' for facts
                        isSaved={fact.saved}
                        onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'facts')}
                        onToggleSave={(id, svd) => handleToggleItemSavedStatus(id, svd, 'facts')}
                        relevanceScore={fact.relevanceScore}
                        sourceLinkFact={fact.sourceLink}
                        itemData={fact}
                      />
                    ))}
                    {/* Placeholder if no facts */}
                    {filteredFunFacts.length === 0 && (currentWorkspaceView !== 'savedItems' && !projectToRender.generatedContentTypes.includes('facts')) && (
                        <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">No facts generated yet. Try generating some!</p>
                    )}
                    {filteredFunFacts.length === 0 && (currentWorkspaceView === 'savedItems' || projectToRender.generatedContentTypes.includes('facts')) && (
                        <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">
                            {currentWorkspaceView === 'savedItems' ? (showOnlySelected ? "No saved facts are selected." : "No facts saved.") : (showOnlySelected ? "No generated facts are selected." : "No facts generated yet.")}
                        </p>
                    )}
                  </div>
                </ScrollArea>
              )}
              {/* Tools Section */}
              {activeUITab === 'tools' && (!isGenerating || generationProgress === 100) && ( (currentWorkspaceView === 'savedItems' || displayableTabs.includes('tools')) && filteredTools.length > 0 ) && (
                <ScrollArea className="h-[calc(100vh-500px)] sm:h-[calc(100vh-450px)] min-h-[300px] p-0.5 -m-0.5 rounded-md border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
                    {filteredTools.map((tool) => (
                      <ContentItemCard
                        key={tool.id} id={tool.id} title={tool.name}
                        typeBadge={tool.type === "free" ? "Free Tool" : "Paid Tool"}
                        isImported={tool.selected} // Use 'selected' for tools
                        isSaved={tool.saved}
                        onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'tools')}
                        onToggleSave={(id, svd) => handleToggleItemSavedStatus(id, svd, 'tools')}
                        relevanceScore={tool.relevanceScore}
                        freeTrialPeriod={tool.freeTrialPeriod}
                        itemData={tool} content="" // No main content string for tools, info is in fields
                      />
                    ))}
                     {/* Placeholder if no tools */}
                     {filteredTools.length === 0 && (currentWorkspaceView !== 'savedItems' && !projectToRender.generatedContentTypes.includes('tools')) && (
                        <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">No tools generated yet. Try generating some!</p>
                    )}
                    {filteredTools.length === 0 && (currentWorkspaceView === 'savedItems' || projectToRender.generatedContentTypes.includes('tools')) && (
                        <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">
                            {currentWorkspaceView === 'savedItems' ? (showOnlySelected ? "No saved tools are selected." : "No tools saved.") : (showOnlySelected ? "No generated tools are selected." : "No tools generated yet.")}
                        </p>
                    )}
                  </div>
                </ScrollArea>
              )}
              {/* Newsletters Section */}
              {activeUITab === 'newsletters' && (!isGenerating || generationProgress === 100) && ( (currentWorkspaceView === 'savedItems' || displayableTabs.includes('newsletters')) && filteredNewsletters.length > 0 ) && (
                <ScrollArea className="h-[calc(100vh-500px)] sm:h-[calc(100vh-450px)] min-h-[300px] p-0.5 -m-0.5 rounded-md border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
                    {filteredNewsletters.map((nl) => (
                      <ContentItemCard
                        key={nl.id} id={nl.id} title={nl.name} typeBadge="Newsletter"
                        isImported={nl.selected} // Use 'selected'
                        isSaved={nl.saved}
                        onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'newsletters')}
                        onToggleSave={(id, svd) => handleToggleItemSavedStatus(id, svd, 'newsletters')}
                        relevanceScore={nl.relevanceScore} content="" // Main content string not used
                        newsletterOperator={nl.operator} newsletterDescription={nl.description}
                        newsletterSubscribers={nl.subscribers} signUpLink={nl.signUpLink}
                        newsletterFrequency={nl.frequency} newsletterCoveredTopics={nl.coveredTopics}
                        itemData={nl}
                      />
                    ))}
                    {/* Placeholder if no newsletters */}
                    {filteredNewsletters.length === 0 && (currentWorkspaceView !== 'savedItems' && !projectToRender.generatedContentTypes.includes('newsletters')) && (
                        <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">No newsletters generated yet. Try generating some!</p>
                    )}
                    {filteredNewsletters.length === 0 && (currentWorkspaceView === 'savedItems' || projectToRender.generatedContentTypes.includes('newsletters')) && (
                        <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">
                           {currentWorkspaceView === 'savedItems' ? (showOnlySelected ? "No saved newsletters are selected." : "No newsletters saved.") : (showOnlySelected ? "No generated newsletters are selected." : "No newsletters generated yet.")}
                        </p>
                    )}
                  </div>
                </ScrollArea>
              )}
              {/* Podcasts Section */}
              {activeUITab === 'podcasts' && (!isGenerating || generationProgress === 100) && ( (currentWorkspaceView === 'savedItems' || displayableTabs.includes('podcasts')) && filteredPodcasts.length > 0 ) && (
                <ScrollArea className="h-[calc(100vh-500px)] sm:h-[calc(100vh-450px)] min-h-[300px] p-0.5 -m-0.5 rounded-md border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
                    {filteredPodcasts.map((podcast) => (
                      <ContentItemCard
                        key={podcast.id}
                        id={podcast.id}
                        title={podcast.name}
                        typeBadge="Podcast"
                        isImported={podcast.selected} // Use 'selected'
                        isSaved={podcast.saved}
                        onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'podcasts')}
                        onToggleSave={(id, svd) => handleToggleItemSavedStatus(id, svd, 'podcasts')}
                        relevanceScore={podcast.relevanceScore}
                        content={ // podcast.description is used here
                          <div className="space-y-1 text-sm">
                            <p className="font-medium text-muted-foreground">{podcast.episodeTitle}</p>
                            <p className="text-xs text-foreground/80 line-clamp-3">{podcast.description}</p>
                          </div>
                        }
                        itemData={podcast}
                        signUpLink={podcast.podcastLink} // Used for "Listen Here" button
                        podcastFrequency={podcast.frequency} podcastTopics={podcast.topics}
                      />
                    ))}
                    {/* Placeholder if no podcasts */}
                    {filteredPodcasts.length === 0 && (currentWorkspaceView !== 'savedItems' && !projectToRender.generatedContentTypes.includes('podcasts')) && (
                        <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">No podcasts generated yet. Try generating some!</p>
                    )}
                    {filteredPodcasts.length === 0 && (currentWorkspaceView === 'savedItems' || projectToRender.generatedContentTypes.includes('podcasts')) && (
                        <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">
                            {currentWorkspaceView === 'savedItems' ? (showOnlySelected ? "No saved podcasts are selected." : "No podcasts saved.") : (showOnlySelected ? "No generated podcasts are selected." : "No podcasts generated yet.")}
                        </p>
                    )}
                  </div>
                </ScrollArea>
              )}

              {/* Message if no content type tabs are displayable */}
              {(displayableTabs.length === 0 && (!isGenerating || generationProgress === 100) && (
                <div className="text-center py-10 text-muted-foreground">
                  {currentWorkspaceView === 'savedItems' ?
                    (showOnlySelected ? 'No saved items are currently selected for the newsletter.' : 'No items saved yet in this project.') :
                    (showOnlySelected ? 'No generated items are currently selected for the newsletter.' : 'No content generated yet for this project. Try generating some!')
                  }
                </div>
              ))}

            </div> {/* End Container for Centered Content */}
          </ScrollArea>

          {/* Right Preview Column */}
           <div className="hidden md:flex flex-col h-full bg-card border-l shadow-lg w-2/5 lg:w-1/3 relative">
             <div className="p-4 md:p-6 border-b flex justify-between items-center gap-2">
                <h2 className="text-xl font-semibold text-primary">Preview</h2>
                <div className="flex items-center gap-2">
                    <StyleCustomizer initialStyles={projectToRender.styles} onStylesChange={handleStylesChange}>
                        <Button variant="ghost" size="icon" tooltip="Customize Styles">
                            <Palette size={18} />
                        </Button>
                    </StyleCustomizer>
                    <Button variant="ghost" size="icon" onClick={() => setIsStyleChatOpen(true)} tooltip="Chat for Styling">
                        <MessageSquarePlus size={18} />
                    </Button>
                </div>
             </div>
            <ScrollArea className="flex-1 w-full">
              <div className="p-4 md:p-6">
                <NewsletterPreview
                  selectedAuthors={importedAuthors}
                  selectedFunFacts={selectedFunFacts}
                  selectedTools={selectedTools}
                  selectedAggregatedContent={selectedNewsletters} // Pass newsletters here
                  selectedPodcasts={selectedPodcasts} // Pass podcasts here
                  styles={projectToRender.styles}
                />
              </div>
            </ScrollArea>
          </div>
        </div> {/* End Main Flex Container for Center + Right */}
      </div> {/* End Root Flex Container */}
      <StyleChatDialog
        isOpen={isStyleChatOpen}
        onOpenChange={setIsStyleChatOpen}
        onSubmit={handleStyleChatSubmit}
        isLoading={isStyleChatLoading}
      />
    </TooltipProvider>
  );
}
