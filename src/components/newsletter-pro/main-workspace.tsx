
// src/components/newsletter-pro/main-workspace.tsx
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2, Edit2 } from "lucide-react"; 
import { cn } from "@/lib/utils";

import type { NewsletterStyles, Project, ContentType, WorkspaceView, PersonalizationSettings, LogEntry } from "./types";
import { ALL_CONTENT_TYPES } from "./types";
import { useToast } from "@/hooks/use-toast";

import { AppSidebar } from "./app-sidebar";
import { SettingsPanel } from "./settings/settings-panel"; 
import { ActualRightSidebar } from "./actual-right-sidebar"; 
import { LeftSidebarProvider, useLeftSidebar } from "@/components/ui/left-sidebar-elements";
import { RightSidebarProvider, useRightSidebar } from "@/components/ui/right-sidebar-elements"; 

import { useProjectState, createNewProject } from "./hooks/use-project-state";
import { useContentGeneration } from "./hooks/use-content-generation";
import { useContentFiltersAndSorts } from "./hooks/use-content-filters-sorts";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts"; 
import { TopicInputSection } from "./ui/topic-input-section";
import { ContentDisplayTabs } from "./ui/content-display-tabs";
import { ContentFiltersBar } from "./ui/content-filters-bar";
import { ContentGrid } from "./ui/content-grid";
import { NewProjectDialog } from "./new-project-dialog";
import { GenerationProgressIndicator } from "./ui/generation-progress-indicator";
import { ActivityLogPanel } from "./ui/activity-log-panel"; 
import { PersonalizeNewsletterDialog } from "./personalize-newsletter-dialog"; 


