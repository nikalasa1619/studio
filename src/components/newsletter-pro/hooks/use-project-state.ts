
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
  LogEntry,
  LogEntryType,
} from "../types";
import { ALL_CONTENT_TYPES } from "../types";
import { useToast } from "@/hooks/use-toast";
import { generateNewsletterStyles } from "@/ai/flows/generate-newsletter-styles-flow";
import type { GenerateNewsletterStylesOutput } from "@/ai/flows/generate-newsletter-styles-flow";

const LOCAL_STORAGE_KEY = "newsletterProProjects";
const ACTIVE_PROJECT_ID_KEY = "newsletterProActiveProjectId";

let logIdCounter = 0; // Moved to module scope

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
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  const addLogEntry = useCallback((message: string, type: LogEntryType = 'info') => {
    setLogEntries(prev => [{ id: `${Date.now()}-${logIdCounter++}`, timestamp: Date.now(), message, type }, ...prev].slice(0, 100)); // Keep last 100 entries
  }, []);


  useEffect(() => {
    try {
      addLogEntry("Attempting to load project data from local storage.", "info");
      const storedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
      const storedActiveId = localStorage.getItem(ACTIVE_PROJECT_ID_KEY);

      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects) as Project[];
        const validatedProjects = parsedProjects.map(p => {
          const defaultNewProject = createNewProject(p.id.replace('project-', '') || Date.now());
          return {
            ...defaultNewProject, 
            ...p,
            name: p.name || `Untitled Project ${new Date(p.lastModified).getHours()}-${new Date(p.lastModified).getMinutes()}`,
            authors: p.authors || [], // Ensure arrays are initialized
            funFacts: p.funFacts || [],
            tools: p.tools || [],
            newsletters: p.newsletters || [],
            podcasts: p.podcasts || [],
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
              ...defaultNewProject.personalization, // Start with defaults
              ...(p.personalization || {}), // Then apply stored personalization
              generateSubjectLine: p.personalization?.generateSubjectLine === undefined ? true : p.personalization.generateSubjectLine,
              generateIntroText: p.personalization?.generateIntroText === undefined ? true : p.personalization.generateIntroText,
            },
            generatedContentTypes: p.generatedContentTypes || [],
          };
        });
        setProjects(validatedProjects);
        addLogEntry(`Loaded ${validatedProjects.length} project(s).`, "info");
        if (storedActiveId && validatedProjects.find(p => p.id === storedActiveId)) {
          setActiveProjectIdState(storedActiveId);
          addLogEntry(`Active project ID set to: ${storedActiveId}.`, "info");
        } else if (validatedProjects.length > 0) {
          setActiveProjectIdState(validatedProjects[0].id);
          addLogEntry(`No active ID found, defaulting to first project: ${validatedProjects[0].id}.`, "info");
        } else {
          addLogEntry("No projects found, opening new project dialog.", "info");
          setIsNewProjectDialogContextOpen(true);
        }
      } else {
        addLogEntry("No stored projects, opening new project dialog.", "info");
        setIsNewProjectDialogContextOpen(true);
      }
    } catch (error: any) {
      console.error("Error loading projects from local storage:", error);
      addLogEntry(`Error loading projects: ${error.message}`, "error");
      setIsNewProjectDialogContextOpen(true);
    }
    setIsClientHydrated(true);
    addLogEntry("Client hydration complete.", "info");
  }, [initialStyles, addLogEntry]); // Removed staticInitialProjectId as it's not used for project list loading

  useEffect(() => {
    if (isClientHydrated && projects.length > 0) { 
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
    } else if (isClientHydrated && projects.length === 0) {
      localStorage.removeItem(LOCAL_STORAGE_KEY); 
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
    if (id) {
      const projectName = projects.find(p => p.id === id)?.name || id;
      addLogEntry(`Switched to project: "${projectName}".`, "info");
    }
  }, [addLogEntry, projects]);

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
    addLogEntry("New project dialog triggered.", "info");
    setIsNewProjectDialogContextOpen(true);
  }, [addLogEntry]);

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
    setProjects((prevProjects) => [updatedProject, ...prevProjects].sort((a, b) => b.lastModified - a.lastModified));
    setActiveProjectId(updatedProject.id);
    setIsNewProjectDialogContextOpen(false);
    addLogEntry(`New project "${updatedProject.name}" created.`, "success");
    return updatedProject.id;
  }, [setActiveProjectId, addLogEntry]);


  const handleRenameProject = useCallback(
    (projectId: string, newName: string) => {
      if (newName.trim() === "") {
        toast({ title: "Error", description: "Project name cannot be empty.", variant: "destructive" });
        addLogEntry(`Failed to rename project ${projectId}: Name empty.`, "error");
        return;
      }
      updateProjectData(projectId, 'name', newName);
      toast({ title: "Project Renamed", description: `Project renamed to "${newName}".` });
      addLogEntry(`Project ${projectId} renamed to "${newName}".`, "info");
    },
    [updateProjectData, toast, addLogEntry]
  );

  const handleDeleteProject = useCallback((projectId: string) => {
    let nextActiveId: string | null = null;
    const projectName = projects.find(p => p.id === projectId)?.name || projectId;
    setProjects(prevProjects => {
        const newProjects = prevProjects.filter(p => p.id !== projectId).sort((a, b) => b.lastModified - a.lastModified);
        if (newProjects.length === 0) {
            nextActiveId = null; 
            return []; 
        } else if (activeProjectId === projectId) {
            nextActiveId = newProjects[0]?.id || null; 
        } else {
            nextActiveId = activeProjectId;
        }
        return newProjects;
    });

    setActiveProjectId(nextActiveId);
    if (nextActiveId === null && projects.filter(p => p.id !== projectId).length === 0) {
      setIsNewProjectDialogContextOpen(true); // Ensure dialog opens if all projects are deleted
      addLogEntry(`Last project "${projectName}" deleted. Opening new project dialog.`, "info");
    } else if (nextActiveId && activeProjectId === projectId) { // Only log if active project changed
       const nextProjectName = projects.find(p => p.id === nextActiveId)?.name || nextActiveId;
       addLogEntry(`Project "${projectName}" deleted. Active project set to "${nextProjectName}".`, "info");
    } else {
      addLogEntry(`Project "${projectName}" deleted.`, "info");
    }
    
    toast({title: "Project Deleted"});
    return nextActiveId; 
  }, [activeProjectId, setActiveProjectId, projects, toast, addLogEntry]); 

  const handleStylesChange = useCallback(
    (newStyles: NewsletterStyles) => {
      if (activeProjectId) {
        updateProjectData(activeProjectId, 'styles', newStyles);
        toast({ title: "Visual Styles Updated", description: "Newsletter visual styles have been saved." });
        addLogEntry("Visual styles updated for current project.", "info");
      }
    },
    [activeProjectId, updateProjectData, toast, addLogEntry]
  );
  
  const handlePersonalizationChange = useCallback(
    (newSettings: PersonalizationSettings) => {
      if (activeProjectId) {
        updateProjectData(activeProjectId, 'personalization', newSettings);
        toast({ title: "Personalization Updated", description: "Newsletter textual personalization settings saved." });
        addLogEntry("Personalization settings updated for current project.", "info");
      }
    },
    [activeProjectId, updateProjectData, toast, addLogEntry]
  );

  const handleStyleChatSubmit = useCallback(
    async (description: string, setIsLoading: (loading: boolean) => void) => {
      if (!activeProjectId) {
        toast({ title: "No Active Project", description: "Please select or create a project.", variant: "destructive"});
        addLogEntry("Style chat submission failed: No active project.", "error");
        setIsLoading(false);
        return;
      }
      const currentProject = projects.find(p => p.id === activeProjectId);
      if (!currentProject) {
        toast({ title: "Error", description: "Active project not found.", variant: "destructive"});
        addLogEntry(`Style chat submission failed: Project ${activeProjectId} not found.`, "error");
        setIsLoading(false);
        return;
      }
      
      addLogEntry(`Submitting to AI for style generation: "${description}"`, "info");
      setIsLoading(true);
      try {
        const result: GenerateNewsletterStylesOutput = await generateNewsletterStyles({ styleDescription: description });
        
        let visualStylesUpdated = false;
        let personalizationUpdated = false;

        if (result && result.styles) {
          const mergedStyles = { ...currentProject.styles, ...result.styles };
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
              // Type assertion as PersonalizationSettings keys might not perfectly align with GNSO keys
              newPersonalization[key as keyof PersonalizationSettings] = result.suggestedPersonalization![key] as any; 
              suggestionsApplied = true;
            }
          });
          
          if (suggestionsApplied) {
            if (JSON.stringify(currentPersonalization) !== JSON.stringify(newPersonalization)) {
                updateProjectData(activeProjectId, 'personalization', newPersonalization);
                personalizationUpdated = true;
            }
          }
        }
        
        let toastMessage = "";
        if (visualStylesUpdated && personalizationUpdated) {
            toastMessage = "Visuals and text suggestions applied based on your input.";
        } else if (visualStylesUpdated) {
            toastMessage = "Visual styles updated based on your description.";
        } else if (personalizationUpdated) {
            toastMessage = "Text suggestions applied based on your input.";
        } else if (result.styles && !result.suggestedPersonalization) {
            toastMessage = "Visual styles were applied. No strong text suggestions found.";
        } else if (!result.styles && result.suggestedPersonalization) { // Corrected this condition
            toastMessage = "Text suggestions applied. No visual style changes found.";
        } else if (result.styles && result.suggestedPersonalization && !visualStylesUpdated && !personalizationUpdated) {
             toastMessage = "AI suggestions matched current settings. No changes applied.";
        }
        
        if (toastMessage) {
            toast({ title: "Style Update Complete", description: toastMessage });
            addLogEntry(`AI style generation successful: ${toastMessage}`, "success");
        }


      } catch (error: any) {
        console.error("Error in handleStyleChatSubmit:", error);
        toast({ title: "Update Failed", description: error.message || "Could not apply changes from chat.", variant: "destructive" });
        addLogEntry(`AI style generation failed: ${error.message}`, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [activeProjectId, projects, updateProjectData, toast, addLogEntry] 
  );


  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || (projects.length > 0 ? projects[0] : null),
    [projects, activeProjectId]
  );

  useEffect(() => {
    if (isClientHydrated) {
      if (!activeProjectId && projects.length > 0) {
        setActiveProjectIdState(projects[0].id);
        addLogEntry(`No active project, defaulting to: "${projects[0].name}".`, "info");
      } else if (projects.length === 0 && !isNewProjectDialogContextOpen) {
        // This ensures the dialog opens if the app loads with no projects.
        setIsNewProjectDialogContextOpen(true);
        addLogEntry("No projects loaded, opening new project dialog.", "info");
      }
    }
  }, [activeProjectId, projects, isClientHydrated, isNewProjectDialogContextOpen, addLogEntry]);


  const toggleItemImportStatus = useCallback(
    (itemId: string, imported: boolean, type: ContentType) => {
      if (!activeProjectId) return;
      
      const key = type as keyof Pick<Project, 'authors' | 'funFacts' | 'tools' | 'newsletters' | 'podcasts'>;

      setProjects(prevProjects =>
        prevProjects.map(p => {
          if (p.id === activeProjectId) {
            const items = p[key] as Array<Author | FunFactItem | ToolItem | NewsletterItem | PodcastItem> | undefined;
            const currentItems = items || []; // Fallback to empty array
            const updatedItems = currentItems.map(item =>
              item.id === itemId ? { ...item, [type === 'authors' ? 'imported' : 'selected']: imported } : item
            );
            const itemToLog = currentItems.find(i => i.id === itemId);
            const itemName = (itemToLog as any)?.name || (itemToLog as any)?.text || (itemToLog as Author)?.quoteCardHeadline || itemId;
            addLogEntry(`Item "${itemName}" (${type}) ${imported ? 'selected' : 'deselected'}.`, "info");
            return { ...p, [key]: updatedItems, lastModified: Date.now() };
          }
          return p;
        })
      );
    },
    [activeProjectId, addLogEntry]
  );

  const handleToggleItemSavedStatus = useCallback(
    (itemId: string, saved: boolean, type: ContentType) => {
      if (!activeProjectId) return;
      const key = type as keyof Pick<Project, 'authors' | 'funFacts' | 'tools' | 'newsletters' | 'podcasts'>;
       setProjects(prevProjects =>
        prevProjects.map(p => {
          if (p.id === activeProjectId) {
            const items = p[key] as Array<Author | FunFactItem | ToolItem | NewsletterItem | PodcastItem> | undefined;
            const currentItems = items || []; // Fallback to empty array
            const updatedItems = currentItems.map(item =>
              item.id === itemId ? { ...item, saved } : item
            );
            const itemToLog = currentItems.find(i => i.id === itemId);
            const itemName = (itemToLog as any)?.name || (itemToLog as any)?.text || (itemToLog as Author)?.quoteCardHeadline || itemId;
            addLogEntry(`Item "${itemName}" (${type}) ${saved ? 'saved' : 'unsaved'}.`, "info");
            return { ...p, [key]: updatedItems, lastModified: Date.now() };
          }
          return p;
        })
      );
      toast({ title: saved ? "Item Saved" : "Item Unsaved", description: `Item has been ${saved ? 'added to' : 'removed from'} your saved items.` });
    }, [activeProjectId, toast, addLogEntry]
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
    setLogEntries([]); // Clear logs as well
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_PROJECT_ID_KEY);
    setIsNewProjectDialogContextOpen(true); 
    toast({ title: "Data Reset", description: "All projects and settings have been reset. Please create a new project." });
    addLogEntry("All application data has been reset.", "warning");
  }, [toast, addLogEntry]);


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
    logEntries, 
    addLogEntry,
  };
}

