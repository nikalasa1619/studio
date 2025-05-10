// src/components/newsletter-pro/main-workspace.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card"; 

import { ContentItemCard } from "./content-item-card";
import { NewsletterPreview } from "./newsletter-preview";
import { StyleCustomizer } from "./style-customizer";
import { AppSidebar } from "./app-sidebar";
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
  AuthorSortOption, // Added import for AuthorSortOption
} from "./types";
import { ALL_CONTENT_TYPES } from "./types";

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

import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { AuthButton } from "@/components/auth-button";
import { useToast } from "@/hooks/use-toast";

import { ChevronDown, Filter, ArrowUpDown, Loader2, ListChecks, Newspaper, Podcast as PodcastIconLucide, Wrench, Lightbulb, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

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
  name: topic ? topic.substring(0, 20) : `Untitled Project ${idSuffix === STATIC_INITIAL_PROJECT_ID ? '1' : idSuffix.substring(0,4)}`,
  topic: topic,
  authors: [],
  funFacts: [],
  tools: [],
  newsletters: [],
  podcasts: [],
  styles: { ...initialStyles },
  lastModified: Date.now(),
});


export function MainWorkspace() {
  // Initialize isClientHydrated to false. It will be set to true in useEffect on the client.
  const [isClientHydrated, setIsClientHydrated] = useState(false);
  
  // useMemo for initialDefaultProject MUST NOT depend on any state that is not yet initialized
  const initialDefaultProject = useMemo(() => createNewProject(STATIC_INITIAL_PROJECT_ID, "Welcome Project"), []);

  const [projects, setProjects] = useState<Project[]>([initialDefaultProject]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(initialDefaultProject.id);
  
  const [currentTopic, setCurrentTopic] = useState<string>(initialDefaultProject.topic);
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>(ALL_CONTENT_TYPES);
  const [activeUITab, setActiveUITab] = useState<ContentType>(ALL_CONTENT_TYPES[0]);
  const [isGenerating, setIsGenerating] = useState(false); // Declaration
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<string>("all");
  const [authorSortOption, setAuthorSortOption] = useState<AuthorSortOption>("default");
  
  const { toast } = useToast();
  const { state: sidebarState, isMobile, toggleSidebar: toggleAppSidebar } = useSidebar();

  useEffect(() => {
    // This effect runs only on the client, once after initial hydration
    const storedProjectsString = localStorage.getItem('newsletterProProjects');
    let projectsToLoad: Project[] = [initialDefaultProject]; // Default if nothing in localStorage
    let activeIdToLoad: string | null = initialDefaultProject.id;
  
    if (storedProjectsString) {
      try {
        const parsedProjects = JSON.parse(storedProjectsString);
        if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
          projectsToLoad = parsedProjects;
        } else if (Array.isArray(parsedProjects) && parsedProjects.length === 0) {
          projectsToLoad = []; // Respect empty array from localStorage
        }
      } catch (e) {
        console.error("Failed to parse projects from localStorage", e);
        // projectsToLoad remains [initialDefaultProject]
      }
    }
  
    if (projectsToLoad.length === 0) {
        const newFirstProject = createNewProject(`local-${Date.now()}`); 
        projectsToLoad = [newFirstProject];
        activeIdToLoad = newFirstProject.id;
    }
    
    // Sort projects by lastModified descending
    const sortedProjects = projectsToLoad.sort((a,b) => b.lastModified - a.lastModified);
    setProjects(sortedProjects);
  
    const storedActiveId = localStorage.getItem('newsletterProActiveProjectId');
    if (storedActiveId && sortedProjects.find(p => p.id === storedActiveId)) {
      activeIdToLoad = storedActiveId;
    } else if (sortedProjects.length > 0) {
      activeIdToLoad = sortedProjects[0].id; 
    } else {
      activeIdToLoad = null; 
    }
    setActiveProjectId(activeIdToLoad);
    
    // Crucially, set isClientHydrated to true AFTER all client-side setup from localStorage is done.
    setIsClientHydrated(true); 
  }, [initialDefaultProject]); // initialDefaultProject is stable and won't cause re-runs of this effect.

  const activeProject = useMemo(() => {
    // During SSR or before client hydration, projects state is [initialDefaultProject]
    // and activeProjectId is initialDefaultProject.id.
    // After hydration, projects and activeProjectId are updated from localStorage.
    return projects.find(p => p.id === activeProjectId);
  }, [projects, activeProjectId]);


  useEffect(() => {
    if (isClientHydrated) { // Only run on client after hydration
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
    const newP = createNewProject(`${projects.length + 1}-${Date.now().toString().slice(-5)}`); // Ensure somewhat unique ID for new projects
    const updatedProjects = [newP, ...projects].sort((a,b) => b.lastModified - a.lastModified);
    setProjects(updatedProjects);
    setActiveProjectId(newP.id);
    setCurrentTopic(""); // Reset topic for the new project
    // Reset other relevant states for a new project if needed
    setSelectedContentTypes(ALL_CONTENT_TYPES); 
    setActiveUITab(ALL_CONTENT_TYPES[0]);
  }, [projects]);


  useEffect(() => {
    if (!isClientHydrated) return; // Wait for hydration

    if (activeProject) {
      setCurrentTopic(activeProject.topic);
      // Project name update logic can be refined or moved if it causes issues during initial load
      // For example, only update if currentTopic is manually changed by user or after generation.
    } else if (projects.length > 0 && activeProjectId === null) {
        // If no active project ID but projects exist (e.g. after deleting current project), select the first one.
        setActiveProjectId(projects[0].id); 
    } else if (projects.length === 0) { 
      // This case should be handled by the localStorage loading logic which ensures at least one project
      // or by the loading screen. If it's reached here, something is wrong.
      // console.warn("No projects and no active project after hydration, attempting to create one.");
      // handleNewProject(); // Avoid calling handleNewProject directly in useEffect like this if it causes loops
    }
  }, [activeProject, projects, activeProjectId, isClientHydrated, handleNewProject]);


  const handleRenameProject = (projectId: string, newName: string) => {
     if (newName.trim() === "") return;
     updateProjectData(projectId, 'name', newName.substring(0, 50));
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
        amazonLink: `${amazonBaseUrl}?k=${encodeURIComponent(fetchedAuthorEntry.source)}&tag=${amazonTrackingTag}`,
        authorNameKey: fetchedAuthorEntry.name,
      }))
    );
    updateProjectData(activeProjectId, 'authors', newAuthorItems);
    setSelectedAuthorFilter("all"); // Reset filter
    setAuthorSortOption("default"); // Reset sort
  };

  const handleFunFactsData = (data: GenerateFunFactsOutput) => {
    if (!activeProjectId) return;
    const newFunFacts: FunFactItem[] = [
      ...data.funFacts.map((fact, index) => ({ id: `fun-${index}-${Date.now()}`, text: fact.text, type: "fun" as const, selected: false, relevanceScore: fact.relevanceScore })),
      ...data.scienceFacts.map((fact, index) => ({ id: `science-${index}-${Date.now()}`, text: fact.text, type: "science" as const, selected: false, relevanceScore: fact.relevanceScore }))
    ];
    updateProjectData(activeProjectId, 'funFacts', newFunFacts);
  };

  const handleToolsData = (data: RecommendProductivityToolsOutput) => {
    if (!activeProjectId) return;
    const newTools: ToolItem[] = [
      ...data.freeTools.map((tool, index) => ({ id: `free-tool-${index}-${Date.now()}`, name: tool.name, type: "free" as const, selected: false, relevanceScore: tool.relevanceScore })),
      ...data.paidTools.map((tool, index) => ({ id: `paid-tool-${index}-${Date.now()}`, name: tool.name, type: "paid" as const, selected: false, relevanceScore: tool.relevanceScore }))
    ];
    updateProjectData(activeProjectId, 'tools', newTools);
  };

  const handleNewslettersData = (data: FetchNewslettersOutput) => {
    if (!activeProjectId) return;
    const newNewsletters: NewsletterItem[] = data.newsletters.map((nl, index) => ({
      ...nl, id: `newsletter-${index}-${Date.now()}`, selected: false
    }));
    updateProjectData(activeProjectId, 'newsletters', newNewsletters);
  };

  const handlePodcastsData = (data: FetchPodcastsOutput) => {
    if (!activeProjectId) return;
    const newPodcasts: PodcastItem[] = data.podcasts.map((podcast, index) => ({
      ...podcast, id: `podcast-${index}-${Date.now()}`, selected: false
    }));
    updateProjectData(activeProjectId, 'podcasts', newPodcasts);
  };

 const handleGenerateContent = async () => {
    if (!currentTopic.trim() || selectedContentTypes.length === 0 || !activeProject || !activeProjectId) {
      toast({ title: "Missing Information", description: "Please enter a topic and select content types to generate.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    updateProjectData(activeProjectId, 'topic', currentTopic); // Update project topic

    // Update project name if it's still the default "Untitled"
    if (activeProject.name.startsWith("Untitled Project") && currentTopic.trim()) {
        handleRenameProject(activeProjectId, currentTopic.substring(0,20) || `Project ${activeProjectId.substring(activeProjectId.length - 4)}`);
    }

    const generationPromises = [];
    let hasErrors = false;

    const processPromise = async (actionPromise: Promise<any>, successHandler: (data: any) => void, type: string) => {
        try {
            const data = await actionPromise;
            successHandler(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
            console.error(`${type} Generation Failed:`, errorMessage, err);
            toast({ title: `${type} Generation Failed`, description: `Details: ${errorMessage}`, variant: "destructive"});
            hasErrors = true;
        }
    };

    if (selectedContentTypes.includes('authors')) {
      generationPromises.push(processPromise(getAuthorsAndQuotesAction({ topic: currentTopic }), handleAuthorsData, "Authors & Quotes"));
    }
    if (selectedContentTypes.includes('facts')) {
      generationPromises.push(processPromise(generateFunFactsAction({ topic: currentTopic }), handleFunFactsData, "Fun Facts"));
    }
    if (selectedContentTypes.includes('tools')) {
       generationPromises.push(processPromise(recommendToolsAction({ topic: currentTopic }), handleToolsData, "Productivity Tools"));
    }
    if (selectedContentTypes.includes('newsletters')) {
       generationPromises.push(processPromise(fetchNewslettersAction({ topic: currentTopic }), handleNewslettersData, "Newsletters"));
    }
    if (selectedContentTypes.includes('podcasts')) {
       generationPromises.push(processPromise(fetchPodcastsAction({ topic: currentTopic }), handlePodcastsData, "Podcasts"));
    }

    try {
      await Promise.all(generationPromises); 
      if (!hasErrors) {
        toast({ title: "Content Generation Complete!", description: "All selected content has been fetched."});
      } else {
         toast({ title: "Generation Finished", description: "Some content generation tasks failed. Please check individual error messages.", variant: "default" });
      }
    } catch (error) { // This catch is for Promise.all itself, less likely to be hit if individual errors are caught by processPromise
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during bulk generation.";
      console.error("Error during bulk content generation:", errorMessage, error);
      toast({ title: "Overall Generation Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };


  const toggleContentType = (contentType: ContentType) => {
    setSelectedContentTypes(prev =>
      prev.includes(contentType)
        ? prev.filter(item => item !== contentType)
        : [...prev, contentType]
    );
  };

  const handleSelectAllContentTypes = (checked: boolean) => {
    if (checked) {
      setSelectedContentTypes([...ALL_CONTENT_TYPES]);
    } else {
      setSelectedContentTypes([]);
    }
  };

  const isAllContentTypesSelected = ALL_CONTENT_TYPES.length > 0 && selectedContentTypes.length === ALL_CONTENT_TYPES.length;


  const toggleItemImportStatus = (itemId: string, imported: boolean, type: ContentType) => {
    if (!activeProject || !activeProjectId) return; // Ensure activeProject and ID exist
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

  const importedAuthors = useMemo(() => activeProject?.authors.filter(author => author.imported) || [], [activeProject]);
  const selectedFunFacts = useMemo(() => activeProject?.funFacts.filter(item => item.selected) || [], [activeProject]);
  const selectedTools = useMemo(() => activeProject?.tools.filter(item => item.selected) || [], [activeProject]);
  const selectedNewsletters = useMemo(() => activeProject?.newsletters.filter(item => item.selected) || [], [activeProject]);
  const selectedPodcasts = useMemo(() => activeProject?.podcasts.filter(item => item.selected) || [], [activeProject]);


  const uniqueAuthorNamesForFilter = useMemo(() => {
    if (!activeProject) return [];
    const names = new Set(activeProject.authors.map(author => author.authorNameKey));
    return Array.from(names);
  }, [activeProject]);

  const sortedAndFilteredAuthors = useMemo(() => {
    if (!activeProject) return [];
    let tempAuthors = [...activeProject.authors];
    if (selectedAuthorFilter !== "all" && selectedAuthorFilter) {
      tempAuthors = tempAuthors.filter(author => author.authorNameKey === selectedAuthorFilter);
    }
    switch (authorSortOption) {
      case "relevance_desc": tempAuthors.sort((a, b) => b.relevanceScore - a.relevanceScore); break;
      case "relevance_asc": tempAuthors.sort((a, b) => a.relevanceScore - b.relevanceScore); break;
      case "name_asc": tempAuthors.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name_desc": tempAuthors.sort((a, b) => b.name.localeCompare(a.name)); break;
      default: break; // No sort or keep original order from API if 'default'
    }
    return tempAuthors;
  }, [activeProject, selectedAuthorFilter, authorSortOption]);

  const handleStylesChange = (newStyles: NewsletterStyles) => {
    if (!activeProjectId) return; // Ensure activeProjectId exists
    updateProjectData(activeProjectId, 'styles', newStyles);
  };

  const contentTypeToIcon = (type: ContentType) => {
    switch (type) {
      case 'authors': return <UsersRound size={16} />;
      case 'facts': return <Lightbulb size={16} />;
      case 'tools': return <Wrench size={16} />;
      case 'newsletters': return <Newspaper size={16} />;
      case 'podcasts': return <PodcastIconLucide size={16} />;
      default: return null;
    }
  }
  const contentTypeToLabel = (type: ContentType) => {
     switch (type) {
      case 'authors': return "Authors & Quotes";
      case 'facts': return "Fun Facts";
      case 'tools': return "Productivity Tools";
      case 'newsletters': return "Newsletters";
      case 'podcasts': return "Podcasts";
      default: return "";
    }
  }
  
  // Initial rendering state (server and first client pass before useEffect sets isClientHydrated=true)
  // Should render based on initialDefaultProject to match SSR.
  // A more sophisticated loading state might be needed if localStorage operations were slow,
  // but for now, this prioritizes avoiding hydration errors.
  if (!isClientHydrated) {
    // Render a minimal shell or the initial state that server would render
    // This helps avoid the "Expected server HTML to contain a matching ..." error.
    // The actual content will populate once isClientHydrated is true and localStorage data is loaded.
    // For now, we let it render the full UI with initialDefaultProject data.
    // If this still causes issues, a dedicated skeleton UI might be needed here.
  }

  // This loader is for when client-side logic determines no project can be shown
  if (isClientHydrated && !activeProject) {
     return (
        <div className="flex h-screen items-center justify-center">
          <div className="text-center p-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-xl text-muted-foreground mb-4">
                 {projects.length === 0 ? "No projects exist." : "Loading project data..."}
              </p>
              <Button onClick={handleNewProject} disabled={!isClientHydrated}>
                Create Your First Project
              </Button>
          </div>
        </div>
      );
  }
  
  // If activeProject is null even after hydration, it means something is wrong with project loading or selection logic
  // For robust UI, ensure activeProject is always available if projects array is not empty.
  // The useEffect hook handling activeProject dependency should manage this.
  // The check above `if (isClientHydrated && !activeProject)` should catch states where no project can be displayed.
  // If activeProject becomes null unexpectedly later, it would indicate a bug in state management.

  if (!activeProject && isClientHydrated) { // Defensive check, should be covered by above loader
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Error: Active project not found.</span>
             <Button onClick={handleNewProject} className="ml-4">Create New Project</Button>
        </div>
    );
  }
  
  // This ensures activeProject is available for rendering the main UI if isClientHydrated.
  // If !isClientHydrated, it uses initialProject state.
  const projectToRender = activeProject || initialDefaultProject;


  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => {
            // Ensure the project exists before setting it as active
            if (projects.find(p => p.id === id)) {
              setActiveProjectId(id);
            } else {
              // Fallback if selected project ID is somehow invalid
              if (projects.length > 0) setActiveProjectId(projects[0].id);
              else setActiveProjectId(null); // Or handleNewProject if no projects
            }
          }}
          onNewProject={handleNewProject}
          onRenameProject={handleRenameProject} // Implement actual rename UI later
          onDeleteProject={(projectId) => { // Implement actual delete UI later
              setProjects(prev => {
                  const remainingProjects = prev.filter(p => p.id !== projectId);
                  if (activeProjectId === projectId) { // If active project is deleted
                      setActiveProjectId(remainingProjects.length > 0 ? remainingProjects[0].id : null);
                  }
                  if (remainingProjects.length === 0) { // If all projects are deleted
                    // Optionally trigger new project creation or show an empty state
                    // For now, activeProjectId will be null, handled by loader above.
                  }
                  return remainingProjects;
              });
              toast({title: "Project Deleted"});
          }}
        />

        <div className="flex flex-1 overflow-hidden relative">
          {isMobile && sidebarState === 'expanded' && (
            <div 
                 className="absolute inset-0 bg-black/30 dark:bg-black/50 z-20 pointer-events-auto transition-opacity duration-300 md:hidden" 
                 onClick={() => toggleAppSidebar()}
            />
          )}

          <ScrollArea className="flex-1 h-full" id="center-column-scroll"> 
            <div className="container mx-auto p-4 md:p-6 space-y-6">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 gap-2">
                <div className="flex-grow min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-primary truncate" title={projectToRender.name}>
                      {projectToRender.name}
                    </h1>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ThemeToggleButton />
                  <AuthButton />
                </div>
              </div>

              <Card className="p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Input
                    id="globalTopic"
                    type="text"
                    value={currentTopic}
                    onChange={(e) => setCurrentTopic(e.target.value)}
                    placeholder="Enter topic (e.g. AI in marketing, Sustainable Energy)"
                    className="flex-grow text-base"
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto min-w-[180px] justify-between">
                        {selectedContentTypes.length === 0
                          ? "Select Content Types"
                          : selectedContentTypes.length === 1
                            ? contentTypeToLabel(selectedContentTypes[0])
                            : selectedContentTypes.length === ALL_CONTENT_TYPES.length
                              ? "All Content Types"
                              : `${selectedContentTypes.length} Types Selected`}
                        <ChevronDown className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 z-50"> 
                      <DropdownMenuLabel>Select Content Types</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={isAllContentTypesSelected}
                        onCheckedChange={handleSelectAllContentTypes}
                        onSelect={(e) => e.preventDefault()} 
                      >
                        All
                      </DropdownMenuCheckboxItem>
                      {ALL_CONTENT_TYPES.map(type => (
                        <DropdownMenuCheckboxItem
                          key={type}
                          checked={selectedContentTypes.includes(type)}
                          onCheckedChange={() => toggleContentType(type)}
                           onSelect={(e) => e.preventDefault()} 
                        >
                          {contentTypeToLabel(type)}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    onClick={handleGenerateContent}
                    disabled={isGenerating || !currentTopic.trim() || selectedContentTypes.length === 0}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate
                  </Button>
                </div>
                {!currentTopic.trim() && <p className="text-sm text-destructive mt-2">Please enter a topic.</p>}
                {currentTopic.trim() && selectedContentTypes.length === 0 && <p className="text-sm text-destructive mt-2">Please select at least one content type.</p>}
              </Card>

              <Separator className="my-6" />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div className="flex-grow w-full md:w-auto"> 
                      <Tabs value={activeUITab} onValueChange={(value) => setActiveUITab(value as ContentType)} className="w-full">
                        <TabsList className="flex flex-wrap gap-2 md:gap-3 py-2 !bg-transparent !p-0 justify-start">
                              {ALL_CONTENT_TYPES.map(type => (
                                <TooltipProvider key={type} delayDuration={300}>
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                        <TabsTrigger
                                            value={type}
                                            className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border !shadow-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary bg-card text-foreground border-border hover:bg-accent/10 data-[state=active]:hover:bg-primary/90 gap-1.5"
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
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2 w-full md:w-auto justify-end"> 
                      <StyleCustomizer initialStyles={projectToRender.styles} onStylesChange={handleStylesChange} />
                  </div>
              </div>
              
              {activeUITab === 'authors' && (
                <>
                  {projectToRender.authors.length > 0 && (
                    <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="min-w-[150px] justify-between">
                            <Filter className="mr-2 h-4 w-4" />
                            {selectedAuthorFilter === "all" ? "All Authors" : selectedAuthorFilter}
                            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="z-50">
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
                          <Button variant="outline" className="min-w-[150px] justify-between">
                            <ArrowUpDown className="mr-2 h-4 w-4" /> Sort By
                            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50">
                          {[
                            { value: "default", label: "Default Order" },
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
                  <ScrollArea className="h-[calc(100vh-450px)] sm:h-[calc(100vh-400px)] min-h-[300px] p-0.5 -m-0.5 rounded-md border">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                      {sortedAndFilteredAuthors.length > 0 ? sortedAndFilteredAuthors.map((authorItem) => (
                        <ContentItemCard
                          key={authorItem.id}
                          id={authorItem.id}
                          title={authorItem.name}
                          typeBadge="Author"
                          isImported={authorItem.imported}
                          onToggleImport={(id, imp) => toggleItemImportStatus(id, imp, 'authors')}
                          className="flex flex-col h-full" 
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
                          itemData={authorItem}
                        />
                      )) : <p className="text-muted-foreground text-center col-span-full py-10">{projectToRender.authors.length > 0 ? "No authors match your filters." : "No authors generated yet. Try generating some!"}</p>}
                    </div>
                  </ScrollArea>
                </>
              )}

              {activeUITab === 'facts' && (
                 <ScrollArea className="h-[calc(100vh-450px)] sm:h-[calc(100vh-400px)] min-h-[300px] p-0.5 -m-0.5 rounded-md border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                    {projectToRender.funFacts.length > 0 ? projectToRender.funFacts.map((fact) => (
                      <ContentItemCard
                        key={fact.id} id={fact.id} content={fact.text}
                        typeBadge={fact.type === "fun" ? "Fun Fact" : "Science Fact"}
                        isImported={fact.selected}
                        onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'facts')}
                        relevanceScore={fact.relevanceScore}
                        itemData={fact}
                      />
                    )) : <p className="text-muted-foreground text-center col-span-full py-10">No facts generated yet. Try generating some!</p>}
                  </div>
                </ScrollArea>
              )}
              {activeUITab === 'tools' && (
                <ScrollArea className="h-[calc(100vh-450px)] sm:h-[calc(100vh-400px)] min-h-[300px] p-0.5 -m-0.5 rounded-md border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                    {projectToRender.tools.length > 0 ? projectToRender.tools.map((tool) => (
                      <ContentItemCard
                        key={tool.id} id={tool.id} title={tool.name}
                        typeBadge={tool.type === "free" ? "Free Tool" : "Paid Tool"}
                        isImported={tool.selected}
                        onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'tools')}
                        relevanceScore={tool.relevanceScore}
                        itemData={tool} content="" 
                      />
                    )) : <p className="text-muted-foreground text-center col-span-full py-10">No tools generated yet. Try generating some!</p>}
                  </div>
                </ScrollArea>
              )}
              {activeUITab === 'newsletters' && (
                <ScrollArea className="h-[calc(100vh-450px)] sm:h-[calc(100vh-400px)] min-h-[300px] p-0.5 -m-0.5 rounded-md border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                    {projectToRender.newsletters.length > 0 ? projectToRender.newsletters.map((nl) => (
                      <ContentItemCard
                        key={nl.id} id={nl.id} title={nl.name} typeBadge="Newsletter"
                        isImported={nl.selected}
                        onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'newsletters')}
                        relevanceScore={nl.relevanceScore} content="" 
                        newsletterOperator={nl.operator} newsletterDescription={nl.description}
                        newsletterSubscribers={nl.subscribers} signUpLink={nl.signUpLink}
                        itemData={nl}
                      />
                    )) : <p className="text-muted-foreground text-center col-span-full py-10">No newsletters generated yet. Try generating some!</p>}
                  </div>
                </ScrollArea>
              )}
              {activeUITab === 'podcasts' && (
                <ScrollArea className="h-[calc(100vh-450px)] sm:h-[calc(100vh-400px)] min-h-[300px] p-0.5 -m-0.5 rounded-md border">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                    {projectToRender.podcasts.length > 0 ? projectToRender.podcasts.map((podcast) => (
                      <ContentItemCard
                        key={podcast.id}
                        id={podcast.id}
                        title={podcast.name}
                        typeBadge="Podcast"
                        isImported={podcast.selected}
                        onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'podcasts')}
                        relevanceScore={podcast.relevanceScore}
                        content={
                          <div className="space-y-1 text-sm">
                            <p className="font-medium text-muted-foreground">{podcast.episodeTitle}</p>
                            <p className="text-xs text-foreground/80 line-clamp-3">{podcast.description}</p>
                          </div>
                        }
                        itemData={podcast}
                        signUpLink={podcast.podcastLink} 
                      />
                    )) : <p className="text-muted-foreground text-center col-span-full py-10">No podcasts generated yet. Try generating some!</p>}
                  </div>
                </ScrollArea>
              )}
            </div>
          </ScrollArea>

          {/* Right Column (Preview) */}
           <div className="hidden md:flex flex-col h-full bg-card border-l shadow-xl w-2/5 lg:w-1/3 relative">
            <ScrollArea className="flex-1 w-full">
              <div className="p-4 md:p-6">
                <NewsletterPreview
                  selectedAuthors={importedAuthors}
                  selectedFunFacts={selectedFunFacts}
                  selectedTools={selectedTools}
                  selectedAggregatedContent={selectedNewsletters} // This is selectedNewsletters
                  selectedPodcasts={selectedPodcasts} // Added
                  styles={projectToRender.styles}
                />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

