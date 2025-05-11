export interface Author {
  id: string; // Unique ID for this specific card e.g., authorName-quoteIndex
  name: string; // Author's name
  titleOrKnownFor: string;
  quote: string; // A single quote
  quoteSource: string;
  imported: boolean; // Changed from selected
  amazonLink: string;
  authorNameKey: string; // To group by author name, e.g., for filtering
  relevanceScore: number;
}

export interface FunFactItem {
  id: string;
  text: string;
  type: 'fun' | 'science';
  selected: boolean;
  relevanceScore?: number;
}

export interface ToolItem {
  id:string;
  name: string;
  type: 'free' | 'paid';
  selected: boolean;
  relevanceScore?: number;
}

export interface NewsletterItem {
  id: string;
  name: string; // Name of the newsletter
  operator: string; // Person or company running it
  signUpLink: string; // Direct URL to the sign-up page
  description: string; // Brief description
  subscribers?: string; // Subscriber count (e.g., "10k+", "Not Publicly Available") - optional
  relevanceScore: number; // Relevance to the topic
  selected: boolean; // If the user wants to include it
}

export interface PodcastItem {
  id: string;
  name: string; // Podcast series name
  episodeTitle: string;
  podcastLink: string; // URL to episode or series
  description: string;
  relevanceScore: number;
  selected: boolean;
}

export interface NewsletterStyles {
  headingFont: string;
  paragraphFont: string;
  hyperlinkFont: string;
  headingColor: string;
  paragraphColor: string;
  hyperlinkColor: string;
  backgroundColor: string;
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
  lastModified: number; // Timestamp for sorting projects
  generatedContentTypes: ContentType[]; // Added to track generated types
}

export type ContentType = 'authors' | 'facts' | 'tools' | 'newsletters' | 'podcasts';
export const ALL_CONTENT_TYPES: ContentType[] = ['authors', 'facts', 'tools', 'newsletters', 'podcasts'];

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
