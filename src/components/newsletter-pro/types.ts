export interface Author {
  id: string;
  name: string;
  titleOrKnownFor: string;
  quoteText: string;
  quoteSource: string;
  selected: boolean;
  amazonLink: string;
}

// The Quote interface is no longer part of the Author structure.
// If it's used independently elsewhere, it can remain. Otherwise, it can be removed if not.
// For this feature, it's absorbed into Author.
// export interface Quote {
//   id: string;
//   text: string;
//   selected: boolean;
// }

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
