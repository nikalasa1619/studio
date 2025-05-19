
// src/components/newsletter-pro/preview/preview-newsletters-section.tsx
"use client";

import React from 'react';
import type { NewsletterItem, NewsletterStyles, PersonalizationSettings } from '../types';
import { ExternalLink } from 'lucide-react';

interface PreviewNewslettersSectionProps {
  newsletters: NewsletterItem[];
  styles: NewsletterStyles;
  personalization: PersonalizationSettings;
  inlineStyles: any;
}

export function PreviewNewslettersSection({
  newsletters,
  styles,
  personalization,
  inlineStyles,
}: PreviewNewslettersSectionProps) {
  if (newsletters.length === 0) return null;

  return (
    <section>
      <h2 style={inlineStyles.h2}>
        {personalization.newslettersHeading || styles.newslettersHeadingText || "Recommended Newsletters"}
      </h2>
      {newsletters.map((item) => (
        <div key={item.id} style={inlineStyles.newsletterItem}>
          <div style={inlineStyles.itemTitle}>{item.name}</div>
          <div style={inlineStyles.itemSecondaryText}>By: {item.operator}</div>
          <div style={inlineStyles.itemDescription}>{item.description}</div>
          {item.subscribers && <div style={inlineStyles.itemMetaText}>Subscribers: {item.subscribers}</div>}
          {item.frequency && <div style={inlineStyles.itemMetaText}>Frequency: {item.frequency}</div>}
          {item.coveredTopics && item.coveredTopics.length > 0 && (
            <div style={inlineStyles.itemMetaText}>Topics: {item.coveredTopics.join(', ')}</div>
          )}
          {item.signUpLink && (
            <a href={item.signUpLink} target="_blank" rel="noopener noreferrer" style={inlineStyles.itemLink}>
              Sign Up <ExternalLink size={14} style={{ marginLeft: '4px' }} />
            </a>
          )}
        </div>
      ))}
    </section>
  );
}
