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

// This will be replaced by NewsletterItem for the new feature
export interface AggregatedContentItem {
  id: string;
  text: string;
  sourceUrl?: string; 
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


export interface NewsletterStyles {
  headingFont: string;
  paragraphFont: string;
  hyperlinkFont: string; 
  headingColor: string;
  paragraphColor: string;
  hyperlinkColor: string;
  backgroundColor: string;
}
