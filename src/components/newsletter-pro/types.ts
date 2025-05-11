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
  saved: boolean; // Added for Save for Later
}

export interface FunFactItem {
  id: string;
  text: string;
  type: 'fun' | 'science';
  selected: boolean;
  relevanceScore?: number;
  sourceLink?: string; // Added
  saved: boolean; // Added for Save for Later
}

export interface ToolItem {
  id:string;
  name: string;
  type: 'free' | 'paid';
  selected: boolean;
  relevanceScore?: number;
  freeTrialPeriod?: string; // Added
  saved: boolean; // Added for Save for Later
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
  frequency?: string; // Added
  coveredTopics?: string[]; // Added
  saved: boolean; // Added for Save for Later
}

export interface PodcastItem {
  id: string;
  name: string; 
  episodeTitle: string;
  podcastLink: string; 
  description: string;
  relevanceScore: number;
  selected: boolean;
  frequency?: string; // Added
  topics?: string[]; // Added
  saved: boolean; // Added for Save for Later
}

export interface NewsletterStyles {
  headingFont: string;
  paragraphFont: string;
  hyperlinkFont: string;
  headingColor: string;
  paragraphColor: string;
  hyperlinkColor: string;
  backgroundColor: string;
  // New text customization fields
  subjectLineText: string;
  previewLineText: string;
  authorsHeadingText: string;
  factsHeadingText: string;
  toolsHeadingText: string;
  newslettersHeadingText: string;
  podcastsHeadingText: string;
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

// 'savedItems' is not a content type for generation, but a view type.
// Keep ContentType for actual generation categories.
export type ContentType = 'authors' | 'facts' | 'tools' | 'newsletters' | 'podcasts';
export const ALL_CONTENT_TYPES: ContentType[] = ['authors', 'facts', 'tools', 'newsletters', 'podcasts'];

// This can be used for UI state to differentiate views.
export type WorkspaceView = ContentType | 'savedItems';


// For author sorting
export type AuthorSortOption = "default" | "relevance_desc" | "relevance_asc" | "name_asc" | "name_desc";


// Keep AggregatedContentItem for now if it's used by old logic, but it should be phased out.
export interface AggregatedContentItem {
  id: string;
  text: string;
  sourceUrl?: string;
  selected: boolean;
  relevanceScore?: number;
}
