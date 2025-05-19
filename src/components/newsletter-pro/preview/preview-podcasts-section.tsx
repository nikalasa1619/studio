
// src/components/newsletter-pro/preview/preview-podcasts-section.tsx
"use client";

import React from 'react';
import type { PodcastItem, NewsletterStyles, PersonalizationSettings } from '../types';
import { MicVocal } from 'lucide-react';

interface PreviewPodcastsSectionProps {
  podcasts: PodcastItem[];
  styles: NewsletterStyles;
  personalization: PersonalizationSettings;
  inlineStyles: any;
}

export function PreviewPodcastsSection({
  podcasts,
  styles,
  personalization,
  inlineStyles,
}: PreviewPodcastsSectionProps) {
  if (podcasts.length === 0) return null;

  return (
    <section>
      <h2 style={inlineStyles.h2}>
        {personalization.podcastsHeading || styles.podcastsHeadingText || "Recommended Podcasts"}
      </h2>
      {podcasts.map((podcast) => (
        <div key={podcast.id} style={inlineStyles.newsletterItem}>
          <div style={inlineStyles.itemTitle}>{podcast.name}</div>
          <div style={inlineStyles.itemSecondaryText}>Episode: {podcast.episodeTitle}</div>
          <div style={inlineStyles.itemDescription}>{podcast.description}</div>
          {podcast.frequency && <div style={inlineStyles.itemMetaText}>Frequency: {podcast.frequency}</div>}
          {podcast.topics && podcast.topics.length > 0 && (
            <div style={inlineStyles.itemMetaText}>Topics: {podcast.topics.join(', ')}</div>
          )}
          {podcast.podcastLink && (
            <a href={podcast.podcastLink} target="_blank" rel="noopener noreferrer" style={inlineStyles.itemLink}>
              Listen Here <MicVocal size={14} style={{ marginLeft: '4px' }} />
            </a>
          )}
        </div>
      ))}
    </section>
  );
}
