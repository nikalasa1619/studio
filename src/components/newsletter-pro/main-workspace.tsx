// src/components/newsletter-pro/main-workspace.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

import type { NewsletterStyles, Project, ContentType, WorkspaceView, PersonalizationSettings } from "./types";
import { ALL_CONTENT_TYPES } from "./types";
import { useToast } from "@/hooks/use-toast";

import { AppSidebar } from "./app-sidebar";
import { SettingsPanel } from "@/components/newsletter-pro/settings/settings-panel"; 
import { StyleChatDialog } from "./style-chat-dialog";
import { ActualRightSidebar } from "./actual-right-sidebar"; 
import { LeftSidebarProvider, useLeftSidebar } from "@/components/ui/left-sidebar-elements";
import { RightSidebarProvider, useRightSidebar } from "@/components/ui/right-sidebar-elements"; 

import { useProjectState, createNewProject } from "./hooks/use-project-state";
import { useContentGeneration } from "./hooks/use-content-generation";
import { useContentFiltersAndSorts } from "./hooks/use-content-filters-sorts";
import { TopicInputSection } from "./ui/topic-input-section";
import { ContentDisplayTabs } from "./ui/content-display-tabs";
import { ContentFiltersBar } from "./ui/content-filters-bar";
import { ContentGrid } from "./ui/content-grid";
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

export type MainViewMode = 'workspace' | 'settings';