const initialStyles: NewsletterStyles = {
  headingFont: "Inter, sans-serif",
  paragraphFont: "Inter, sans-serif",
  hyperlinkFont: "Inter, sans-serif",
  headingColor: "#111827",
  paragraphColor: "#374151",
  hyperlinkColor: "#008080",
  backgroundColor: "#FFFFFF",
  borderColor: "hsl(var(--border))", 
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
const APP_TITLE = "NewsLetterPro Beta";

export type MainViewMode = 'workspace' | 'settings';

function MainWorkspaceInternal() {
  const { toast } = useToast();
  const {
    state: leftSidebarState,
    isMobile: isLeftMobile,
    setOpen: setLeftSidebarOpen, 
    variant: leftSidebarVariant
  } = useLeftSidebar();

  const {
    state: rightSidebarState,
    isMobile: isRightMobile,
    setOpen: setRightSidebarOpen, 
    variant: rightSidebarVariant
  } = useRightSidebar();

  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    isClientHydrated,
    updateProjectData,
    triggerNewProjectDialog,
    confirmAndCreateNewProject,
    isNewProjectDialogContextOpen,
    setIsNewProjectDialogContextOpen,
    handleRenameProject,
    handleDeleteProject: actualHandleDeleteProject,
    handleStylesChange,
    handlePersonalizationChange,
    handleStyleChatSubmit,
    toggleItemImportStatus,
    handleToggleItemSavedStatus,
    importedAuthors,
    selectedFunFacts,
    selectedTools,
    selectedNewsletters,
    selectedPodcasts,
    resetAllData,
    logEntries, 
    addLogEntry,
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
    isGenerateButtonDisabled,
    showTopicErrorAnimation,
  } = useContentGeneration(activeProject, updateProjectData, handleRenameProject, toast, addLogEntry);

  const [mainViewMode, setMainViewModeState] = useState<MainViewMode>('workspace');
  const [currentOverallView, setCurrentOverallView] = useState<WorkspaceView>('authors');
  const [activeUITab, setActiveUITab] = useState<ContentType>(ALL_CONTENT_TYPES[0]);
  const [isPersonalizeDialogOpen, setIsPersonalizeDialogOpen] = useState(false); 

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

  useKeyboardShortcuts({ 
    activeProject,
    isGenerating,
    currentOverallView,
    activeUITab,
    setShowOnlySelected,
    addLogEntry,
  });


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


  const handleNewProjectConfirmed = (description: string, audience: string) => {
    const newPId = confirmAndCreateNewProject(description, audience);
    if (newPId) {
      setCurrentTopic("");
      setSelectedContentTypesForGeneration(ALL_CONTENT_TYPES);
      setCurrentOverallView('authors');
      setActiveUITab(ALL_CONTENT_TYPES[0]);
      setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<ContentType, boolean>));
      setMainViewModeState('workspace');
    }
  };

  const handleDeleteProject = useCallback((projectId: string) => {
    const nextActiveId = actualHandleDeleteProject(projectId);
    if (nextActiveId === null && projects.length === 1 && projects[0].id === projectId) {
      triggerNewProjectDialog();
    } else if (nextActiveId) {
      const nextProject = projects.find(p => p.id === nextActiveId);
      setCurrentTopic(nextProject?.topic || "");
      setCurrentOverallView('authors');
      setActiveUITab('authors');
      setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<ContentType, boolean>));
    } else if (projects.filter(p => p.id !== projectId).length === 0) {
      triggerNewProjectDialog();
    }
    setMainViewModeState('workspace');
  }, [actualHandleDeleteProject, projects, triggerNewProjectDialog, setCurrentTopic, setCurrentOverallView, setActiveUITab, setShowOnlySelected]);


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
    return (
      (!isLeftMobile && leftSidebarState === 'expanded' && leftSidebarVariant === 'floating') ||
      (!isRightMobile && rightSidebarState === 'expanded' && rightSidebarVariant === 'floating')
    );
  }, [isLeftMobile, leftSidebarState, leftSidebarVariant, isRightMobile, rightSidebarState, rightSidebarVariant]);


  const handleOverlayClickForSidebars = () => {
    if (!isLeftMobile && leftSidebarState === 'expanded' && leftSidebarVariant === 'floating') {
      setLeftSidebarOpen(false);
    }
    if (!isRightMobile && rightSidebarState === 'expanded' && rightSidebarVariant === 'floating') {
      setRightSidebarOpen(false);
    }
  };

  const isTopicLocked = useMemo(() => {
    if (!activeProject) return false;
    return activeProject.topic.trim() !== "" && activeProject.generatedContentTypes.length > 0 && currentTopic === activeProject.topic;
  }, [activeProject, currentTopic]);


  const handleMainViewModeChange = (mode: MainViewMode) => {
    setMainViewModeState(mode);
    if (mode === 'settings') {
      addLogEntry("Navigated to Settings view.", "info");
      setLeftSidebarOpen(false); 
    } else {
      addLogEntry("Navigated to Workspace view.", "info");
    }
  };


  if (!isClientHydrated && !isNewProjectDialogContextOpen) {
    return (
      <div className="flex h-screen items-center justify-center p-6 bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mr-4" />
        <p className="text-xl text-muted-foreground">
          Loading project data...
        </p>
      </div>
    );
  }

  if (isClientHydrated && projects.length === 0 && !isNewProjectDialogContextOpen) {
    return (
      <>
        <div className="flex h-screen items-center justify-center p-6 bg-background text-foreground">
          <Loader2 className="h-12 w-12 animate-spin text-primary mr-4" />
          <p className="text-xl text-muted-foreground">Preparing your workspace...</p>
        </div>
        <NewProjectDialog
          isOpen={true}
          onOpenChange={(open) => {
            if (!open && projects.length === 0) {
              setIsNewProjectDialogContextOpen(true);
            } else {
              setIsNewProjectDialogContextOpen(open);
            }
          }}
          onSubmit={handleNewProjectConfirmed}
        />
      </>
    );
  }

  if (!activeProject && !isNewProjectDialogContextOpen) {
     if (isClientHydrated && projects.length === 0) {
      triggerNewProjectDialog();
    }
    return (
      <div className="flex h-screen items-center justify-center p-6 bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mr-4" />
        <p className="text-xl text-muted-foreground">Initializing...</p>
      </div>
    );
  }

  const projectToRender = activeProject;

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <AppSidebar
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={(id) => {
            const projectExists = projects.find(p => p.id === id);
            if (projectExists) {
              setActiveProjectId(id);
              setCurrentTopic(projectExists.topic || "");
              setCurrentOverallView('authors'); 
              const firstDisplayableTabForSelectedProject = ALL_CONTENT_TYPES.find(type => {
                if (currentOverallView === 'savedItems') {
                  const key = type as keyof Pick<Project, 'authors' | 'funFacts' | 'tools' | 'newsletters' | 'podcasts'>;
                  return projectExists[key]?.some((item: any) => item.saved);
                }
                return projectExists.generatedContentTypes.includes(type);
              }) || ALL_CONTENT_TYPES[0];
              setActiveUITab(firstDisplayableTabForSelectedProject);
              setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<ContentType, boolean>));
            } else if (projects.length > 0) {
              setActiveProjectId(projects[0].id);
              setCurrentTopic(projects[0].topic || "");
              setCurrentOverallView('authors');
              setActiveUITab('authors');
              setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<ContentType, boolean>));
            } else {
              triggerNewProjectDialog();
            }
            setMainViewModeState('workspace');
          }}
          onNewProject={() => {
            triggerNewProjectDialog();
          }}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
          onSelectSavedItemsView={() => {
            addLogEntry("Switched to Saved Items view.", "info");
            setCurrentOverallView('savedItems');
            setShowOnlySelected(ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<ContentType, boolean>));
            const firstSavedType = projectToRender ? ALL_CONTENT_TYPES.find(type => {
              const key = type as keyof Pick<Project, 'authors' | 'funFacts' | 'tools' | 'newsletters' | 'podcasts'>;
              return projectToRender[key]?.some((item: any) => item.saved);
            }) || ALL_CONTENT_TYPES[0] : ALL_CONTENT_TYPES[0];
            setActiveUITab(firstSavedType);
            setMainViewModeState('workspace');
          }}
          isSavedItemsActive={currentOverallView === 'savedItems'}
          currentMainViewMode={mainViewMode}
          onSetMainViewMode={handleMainViewModeChange}
          appTitle={APP_TITLE}
        />

        <NewProjectDialog
          isOpen={isNewProjectDialogContextOpen}
          onOpenChange={(open) => {
            if (!open && projects.length === 0) {
              setIsNewProjectDialogContextOpen(true);
              toast({ title: "Project Needed", description: "Please create a project to continue.", variant: "default" });
              addLogEntry("New project dialog closed without creation; prompting again.", "warning");
            } else {
              setIsNewProjectDialogContextOpen(open);
            }
          }}
          onSubmit={handleNewProjectConfirmed}
        />

        {mainViewMode === 'workspace' && projectToRender && (
          <div
            className={cn(
              "relative flex-1 h-full transition-all duration-300 flex flex-col",
              centerShouldBeDimmed ? "opacity-50 pointer-events-auto" : "opacity-100 pointer-events-auto"
            )}
            style={workspaceStyle}
            onClick={centerShouldBeDimmed ? handleOverlayClickForSidebars : undefined}
          >
            {centerShouldBeDimmed && (
              <div
                className="absolute inset-0 bg-black/30 dark:bg-black/50 z-20 transition-opacity duration-300"
                aria-hidden="true"
              />
            )}
            <div className="flex flex-col flex-grow overflow-hidden z-10 relative" id="center-column-scroll">
              <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6 flex-shrink-0">

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
                    showTopicErrorAnimation={showTopicErrorAnimation}
                    addLogEntry={addLogEntry}
                    onPersonalizeClick={() => setIsPersonalizeDialogOpen(true)} 
                  />
                )}

                {isGenerating && currentOverallView !== 'savedItems' ? (
                  <GenerationProgressIndicator
                    generationProgress={generationProgress}
                    currentGenerationMessage={currentGenerationMessage}
                  />
                ) : (
                  <>
                    <div className="sticky top-6 z-10 bg-transparent pt-6 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8">
                       <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-md p-3">
                        <ContentDisplayTabs
                          activeUITab={activeUITab}
                          onActiveUITabChange={(value) => setActiveUITab(value as ContentType)}
                          displayableTabs={displayableTabs}
                        />
                      </div>
                       {(projectToRender.generatedContentTypes.length > 0 || (currentOverallView === 'savedItems' && displayableTabs.length > 0)) && (
                        <div className="mt-4">
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
                        </div>
                      )}
                    </div>
                    <div className="px-0 sm:px-0 md:px-0 flex-grow overflow-y-auto">
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
              <ActivityLogPanel logEntries={logEntries} />
            </div>
          </div>
        )}
        {mainViewMode === 'settings' && projectToRender && (
          <SettingsPanel
            onResetAllData={resetAllData}
          />
        )}
        {mainViewMode === 'workspace' && projectToRender && (
          <ActualRightSidebar
            initialStyles={projectToRender.styles}
            personalizationSettings={projectToRender.personalization}
            selectedAuthors={importedAuthors}
            selectedFunFacts={selectedFunFacts}
            selectedTools={selectedTools}
            selectedNewsletters={selectedNewsletters}
            selectedPodcasts={selectedPodcasts}
            projectTopic={projectToRender.topic || currentTopic}
            onStyleChatSubmit={handleStyleChatSubmit}
            isLoadingStyleChatGlobal={isGenerating} // Pass main generating state for now
          />
        )}
      </div>
      {projectToRender && (
        <PersonalizeNewsletterDialog
            isOpen={isPersonalizeDialogOpen}
            onOpenChange={setIsPersonalizeDialogOpen}
            initialSettings={projectToRender.personalization}
            onSubmit={handlePersonalizationChange}
        />
      )}
    </>
  );
}

export function MainWorkspace() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-screen items-center justify-center p-6 bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary mr-4" />
        <p className="text-xl text-muted-foreground">Initializing Workspace...</p>
      </div>
    );
  }
  return (
    <LeftSidebarProvider>
      <RightSidebarProvider defaultOpen={false}> 
        <MainWorkspaceInternal />
      </RightSidebarProvider>
    </LeftSidebarProvider>
  );
}
