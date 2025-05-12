
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AppSidebar } from "./app-sidebar";
import { SettingsPanel } from "./settings-panel";
import { StyleChatDialog } from "./style-chat-dialog";
import { ActualRightSidebar } from "./actual-right-sidebar";
import { LeftSidebarProvider, useLeftSidebar } from "@/components/ui/left-sidebar-elements";
import { RightSidebarProvider, useRightSidebar } from "@/components/ui/right-sidebar-elements";
import { Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

import type { NewsletterStyles, Project, ContentType, WorkspaceView as ContentDisplayView, GeneratedContent } from "./types";
import { ALL_CONTENT_TYPES } from "./types";
import { useToast } from "@/hooks/use-toast";

import { useProjectState, createNewProject } from "./hooks/use-project-state";
import { useContentGeneration } from "./hooks/use-content-generation";
import { useContentFiltersAndSorts } from "./hooks/use-content-filters-sorts";
import { TopicInputSection } from "./ui/topic-input-section";
import { ContentDisplayTabs } from "./ui/content-display-tabs";
import { ContentFiltersBar } from "./ui/content-filters-bar";
import { ContentGrid } from "./ui/content-grid";

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

export type MainViewMode = 'workspace' | 'settings';

function MainWorkspaceInternal() {
  const { toast } = useToast();
  const { state: leftSidebarState, isMobile: isLeftMobile, toggleSidebar: toggleLeftSidebar } = useLeftSidebar();
  const { state: rightSidebarState, isMobile: isRightMobile, toggleSidebar: toggleRightSidebarHook } = useRightSidebar();

  const {
    projects,
    setProjects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    isClientHydrated,
    updateProjectData,
    handleNewProject: actualHandleNewProject,
    handleRenameProject,
    handleDeleteProject: actualHandleDeleteProject,
    handleStylesChange,
    handleStyleChatSubmit,
    toggleItemImportStatus,
    handleToggleItemSavedStatus,
    importedAuthors,
    selectedFunFacts,
    selectedTools,
    selectedNewsletters,
    selectedPodcasts,
  } = useProjectState(initialStyles, STATIC_INITIAL_PROJECT_ID, createNewProject);

  const {
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
  } = useContentGeneration(activeProject, updateProjectData, handleRenameProject, toast);
  
  const [mainViewMode, setMainViewMode] = useState<MainViewMode>('workspace');
  const [currentContentDisplayView, setCurrentContentDisplayView] = useState<ContentDisplayView>('authors');
  const [activeUITab, setActiveUITab] = useState<ContentType>(ALL_CONTENT_TYPES[0]);
   const [isBackdropCustomizerOpen, setIsBackdropCustomizerOpen] = useState(false);


  const {
    getRawItemsForView,
    displayableTabs,
    showOnlySelected,
    setShowOnlySelected,
    filterStates,
    sortStates,
    handleFilterChange,
    handleSortChange,
    uniqueAuthorNamesForFilter,
    sortedAndFilteredAuthors,
    filteredFunFacts,
    filteredTools,
    filteredNewsletters,
    filteredPodcasts,
  } = useContentFiltersAndSorts(activeProject, activeUITab, currentContentDisplayView);

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


  const handleNewProject = useCallback(() => {
    const newPId = actualHandleNewProject();
    if (newPId) {
        setCurrentTopic("");
        setSelectedContentTypesForGeneration(ALL_CONTENT_TYPES);
        setCurrentContentDisplayView('authors');
        setActiveUITab(ALL_CONTENT_TYPES[0]);
        setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<ContentType, boolean>));
        setMainViewMode('workspace');
    }
  }, [actualHandleNewProject, setSelectedContentTypesForGeneration, setShowOnlySelected]);

  const handleDeleteProject = useCallback((projectId: string) => {
    const nextActiveId = actualHandleDeleteProject(projectId);
    if(nextActiveId === null && projects.length === 1 && projects[0].id === projectId) { // only one project was deleted
        handleNewProject(); // create a new default one
    } else if (nextActiveId) {
        setCurrentTopic(projects.find(p => p.id === nextActiveId)?.topic || "");
        setCurrentContentDisplayView('authors'); 
        setActiveUITab('authors');
        setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {}));
    }
    toast({title: "Project Deleted"});
    setMainViewMode('workspace');
  }, [actualHandleDeleteProject, projects, handleNewProject, toast, setShowOnlySelected]);


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

  const centerShouldBeDimmed = useMemo(() => {
    const backdropType = activeProject?.styles?.workspaceBackdropType;
    if (backdropType === 'none' || !backdropType) return false;

    const isLeftFloatingAndExpanded = !isLeftMobile && leftSidebarState === 'expanded';
    const isRightFloatingAndExpanded = !isRightMobile && rightSidebarState === 'expanded';
    
    return isLeftFloatingAndExpanded || isRightFloatingAndExpanded;
  }, [activeProject?.styles?.workspaceBackdropType, isLeftMobile, leftSidebarState, isRightMobile, rightSidebarState]);

  const handleOverlayClick = () => {
    if (!isLeftMobile && leftSidebarState === 'expanded' && typeof toggleLeftSidebar === 'function') {
        toggleLeftSidebar();
    }
    if (!isRightMobile && rightSidebarState === 'expanded' && typeof toggleRightSidebarHook === 'function') {
        toggleRightSidebarHook();
    }
  };
  
  const [isStyleChatOpen, setIsStyleChatOpen] = useState(false);

  const onChatSubmitForStyles = async (description: string) => {
    if (!activeProjectId || !activeProject) {
        toast({ title: "Error", description: "No active project selected.", variant: "destructive" });
        return;
    }
    await handleStyleChatSubmit(description, setIsStyleChatLoading, setIsStyleChatOpen);
  }


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
                  <AlertDescription>Could not load project data or no project selected. Please refresh or create a new project.</AlertDescription>
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
            const projectExists = projects.find(p => p.id === id);
            if (projectExists) {
              setActiveProjectId(id);
              setCurrentTopic(projectExists.topic);
              setCurrentContentDisplayView('authors'); 
              setActiveUITab('authors'); 
              setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {}));
            } else if (projects.length > 0) {
              setActiveProjectId(projects[0].id);
              setCurrentTopic(projects[0].topic);
              setCurrentContentDisplayView('authors');
              setActiveUITab('authors');
              setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {}));
            } else {
              setActiveProjectId(null); 
            }
            setMainViewMode('workspace'); 
          }}
          onNewProject={handleNewProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          onSelectSavedItemsView={() => {
            setCurrentContentDisplayView('savedItems');
            setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {}));
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
            setMainViewMode('workspace'); 
          }}
          isSavedItemsActive={currentContentDisplayView === 'savedItems'}
          currentMainViewMode={mainViewMode}
          onSetMainViewMode={setMainViewMode}
        />

        {mainViewMode === 'workspace' && (
          <>
            <div
              className={cn(
                "relative flex-1 h-full transition-opacity duration-300",
                 centerShouldBeDimmed ? "opacity-50 " : "opacity-100",
                 (centerShouldBeDimmed && ((!isLeftMobile && leftSidebarState === 'expanded') || (!isRightMobile && rightSidebarState === 'expanded'))) ? "pointer-events-auto" : "pointer-events-auto" // ensure main area is clickable if sidebars are floating
              )}
              style={workspaceStyle}
              onClick={centerShouldBeDimmed ? handleOverlayClick : undefined} 
            >
              {centerShouldBeDimmed && (
                <div
                  className="absolute inset-0 bg-black/30 dark:bg-black/50 z-20 transition-opacity duration-300"
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

                  {currentContentDisplayView !== 'savedItems' && (
                     <TopicInputSection
                        currentTopic={currentTopic}
                        onCurrentTopicChange={setCurrentTopic}
                        selectedContentTypesForGeneration={selectedContentTypesForGeneration}
                        onToggleContentTypeForGeneration={toggleContentTypeForGeneration}
                        onSelectAllContentTypesForGeneration={handleSelectAllContentTypesForGeneration}
                        isAllContentTypesForGenerationSelected={isAllContentTypesForGenerationSelected}
                        onGenerateContent={handleGenerateContent}
                        isGenerating={isGenerating}
                        isGenerateButtonDisabled={isGenerateButtonDisabled}
                        generationProgress={generationProgress}
                        currentGenerationMessage={currentGenerationMessage}
                        activeProjectGeneratedContentTypes={projectToRender.generatedContentTypes}
                        activeProjectTopic={projectToRender.topic}
                    />
                  )}
                  
                  <div className="space-y-4"> 
                    <ContentDisplayTabs
                        activeUITab={activeUITab}
                        onActiveUITabChange={(value) => setActiveUITab(value as ContentType)}
                        displayableTabs={displayableTabs}
                        isGenerating={isGenerating}
                        generationProgress={generationProgress}
                    />
                    
                    {(!isGenerating || generationProgress === 100) && (projectToRender.generatedContentTypes.length > 0 || (currentContentDisplayView === 'savedItems' && (projectToRender.authors.some(a=>a.saved) || projectToRender.funFacts.some(f=>f.saved) || projectToRender.tools.some(t=>t.saved) || projectToRender.newsletters.some(n=>n.saved) || projectToRender.podcasts.some(p=>p.saved) ) ) ) && (
                        <ContentFiltersBar
                            activeUITab={activeUITab}
                            filterStates={filterStates}
                            sortStates={sortStates}
                            onFilterChange={handleFilterChange}
                            onSortChange={handleSortChange}
                            showOnlySelected={showOnlySelected}
                            onShowOnlySelectedChange={(type, checked) => setShowOnlySelected(prev => ({ ...prev, [type]: checked }))}
                            currentContentDisplayView={currentContentDisplayView}
                            uniqueAuthorNamesForFilter={uniqueAuthorNamesForFilter}
                        />
                    )}
                  </div>
                  
                  <ContentGrid
                      activeUITab={activeUITab}
                      isGenerating={isGenerating}
                      generationProgress={generationProgress}
                      getRawItemsForView={getRawItemsForView}
                      sortedAndFilteredAuthors={sortedAndFilteredAuthors}
                      filteredFunFacts={filteredFunFacts}
                      filteredTools={filteredTools}
                      filteredNewsletters={filteredNewsletters}
                      filteredPodcasts={filteredPodcasts}
                      showOnlySelected={showOnlySelected}
                      currentContentDisplayView={currentContentDisplayView}
                      onToggleItemImportStatus={toggleItemImportStatus}
                      onToggleItemSavedStatus={handleToggleItemSavedStatus}
                  />
                </div>
              </ScrollArea>
            </div>
            
            <ActualRightSidebar
                initialStyles={projectToRender.styles}
                onStylesChange={handleStylesChange}
                selectedAuthors={importedAuthors}
                selectedFunFacts={selectedFunFacts}
                selectedTools={selectedTools}
                selectedNewsletters={selectedNewsletters}
                selectedPodcasts={selectedPodcasts}
                onSetIsStyleChatOpen={setIsStyleChatOpen}
            />
          </>
        )}
        {mainViewMode === 'settings' && activeProject && (
          <SettingsPanel
            initialStyles={activeProject.styles}
            onStylesChange={handleStylesChange}
            isStyleChatOpen={isStyleChatOpen}
            onSetIsStyleChatOpen={setIsStyleChatOpen}
            onStyleChatSubmit={onChatSubmitForStyles}
            isLoadingStyleChat={isStyleChatLoading}
            isBackdropCustomizerOpen={isBackdropCustomizerOpen}
            onSetIsBackdropCustomizerOpen={setIsBackdropCustomizerOpen}
          />
        )}
      </div>
      <StyleChatDialog
        isOpen={isStyleChatOpen}
        onOpenChange={setIsStyleChatOpen}
        onSubmit={onChatSubmitForStyles}
        isLoading={isStyleChatLoading}
      />
    </TooltipProvider>
  );
}

export function MainWorkspace() {
  return (
    <LeftSidebarProvider>
      <RightSidebarProvider defaultOpen={true}> 
        <MainWorkspaceInternal />
      </RightSidebarProvider>
    </LeftSidebarProvider>
  )
}