function MainWorkspaceInternal() {
  const { toast } = useToast();
  const { state: leftSidebarState, isMobile: isLeftMobile, toggleSidebar: toggleLeftSidebar } = useLeftSidebar();
  const { state: rightSidebarState, isMobile: isRightMobile, toggleSidebar: toggleRightSidebarHook } = useRightSidebar();

  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    isClientHydrated,
    updateProjectData,
    handleNewProject: actualHandleNewProject,
    handleRenameProject,
    handleDeleteProject: actualHandleDeleteProject,
    handleStylesChange,
    handlePersonalizationChange, 
    handleStyleChatSubmit: actualHandleStyleChatSubmit,
    toggleItemImportStatus,
    handleToggleItemSavedStatus,
    importedAuthors,
    selectedFunFacts,
    selectedTools,
    selectedNewsletters,
    selectedPodcasts,
    resetAllData,
  } = useProjectState(initialStyles, STATIC_INITIAL_PROJECT_ID);

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
  const [currentOverallView, setCurrentOverallView] = useState<WorkspaceView>('authors'); 
  const [activeUITab, setActiveUITab] = useState<ContentType>(ALL_CONTENT_TYPES[0]);
  

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
  } = useContentFiltersAndSorts(activeProject, activeUITab, currentOverallView);


  useEffect(() => {
    if (activeProject) { 
      if (displayableTabs.length > 0) {
        if (!displayableTabs.includes(activeUITab)) {
          setActiveUITab(displayableTabs[0]);
        }
      } else if (currentOverallView !== 'savedItems' && !activeProject.topic && !isGenerating) { 
        setActiveUITab(ALL_CONTENT_TYPES[0]);
      } else if (currentOverallView === 'savedItems' && displayableTabs.length === 0) {
         setActiveUITab(ALL_CONTENT_TYPES[0]);
      }
    }
  }, [displayableTabs, activeUITab, activeProject, currentOverallView, isGenerating]);


  const handleNewProject = useCallback(() => {
    const newPId = actualHandleNewProject();
    if (newPId) {
        setCurrentTopic(""); 
        setSelectedContentTypesForGeneration(ALL_CONTENT_TYPES); 
        setCurrentOverallView('authors'); 
        setActiveUITab(ALL_CONTENT_TYPES[0]); 
        setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<ContentType, boolean>));
        setMainViewMode('workspace');
    }
  }, [actualHandleNewProject, setCurrentTopic, setSelectedContentTypesForGeneration, setCurrentOverallView, setActiveUITab, setShowOnlySelected]);

  const handleDeleteProject = useCallback((projectId: string) => {
    const nextActiveId = actualHandleDeleteProject(projectId);
    if(nextActiveId === null && projects.length === 1 && projects[0].id === projectId) { 
        handleNewProject(); 
    } else if (nextActiveId) {
        const nextProject = projects.find(p => p.id === nextActiveId);
        setCurrentTopic(nextProject?.topic || "");
        setCurrentOverallView('authors'); 
        setActiveUITab('authors');
        setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<ContentType, boolean>));
    }
    toast({title: "Project Deleted"});
    setMainViewMode('workspace');
  }, [actualHandleDeleteProject, projects, handleNewProject, toast, setCurrentTopic, setCurrentOverallView, setActiveUITab, setShowOnlySelected]);


  const workspaceStyle = useMemo(() => {
    if (!activeProject || !activeProject.styles) return { backgroundColor: 'hsl(var(--background))' };
    const { workspaceBackdropType, workspaceBackdropSolidColor, workspaceBackdropGradientStart, workspaceBackdropGradientEnd, workspaceBackdropImageURL } = activeProject.styles;

    switch (workspaceBackdropType) {
      case 'solid':
        return { backgroundColor: workspaceBackdropSolidColor || 'hsl(var(--background))' };
      case 'gradient':
        return { backgroundImage: `linear-gradient(to bottom right, ${workspaceBackdropGradientStart || 'hsl(var(--background))'}, ${workspaceBackdropGradientEnd || 'hsl(var(--background))'})` };
      case 'image':
        return {
          backgroundImage: `url(${workspaceBackdropImageURL || ''})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      case 'none':
      default:
        return { backgroundColor: 'hsl(var(--background))' }; 
    }
  }, [activeProject]);

  const centerShouldBeDimmed = useMemo(() => {
    const isLeftFloatingAndExpanded = !isLeftMobile && leftSidebarState === 'expanded';
    const isRightFloatingAndExpanded = !isRightMobile && rightSidebarState === 'expanded';
    
    // Dim if either floating sidebar is expanded, regardless of backdrop type
    return isLeftFloatingAndExpanded || isRightFloatingAndExpanded;
  }, [isLeftMobile, leftSidebarState, isRightMobile, rightSidebarState]);


  const handleOverlayClick = () => {
    if (!isLeftMobile && leftSidebarState === 'expanded' && typeof toggleLeftSidebar === 'function') {
        toggleLeftSidebar();
    }
    if (!isRightMobile && rightSidebarState === 'expanded' && typeof toggleRightSidebarHook === 'function') {
        toggleRightSidebarHook();
    }
  };
  
  const [isStyleChatOpen, setIsStyleChatOpen] = useState(false);
  const [isBackdropCustomizerOpen, setIsBackdropCustomizerOpen] = useState(false);


  const onChatSubmitForStyles = async (description: string) => {
    if (!activeProjectId || !activeProject) {
        toast({ title: "Error", description: "No active project selected.", variant: "destructive" });
        return;
    }
    await actualHandleStyleChatSubmit(description, setIsStyleChatLoading, setIsStyleChatOpen);
  }

  const isTopicLocked = useMemo(() => {
    if (!activeProject) return false;
    return activeProject.topic.trim() !== "" && activeProject.generatedContentTypes.length > 0 && currentTopic === activeProject.topic;
  }, [activeProject, currentTopic]);


  const [clientReady, setClientReady] = useState(false);
  useEffect(() => {
    if (isClientHydrated) {
      setClientReady(true);
    }
  }, [isClientHydrated]);

  if (!clientReady || !activeProject) {
    return (
      <div className="flex h-screen items-center justify-center p-6 bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary mr-4" />
        <p className="text-xl text-muted-foreground">
          {clientReady && projects.length === 0 ? "Creating initial project..." : "Loading project data..."}
        </p>
      </div>
    );
  }
  
  const projectToRender = activeProject;

  if (!projectToRender) {
      return (
          <div className="flex h-screen items-center justify-center p-6 bg-background">
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
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => {
            const projectExists = projects.find(p => p.id === id);
            if (projectExists) {
              setActiveProjectId(id);
              setCurrentTopic(projectExists.topic || ""); 
              setCurrentOverallView('authors'); 
              setActiveUITab('authors'); 
              setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<ContentType, boolean>));
            } else if (projects.length > 0) {
              setActiveProjectId(projects[0].id);
              setCurrentTopic(projects[0].topic || "");
              setCurrentOverallView('authors');
              setActiveUITab('authors');
              setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<ContentType, boolean>));
            } else {
              setActiveProjectId(null); 
              setCurrentTopic("");
            }
            setMainViewMode('workspace'); 
          }}
          onNewProject={handleNewProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          onSelectSavedItemsView={() => {
            setCurrentOverallView('savedItems');
            setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<ContentType, boolean>));
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
          isSavedItemsActive={currentOverallView === 'savedItems'}
          currentMainViewMode={mainViewMode}
          onSetMainViewMode={setMainViewMode}
        />

        {mainViewMode === 'workspace' && (
          <>
            <div
              className={cn(
                "relative flex-1 h-full transition-all duration-300 flex flex-col",
                 centerShouldBeDimmed ? "opacity-50 pointer-events-auto" : "opacity-100 pointer-events-auto"
              )}
              style={workspaceStyle}
              onClick={centerShouldBeDimmed ? handleOverlayClick : undefined} 
            >
              {centerShouldBeDimmed && (
                <div
                  className="absolute inset-0 bg-black/30 dark:bg-black/50 z-20 transition-opacity duration-300"
                  aria-hidden="true"
                />
              )}
              <div className="flex-grow overflow-y-auto z-10 relative" id="center-column-scroll"> 
                <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
                  
                  {currentOverallView !== 'savedItems' && (
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
                        activeProjectGeneratedContentTypes={projectToRender.generatedContentTypes}
                        activeProjectTopic={projectToRender.topic}
                        isTopicLocked={isTopicLocked}
                        setSelectedContentTypesForGeneration={setSelectedContentTypesForGeneration}
                        generationProgress={generationProgress}
                        currentGenerationMessage={currentGenerationMessage}
                    />
                  )}
                  
                  {isGenerating && generationProgress < 100 && !currentGenerationMessage.toLowerCase().includes("complete") && !currentGenerationMessage.toLowerCase().includes("finished") && !currentOverallView !== 'savedItems' ? (
                     <div className="flex flex-col items-center justify-center flex-grow py-20 min-h-[300px] animate-fadeInUp"> 
                        <Loader2 className="h-16 w-16 animate-spin text-primary mb-6" />
                        <p className="text-lg text-foreground/80">
                            {currentGenerationMessage || "Generating content, please wait..."}
                        </p>
                    </div>
                  ) : (
                    <>
                    <div className="sticky top-6 z-10 bg-transparent pt-3 space-y-4 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8"> 
                        <ContentDisplayTabs
                            activeUITab={activeUITab}
                            onActiveUITabChange={(value) => setActiveUITab(value as ContentType)}
                            displayableTabs={displayableTabs}
                        />
                        
                        {(projectToRender.generatedContentTypes.length > 0 || (currentOverallView === 'savedItems' && displayableTabs.length > 0 ) ) && (
                            <ContentFiltersBar
                                activeUITab={activeUITab}
                                filterStates={filterStates}
                                sortStates={sortStates}
                                onFilterChange={handleFilterChange}
                                onSortChange={handleSortChange}
                                showOnlySelected={showOnlySelected}
                                onShowOnlySelectedChange={(type, checked) => setShowOnlySelected(prev => ({ ...prev, [type]: checked }))}
                                currentContentDisplayView={currentOverallView}
                                uniqueAuthorNamesForFilter={uniqueAuthorNamesForFilter}
                            />
                        )}
                      </div>
                      <div className="px-4 sm:px-6 md:px-8"> {/* Added padding for content grid consistency */}
                        <ContentGrid
                            activeUITab={activeUITab}
                            getRawItemsForView={getRawItemsForView}
                            sortedAndFilteredAuthors={sortedAndFilteredAuthors}
                            filteredFunFacts={filteredFunFacts}
                            filteredTools={filteredTools}
                            filteredNewsletters={filteredNewsletters}
                            filteredPodcasts={filteredPodcasts}
                            showOnlySelected={showOnlySelected}
                            currentContentDisplayView={currentOverallView}
                            onToggleItemImportStatus={toggleItemImportStatus}
                            onToggleItemSavedStatus={handleToggleItemSavedStatus}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <ActualRightSidebar
                initialStyles={projectToRender.styles}
                onStylesChange={handleStylesChange}
                personalizationSettings={projectToRender.personalization} 
                onPersonalizationChange={handlePersonalizationChange} 
                selectedAuthors={importedAuthors}
                selectedFunFacts={selectedFunFacts}
                selectedTools={selectedTools}
                selectedNewsletters={selectedNewsletters}
                selectedPodcasts={selectedPodcasts}
                onSetIsStyleChatOpen={setIsStyleChatOpen}
                projectTopic={projectToRender.topic || "Newsletter Content"}
            />
          </>
        )}
        {mainViewMode === 'settings' && activeProject && (
          <SettingsPanel 
            initialStyles={projectToRender.styles}
            onStylesChange={handleStylesChange}
            personalizationSettings={projectToRender.personalization}
            onPersonalizationChange={handlePersonalizationChange}
            onResetAllData={resetAllData}
            onSetIsStyleChatOpen={setIsStyleChatOpen}
            onSetIsBackdropCustomizerOpen={setIsBackdropCustomizerOpen}
            isBackdropCustomizerOpen={isBackdropCustomizerOpen}
            onStyleChatSubmit={onChatSubmitForStyles} 
            isLoadingStyleChat={isStyleChatLoading} 
          />
        )}
      </div>
      <StyleChatDialog
        isOpen={isStyleChatOpen}
        onOpenChange={setIsStyleChatOpen}
        onSubmit={onChatSubmitForStyles}
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

export function MainWorkspace() {
  return (
    <LeftSidebarProvider>
      <RightSidebarProvider defaultOpen={true}> 
        <MainWorkspaceInternal />
      </RightSidebarProvider>
    </LeftSidebarProvider>
  )
}