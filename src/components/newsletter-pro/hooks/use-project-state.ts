
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { Project, NewsletterStyles, Author, FunFactItem, ToolItem, NewsletterItem, PodcastItem, GeneratedContent, ContentType, PersonalizationSettings } from "../types";
import { generateStylesFromChatAction } from "@/actions/newsletter-actions";
import type { GenerateNewsletterStylesOutput } from "@/ai/flows/generate-newsletter-styles-flow";
import { useToast } from "@/hooks/use-toast";
import { ALL_CONTENT_TYPES } from "../types";


export const createNewProject = (idSuffix: string, topic: string = "NewsLetterPro Beta", initialStyles: NewsletterStyles): Project => ({
  id: idSuffix === "project-initial-ssr-1" ? "project-initial-ssr-1" : `project-${idSuffix}-${Date.now()}`,
  name: topic,
  topic: topic === "NewsLetterPro Beta" ? "" : topic, 
  authors: [],
  funFacts: [],
  tools: [],
  newsletters: [],
  podcasts: [],
  styles: { ...initialStyles },
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

const defaultPersonalizationSettings: PersonalizationSettings = { 
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
};


export function useProjectState(initialStylesConfig: NewsletterStyles, staticInitialProjectId: string, createProjectFn: typeof createNewProject) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isClientHydrated, setIsClientHydrated] = useState(false);
  const { toast } = useToast();

  const activeProject = useMemo(() => {
    if (!activeProjectId) return null;
    return projects.find(p => p.id === activeProjectId);
  }, [projects, activeProjectId]);

  const updateProjectData = useCallback(<K extends keyof Project>(projectId: string, key: K, data: Project[K]) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? { ...p, [key]: data, lastModified: Date.now() } : p
      ).sort((a,b) => b.lastModified - a.lastModified) 
    );
  }, []);

  const handleNewProject = useCallback(() => {
    const newP = createProjectFn(`${projects.length + 1}-${Date.now().toString().slice(-5)}`, `Untitled Project ${projects.length + 1}`, initialStylesConfig);
    const updatedProjects = [newP, ...projects].sort((a,b) => b.lastModified - a.lastModified);
    setProjects(updatedProjects);
    setActiveProjectId(newP.id);
    return newP.id;
  }, [projects, initialStylesConfig, createProjectFn]);


  useEffect(() => {
    const storedProjectsString = localStorage.getItem('newsletterProProjects');
    let projectsToLoad: Project[] = [];
    let activeIdToLoad: string | null = null;

    if (storedProjectsString) {
      try {
        const parsedProjects = JSON.parse(storedProjectsString);
        if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
          projectsToLoad = parsedProjects.map((p: any) => ({
            ...createProjectFn('', '', initialStylesConfig), 
            ...p,
            styles: {...initialStylesConfig, ...p.styles}, 
            personalization: { 
                ...defaultPersonalizationSettings, 
                ...(p.personalization || {}),
                subjectLine: p.personalization?.subjectLine || '', 
                introText: p.personalization?.introText || '',     
            },
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
        const newFirstProject = createProjectFn(staticInitialProjectId, "NewsLetterPro Beta", initialStylesConfig);
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
    setIsClientHydrated(true);
  }, [initialStylesConfig, staticInitialProjectId, createProjectFn]);


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

  
  useEffect(() => {
    if (!isClientHydrated || !activeProject) return;

    if (activeProject) {
      if (!activeProject.styles || Object.keys(activeProject.styles).length === 0 ||
          !activeProject.styles.subjectLineText || !activeProject.styles.workspaceBackdropType ) { 
          updateProjectData(activeProject.id, 'styles', {...initialStylesConfig, ...activeProject.styles});
      }
      if (!activeProject.personalization || activeProject.personalization.generateSubjectLine === undefined || activeProject.personalization.generateIntroText === undefined) { 
          updateProjectData(activeProject.id, 'personalization', { 
            ...defaultPersonalizationSettings, 
            ...(activeProject.personalization || {}),
            subjectLine: activeProject.personalization?.subjectLine || '',
            introText: activeProject.personalization?.introText || '',
          });
      }
      if (!activeProject.generatedContentTypes) {
          updateProjectData(activeProject.id, 'generatedContentTypes', []);
      }

      (['authors', 'facts', 'tools', 'newsletters', 'podcasts'] as const).forEach(contentTypeKey => {
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
    } else if (projects.length === 0 && isClientHydrated) {
        handleNewProject();
    }
  }, [activeProject, projects, activeProjectId, isClientHydrated, updateProjectData, handleNewProject, initialStylesConfig]);


  const handleRenameProject = (projectId: string, newName: string) => {
     if (newName.trim() === "") return;
     const finalName = newName.length > 20 ? `${newName.substring(0, 20)}...` : newName;
     updateProjectData(projectId, 'name', finalName);
  };

  const handleDeleteProject = (projectId: string) => {
    let nextActiveId: string | null = null;
    setProjects(prev => {
        const remainingProjects = prev.filter(p => p.id !== projectId);
        if (activeProjectId === projectId) { 
            if (remainingProjects.length > 0) {
                nextActiveId = remainingProjects[0].id;
                setActiveProjectId(remainingProjects[0].id); 
            } else {
                nextActiveId = null;
                setActiveProjectId(null); 
            }
        }
        return remainingProjects;
    });
    return nextActiveId;
  };


  const handleStylesChange = (newStyles: NewsletterStyles) => {
    if (!activeProjectId || !activeProject) return;
    updateProjectData(activeProjectId, 'styles', newStyles);
  };

   const handlePersonalizationChange = (newSettings: PersonalizationSettings) => { 
    if (!activeProjectId || !activeProject) return;
    updateProjectData(activeProjectId, 'personalization', newSettings);
    toast({ title: "Personalization Updated!", description: "Newsletter personalization settings have been saved." });
  };


   const handleStyleChatSubmit = async (
        description: string, 
        setIsLoading: (loading: boolean) => void,
        setDialogIsOpen: (open: boolean) => void
    ) => {
    if (!activeProjectId || !activeProject) {
      toast({ title: "Error", description: "No active project selected.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const newStylesOutput = await generateStylesFromChatAction({ styleDescription: description });
      const updatedStyles = { ...activeProject.styles, ...newStylesOutput.styles };
      handleStylesChange(updatedStyles);
      toast({ title: "Styles Updated!", description: "Newsletter styles have been updated based on your description." });
      setDialogIsOpen(false); 
    } catch (err: any) {
      toast({ title: "Style Generation Failed", description: err.message || "Could not update styles.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

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

  const resetAllData = useCallback(() => {
    localStorage.removeItem('newsletterProProjects');
    localStorage.removeItem('newsletterProActiveProjectId');
    const newFirstProject = createNewProject(staticInitialProjectId, "NewsLetterPro Beta", initialStylesConfig);
    setProjects([newFirstProject]);
    setActiveProjectId(newFirstProject.id);
    // You might need to reset other states managed outside this hook if they depend on project data
    // For example, clear any cached data or reset UI elements in MainWorkspace or other components
    toast({ title: "System Reset", description: "All projects and settings have been reset to default." });
  }, [staticInitialProjectId, initialStylesConfig]);

  return {
    projects,
    setProjects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    isClientHydrated,
    updateProjectData,
    handleNewProject,
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
    resetAllData, // Expose the new reset function
  };
}

