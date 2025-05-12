
"use client";

import { useState, useMemo, useCallback } from "react";
import type { Project, ContentType, GeneratedContent, SortOption, AuthorSortOption, Author, FunFactItem, ToolItem, NewsletterItem, PodcastItem, WorkspaceView } from "../types";
import { applySort, getProjectGroup } from "../utils/workspace-helpers"; // Assuming applySort and getProjectGroup are moved here

const DEFAULT_SORT_OPTION: SortOption['value'] = "relevanceScore_desc";

export function useContentFiltersAndSorts(
    activeProject: Project | null,
    activeUITab: ContentType,
    currentContentDisplayView: WorkspaceView
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
    (['authors', 'facts', 'tools', 'newsletters', 'podcasts'] as ContentType[]).reduce((acc, type) => ({ ...acc, [type]: false }), {} as Record<ContentType, boolean>)
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

    if (currentContentDisplayView === 'savedItems') {
        return baseItems.filter(item => item.saved);
    } else {
        // Only return items if they have been generated for the project OR if there is no topic yet (initial state)
        return (isGeneratedForProjectType || !activeProject.topic) ? baseItems : [];
    }
  }, [activeProject, currentContentDisplayView]);

  const displayableTabs = useMemo(() => {
    if (!activeProject) return [];
    let sourceItemsFunction: (type: ContentType) => GeneratedContent[] = getRawItemsForView;

    if (currentContentDisplayView === 'savedItems') {
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
    }
    
    const tabs = (['authors', 'facts', 'tools', 'newsletters', 'podcasts'] as ContentType[]).filter(type => {
        // For 'workspace' view, show tab if content type generated or no topic yet.
        // For 'savedItems' view, show tab if there are saved items of that type.
        if (currentContentDisplayView === 'workspace') {
            return (activeProject.generatedContentTypes.includes(type) || !activeProject.topic);
        } else { // 'savedItems'
            return sourceItemsFunction(type).length > 0;
        }
    });
    return tabs;

  }, [activeProject, currentContentDisplayView, getRawItemsForView]);


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
    if (showOnlySelected['authors'] && activeUITab === 'authors' && currentContentDisplayView !== 'savedItems') {
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
  }, [activeProject, selectedAuthorFilter, authorSortOption, getRawItemsForView, showOnlySelected, activeUITab, currentContentDisplayView]);

  const filteredFunFacts = useMemo(() => {
    if(!activeProject) return [];
    let facts = getRawItemsForView('facts') as FunFactItem[];
    if (funFactTypeFilter !== 'all') {
      facts = facts.filter(fact => fact.type === funFactTypeFilter);
    }
    if (showOnlySelected['facts'] && activeUITab === 'facts' && currentContentDisplayView !== 'savedItems') {
        facts = facts.filter(fact => fact.selected);
    }
    return applySort(facts, funFactSortOption);
  }, [activeProject, getRawItemsForView, showOnlySelected, activeUITab, funFactTypeFilter, funFactSortOption, currentContentDisplayView]);

  const filteredTools = useMemo(() => {
    if(!activeProject) return [];
    let tools = getRawItemsForView('tools') as ToolItem[];
    if (toolTypeFilter !== 'all') {
      tools = tools.filter(tool => tool.type === toolTypeFilter);
    }
    if (showOnlySelected['tools'] && activeUITab === 'tools' && currentContentDisplayView !== 'savedItems') {
        tools = tools.filter(tool => tool.selected);
    }
    return applySort(tools, toolSortOption);
  }, [activeProject, getRawItemsForView, showOnlySelected, activeUITab, toolTypeFilter, toolSortOption, currentContentDisplayView]);

  const filteredNewsletters = useMemo(() => {
     if(!activeProject) return [];
    let newsletters = getRawItemsForView('newsletters') as NewsletterItem[];
    if (newsletterFrequencyFilter !== 'all') {
      newsletters = newsletters.filter(nl => nl.frequency === newsletterFrequencyFilter);
    }
    if (showOnlySelected['newsletters'] && activeUITab === 'newsletters' && currentContentDisplayView !== 'savedItems') {
        newsletters = newsletters.filter(nl => nl.selected);
    }
    return applySort(newsletters, newsletterSortOption);
  }, [activeProject, getRawItemsForView, showOnlySelected, activeUITab, newsletterFrequencyFilter, newsletterSortOption, currentContentDisplayView]);

  const filteredPodcasts = useMemo(() => {
     if(!activeProject) return [];
    let podcasts = getRawItemsForView('podcasts') as PodcastItem[];
     if (podcastFrequencyFilter !== 'all') {
      podcasts = podcasts.filter(p => p.frequency === podcastFrequencyFilter);
    }
    if (showOnlySelected['podcasts'] && activeUITab === 'podcasts' && currentContentDisplayView !== 'savedItems') {
        podcasts = podcasts.filter(p => p.selected);
    }
    return applySort(podcasts, podcastSortOption);
  }, [activeProject, getRawItemsForView, showOnlySelected, activeUITab, podcastFrequencyFilter, podcastSortOption, currentContentDisplayView]);

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
