"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card"; // Added Card import

import { ContentItemCard } from "./content-item-card";
import { NewsletterPreview } from "./newsletter-preview";
import { StyleCustomizer } from "./style-customizer";
import { AppSidebar } from "./app-sidebar";
import { useSidebar } from "@/components/ui/sidebar"; // SidebarProvider is in page.tsx
import type {
  Author,
  FunFactItem,
  ToolItem,
  NewsletterItem,
  PodcastItem,
  NewsletterStyles,
  Project,
  ContentType,
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

import { ChevronDown, Filter, ArrowUpDown, Palette, PanelRightClose, PanelRightOpen, Loader2, ListChecks, Newspaper, Podcast as PodcastIconLucide, Wrench, Lightbulb, UsersRound } from "lucide-react";
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

type AuthorSortOption = "relevance_desc" | "relevance_asc" | "name_asc" | "name_desc" | "default";

const createNewProject = (idSuffix: number | string, topic: string = ""): Project => ({
  id: `project-${idSuffix}-${Date.now()}`,
  name: topic ? topic.substring(0, 20) : `Untitled Project ${idSuffix}`,
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
  const [projects, setProjects] = useState<Project[]>(() => [createNewProject(1)]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(projects[0]?.id || null);

  const [currentTopic, setCurrentTopic] = useState<string>("");
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>(ALL_CONTENT_TYPES);

  const [activeUITab, setActiveUITab] = useState<ContentType>(ALL_CONTENT_TYPES[0]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<string>("all");
  const [authorSortOption, setAuthorSortOption] = useState<AuthorSortOption>("default");
  const [isPreviewPanelOpen, setIsPreviewPanelOpen] = useState(true);
  const { toast } = useToast();

  const { state: sidebarState, isMobile, openMobile: isMobileSidebarOpen } = useSidebar();
  const isSidebarActuallyExpanded = (!isMobile && sidebarState === 'expanded') || (isMobile && isMobileSidebarOpen);


  const activeProject = useMemo(() => {
    return projects.find(p => p.id === activeProjectId);
  }, [projects, activeProjectId]);

  useEffect(() => {
    if (activeProject) {
      setCurrentTopic(activeProject.topic);
    } else if (projects.length > 0) {
      setActiveProjectId(projects[0].id);
    }
  }, [activeProject, projects]);

  const updateProjectData = useCallback(<K extends keyof Project>(projectId: string, key: K, data: Project[K]) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? { ...p, [key]: data, lastModified: Date.now() } : p
      ).sort((a,b) => b.lastModified - a.lastModified) // Keep sorted by lastModified
    );
  }, []);

  const handleNewProject = () => {
    const newP = createNewProject(projects.length + 1);
    setProjects(prev => [...prev, newP].sort((a,b) => b.lastModified - a.lastModified));
    setActiveProjectId(newP.id);
    setCurrentTopic("");
    setSelectedContentTypes(ALL_CONTENT_TYPES);
  };

  const handleSelectProject = (projectId: string) => {
    setActiveProjectId(projectId);
  };

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
    setSelectedAuthorFilter("all");
    setAuthorSortOption("default");
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
    if (!currentTopic.trim() || selectedContentTypes.length === 0 || !activeProject) {
      toast({ title: "Missing Information", description: "Please enter a topic and select content types to generate.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    updateProjectData(activeProject.id, 'topic', currentTopic);

    if (activeProject.name.startsWith("Untitled Project")) {
        handleRenameProject(activeProject.id, currentTopic.substring(0,20) || `Project ${activeProject.id.substring(8,12)}`);
    }

    const generationPromises = [];

    if (selectedContentTypes.includes('authors')) {
      generationPromises.push(getAuthorsAndQuotesAction({ topic: currentTopic }).then(handleAuthorsData).catch(err => toast({ title: "Author Generation Failed", description: err.message, variant: "destructive"})));
    }
    if (selectedContentTypes.includes('facts')) {
      generationPromises.push(generateFunFactsAction({ topic: currentTopic }).then(handleFunFactsData).catch(err => toast({ title: "Fact Generation Failed", description: err.message, variant: "destructive"})));
    }
    if (selectedContentTypes.includes('tools')) {
      generationPromises.push(recommendToolsAction({ topic: currentTopic }).then(handleToolsData).catch(err => toast({ title: "Tool Recommendation Failed", description: err.message, variant: "destructive"})));
    }
    if (selectedContentTypes.includes('newsletters')) {
      generationPromises.push(fetchNewslettersAction({ topic: currentTopic }).then(handleNewslettersData).catch(err => toast({ title: "Newsletter Fetching Failed", description: err.message, variant: "destructive"})));
    }
    if (selectedContentTypes.includes('podcasts')) {
      generationPromises.push(fetchPodcastsAction({ topic: currentTopic }).then(handlePodcastsData).catch(err => toast({ title: "Podcast Fetching Failed", description: err.message, variant: "destructive"})));
    }

    try {
      await Promise.all(generationPromises);
      toast({ title: "Content Generation Complete!", description: "Selected content has been fetched."});
    } catch (error) {
      console.error("Error during bulk generation:", error);
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
      default: break;
    }
    return tempAuthors;
  }, [activeProject, selectedAuthorFilter, authorSortOption]);

  const handleStylesChange = (newStyles: NewsletterStyles) => {
    if (!activeProjectId) return;
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

  if (!activeProject) {
     if (projects.length > 0 && !activeProjectId) {
        setActiveProjectId(projects[0].id);
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
     }
     if (projects.length === 0) {
        return (
          <div className="flex h-screen items-center justify-center">
            <div className="text-center p-6">
                <p className="text-xl text-muted-foreground mb-4">No projects available.</p>
                <Button onClick={handleNewProject}>Create Your First Project</Button>
            </div>
          </div>
        );
     }
     return <div className="flex h-screen items-center justify-center"><p className="p-6">No active project selected or project data is inconsistent.</p></div>;
  }


  return (
    <div className="flex h-screen w-full bg-background">
      <AppSidebar
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={handleSelectProject}
        onNewProject={handleNewProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={(projectId) => {
            setProjects(prev => prev.filter(p => p.id !== projectId));
            if (activeProjectId === projectId) {
                setActiveProjectId(projects.length > 1 ? projects.find(p => p.id !== projectId)!.id : null);
            }
            toast({title: "Project Deleted"});
        }}
      />

      <div className="flex flex-1 overflow-hidden relative">
         { (isSidebarActuallyExpanded || isPreviewPanelOpen) && (
           <div className="absolute inset-0 bg-black/30 dark:bg-black/50 z-20 pointer-events-none transition-opacity duration-300" />
        )}

        {/* Column B: Main Workspace Content */}
        <ScrollArea className="flex-1 h-full z-10"> {/* Column B */}
          <div className="container mx-auto p-4 md:p-6 space-y-6">

            <div className="flex justify-between items-center pt-4">
              <h1 className="text-3xl font-bold text-primary">{activeProject?.name || "NewsLetterPro"}</h1>
              <div className="flex items-center gap-2">
                <ThemeToggleButton />
                <AuthButton />
              </div>
            </div>

            <div className="bg-card p-4 sm:p-6 rounded-lg shadow-lg">
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
                  <DropdownMenuContent className="w-64">
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
            </div>

            <Separator className="my-6" />

            <div className="flex justify-between items-center mb-4">
                <div className="flex-grow"> {/* Wrapper for Tabs to control its growth */}
                    <Tabs value={activeUITab} onValueChange={(value) => setActiveUITab(value as ContentType)} className="w-full">
                       <TabsList className="flex flex-wrap gap-2 md:gap-3 py-2 !bg-transparent !p-0">
                            {ALL_CONTENT_TYPES.map(type => (
                                <TabsTrigger
                                  key={type}
                                  value={type}
                                  className="inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 md:px-4 md:py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border !shadow-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary bg-transparent text-foreground border-border hover:bg-accent/10 data-[state=active]:hover:bg-primary/90 gap-1.5"
                                >
                                    {contentTypeToIcon(type)}
                                    {contentTypeToLabel(type)}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
                 <div className="flex-shrink-0 flex items-center gap-2 ml-4"> {/* Container for StyleCustomizer and Preview Toggle Button */}
                    <StyleCustomizer initialStyles={activeProject.styles} onStylesChange={handleStylesChange} />
                    <TooltipProvider>
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsPreviewPanelOpen(!isPreviewPanelOpen)}
                            className="z-40"
                            aria-label={isPreviewPanelOpen ? "Collapse Preview" : "Expand Preview"}
                            >
                            {isPreviewPanelOpen ? <PanelRightClose /> : <PanelRightOpen />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">
                            <p>{isPreviewPanelOpen ? "Collapse Preview" : "Expand Preview"}</p>
                        </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                 </div>
            </div>

            {activeUITab === 'authors' && (
              <>
                {activeProject.authors.length > 0 && (
                  <div className="mb-4 flex flex-wrap items-center gap-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Filter className="mr-2 h-4 w-4" />
                          Filter: {selectedAuthorFilter === "all" ? "All Authors" : selectedAuthorFilter}
                          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuCheckboxItem
                          checked={selectedAuthorFilter === "all"}
                          onCheckedChange={() => setSelectedAuthorFilter("all")}
                        >
                          All Authors
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        {uniqueAuthorNamesForFilter.map(name => (
                          <DropdownMenuCheckboxItem
                            key={name}
                            checked={selectedAuthorFilter === name}
                            onCheckedChange={() => setSelectedAuthorFilter(name)}
                          >
                            {name}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <ArrowUpDown className="mr-2 h-4 w-4" /> Sort By
                          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {[
                          { value: "default", label: "Default Order" },
                          { value: "relevance_desc", label: "Relevance (High to Low)" },
                          { value: "relevance_asc", label: "Relevance (Low to High)" },
                          { value: "name_asc", label: "Name (A-Z)" },
                          { value: "name_desc", label: "Name (Z-A)" },
                        ].map(option => (
                          <DropdownMenuCheckboxItem
                            key={option.value}
                            checked={authorSortOption === option.value}
                            onCheckedChange={() => setAuthorSortOption(option.value as AuthorSortOption)}
                          >
                            {option.label}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px] p-0.5 rounded-md border">
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
                    )) : <p className="text-muted-foreground text-center col-span-full py-10">{activeProject.authors.length > 0 ? "No authors match criteria." : "No authors generated for this project."}</p>}
                  </div>
                </ScrollArea>
              </>
            )}

            {activeUITab === 'facts' && (
              <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px] p-0.5 rounded-md border">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                  {activeProject.funFacts.length > 0 ? activeProject.funFacts.map((fact) => (
                    <ContentItemCard
                      key={fact.id} id={fact.id} content={fact.text}
                      typeBadge={fact.type === "fun" ? "Fun Fact" : "Science Fact"}
                      isImported={fact.selected}
                      onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'facts')}
                      relevanceScore={fact.relevanceScore}
                      itemData={fact}
                    />
                  )) : <p className="text-muted-foreground text-center col-span-full py-10">No facts generated for this project.</p>}
                </div>
              </ScrollArea>
            )}
            {activeUITab === 'tools' && (
              <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px] p-0.5 rounded-md border">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                  {activeProject.tools.length > 0 ? activeProject.tools.map((tool) => (
                    <ContentItemCard
                      key={tool.id} id={tool.id} title={tool.name}
                      typeBadge={tool.type === "free" ? "Free Tool" : "Paid Tool"}
                      isImported={tool.selected}
                      onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'tools')}
                      relevanceScore={tool.relevanceScore}
                      itemData={tool} content=""
                    />
                  )) : <p className="text-muted-foreground text-center col-span-full py-10">No tools generated for this project.</p>}
                </div>
              </ScrollArea>
            )}
            {activeUITab === 'newsletters' && (
              <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px] p-0.5 rounded-md border">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                  {activeProject.newsletters.length > 0 ? activeProject.newsletters.map((nl) => (
                    <ContentItemCard
                      key={nl.id} id={nl.id} title={nl.name} typeBadge="Newsletter"
                      isImported={nl.selected}
                      onToggleImport={(id, sel) => toggleItemImportStatus(id, sel, 'newsletters')}
                      relevanceScore={nl.relevanceScore} content=""
                      newsletterOperator={nl.operator} newsletterDescription={nl.description}
                      newsletterSubscribers={nl.subscribers} signUpLink={nl.signUpLink}
                      itemData={nl}
                    />
                  )) : <p className="text-muted-foreground text-center col-span-full py-10">No newsletters generated for this project.</p>}
                </div>
              </ScrollArea>
            )}
             {activeUITab === 'podcasts' && (
              <ScrollArea className="h-[calc(100vh-400px)] min-h-[300px] p-0.5 rounded-md border">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
                  {activeProject.podcasts.length > 0 ? activeProject.podcasts.map((podcast) => (
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
                  )) : <p className="text-muted-foreground text-center col-span-full py-10">No podcasts generated for this project.</p>}
                </div>
              </ScrollArea>
            )}
          </div>
        </ScrollArea>

        {/* Column C: Preview Pane - positioned to overlay */}
        <div className={cn(
          "fixed top-0 bottom-0 h-full bg-card border-l flex flex-col items-start shadow-xl transition-transform duration-300 ease-in-out z-30",
          "right-0",
          isPreviewPanelOpen ? "translate-x-0 w-full md:w-2/5 lg:w-1/3" : "translate-x-full w-0"
        )}>
          {isPreviewPanelOpen && (
            <ScrollArea className="flex-1 w-full">
              <div className="p-4 md:p-6">
                <NewsletterPreview
                  selectedAuthors={importedAuthors}
                  selectedFunFacts={selectedFunFacts}
                  selectedTools={selectedTools}
                  selectedAggregatedContent={selectedNewsletters}
                  selectedPodcasts={selectedPodcasts}
                  styles={activeProject.styles}
                />
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}

