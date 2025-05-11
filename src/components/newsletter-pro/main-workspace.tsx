// src/components/newsletter-pro/main-workspace.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
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
  SortOption,
} from "./types";
import { ALL_CONTENT_TYPES, COMMON_FREQUENCIES } from "./types";

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
import { Loader2, UsersRound, Lightbulb, Wrench, Newspaper, Podcast as PodcastIconLucide, ChevronDown, Filter, ArrowUpDown, Bookmark, Info, Palette, MessageSquarePlus, LayoutDashboard, Droplet } from "lucide-react";
import { cn } from "@/lib/utils";
import { StyleCustomizer } from "./style-customizer";
import { StyleChatDialog } from "./style-chat-dialog";
import { BackdropCustomizer } from "./backdrop-customizer";


const initialStyles: NewsletterStyles = {
  headingFont: "Inter, sans-serif",
  paragraphFont: "Inter, sans-serif",
  hyperlinkFont: "Inter, sans-serif",
  headingColor: "#111827",
  paragraphColor: "#374151",
  hyperlinkColor: "#008080",
  backgroundColor: "#FFFFFF",
  subjectLineText: "Your Weekly Insights",
  previewLineText: "Catch up on the latest trends and ideas!",
  authorsHeadingText: "Inspiring Authors & Quotes",
  factsHeadingText: "Did You Know?",
  toolsHeadingText: "Recommended Tools",
  newslettersHeadingText: "Recommended Newsletters",
  podcastsHeadingText: "Recommended Podcasts",
  workspaceBackdropType: 'none',
  workspaceBackdropSolidColor: '#FFFFFF',
  workspaceBackdropGradientStart: '#FFFFFF',
  workspaceBackdropGradientEnd: '#DDDDDD',
  workspaceBackdropImageURL: '',
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

const DEFAULT_SORT_OPTION: SortOption['value'] = "relevanceScore_desc";

const commonSortOptions: SortOption[] = [
  { value: "relevanceScore_desc", label: "Relevance (High-Low)" },
  { value: "relevanceScore_asc", label: "Relevance (Low-High)" },
];

const nameSortOptions: SortOption[] = [
  ...commonSortOptions,
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
];

const textSortOptions: SortOption[] = [ // For facts
  ...commonSortOptions,
  { value: "text_asc", label: "Text (A-Z)" },
  { value: "text_desc", label: "Text (Z-A)" },
];


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

  // Filters & Sort State
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<string>("all"); // Authors
  const [authorSortOption, setAuthorSortOption] = useState<AuthorSortOption>("relevance_desc");

  const [funFactTypeFilter, setFunFactTypeFilter] = useState<"all" | "fun" | "science">("all"); // Facts
  const [funFactSortOption, setFunFactSortOption] = useState<SortOption['value']>(DEFAULT_SORT_OPTION);

  const [toolTypeFilter, setToolTypeFilter] = useState<"all" | "free" | "paid">("all"); // Tools
  const [toolSortOption, setToolSortOption] = useState<SortOption['value']>(DEFAULT_SORT_OPTION);

  const [newsletterFrequencyFilter, setNewsletterFrequencyFilter] = useState<string>("all"); // Newsletters
  const [newsletterSortOption, setNewsletterSortOption] = useState<SortOption['value']>(DEFAULT_SORT_OPTION);

  const [podcastFrequencyFilter, setPodcastFrequencyFilter] = useState<string>("all"); // Podcasts
  const [podcastSortOption, setPodcastSortOption] = useState<SortOption['value']>(DEFAULT_SORT_OPTION);


  const [isStyleChatOpen, setIsStyleChatOpen] = useState(false);
  const [isStyleChatLoading, setIsStyleChatLoading] = useState(false);
  const [isBackdropCustomizerOpen, setIsBackdropCustomizerOpen] = useState(false);


  const [currentWorkspaceView, setCurrentWorkspaceView] = useState<WorkspaceView>('authors');
  const [activeUITab, setActiveUITab] = useState<ContentType>(ALL_CONTENT_TYPES[0]);
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  const { toast } = useToast();
  const { state: sidebarState, isMobile, toggleSidebar } = useSidebar();

  const activeProject = useMemo(() => {
    if (!activeProjectId) return null;
    return projects.find(p => p.id === activeProjectId);
  }, [projects, activeProjectId]);


  const getRawItemsForView = useCallback((type: ContentType): GeneratedContent[] => {
    if (!activeProject) return [];
    const isGeneratedForProjectType = activeProject.generatedContentTypes.includes(type);

    let baseItems: GeneratedContent[] = [];
    switch (type) {
        case 'authors': baseItems = activeProject.authors; break;
        case 'facts': baseItems = activeProject.funFacts; break;
        case 'tools': baseItems = activeProject.tools; break;
        case 'newsletters': baseItems = activeProject.newsletters; break;
        case 'podcasts': baseItems = activeProject.podcasts; break;
        default: return [];
    }

    if (currentWorkspaceView === 'savedItems') {
        return baseItems.filter(item => item.saved);
    } else {
        return isGeneratedForProjectType ? baseItems : [];
    }
  }, [activeProject, currentWorkspaceView]);


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
        return items.length > 0;
    });
  }, [activeProject, currentWorkspaceView]);

  useEffect(() => {
    if (displayableTabs.length > 0 && !displayableTabs.includes(activeUITab)) {
      setActiveUITab(displayableTabs[0]);
    } else if (displayableTabs.length === 0 && activeProject?.generatedContentTypes && activeProject.generatedContentTypes.length > 0) {
       const firstGenerated = activeProject.generatedContentTypes.find(type => getRawItemsForView(type).length > 0);
       setActiveUITab(firstGenerated || ALL_CONTENT_TYPES[0]);
    } else if (displayableTabs.length === 0 && (!activeProject?.generatedContentTypes || activeProject.generatedContentTypes.length === 0)) {
      setActiveUITab(ALL_CONTENT_TYPES[0]);
    }
  }, [displayableTabs, activeUITab, activeProject, getRawItemsForView]);


  useEffect(() => {
    const storedProjectsString = localStorage.getItem('newsletterProProjects');
    let projectsToLoad: Project[] = [];
    let activeIdToLoad: string | null = null;

    if (storedProjectsString) {
      try {
        const parsedProjects = JSON.parse(storedProjectsString);
        if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
          projectsToLoad = parsedProjects.map((p: any) => ({
            ...createNewProject(''),
            ...p,
            styles: {...initialStyles, ...p.styles},
            generatedContentTypes: p.generatedContentTypes || [],
            authors: p.authors?.map((a: any) => ({ ...a, saved: a.saved ?? false, imported: a.imported ?? false })) || [],
            funFacts: p.funFacts?.map((f: any) => ({ ...f, saved: f.saved ?? false, selected: f.selected ?? false })) || [],
            tools: p.tools?.map((t: any) => ({ ...t, saved: t.saved ?? false, selected: t.selected ?? false })) || [],
            newsletters: p.newsletters?.map((n: any) => ({ ...n, saved: n.saved ?? false, selected: n.selected ?? false })) || [],
            podcasts: p.podcasts?.map((pc: any) => ({ ...pc, saved: pc.saved ?? false, selected: pc.selected ?? false })) || [],
          }));
        }
      } catch (e) {
        console.error("Failed to parse projects from localStorage", e);
      }
    }

    if (projectsToLoad.length === 0) {
        const newFirstProject = createNewProject(`local-${Date.now().toString().slice(-5)}`, "My First Project");
        projectsToLoad = [newFirstProject];
        activeIdToLoad = newFirstProject.id;
    }

    const sortedProjects = projectsToLoad.sort((a,b) => b.lastModified - a.lastModified);
    setProjects(sortedProjects);

    const storedActiveId = localStorage.getItem('newsletterProActiveProjectId');
    if (storedActiveId && sortedProjects.find(p => p.id === storedActiveId)) {
      activeIdToLoad = storedActiveId;
    } else if (sortedProjects.length > 0 && !activeIdToLoad) {
      activeIdToLoad = sortedProjects[0].id;
    }
    setActiveProjectId(activeIdToLoad);
    if(activeIdToLoad) {
        const initialActiveProj = sortedProjects.find(p => p.id === activeIdToLoad);
        if(initialActiveProj) setCurrentTopic(initialActiveProj.topic);
    }
    setIsClientHydrated(true);
  }, []);


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
    setCurrentTopic("");
    setSelectedContentTypesForGeneration(ALL_CONTENT_TYPES);
    setCurrentWorkspaceView('authors');
    setActiveUITab(ALL_CONTENT_TYPES[0]);
    setShowOnlySelected(false);
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
      setCurrentTopic(activeProject.topic);
      if (!activeProject.styles || Object.keys(activeProject.styles).length === 0 ||
          !activeProject.styles.subjectLineText || !activeProject.styles.workspaceBackdropType ) {
          updateProjectData(activeProject.id, 'styles', {...initialStyles, ...activeProject.styles});
      }
      if (!activeProject.generatedContentTypes) {
          updateProjectData(activeProject.id, 'generatedContentTypes', []);
      }

      (['authors', 'funFacts', 'tools', 'newsletters', 'podcasts'] as const).forEach(contentTypeKey => {
        if (activeProject[contentTypeKey] && Array.isArray(activeProject[contentTypeKey])) {
            const items = activeProject[contentTypeKey] as GeneratedContent[];
            const needsUpdate = items.some(item => item.saved === undefined || ('imported' in item && item.imported === undefined) || ('selected' in item && item.selected === undefined) );
            if (needsUpdate) {
                updateProjectData(activeProject.id, contentTypeKey, items.map(item => ({
                    ...item,
                    saved: item.saved ?? false,
                    imported: 'imported' in item ? (item.imported ?? false) : undefined,
                    selected: 'selected' in item ? (item.selected ?? false) : undefined,
                })) as any);
            }
        }
      });


    } else if (projects.length > 0 && !activeProjectId && isClientHydrated) {
        setActiveProjectId(projects[0].id);
        setCurrentTopic(projects[0].topic);
    } else if (projects.length === 0 && isClientHydrated) {
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
        authorNameKey: fetchedAuthorEntry.name,
      }))
    );
    updateProjectData(activeProjectId, 'authors', newAuthorItems);
    setSelectedAuthorFilter("all");
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

    const typesToActuallyGenerate = selectedContentTypesForGeneration.filter(
      type => !activeProject.generatedContentTypes.includes(type)
    );

    if (typesToActuallyGenerate.length === 0) {
        toast({ title: "Content Already Generated", description: "All selected content types have already been generated for this topic. Choose different types or start a new project.", variant: "default" });
        return;
    }

    setIsGenerating(true);
    updateProjectData(activeProjectId, 'topic', currentTopic);

    const firstTypeToGenerate = typesToActuallyGenerate[0];
    if (firstTypeToGenerate && !displayableTabs.includes(firstTypeToGenerate)) {
        setCurrentWorkspaceView(firstTypeToGenerate);
        setActiveUITab(firstTypeToGenerate);
    } else if (displayableTabs.length > 0 && !displayableTabs.includes(activeUITab)) {
        setCurrentWorkspaceView(displayableTabs[0]);
        setActiveUITab(displayableTabs[0]);
    } else if (displayableTabs.length === 0 && typesToActuallyGenerate.length > 0) {
         setCurrentWorkspaceView(firstTypeToGenerate);
         setActiveUITab(firstTypeToGenerate);
    }


    if (activeProject.name.startsWith("Untitled Project") && currentTopic.trim()) {
        handleRenameProject(activeProjectId, currentTopic);
    }

    const totalSteps = typesToActuallyGenerate.length * 3; // Fetching, Validating, Processing for each type
    let completedSteps = 0;
    let hasErrors = false;

    setGenerationProgress(0);
    setCurrentGenerationMessage("Initializing content generation...");

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
            updateProgress(`Validating ${action.name} data...`, true);
            action.handler(data);
            updateProgress(`${action.name} processed successfully!`, true);
            if (activeProjectId && activeProject) {
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
            completedSteps += (3 - (completedSteps % 3 === 0 ? 3 : completedSteps % 3)); 
            updateProgress(`${action.name} generation failed.`, false); 
        }
    }

    if (!hasErrors && totalSteps > 0 && typesToActuallyGenerate.length > 0) {
      updateProgress("All content generated successfully!", false);
      toast({ title: "Content Generation Complete!", description: "All selected content has been fetched."});
    } else if (totalSteps > 0 && typesToActuallyGenerate.length > 0) {
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
  };


  const toggleContentTypeForGeneration = (contentType: ContentType) => {
    setSelectedContentTypesForGeneration(prev =>
      prev.includes(contentType)
        ? prev.filter(item => item !== contentType)
        : [...prev, contentType]
    );
  };

  const handleSelectAllContentTypesForGeneration = (checked: boolean) => {
    if (checked) {
      const ungeneratedTypes = ALL_CONTENT_TYPES.filter(type => !activeProject?.generatedContentTypes.includes(type));
      setSelectedContentTypesForGeneration(ungeneratedTypes);
    } else {
      setSelectedContentTypesForGeneration([]);
    }
  };

  const isAllContentTypesForGenerationSelected = useMemo(() => {
    if (!activeProject) return false;
    const ungeneratedTypes = ALL_CONTENT_TYPES.filter(type => !activeProject.generatedContentTypes.includes(type));
    if (ungeneratedTypes.length === 0) return true; 
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



  const applySort = <T extends { relevanceScore?: number; name?: string; text?: string }>(items: T[], sortOption: SortOption['value']): T[] => {
    const [field, direction] = sortOption.split('_') as [keyof T, "asc" | "desc"];

    return [...items].sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (field === 'relevanceScore') {
        valA = (valA ?? 0) as T[keyof T];
        valB = (valB ?? 0) as T[keyof T];
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  };


  const uniqueAuthorNamesForFilter = useMemo(() => {
    if (!activeProject) return [];
    const authorsToConsider = getRawItemsForView('authors') as Author[];
    const names = new Set(authorsToConsider.map(author => author.authorNameKey));
    return Array.from(names);
  }, [activeProject, getRawItemsForView]);

  const sortedAndFilteredAuthors = useMemo(() => {
    if (!activeProject) return [];
    let tempAuthors = getRawItemsForView('authors') as Author[];

    if (selectedAuthorFilter !== "all" && selectedAuthorFilter) {
      tempAuthors = tempAuthors.filter(author => author.authorNameKey === selectedAuthorFilter);
    }
    if (showOnlySelected && activeUITab === 'authors' && currentWorkspaceView !== 'savedItems') {
        tempAuthors = tempAuthors.filter(author => author.imported);
    }
    switch (authorSortOption) {
      case "relevance_desc": tempAuthors.sort((a, b) => b.relevanceScore - a.relevanceScore); break;
      case "relevance_asc": tempAuthors.sort((a, b) => a.relevanceScore - b.relevanceScore); break;
      case "name_asc": tempAuthors.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name_desc": tempAuthors.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: tempAuthors.sort((a, b) => b.relevanceScore - a.relevanceScore); break;
    }
    return tempAuthors;
  }, [activeProject, selectedAuthorFilter, authorSortOption, getRawItemsForView, showOnlySelected, activeUITab, currentWorkspaceView]);

  const filteredFunFacts = useMemo(() => {
    if(!activeProject) return [];
    let facts = getRawItemsForView('facts') as FunFactItem[];
    if (funFactTypeFilter !== 'all') {
      facts = facts.filter(fact => fact.type === funFactTypeFilter);
    }
    if (showOnlySelected && activeUITab === 'facts' && currentWorkspaceView !== 'savedItems') {
        facts = facts.filter(fact => fact.selected);
    }
    return applySort(facts, funFactSortOption);
  }, [activeProject, getRawItemsForView, showOnlySelected, activeUITab, funFactTypeFilter, funFactSortOption, currentWorkspaceView]);

  const filteredTools = useMemo(() => {
    if(!activeProject) return [];
    let tools = getRawItemsForView('tools') as ToolItem[];
    if (toolTypeFilter !== 'all') {
      tools = tools.filter(tool => tool.type === toolTypeFilter);
    }
    if (showOnlySelected && activeUITab === 'tools' && currentWorkspaceView !== 'savedItems') {
        tools = tools.filter(tool => tool.selected);
    }
    return applySort(tools, toolSortOption);
  }, [activeProject, getRawItemsForView, showOnlySelected, activeUITab, toolTypeFilter, toolSortOption, currentWorkspaceView]);

  const filteredNewsletters = useMemo(() => {
     if(!activeProject) return [];
    let newsletters = getRawItemsForView('newsletters') as NewsletterItem[];
    if (newsletterFrequencyFilter !== 'all') {
      newsletters = newsletters.filter(nl => nl.frequency === newsletterFrequencyFilter);
    }
    if (showOnlySelected && activeUITab === 'newsletters' && currentWorkspaceView !== 'savedItems') {
        newsletters = newsletters.filter(nl => nl.selected);
    }
    return applySort(newsletters, newsletterSortOption);
  }, [activeProject, getRawItemsForView, showOnlySelected, activeUITab, newsletterFrequencyFilter, newsletterSortOption, currentWorkspaceView]);

  const filteredPodcasts = useMemo(() => {
     if(!activeProject) return [];
    let podcasts = getRawItemsForView('podcasts') as PodcastItem[];
     if (podcastFrequencyFilter !== 'all') {
      podcasts = podcasts.filter(p => p.frequency === podcastFrequencyFilter);
    }
    if (showOnlySelected && activeUITab === 'podcasts' && currentWorkspaceView !== 'savedItems') {
        podcasts = podcasts.filter(p => p.selected);
    }
    return applySort(podcasts, podcastSortOption);
  }, [activeProject, getRawItemsForView, showOnlySelected, activeUITab, podcastFrequencyFilter, podcastSortOption, currentWorkspaceView]);


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
      const updatedStyles = { ...activeProject.styles, ...newStylesOutput.styles };
      handleStylesChange(updatedStyles);
      toast({ title: "Styles Updated!", description: "Newsletter styles have been updated based on your description." });
      setIsStyleChatOpen(false);
    } catch (err: any) {
      toast({ title: "Style Generation Failed", description: err.message || "Could not update styles.", variant: "destructive" });
    } finally {
      setIsStyleChatLoading(false);
    }
  };


  const contentTypeToIcon = (type: ContentType | 'savedItems') => {
    if (type === 'savedItems') return <Bookmark size={16} />;
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

  const allProjectTypesGenerated = activeProject && ALL_CONTENT_TYPES.every(type => activeProject.generatedContentTypes.includes(type));
  const noNewTypesSelectedForGeneration = activeProject && selectedContentTypesForGeneration.length > 0 && selectedContentTypesForGeneration.every(type => activeProject.generatedContentTypes.includes(type));

  const isGenerateButtonDisabled =
    isGenerating ||
    !currentTopic.trim() ||
    selectedContentTypesForGeneration.length === 0 ||
    (currentWorkspaceView !== 'savedItems' && (allProjectTypesGenerated || noNewTypesSelectedForGeneration));

  const workspaceStyle = useMemo(() => {
    if (!activeProject || !activeProject.styles) return {};
    const { workspaceBackdropType, workspaceBackdropSolidColor, workspaceBackdropGradientStart, workspaceBackdropGradientEnd, workspaceBackdropImageURL } = activeProject.styles;

    switch (workspaceBackdropType) {
      case 'solid':
        return { backgroundColor: workspaceBackdropSolidColor || 'transparent' };
      case 'gradient':
        return { backgroundImage: `linear-gradient(to bottom right, ${workspaceBackdropGradientStart || '#FFFFFF'}, ${workspaceBackdropGradientEnd || '#DDDDDD'})` };
      case 'image':
        return {
          backgroundImage: `url(${workspaceBackdropImageURL || 'https://picsum.photos/seed/defaultbg/1920/1080'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      case 'none':
      default:
        return { backgroundColor: 'hsl(var(--background))' }; 
    }
  }, [activeProject]);


  if (!isClientHydrated || !activeProject) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary mr-4" />
        <p className="text-xl text-muted-foreground">
          {isClientHydrated && projects.length === 0 ? "Creating initial project..." : "Loading project data..."}
        </p>
      </div>
    );
  }

  const projectToRender = activeProject;

  if (!projectToRender) {
      return (
          <div className="flex h-screen items-center justify-center p-6">
              <Alert variant="destructive">
                  <Info className="h-4 w-4"/>
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
              setCurrentWorkspaceView('authors');
              setActiveUITab('authors');
              setShowOnlySelected(false);
            } else {
              if (projects.length > 0) {
                setActiveProjectId(projects[0].id);
                setCurrentWorkspaceView('authors');
                setActiveUITab('authors');
                setShowOnlySelected(false);
              }
              else setActiveProjectId(null);
            }
          }}
          onNewProject={handleNewProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={(projectId) => {
              setProjects(prev => {
                  const remainingProjects = prev.filter(p => p.id !== projectId);
                  if (activeProjectId === projectId) {
                      if (remainingProjects.length > 0) {
                          setActiveProjectId(remainingProjects[0].id);
                          setCurrentWorkspaceView('authors');
                          setActiveUITab('authors');
                          setShowOnlySelected(false);
                      } else {
                          setActiveProjectId(null);
                      }
                  }
                  return remainingProjects;
              });
              toast({title: "Project Deleted"});
          }}
          onSelectSavedItemsView={() => {
            setCurrentWorkspaceView('savedItems');
            setShowOnlySelected(false);
            const firstSavedType = ALL_CONTENT_TYPES.find(type => {
                switch (type) {
                    case 'authors': return projectToRender.authors.some(a=>a.saved);
                    case 'facts': return projectToRender.funFacts.some(f=>f.saved);
                    case 'tools': return projectToRender.tools.some(t=>t.saved);
                    case 'newsletters': return projectToRender.newsletters.some(n=>n.saved);
                    case 'podcasts': return projectToRender.podcasts.some(p=>p.saved);
                    default: return false;
                }
            }) || 'authors';
            setActiveUITab(firstSavedType);
          }}
          isSavedItemsActive={currentWorkspaceView === 'savedItems'}
          initialStyles={projectToRender.styles}
          onStylesChange={handleStylesChange}
          isStyleChatOpen={isStyleChatOpen}
          onSetIsStyleChatOpen={setIsStyleChatOpen}
          onStyleChatSubmit={onStyleChatSubmit}
          isLoadingStyleChat={isStyleChatLoading}
          isBackdropCustomizerOpen={isBackdropCustomizerOpen}
          onSetIsBackdropCustomizerOpen={setIsBackdropCustomizerOpen}
        />

        <div className="flex flex-1 overflow-hidden"> 

          {/* Center Column (B) */}
          <div
            className={cn(
              "relative flex-1 h-full transition-opacity duration-300",
              isMobile && sidebarState === 'expanded' ? "pointer-events-none opacity-50" : "opacity-100",
              !isMobile && sidebarState === 'expanded' && "opacity-50 pointer-events-none"
            )}
            style={workspaceStyle}
            >
            {!isMobile && sidebarState === 'expanded' && activeProject?.styles.workspaceBackdropType !== 'none' && (
              <div
                className="absolute inset-0 bg-black/30 dark:bg-black/50 z-20 transition-opacity duration-300"
                onClick={toggleSidebar}
              />
            )}
            <ScrollArea className="h-full relative z-10" id="center-column-scroll">
              <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-6">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 sm:pt-6 gap-3">
                <div className="flex-grow min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary truncate" title={projectToRender.name}>
                      {projectToRender.name}
                    </h1>
                </div>
              </div>

              {currentWorkspaceView !== 'savedItems' && (
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
                        onChange={(e) => setCurrentTopic(e.target.value)}
                        placeholder="Enter topic (e.g. AI in marketing, Sustainable Energy)"
                        className="flex-grow text-sm sm:text-base py-2.5"
                        disabled={isGenerating}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full sm:w-auto min-w-[180px] sm:min-w-[200px] justify-between py-2.5" disabled={isGenerating}>
                            {selectedContentTypesForGeneration.length === 0
                              ? "Select Content Types"
                              : selectedContentTypesForGeneration.length === 1
                                ? contentTypeToLabel(selectedContentTypesForGeneration[0])
                                : selectedContentTypesForGeneration.length === ALL_CONTENT_TYPES.filter(type => !projectToRender.generatedContentTypes.includes(type)).length && selectedContentTypesForGeneration.length > 0 && ALL_CONTENT_TYPES.filter(type => !projectToRender.generatedContentTypes.includes(type)).length > 0
                                  ? "All New Types"
                                  : `${selectedContentTypesForGeneration.length} Types Selected`}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-60 sm:w-64 z-50">
                          <DropdownMenuLabel>Select Content Types</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuCheckboxItem
                            checked={isAllContentTypesForGenerationSelected}
                            onCheckedChange={handleSelectAllContentTypesForGeneration}
                            onSelect={(e) => e.preventDefault()}
                            disabled={ALL_CONTENT_TYPES.every(type => projectToRender.generatedContentTypes.includes(type))}
                          >
                            All New (Ungenerated)
                          </DropdownMenuCheckboxItem>
                          {ALL_CONTENT_TYPES.map(type => (
                            <DropdownMenuCheckboxItem
                              key={type}
                              checked={selectedContentTypesForGeneration.includes(type)}
                              onCheckedChange={() => toggleContentTypeForGeneration(type)}
                              disabled={projectToRender.generatedContentTypes.includes(type)}
                              onSelect={(e) => e.preventDefault()}
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
                    <GenerationProgressIndicator
                      isVisible={isGenerating}
                      progress={generationProgress}
                      message={currentGenerationMessage}
                    />
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

              {/* Container for General Filters (Tabs) */}
              <div className="my-6 sm:my-8">
                {(!isGenerating || generationProgress === 100) && displayableTabs.length > 0 && (
                  <Tabs value={activeUITab} onValueChange={(value) => setActiveUITab(value as ContentType)} className="w-full">
                    <TabsList className={cn("flex flex-wrap gap-2 sm:gap-3 py-1.5 !bg-transparent !p-0 justify-start mb-4")}>
                      {displayableTabs.map(type => (
                        <TooltipProvider key={type} delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <TabsTrigger
                                value={type}
                                disabled={isGenerating}
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
              
              {/* Container for Specific Filters and Sort */}
              <div className="mb-4 sm:mb-6">
                {(!isGenerating || generationProgress === 100) && (activeProject?.generatedContentTypes.length > 0 || (currentWorkspaceView === 'savedItems' && (projectToRender.authors.some(a=>a.saved) || projectToRender.funFacts.some(f=>f.saved) || projectToRender.tools.some(t=>t.saved) || projectToRender.newsletters.some(n=>n.saved) || projectToRender.podcasts.some(p=>p.saved) ) ) ) && (
                  <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          {activeUITab === 'authors' && (
                              <>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between py-2 sm:py-2.5">
                                              <Filter className="mr-2 h-4 w-4" />
                                              {selectedAuthorFilter === "all" ? "All Authors" : selectedAuthorFilter}
                                              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent className="z-50">
                                          <DropdownMenuCheckboxItem checked={selectedAuthorFilter === "all"} onCheckedChange={() => setSelectedAuthorFilter("all")} onSelect={(e) => e.preventDefault()}>All Authors</DropdownMenuCheckboxItem>
                                          <DropdownMenuSeparator />
                                          {uniqueAuthorNamesForFilter.map(name => (<DropdownMenuCheckboxItem key={name} checked={selectedAuthorFilter === name} onCheckedChange={() => setSelectedAuthorFilter(name)} onSelect={(e) => e.preventDefault()}>{name}</DropdownMenuCheckboxItem>))}
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between py-2 sm:py-2.5">
                                              <ArrowUpDown className="mr-2 h-4 w-4" /> Sort By <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="z-50">
                                          {[{ value: "relevance_desc", label: "Relevance (High-Low)" },{ value: "relevance_asc", label: "Relevance (Low-High)" },{ value: "name_asc", label: "Name (A-Z)" },{ value: "name_desc", label: "Name (Z-A)" },].map(option => (
                                              <DropdownMenuCheckboxItem key={option.value} checked={authorSortOption === option.value} onCheckedChange={() => setAuthorSortOption(option.value as AuthorSortOption)} onSelect={(e) => e.preventDefault()}>{option.label}</DropdownMenuCheckboxItem>
                                          ))}
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              </>
                          )}
                          {activeUITab === 'facts' && (
                              <>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><Filter className="mr-2 h-4 w-4" />{funFactTypeFilter === 'all' ? 'All Fact Types' : (funFactTypeFilter === 'fun' ? 'Fun Facts' : 'Science Facts')}<ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                      <DropdownMenuContent><DropdownMenuRadioGroup value={funFactTypeFilter} onValueChange={(val) => setFunFactTypeFilter(val as "all" | "fun" | "science")}>
                                          <DropdownMenuRadioItem value="all">All Fact Types</DropdownMenuRadioItem>
                                          <DropdownMenuRadioItem value="fun">Fun Facts</DropdownMenuRadioItem>
                                          <DropdownMenuRadioItem value="science">Science Facts</DropdownMenuRadioItem>
                                      </DropdownMenuRadioGroup></DropdownMenuContent>
                                  </DropdownMenu>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><ArrowUpDown className="mr-2 h-4 w-4" /> Sort By <ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">{textSortOptions.map(opt => <DropdownMenuCheckboxItem key={opt.value} checked={funFactSortOption === opt.value} onCheckedChange={() => setFunFactSortOption(opt.value)}>{opt.label}</DropdownMenuCheckboxItem>)}</DropdownMenuContent>
                                  </DropdownMenu>
                              </>
                          )}
                          {activeUITab === 'tools' && (
                              <>
                              <DropdownMenu>
                                      <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><Filter className="mr-2 h-4 w-4" />{toolTypeFilter === 'all' ? 'All Tool Types' : (toolTypeFilter === 'free' ? 'Free Tools' : 'Paid Tools')}<ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                      <DropdownMenuContent><DropdownMenuRadioGroup value={toolTypeFilter} onValueChange={(val) => setToolTypeFilter(val as "all" | "free" | "paid")}>
                                          <DropdownMenuRadioItem value="all">All Tool Types</DropdownMenuRadioItem>
                                          <DropdownMenuRadioItem value="free">Free Tools</DropdownMenuRadioItem>
                                          <DropdownMenuRadioItem value="paid">Paid Tools</DropdownMenuRadioItem>
                                      </DropdownMenuRadioGroup></DropdownMenuContent>
                                  </DropdownMenu>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><ArrowUpDown className="mr-2 h-4 w-4" /> Sort By <ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">{nameSortOptions.map(opt => <DropdownMenuCheckboxItem key={opt.value} checked={toolSortOption === opt.value} onCheckedChange={() => setToolSortOption(opt.value)}>{opt.label}</DropdownMenuCheckboxItem>)}</DropdownMenuContent>
                                  </DropdownMenu>
                              </>
                          )}
                          {activeUITab === 'newsletters' && (
                              <>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><Filter className="mr-2 h-4 w-4" />{newsletterFrequencyFilter === 'all' ? 'All Frequencies' : newsletterFrequencyFilter}<ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                      <DropdownMenuContent><DropdownMenuRadioGroup value={newsletterFrequencyFilter} onValueChange={setNewsletterFrequencyFilter}>
                                          <DropdownMenuRadioItem value="all">All Frequencies</DropdownMenuRadioItem>
                                          {COMMON_FREQUENCIES.map(freq => <DropdownMenuRadioItem key={freq} value={freq}>{freq}</DropdownMenuRadioItem>)}
                                      </DropdownMenuRadioGroup></DropdownMenuContent>
                                  </DropdownMenu>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><ArrowUpDown className="mr-2 h-4 w-4" /> Sort By <ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">{nameSortOptions.map(opt => <DropdownMenuCheckboxItem key={opt.value} checked={newsletterSortOption === opt.value} onCheckedChange={() => setNewsletterSortOption(opt.value)}>{opt.label}</DropdownMenuCheckboxItem>)}</DropdownMenuContent>
                                  </DropdownMenu>
                              </>
                          )}
                          {activeUITab === 'podcasts' && (
                              <>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><Filter className="mr-2 h-4 w-4" />{podcastFrequencyFilter === 'all' ? 'All Frequencies' : podcastFrequencyFilter}<ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                      <DropdownMenuContent><DropdownMenuRadioGroup value={podcastFrequencyFilter} onValueChange={setPodcastFrequencyFilter}>
                                          <DropdownMenuRadioItem value="all">All Frequencies</DropdownMenuRadioItem>
                                          {COMMON_FREQUENCIES.map(freq => <DropdownMenuRadioItem key={freq} value={freq}>{freq}</DropdownMenuRadioItem>)}
                                      </DropdownMenuRadioGroup></DropdownMenuContent>
                                  </DropdownMenu>
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild><Button variant="outline" className="min-w-[150px] sm:min-w-[160px] justify-between"><ArrowUpDown className="mr-2 h-4 w-4" /> Sort By <ChevronDown className="ml-auto h-4 w-4 opacity-50" /></Button></DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">{nameSortOptions.map(opt => <DropdownMenuCheckboxItem key={opt.value} checked={podcastSortOption === opt.value} onCheckedChange={() => setPodcastSortOption(opt.value)}>{opt.label}</DropdownMenuCheckboxItem>)}</DropdownMenuContent>
                                  </DropdownMenu>
                              </>
                          )}
                      </div>
                      {currentWorkspaceView !== 'savedItems' &&
                          <div className="flex items-center space-x-2 ml-auto">
                              <Switch
                                  id={`show-selected-filter-${activeUITab}`} 
                                  checked={showOnlySelected}
                                  onCheckedChange={setShowOnlySelected}
                                  aria-label="Show only selected items"
                              />
                              <Label htmlFor={`show-selected-filter-${activeUITab}`} className="text-sm">Show Only Selected</Label>
                          </div>
                      }
                  </div>
                )}
              </div>
              
              {/* Content Display Area - Removed ScrollArea here, relies on parent ScrollArea */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-8"> {/* Added pb-8 for spacing at the bottom */}
                {activeUITab === 'authors' && (!isGenerating || generationProgress === 100) && (
                  <>
                    {(() => {
                      const rawItems = getRawItemsForView('authors');
                      const typeLabel = contentTypeToLabel(activeUITab);
                      if (rawItems.length === 0) {
                        return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">
                                 {currentWorkspaceView === 'savedItems' ? `No ${typeLabel.toLowerCase()} saved.` : `${typeLabel} not generated yet.`}
                               </p>;
                      }
                      if (sortedAndFilteredAuthors.length === 0) {
                        const message = showOnlySelected && currentWorkspaceView !== 'savedItems'
                          ? `No selected ${typeLabel.toLowerCase()} to display for the current filters.`
                          : `No authors match current filters.`;
                        return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">{message}</p>;
                      }
                      return (
                        <>
                          {sortedAndFilteredAuthors.map((authorItem) => (<ContentItemCard key={authorItem.id} id={authorItem.id} title={authorItem.name} typeBadge="Author" isImported={authorItem.imported} isSaved={authorItem.saved} onToggleImport={(id, imp) => toggleItemImportStatus(id, imp, 'authors')} onToggleSave={(id, svd) => handleToggleItemSavedStatus(id, svd, 'authors')} className="flex flex-col h-full" relevanceScore={authorItem.relevanceScore} content={<div className="space-y-2"><p className="text-xs text-muted-foreground italic">{authorItem.titleOrKnownFor}</p><blockquote className="border-l-2 pl-3 text-sm italic">"{authorItem.quote}"</blockquote><p className="text-xs text-muted-foreground">Source: {authorItem.quoteSource}</p></div>} amazonLink={authorItem.amazonLink} itemData={authorItem} />))}
                        </>
                      );
                    })()}
                  </>
                )}

                {activeUITab === 'facts' && (!isGenerating || generationProgress === 100) && (
                  <>
                    {(() => {
                      const rawItems = getRawItemsForView('facts');
                      const typeLabel = contentTypeToLabel(activeUITab);
                      if (rawItems.length === 0) {
                        return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">
                                 {currentWorkspaceView === 'savedItems' ? `No ${typeLabel.toLowerCase()} saved.` : `${typeLabel} not generated yet.`}
                               </p>;
                      }
                      if (filteredFunFacts.length === 0) {
                        const message = showOnlySelected && currentWorkspaceView !== 'savedItems'
                          ? `No selected ${typeLabel.toLowerCase()} to display for the current filters.`
                          : `No ${typeLabel.toLowerCase()} found for the current filters.`;
                        return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">{message}</p>;
                      }
                      return (
                        <>
                          {filteredFunFacts.map((fact) => (<ContentItemCard key={fact.id} id={fact.id} content={fact.text} typeBadge={fact.type === "fun" ? "Fun Fact" : "Science Fact"} isImported={fact.selected} isSaved={fact.saved} onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'facts')} onToggleSave={(id, svd) => handleToggleItemSavedStatus(id, svd, 'facts')} relevanceScore={fact.relevanceScore} sourceLinkFact={fact.sourceLink} itemData={fact} />))}
                        </>
                      );
                    })()}
                  </>
                )}

                {activeUITab === 'tools' && (!isGenerating || generationProgress === 100) && (
                  <>
                    {(() => {
                       const rawItems = getRawItemsForView('tools');
                      const typeLabel = contentTypeToLabel(activeUITab);
                      if (rawItems.length === 0) {
                        return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">
                                 {currentWorkspaceView === 'savedItems' ? `No ${typeLabel.toLowerCase()} saved.` : `${typeLabel} not generated yet.`}
                               </p>;
                      }
                      if (filteredTools.length === 0) {
                        const message = showOnlySelected && currentWorkspaceView !== 'savedItems'
                          ? `No selected ${typeLabel.toLowerCase()} to display for the current filters.`
                          : `No ${typeLabel.toLowerCase()} found for the current filters.`;
                        return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">{message}</p>;
                      }
                      return (
                        <>
                          {filteredTools.map((tool) => (<ContentItemCard key={tool.id} id={tool.id} title={tool.name} typeBadge={tool.type === "free" ? "Free Tool" : "Paid Tool"} isImported={tool.selected} isSaved={tool.saved} onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'tools')} onToggleSave={(id, svd) => handleToggleItemSavedStatus(id, svd, 'tools')} relevanceScore={tool.relevanceScore} freeTrialPeriod={tool.freeTrialPeriod} itemData={tool} content="" />))}
                        </>
                      );
                    })()}
                  </>
                )}

                {activeUITab === 'newsletters' && (!isGenerating || generationProgress === 100) && (
                  <>
                    {(() => {
                      const rawItems = getRawItemsForView('newsletters');
                      const typeLabel = contentTypeToLabel(activeUITab);
                      if (rawItems.length === 0) {
                        return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">
                                 {currentWorkspaceView === 'savedItems' ? `No ${typeLabel.toLowerCase()} saved.` : `${typeLabel} not generated yet.`}
                               </p>;
                      }
                      if (filteredNewsletters.length === 0) {
                        const message = showOnlySelected && currentWorkspaceView !== 'savedItems'
                          ? `No selected ${typeLabel.toLowerCase()} to display for the current filters.`
                          : `No ${typeLabel.toLowerCase()} found for the current filters.`;
                        return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">{message}</p>;
                      }
                      return (
                        <>
                          {filteredNewsletters.map((nl) => (<ContentItemCard key={nl.id} id={nl.id} title={nl.name} typeBadge="Newsletter" isImported={nl.selected} isSaved={nl.saved} onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'newsletters')} onToggleSave={(id, svd) => handleToggleItemSavedStatus(id, svd, 'newsletters')} relevanceScore={nl.relevanceScore} content="" newsletterOperator={nl.operator} newsletterDescription={nl.description} newsletterSubscribers={nl.subscribers} signUpLink={nl.signUpLink} newsletterFrequency={nl.frequency} newsletterCoveredTopics={nl.coveredTopics} itemData={nl} />))}
                        </>
                      );
                    })()}
                  </>
                )}

                {activeUITab === 'podcasts' && (!isGenerating || generationProgress === 100) && (
                  <>
                    {(() => {
                      const rawItems = getRawItemsForView('podcasts');
                       const typeLabel = contentTypeToLabel(activeUITab);
                      if (rawItems.length === 0) {
                        return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">
                                 {currentWorkspaceView === 'savedItems' ? `No ${typeLabel.toLowerCase()} saved.` : `${typeLabel} not generated yet.`}
                               </p>;
                      }
                      if (filteredPodcasts.length === 0) {
                        const message = showOnlySelected && currentWorkspaceView !== 'savedItems'
                          ? `No selected ${typeLabel.toLowerCase()} to display for the current filters.`
                          : `No ${typeLabel.toLowerCase()} found for the current filters.`;
                        return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">{message}</p>;
                      }
                      return (
                        <>
                          {filteredPodcasts.map((podcast) => (<ContentItemCard key={podcast.id} id={podcast.id} title={podcast.name} typeBadge="Podcast" isImported={podcast.selected} isSaved={podcast.saved} onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'podcasts')} onToggleSave={(id, svd) => handleToggleItemSavedStatus(id, svd, 'podcasts')} relevanceScore={podcast.relevanceScore} content={<div className="space-y-1 text-sm"><p className="font-medium text-muted-foreground">{podcast.episodeTitle}</p><p className="text-xs text-foreground/80 line-clamp-3">{podcast.description}</p></div>} itemData={podcast} signUpLink={podcast.podcastLink} podcastFrequency={podcast.frequency} podcastTopics={podcast.topics} />))}
                        </>
                      );
                    })()}
                  </>
                )}

                {(displayableTabs.length === 0 && (!isGenerating || generationProgress === 100) && (
                  <div className="text-center py-10 text-muted-foreground col-span-full">
                    {currentWorkspaceView === 'savedItems' ?
                      (showOnlySelected && currentWorkspaceView !== 'savedItems' ? 'No saved items are currently selected for the newsletter.' : 'No items saved yet in this project.') :
                      (showOnlySelected && currentWorkspaceView !== 'savedItems' ? 'No generated items are currently selected for the newsletter.' : 'No content generated yet for this project. Try generating some!')
                    }
                  </div>
                ))}
              </div>

            </div>
            </ScrollArea>
          </div>

          {/* Right Column (C) - Newsletter Preview */}
           <div className="hidden md:flex flex-col h-full bg-card border-l shadow-lg w-2/5 lg:w-1/3 relative z-10">
              <div className="p-4 md:p-6 border-b flex justify-between items-center gap-2">
                 <div className="flex items-center gap-3">
                    <Newspaper className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-semibold text-primary">Preview</h2>
                </div>
                <div className="flex items-center gap-2">
                    <StyleCustomizer initialStyles={projectToRender.styles} onStylesChange={handleStylesChange}>
                        <Button variant="ghost" size="icon" title="Customize Styles">
                            <Palette size={18} />
                        </Button>
                    </StyleCustomizer>
                    <Button variant="ghost" size="icon" onClick={() => setIsStyleChatOpen(true)} title="Chat for Styling">
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
                        selectedAggregatedContent={selectedNewsletters}
                        selectedPodcasts={selectedPodcasts}
                        styles={projectToRender.styles}
                    />
                </div>
            </ScrollArea>
          </div>
        </div>
      </div>
      <StyleChatDialog
        isOpen={isStyleChatOpen}
        onOpenChange={setIsStyleChatOpen}
        onSubmit={handleStyleChatSubmit}
        isLoading={isStyleChatLoading}
      />
      <BackdropCustomizer
        isOpen={isBackdropCustomizerOpen}
        onOpenChange={setIsBackdropCustomizerOpen}
        initialStyles={projectToRender.styles}
        onStylesChange={handleStylesChange}
      />
    </TooltipProvider>
  );
}

