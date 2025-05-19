
// src/components/newsletter-pro/preview/preview-author-section.tsx
"use client";

import React from 'react';
import type { Author, NewsletterStyles, PersonalizationSettings } from '../types';
import type { FormattedQuoteData } from '../newsletter-preview'; // Assuming FormattedQuoteData is exported

interface PreviewAuthorSectionProps {
  authors: Author[];
  formattedQuotes: Record<string, FormattedQuoteData>;
  isLoadingFormats: boolean;
  styles: NewsletterStyles;
  personalization: PersonalizationSettings;
  inlineStyles: any; // Consider defining a more specific type for inlineStyles
}

export function PreviewAuthorSection({
  authors,
  formattedQuotes,
  isLoadingFormats,
  styles,
  personalization,
  inlineStyles,
}: PreviewAuthorSectionProps) {
  if (authors.length === 0) return null;

  return (
    <section>
      <h2 style={inlineStyles.h2}>
        {personalization.authorsHeading || styles.authorsHeadingText || "Inspiring Authors & Quotes"}
      </h2>
      {isLoadingFormats && (
        <div style={inlineStyles.loadingContainer}>
          {/* Use a proper Loader component if available, e.g., from lucide-react */}
          <p style={{ fontFamily: styles.paragraphFont, color: styles.paragraphColor }}>Formatting quotes...</p>
        </div>
      )}
      {!isLoadingFormats && authors.map((authorItem) => {
        const formatted = formattedQuotes[authorItem.id];
        if (!formatted) return null;

        return (
          <div key={`${authorItem.id}-preview-formatted`} style={{ marginBottom: '2em', paddingBottom: '1em', borderBottom: `1px solid ${styles.borderColor || 'hsl(var(--border))'}` }}>
            <h3 style={inlineStyles.quoteSectionHeadline}>{formatted.headline}</h3>
            <p style={inlineStyles.quoteIntroductoryCopy}>{formatted.introductoryCopy}</p>
            <blockquote style={inlineStyles.quoteText}>
              {formatted.formattedQuote}
            </blockquote>
            <p style={inlineStyles.quoteSourceLinkContainer}>
              Source: <a href={formatted.goodreadsLink} target="_blank" rel="noopener noreferrer" style={inlineStyles.quoteSourceLink}>
                {formatted.bookTitle}
              </a>
            </p>
          </div>
        );
      })}
    </section>
  );
}
