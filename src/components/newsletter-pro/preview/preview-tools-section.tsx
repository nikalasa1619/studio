
// src/components/newsletter-pro/preview/preview-tools-section.tsx
"use client";

import React from 'react';
import type { ToolItem, NewsletterStyles, PersonalizationSettings } from '../types';

interface PreviewToolsSectionProps {
  tools: ToolItem[];
  styles: NewsletterStyles;
  personalization: PersonalizationSettings;
  inlineStyles: any;
}

export function PreviewToolsSection({
  tools,
  styles,
  personalization,
  inlineStyles,
}: PreviewToolsSectionProps) {
  if (tools.length === 0) return null;

  return (
    <section>
      <h2 style={inlineStyles.h2}>
        {personalization.toolsHeading || styles.toolsHeadingText || "Recommended Tools"}
      </h2>
      <ul style={inlineStyles.ul}>
        {tools.map((tool) => (
          <li key={tool.id} style={inlineStyles.li}>
            {tool.name} ({tool.type === 'free' ? 'Free' : 'Paid'})
            {tool.type === 'paid' && tool.freeTrialPeriod && <span style={inlineStyles.toolTrialText}>({tool.freeTrialPeriod})</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}
