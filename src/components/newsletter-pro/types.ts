export interface Author {
  id: string;
  name: string;
  quotes: Quote[];
}

export interface Quote {
  id: string;
  text: string;
  selected: boolean;
}

export interface FunFactItem {
  id: string;
  text: string;
  type: 'fun' | 'science';
  selected: boolean;
}

export interface ToolItem {
  id: string;
  name: string;
  type: 'free' | 'paid';
  selected: boolean;
}

export interface AggregatedContentItem {
  id: string;
  text: string;
  sourceUrl?: string; // Optional: if we want to track where it came from
  selected: boolean;
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
