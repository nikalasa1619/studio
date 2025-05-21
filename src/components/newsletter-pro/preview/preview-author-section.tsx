
// src/components/newsletter-pro/preview/preview-author-section.tsx
"use client";

import React from 'react';
import type { Author, NewsletterStyles, PersonalizationSettings } from '../types';
import type { FormattedQuoteData } from '../newsletter-preview'; 
import { Loader2 } from 'lucide-react'; // For loading indicator

interface PreviewAuthorSectionProps {
  authors: Author[];
  formattedQuotes: Record<string, FormattedQuoteData>;
  isLoadingFormats: boolean;
  styles: NewsletterStyles;
  personalization: PersonalizationSettings;
  inlineStyles: any; 
}

export function PreviewAuthorSection({
  authors,
  formattedQuotes,
  isLoadingFormats,
  styles,
  personalization,
  inlineStyles,
}: PreviewAuthorSectionProps) {
  if (authors.length === 0 && !isLoadingFormats) return null; // Don't render section if no authors and not loading

  return (
    <section>
      <h2 style={inlineStyles.h2}>
        {personalization.authorsHeading || styles.authorsHeadingText || "Inspiring Authors & Quotes"}
      </h2>
      {isLoadingFormats && (
        <div style={inlineStyles.loadingContainer}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p style={{ fontFamily: styles.paragraphFont, color: styles.paragraphColor, marginTop: '10px' }}>
            Formatting quotes...
          </p>
        </div>
      )}
      {!isLoadingFormats && authors.map((authorItem) => {
        const formatted = formattedQuotes[authorItem.id];
        if (!formatted) {
            // Render a placeholder or minimal info if formatting is somehow missing for a selected author
            return (
                 <div key={`${authorItem.id}-preview-fallback`} style={{ marginBottom: '2em', paddingBottom: '1em', borderBottom: `1px solid ${styles.borderColor || 'hsl(var(--border))'}` }}>
                    <h3 style={inlineStyles.quoteSectionHeadline}>{authorItem.quoteCardHeadline || "Insight from " + authorItem.name}</h3>
                    <p style={inlineStyles.quoteIntroductoryCopy}>{authorItem.titleOrKnownFor}, {authorItem.name}, on a key insight.</p>
                    <blockquote style={inlineStyles.quoteText}>
                      "{authorItem.quote.replace(/^"+|"+$/g, '')}"
                    </blockquote>
                    <p style={inlineStyles.quoteSourceLinkContainer}>
                      Source: {authorItem.quoteSource}
                    </p>
                </div>
            );
        }

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
