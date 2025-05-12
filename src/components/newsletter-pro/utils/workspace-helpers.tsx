
import React from "react"; // Changed from 'import type'
import { Bookmark, UsersRound, Lightbulb, Wrench, Newspaper, Podcast as PodcastIconLucide } from "lucide-react";
import type { ContentType, Project, SortOption } from "../types";


export const getProjectGroup = (project: Project): 'Recent' | 'Yesterday' | 'Older' => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;

  if (now - project.lastModified < oneHour) {
    return 'Recent';
  }

  const projectDate = new Date(project.lastModified);
  const today = new Date();
  today.setHours(0,0,0,0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  
  if (projectDate >= yesterday && projectDate < today) {
    return 'Yesterday';
  }
  
  return 'Older';
};

export const contentTypeToIcon = (type: ContentType | 'savedItems'): React.ReactNode => {
    if (type === 'savedItems') return (<Bookmark size={16} />);
    switch (type) {
      case 'authors': return (<UsersRound size={16} />);
      case 'facts': return (<Lightbulb size={16} />);
      case 'tools': return (<Wrench size={16} />);
      case 'newsletters': return (<Newspaper size={16} />);
      case 'podcasts': return (<PodcastIconLucide size={16} />);
      default: return null;
    }
};

export const contentTypeToLabel = (type: ContentType | 'savedItems'): string => {
     if (type === 'savedItems') return "Saved Items";
     switch (type) {
      case 'authors': return "Authors & Quotes";
      case 'facts': return "Fun Facts";
      case 'tools': return "Productivity Tools";
      case 'newsletters': return "Newsletters";
      case 'podcasts': return "Podcasts";
      default: return "";
    }
};

export const applySort = <T extends { relevanceScore?: number; name?: string; text?: string }>(items: T[], sortOption: SortOption['value']): T[] => {
    const [field, direction] = sortOption.split('_') as [keyof T, "asc" | "desc"];

    return [...items].sort((a, b) => {
      let valA = a[field];
      let valB = b[field];

      if (field === 'relevanceScore') {
        valA = (valA ?? 0) as T[keyof T]; 
        valB = (valB ?? 0) as T[keyof T];
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return direction === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
};

export const commonSortOptions: SortOption[] = [
  { value: "relevanceScore_desc", label: "Relevance (High-Low)" },
  { value: "relevanceScore_asc", label: "Relevance (Low-High)" },
];

export const nameSortOptions: SortOption[] = [
  ...commonSortOptions,
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
];

export const textSortOptions: SortOption[] = [ 
  ...commonSortOptions,
  { value: "text_asc", label: "Text (A-Z)" },
  { value: "text_desc", label: "Text (Z-A)" },
];
