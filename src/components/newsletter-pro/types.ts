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
  id: string;
  name: string;
  type: 'free' | 'paid';
  selected: boolean;
  relevanceScore?: number;
}

export interface AggregatedContentItem {
  id: string;
  text: string;
  sourceUrl?: string; // Optional: if we want to track where it came from
  selected: boolean;
  relevanceScore?: number; // Added for consistency, though AI flow for aggregation doesn't provide it yet
}

export interface NewsletterStyles {
  headingFont: string;
  paragraphFont: string;
  hyperlinkFont: string; // Though typically hyperlinks inherit paragraph font and only color/decoration changes
  headingColor: string;
  paragraphColor: string;
  hyperlinkColor: string;
  backgroundColor: string;
}

