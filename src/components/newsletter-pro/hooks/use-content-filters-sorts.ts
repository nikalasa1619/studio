"use client";

import { useState, useMemo, useCallback } from "react";
import type { Project, ContentType, GeneratedContent, SortOption, AuthorSortOption, Author, FunFactItem, ToolItem, NewsletterItem, PodcastItem, WorkspaceView } from "../types";
import { ALL_CONTENT_TYPES } from "../types"; // Ensure ALL_CONTENT_TYPES is imported
import { applySort, getProjectGroup } from "../utils/workspace-helpers";

const DEFAULT_SORT_OPTION: SortOption['value'] = "relevanceScore_desc";

export function useContentFiltersAndSorts(
    activeProject: Project | null,
    activeUITab: ContentType,
    currentOverallView: WorkspaceView // Renamed for clarity from currentContentDisplayView in MainWorkspace
) {
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<string>("all"); 
  const [authorSortOption, setAuthorSortOption] = useState<AuthorSortOption>("relevance_desc");

  const [funFactTypeFilter, setFunFactTypeFilter] = useState<"all" | "fun" | "science">("all"); 
  const [funFactSortOption, setFunFactSortOption] = useState<SortOption['value']>(DEFAULT_SORT_OPTION);

  const [toolTypeFilter, setToolTypeFilter] = useState<"all" | "free" | "paid">("all"); 
  const [toolSortOption, setToolSortOption] = useState<SortOption['value']>(DEFAULT_SORT_OPTION);

  const [newsletterFrequencyFilter, setNewsletterFrequencyFilter] = useState<string>("all"); 
  const [newsletterSortOption, setNewsletterSortOption] = useState<SortOption['value']>(DEFAULT_SORT_OPTION);

  const [podcastFrequencyFilter, setPodcastFrequencyFilter] = useState<string>("all"); 
  const [podcastSortOption, setPodcastSortOption] = useState<SortOption['value']>(DEFAULT_SORT_OPTION);
  
  const [showOnlySelected, setShowOnlySelected] = useState<Record<ContentType, boolean>>(
    ALL_CONTENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<ContentType, boolean>)
  );

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

    if (currentOverallView === 'savedItems') {
        return baseItems.filter(item => item.saved);
    } else { // Workspace view
        return (isGeneratedForProjectType || !activeProject.topic) ? baseItems : [];
    }
  }, [activeProject, currentOverallView]);

  const displayableTabs = useMemo(() => {
    if (!activeProject) return [];

    const isWorkspaceView = currentOverallView !== 'savedItems';

    if (isWorkspaceView) {
      // If there's no topic yet (e.g., a brand new project), show all content type tabs by default.
      if (!activeProject.topic) {
        return [...ALL_CONTENT_TYPES];
      }
      // If there is a topic, only show tabs for content types that have been generated.
      const generatedTabs = ALL_CONTENT_TYPES.filter(type =>
        activeProject.generatedContentTypes.includes(type)
      );
      return generatedTabs;
    } else { // currentOverallView === 'savedItems'
      const savedTabs = ALL_CONTENT_TYPES.filter(type => {
        const items = getRawItemsForView(type); 
        return items.length > 0;
      });
      return savedTabs;
    }
  }, [activeProject, currentOverallView, getRawItemsForView]);


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
    if (showOnlySelected['authors'] && activeUITab === 'authors' && currentOverallView !== 'savedItems') {
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
  }, [activeProject, selectedAuthorFilter, authorSortOption, getRawItemsForView, showOnlySelected, activeUITab, currentOverallView]);

  const filteredFunFacts = useMemo(() => {
    if(!activeProject) return [];
    let facts = getRawItemsForView('facts') as FunFactItem[];
    if (funFactTypeFilter !== 'all') {
      facts = facts.filter(fact => fact.type === funFactTypeFilter);
    }
    if (showOnlySelected['facts'] && activeUITab === 'facts' && currentOverallView !== 'savedItems') {
        facts = facts.filter(fact => fact.selected);
    }
    return applySort(facts, funFactSortOption);
  }, [activeProject, getRawItemsForView, showOnlySelected, activeUITab, funFactTypeFilter, funFactSortOption, currentOverallView]);

  const filteredTools = useMemo(() => {
    if(!activeProject) return [];
    let tools = getRawItemsForView('tools') as ToolItem[];
    if (toolTypeFilter !== 'all') {
      tools = tools.filter(tool => tool.type === toolTypeFilter);
    }
    if (showOnlySelected['tools'] && activeUITab === 'tools' && currentOverallView !== 'savedItems') {
        tools = tools.filter(tool => tool.selected);
    }
    return applySort(tools, toolSortOption);
  }, [activeProject, getRawItemsForView, showOnlySelected, activeUITab, toolTypeFilter, toolSortOption, currentOverallView]);

  const filteredNewsletters = useMemo(() => {
     if(!activeProject) return [];
    let newsletters = getRawItemsForView('newsletters') as NewsletterItem[];
    if (newsletterFrequencyFilter !== 'all') {
      newsletters = newsletters.filter(nl => nl.frequency === newsletterFrequencyFilter);
    }
    if (showOnlySelected['newsletters'] && activeUITab === 'newsletters' && currentOverallView !== 'savedItems') {
        newsletters = newsletters.filter(nl => nl.selected);
    }
    return applySort(newsletters, newsletterSortOption);
  }, [activeProject, getRawItemsForView, showOnlySelected, activeUITab, newsletterFrequencyFilter, newsletterSortOption, currentOverallView]);

  const filteredPodcasts = useMemo(() => {
     if(!activeProject) return [];
    let podcasts = getRawItemsForView('podcasts') as PodcastItem[];
     if (podcastFrequencyFilter !== 'all') {
      podcasts = podcasts.filter(p => p.frequency === podcastFrequencyFilter);
    }
    if (showOnlySelected['podcasts'] && activeUITab === 'podcasts' && currentOverallView !== 'savedItems') {
        podcasts = podcasts.filter(p => p.selected);
    }
    return applySort(podcasts, podcastSortOption);
  }, [activeProject, getRawItemsForView, showOnlySelected, activeUITab, podcastFrequencyFilter, podcastSortOption, currentOverallView]);

  const handleFilterChange = (type: ContentType, value: string) => {
    switch(type) {
        case 'authors': setSelectedAuthorFilter(value); break;
        case 'facts': setFunFactTypeFilter(value as "all" | "fun" | "science"); break;
        case 'tools': setToolTypeFilter(value as "all" | "free" | "paid"); break;
        case 'newsletters': setNewsletterFrequencyFilter(value); break;
        case 'podcasts': setPodcastFrequencyFilter(value); break;
    }
  };

  const handleSortChange = (type: ContentType, value: SortOption['value'] | AuthorSortOption) => {
    switch(type) {
        case 'authors': setAuthorSortOption(value as AuthorSortOption); break;
        case 'facts': setFunFactSortOption(value as SortOption['value']); break;
        case 'tools': setToolSortOption(value as SortOption['value']); break;
        case 'newsletters': setNewsletterSortOption(value as SortOption['value']); break;
        case 'podcasts': setPodcastSortOption(value as SortOption['value']); break;
    }
  };
  
  const filterStates = {
    authors: selectedAuthorFilter,
    facts: funFactTypeFilter,
    tools: toolTypeFilter,
    newsletters: newsletterFrequencyFilter,
    podcasts: podcastFrequencyFilter,
  };

  const sortStates = {
    authors: authorSortOption,
    facts: funFactSortOption,
    tools: toolSortOption,
    newsletters: newsletterSortOption,
    podcasts: podcastSortOption,
  };


  return {
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
  };
}
