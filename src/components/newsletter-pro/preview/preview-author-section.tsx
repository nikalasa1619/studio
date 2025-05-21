
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
  if (authors.length === 0 && !isLoadingFormats) return null;

  const getSourceText = (formatted: FormattedQuoteData, authorItem: Author) => {
    let sourceText = formatted.bookTitle;
    if (authorItem.publicationYear) {
      sourceText += ` (${authorItem.publicationYear}`;
      if (authorItem.pageNumber) {
        sourceText += `, p. ${authorItem.pageNumber}`;
      }
      sourceText += ')';
    } else if (authorItem.pageNumber) {
      sourceText += ` (p. ${authorItem.pageNumber})`;
    }
    return sourceText;
  };

  return (
    <section>
      <h2 style={inlineStyles.h2}>
        {personalization.authorsHeading || styles.authorsHeadingText || "Inspiring Authors & Quotes"}
      </h2>
      {isLoadingFormats && authors.length > 0 && (
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
            return (
                 <div key={`${authorItem.id}-preview-fallback`} style={{ marginBottom: '2em', paddingBottom: '1em', borderBottom: `1px solid ${styles.borderColor || 'hsl(var(--border))'}` }}>
                    <h3 style={inlineStyles.quoteSectionHeadline}>{authorItem.quoteCardHeadline || "Insight from " + authorItem.name}</h3>
                    <p style={inlineStyles.quoteIntroductoryCopy}>{authorItem.titleOrKnownFor}, {authorItem.name}, on a key insight.</p>
                    <blockquote style={inlineStyles.quoteText}>
                      "{authorItem.quote.replace(/^"+|"+$/g, '')}"
                    </blockquote>
                    <p style={inlineStyles.quoteSourceLinkContainer}>
                      Source: <a href={authorItem.amazonLink} target="_blank" rel="noopener noreferrer" style={inlineStyles.quoteSourceLink}>
                        {authorItem.quoteSource}
                        {authorItem.publicationYear ? ` (${authorItem.publicationYear}` : ''}
                        {authorItem.pageNumber && authorItem.publicationYear ? `, p. ${authorItem.pageNumber}` : authorItem.pageNumber ? ` (p. ${authorItem.pageNumber}` : ''}
                        {authorItem.publicationYear ? ')' : ''}
                      </a>
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
                {getSourceText(formatted, authorItem)}
              </a>
            </p>
          </div>
        );
      })}
    </section>
  );
}
