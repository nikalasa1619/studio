export interface Author {
  id: string; 
  name: string; 
  titleOrKnownFor: string;
  quote: string; 
  quoteSource: string;
  imported: boolean;
  amazonLink: string;
  authorNameKey: string; 
  relevanceScore: number;
  saved: boolean; 
}

export interface FunFactItem {
  id: string;
  text: string;
  type: 'fun' | 'science';
  selected: boolean;
  relevanceScore?: number;
  sourceLink?: string; 
  saved: boolean; 
}

export interface ToolItem {
  id:string;
  name: string;
  type: 'free' | 'paid';
  selected: boolean;
  relevanceScore?: number;
  freeTrialPeriod?: string; 
  saved: boolean; 
}

export interface NewsletterItem {
  id: string;
  name: string; 
  operator: string; 
  signUpLink: string; 
  description: string; 
  subscribers?: string; 
  relevanceScore: number; 
  selected: boolean; 
  frequency?: string; 
  coveredTopics?: string[]; 
  saved: boolean; 
}

export interface PodcastItem {
  id: string;
  name: string; 
  episodeTitle: string;
  podcastLink: string; 
  description: string;
  relevanceScore: number;
  selected: boolean;
  frequency?: string; 
  topics?: string[]; 
  saved: boolean; 
}

export interface NewsletterStyles {
  headingFont: string;
  paragraphFont: string;
  hyperlinkFont: string;
  headingColor: string;
  paragraphColor: string;
  hyperlinkColor: string;
  backgroundColor: string; // For newsletter content background
  subjectLineText: string;
  previewLineText: string;
  authorsHeadingText: string;
  factsHeadingText: string;
  toolsHeadingText: string;
  newslettersHeadingText: string;
  podcastsHeadingText: string;

  // New backdrop styles for the main workspace area
  workspaceBackdropType: 'none' | 'solid' | 'gradient' | 'image';
  workspaceBackdropSolidColor?: string;
  workspaceBackdropGradientStart?: string;
  workspaceBackdropGradientEnd?: string;
  workspaceBackdropImageURL?: string; 
}

export type GeneratedContent = Author | FunFactItem | ToolItem | NewsletterItem | PodcastItem;

export interface Project {
  id: string;
  name: string;
  topic: string;
  authors: Author[];
  funFacts: FunFactItem[];
  tools: ToolItem[];
  newsletters: NewsletterItem[];
  podcasts: PodcastItem[];
  styles: NewsletterStyles;
  lastModified: number; 
  generatedContentTypes: ContentType[]; 
}

export type ContentType = 'authors' | 'facts' | 'tools' | 'newsletters' | 'podcasts';
export const ALL_CONTENT_TYPES: ContentType[] = ['authors', 'facts', 'tools', 'newsletters', 'podcasts'];

export type WorkspaceView = ContentType | 'savedItems';

export type SortDirection = "asc" | "desc";
export type SortableField = "relevanceScore" | "name" | "text"; // 'name' for tools, newsletters, podcasts; 'text' for facts

export interface SortOption {
  value: `${SortableField}_${SortDirection}`;
  label: string;
}

// Specific sort options for authors (already defined, can be merged or kept separate)
export type AuthorSortOption = "default" | "relevance_desc" | "relevance_asc" | "name_asc" | "name_desc";

export const COMMON_FREQUENCIES = ["Daily", "Weekly", "Bi-weekly", "Monthly"] as const;
export type CommonFrequency = typeof COMMON_FREQUENCIES[number];


// Keep AggregatedContentItem for now if it's used by old logic, but it should be phased out.
export interface AggregatedContentItem {
  id: string;
  text: string;
  sourceUrl?: string;
  selected: boolean;
  relevanceScore?: number;
}
