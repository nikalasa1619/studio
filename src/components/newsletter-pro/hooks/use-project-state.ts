
// src/components/newsletter-pro/hooks/use-project-state.ts
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type {
  Project,
  ContentType,
  Author,
  FunFactItem,
  ToolItem,
  NewsletterItem,
  PodcastItem,
  NewsletterStyles,
  PersonalizationSettings,
} from "../types";
import { ALL_CONTENT_TYPES } from "../types";
import { useToast } from "@/hooks/use-toast";
import { generateNewsletterStyles } from "@/ai/flows/generate-newsletter-styles-flow";
import type { GenerateNewsletterStylesOutput } from "@/ai/flows/generate-newsletter-styles-flow";


const LOCAL_STORAGE_KEY = "newsletterProProjects";
const ACTIVE_PROJECT_ID_KEY = "newsletterProActiveProjectId";

export const createNewProject = (idSuffix: string | number = Date.now()): Project => ({
  id: `project-${idSuffix}`,
  name: `Untitled Project ${new Date().getHours()}-${new Date().getMinutes()}`,
  topic: "",
  authors: [],
  funFacts: [],
  tools: [],
  newsletters: [],
  podcasts: [],
  styles: { 
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
  },
  personalization: { 
    newsletterDescription: '',
    targetAudience: '',
    subjectLine: '',
    introText: '',
    generateSubjectLine: true,
    generateIntroText: true,
    authorsHeading: '',
    factsHeading: '',
    toolsHeading: '',
    newslettersHeading: '',
    podcastsHeading: '',
  },
  lastModified: Date.now(),
  generatedContentTypes: [],
});


