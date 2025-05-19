
// src/components/newsletter-pro/preview/preview-facts-section.tsx
"use client";

import React from 'react';
import type { FunFactItem, NewsletterStyles, PersonalizationSettings } from '../types';
import { Link as LinkIcon } from 'lucide-react'; // Assuming LinkIcon is desired

interface PreviewFactsSectionProps {
  facts: FunFactItem[];
  styles: NewsletterStyles;
  personalization: PersonalizationSettings;
  inlineStyles: any;
}

export function PreviewFactsSection({
  facts,
  styles,
  personalization,
  inlineStyles,
}: PreviewFactsSectionProps) {
  if (facts.length === 0) return null;

  return (
    <section>
      <h2 style={inlineStyles.h2}>
        {personalization.factsHeading || styles.factsHeadingText || "Did You Know?"}
      </h2>
      <ul style={inlineStyles.ul}>
        {facts.map((fact) => (
          <li key={fact.id} style={inlineStyles.li}>
            <strong>{fact.type === 'fun' ? 'Fun Fact' : 'Science Fact'}:</strong> {fact.text}
            {fact.sourceLink && (
              <a href={fact.sourceLink} target="_blank" rel="noopener noreferrer" style={inlineStyles.factSourceLink}>
                <LinkIcon size={12} style={{ display: 'inline-block', marginRight: '3px', verticalAlign: 'middle' }} />Source
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