export function useProjectState(
  initialStyles: NewsletterStyles,
  staticInitialProjectId: string
) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectIdState] = useState<string | null>(null);
  const [isClientHydrated, setIsClientHydrated] = useState(false);
  const { toast } = useToast();
  const [isNewProjectDialogContextOpen, setIsNewProjectDialogContextOpen] = useState(false);


  useEffect(() => {
    try {
      const storedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
      const storedActiveId = localStorage.getItem(ACTIVE_PROJECT_ID_KEY);

      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects) as Project[];
        const validatedProjects = parsedProjects.map(p => ({
          ...createNewProject(p.id.replace('project-', '') || Date.now()), 
          ...p,
          name: p.name || `Untitled Project ${new Date(p.lastModified).getHours()}-${new Date(p.lastModified).getMinutes()}`,
          styles: { 
            ...initialStyles, 
            ...(p.styles || {}),
            workspaceBackdropType: p.styles?.workspaceBackdropType || 'none',
            workspaceBackdropSolidColor: p.styles?.workspaceBackdropSolidColor || initialStyles.workspaceBackdropSolidColor,
            workspaceBackdropGradientStart: p.styles?.workspaceBackdropGradientStart || initialStyles.workspaceBackdropGradientStart,
            workspaceBackdropGradientEnd: p.styles?.workspaceBackdropGradientEnd || initialStyles.workspaceBackdropGradientEnd,
            workspaceBackdropImageURL: p.styles?.workspaceBackdropImageURL || initialStyles.workspaceBackdropImageURL,
           },
          personalization: { 
            newsletterDescription: p.personalization?.newsletterDescription || '',
            targetAudience: p.personalization?.targetAudience || '',
            subjectLine: p.personalization?.subjectLine || '',
            introText: p.personalization?.introText || '',
            generateSubjectLine: p.personalization?.generateSubjectLine === undefined ? true : p.personalization.generateSubjectLine,
            generateIntroText: p.personalization?.generateIntroText === undefined ? true : p.personalization.generateIntroText,
            authorsHeading: p.personalization?.authorsHeading || '',
            factsHeading: p.personalization?.factsHeading || '',
            toolsHeading: p.personalization?.toolsHeading || '',
            newslettersHeading: p.personalization?.newslettersHeading || '',
            podcastsHeading: p.personalization?.podcastsHeading || '',
          },
          generatedContentTypes: p.generatedContentTypes || [],
        }));
        setProjects(validatedProjects);
        if (storedActiveId && validatedProjects.find(p => p.id === storedActiveId)) {
          setActiveProjectIdState(storedActiveId);
        } else if (validatedProjects.length > 0) {
          setActiveProjectIdState(validatedProjects[0].id);
        } else {
          // No projects, trigger new project dialog flow instead of auto-creating
          setIsNewProjectDialogContextOpen(true);
        }
      } else {
         // No stored projects, trigger new project dialog flow
        setIsNewProjectDialogContextOpen(true);
      }
    } catch (error) {
      console.error("Error loading projects from local storage:", error);
      // Error loading, trigger new project dialog flow
      setIsNewProjectDialogContextOpen(true);
    }
    setIsClientHydrated(true);
  }, [initialStyles, staticInitialProjectId]);

  useEffect(() => {
    if (isClientHydrated && projects.length > 0) { // Ensure projects array is not empty before saving
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
    } else if (isClientHydrated && projects.length === 0) {
      localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear if no projects
    }
  }, [projects, isClientHydrated]);

  useEffect(() => {
    if (activeProjectId && isClientHydrated) {
      localStorage.setItem(ACTIVE_PROJECT_ID_KEY, activeProjectId);
    } else if (!activeProjectId && isClientHydrated) {
      localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
    }
  }, [activeProjectId, isClientHydrated]);


  const setActiveProjectId = useCallback((id: string | null) => {
    setActiveProjectIdState(id);
  }, []);

  const updateProjectData = useCallback(
    <K extends keyof Project>(projectId: string, key: K, data: Project[K]) => {
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p.id === projectId ? { ...p, [key]: data, lastModified: Date.now() } : p
        )
      );
    },
    []
  );
  
  const triggerNewProjectDialog = useCallback(() => {
    setIsNewProjectDialogContextOpen(true);
  }, []);

  const confirmAndCreateNewProject = useCallback((newsletterDescription: string, targetAudience: string) => {
    const newProject = createNewProject();
    const updatedProject = {
      ...newProject,
      personalization: {
        ...newProject.personalization,
        newsletterDescription,
        targetAudience,
      }
    };
    setProjects((prevProjects) => [updatedProject, ...prevProjects]);
    setActiveProjectId(updatedProject.id);
    setIsNewProjectDialogContextOpen(false);
    // Caller (MainWorkspace) will handle resetting topic, selected content types etc.
    return updatedProject.id;
  }, []);


  const handleRenameProject = useCallback(
    (projectId: string, newName: string) => {
      if (newName.trim() === "") {
        toast({ title: "Error", description: "Project name cannot be empty.", variant: "destructive" });
        return;
      }
      updateProjectData(projectId, 'name', newName);
      toast({ title: "Project Renamed", description: `Project renamed to "${newName}".` });
    },
    [updateProjectData, toast]
  );

  const handleDeleteProject = useCallback((projectId: string) => {
    let nextActiveId: string | null = null;
    setProjects(prevProjects => {
        const newProjects = prevProjects.filter(p => p.id !== projectId);
        if (newProjects.length === 0) {
            // No projects left, trigger new project dialog instead of auto-creating
            nextActiveId = null; 
            return []; // Return empty array
        } else if (activeProjectId === projectId) {
            nextActiveId = newProjects[0].id; 
        } else {
            nextActiveId = activeProjectId;
        }
        return newProjects;
    });

    setActiveProjectId(nextActiveId);
    if (nextActiveId === null && projects.filter(p => p.id !== projectId).length === 0) {
      setIsNewProjectDialogContextOpen(true); // Open dialog if last project deleted
    }
    
    toast({title: "Project Deleted"});
    return nextActiveId; 
  }, [activeProjectId, setActiveProjectId, projects, toast]); 

  const handleStylesChange = useCallback(
    (newStyles: NewsletterStyles) => {
      if (activeProjectId) {
        updateProjectData(activeProjectId, 'styles', newStyles);
        toast({ title: "Visual Styles Updated", description: "Newsletter visual styles have been saved." });
      }
    },
    [activeProjectId, updateProjectData, toast]
  );
  
  const handlePersonalizationChange = useCallback(
    (newSettings: PersonalizationSettings) => {
      if (activeProjectId) {
        updateProjectData(activeProjectId, 'personalization', newSettings);
        toast({ title: "Personalization Updated", description: "Newsletter textual personalization settings saved." });
      }
    },
    [activeProjectId, updateProjectData, toast]
  );

  const handleStyleChatSubmit = useCallback(
    async (description: string, setIsLoading: (loading: boolean) => void) => {
      if (!activeProjectId) {
        toast({ title: "No Active Project", description: "Please select or create a project.", variant: "destructive"});
        return;
      }
      const currentProject = projects.find(p => p.id === activeProjectId);
      if (!currentProject) {
        toast({ title: "Error", description: "Active project not found.", variant: "destructive"});
        return;
      }

      setIsLoading(true);
      try {
        const result: GenerateNewsletterStylesOutput = await generateNewsletterStyles({ styleDescription: description });
        
        let visualStylesUpdated = false;
        let personalizationUpdated = false;

        if (result && result.styles) {
          const mergedStyles = { ...currentProject.styles, ...result.styles };
          // Check if visual styles actually changed to avoid redundant toasts
          if (JSON.stringify(currentProject.styles) !== JSON.stringify(mergedStyles)) {
            updateProjectData(activeProjectId, 'styles', mergedStyles);
            visualStylesUpdated = true;
          }
        } else {
           throw new Error("AI did not return valid visual styles.");
        }

        if (result && result.suggestedPersonalization) {
          const currentPersonalization = { ...currentProject.personalization };
          let newPersonalization = { ...currentPersonalization };
          let suggestionsApplied = false;

          (Object.keys(result.suggestedPersonalization) as Array<keyof typeof result.suggestedPersonalization>).forEach(key => {
            if (result.suggestedPersonalization![key]) {
              newPersonalization[key] = result.suggestedPersonalization![key] as any; // Type assertion
              suggestionsApplied = true;
            }
          });
          
          if (suggestionsApplied) {
             // Check if personalization actually changed
            if (JSON.stringify(currentPersonalization) !== JSON.stringify(newPersonalization)) {
                updateProjectData(activeProjectId, 'personalization', newPersonalization);
                personalizationUpdated = true;
            }
          }
        }
        
        if (visualStylesUpdated && personalizationUpdated) {
            toast({ title: "Styles & Personalization Updated!", description: "Visuals and text suggestions applied based on your input." });
        } else if (visualStylesUpdated) {
            toast({ title: "Visual Styles Updated!", description: "Visual styles updated based on your description." });
        } else if (personalizationUpdated) {
            toast({ title: "Personalization Suggested!", description: "Text suggestions applied based on your input." });
        } else if (result.styles && !result.suggestedPersonalization) {
            toast({ title: "Styles Updated (No text suggestions)", description: "Visual styles were applied. No strong text suggestions found." });
        } else if (!result.styles && result.suggestedPersonalization) {
            // This case should be unlikely given the prompt logic, but handle it
            toast({ title: "Personalization Suggested (No visual changes)", description: "Text suggestions applied. No visual style changes found." });
        } else if (result.styles && result.suggestedPersonalization && !visualStylesUpdated && !personalizationUpdated) {
             toast({ title: "No Changes Detected", description: "AI suggestions matched current settings." });
        }


      } catch (error: any) {
        console.error("Error in handleStyleChatSubmit:", error);
        toast({ title: "Update Failed", description: error.message || "Could not apply changes from chat.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    },
    [activeProjectId, projects, updateProjectData, toast] 
  );


  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || (projects.length > 0 ? projects[0] : null),
    [projects, activeProjectId]
  );

  useEffect(() => {
    if (isClientHydrated) {
      if (!activeProjectId && projects.length > 0) {
        setActiveProjectIdState(projects[0].id);
      } else if (projects.length === 0 && !isNewProjectDialogContextOpen) {
        setIsNewProjectDialogContextOpen(true);
      }
    }
  }, [activeProjectId, projects, isClientHydrated, isNewProjectDialogContextOpen]);


  const toggleItemImportStatus = useCallback(
    (itemId: string, imported: boolean, type: ContentType) => {
      if (!activeProjectId) return;
      
      const key = type as keyof Pick<Project, 'authors' | 'funFacts' | 'tools' | 'newsletters' | 'podcasts'>;

      setProjects(prevProjects =>
        prevProjects.map(p => {
          if (p.id === activeProjectId) {
            const items = p[key] as Array<Author | FunFactItem | ToolItem | NewsletterItem | PodcastItem>;
            const updatedItems = items.map(item =>
              item.id === itemId ? { ...item, [type === 'authors' ? 'imported' : 'selected']: imported } : item
            );
            return { ...p, [key]: updatedItems, lastModified: Date.now() };
          }
          return p;
        })
      );
    },
    [activeProjectId]
  );

  const handleToggleItemSavedStatus = useCallback(
    (itemId: string, saved: boolean, type: ContentType) => {
      if (!activeProjectId) return;
      const key = type as keyof Pick<Project, 'authors' | 'funFacts' | 'tools' | 'newsletters' | 'podcasts'>;
       setProjects(prevProjects =>
        prevProjects.map(p => {
          if (p.id === activeProjectId) {
            const items = p[key] as Array<Author | FunFactItem | ToolItem | NewsletterItem | PodcastItem>;
            const updatedItems = items.map(item =>
              item.id === itemId ? { ...item, saved } : item
            );
            return { ...p, [key]: updatedItems, lastModified: Date.now() };
          }
          return p;
        })
      );
      toast({ title: saved ? "Item Saved" : "Item Unsaved", description: `Item has been ${saved ? 'added to' : 'removed from'} your saved items.` });
    }, [activeProjectId, toast]
  );


  const importedAuthors = useMemo(
    () => activeProject?.authors.filter((author) => author.imported) || [],
    [activeProject?.authors]
  );
  const selectedFunFacts = useMemo(
    () => activeProject?.funFacts.filter((fact) => fact.selected) || [],
    [activeProject?.funFacts]
  );
  const selectedTools = useMemo(
    () => activeProject?.tools.filter((tool) => tool.selected) || [],
    [activeProject?.tools]
  );
  const selectedNewsletters = useMemo(
    () => activeProject?.newsletters.filter((nl) => nl.selected) || [],
    [activeProject?.newsletters]
  );
  const selectedPodcasts = useMemo(
    () => activeProject?.podcasts.filter((p) => p.selected) || [],
    [activeProject?.podcasts]
  );

  const resetAllData = useCallback(() => {
    setProjects([]); 
    setActiveProjectIdState(null); 
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
    setIsNewProjectDialogContextOpen(true); 
    toast({ title: "Data Reset", description: "All projects and settings have been reset. Please create a new project." });
  }, [toast]);


  return {
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
    handleDeleteProject,
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
  };
}

