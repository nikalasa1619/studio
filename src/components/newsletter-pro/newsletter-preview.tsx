"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Author, FunFactItem, ToolItem, NewsletterItem, NewsletterStyles } from "./types"; // Added NewsletterItem
import { Newspaper, ExternalLink } from "lucide-react";

interface NewsletterPreviewProps {
  selectedAuthors: Author[];
  selectedFunFacts: FunFactItem[];
  selectedTools: ToolItem[];
  selectedAggregatedContent: NewsletterItem[]; // Changed from AggregatedContentItem to NewsletterItem
  styles: NewsletterStyles;
}

export function NewsletterPreview({
  selectedAuthors,
  selectedFunFacts,
  selectedTools,
  selectedAggregatedContent, // This is now selectedNewsletters
  styles,
}: NewsletterPreviewProps) {

  const renderableItems = [
    ...selectedAuthors,
    ...selectedFunFacts,
    ...selectedTools,
    ...selectedAggregatedContent, // This contains NewsletterItem[]
  ];

  if (renderableItems.length === 0) {
    return (
      <Card className="mt-8 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Newspaper className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Newsletter Preview</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select or import some content items to see a preview here.</p>
        </CardContent>
      </Card>
    );
  }
  
  const inlineStyles = {
    container: {
      fontFamily: styles.paragraphFont,
      color: styles.paragraphColor,
      backgroundColor: styles.backgroundColor,
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid hsl(var(--border))',
    },
    h1: {
      fontFamily: styles.headingFont,
      color: styles.headingColor,
      fontSize: '2em',
      marginBottom: '0.5em',
    },
    h2: {
      fontFamily: styles.headingFont,
      color: styles.headingColor,
      fontSize: '1.5em',
      marginTop: '1em',
      marginBottom: '0.3em',
    },
    h3: { // For individual author names in preview
        fontFamily: styles.headingFont,
        color: styles.headingColor,
        fontSize: '1.2em',
        fontWeight: 'bold',
        marginBottom: '0.2em',
    },
    authorTitle: { // For author's title/known for
        fontFamily: styles.paragraphFont,
        color: styles.paragraphColor,
        fontSize: '0.9em',
        fontStyle: 'italic',
        marginBottom: '0.4em',
    },
    p: {
      fontFamily: styles.paragraphFont,
      color: styles.paragraphColor,
      lineHeight: '1.6',
      marginBottom: '1em',
    },
    blockquote: {
      fontFamily: styles.paragraphFont,
      color: styles.paragraphColor,
      lineHeight: '1.4', 
      marginBottom: '0.5em', 
      paddingLeft: '1em',
      borderLeft: '2px solid #ccc', 
      fontStyle: 'italic',
      fontSize: '0.95em', 
    },
    quoteContainer: { // Wrapper for each quote and its source
        marginBottom: '1.5em', 
        paddingBottom: '1em',
        borderBottom: '1px dashed #eee',
    },
    quoteSourceLink: { // For the source link
        fontFamily: styles.hyperlinkFont,
        color: styles.hyperlinkColor,
        textDecoration: 'underline',
        fontSize: '0.85em',
        display: 'block', // To ensure it's on its own line and can be left-aligned
        textAlign: 'left' as 'left',
        marginTop: '0.3em',
    },
    relevanceText: {
      fontSize: '0.8em',
      fontStyle: 'normal',
      color: styles.paragraphColor, 
      marginLeft: '8px',
    },
    a: { // General hyperlink style, can be overridden by more specific ones
      fontFamily: styles.hyperlinkFont,
      color: styles.hyperlinkColor,
      textDecoration: 'underline',
    },
    ul: {
      listStyleType: 'disc',
      marginLeft: '20px',
      fontFamily: styles.paragraphFont,
      color: styles.paragraphColor,
    },
    li: {
      marginBottom: '0.5em',
    },
    newsletterItem: {
      marginBottom: '1.5em',
      paddingBottom: '1em',
      borderBottom: '1px dashed #eee',
    },
    newsletterTitle: {
      fontFamily: styles.headingFont,
      color: styles.headingColor,
      fontSize: '1.1em',
      fontWeight: 'bold',
      marginBottom: '0.2em',
    },
    newsletterOperator: {
      fontSize: '0.9em',
      color: styles.paragraphColor,
      fontStyle: 'italic',
      marginBottom: '0.3em',
    },
    newsletterDescription: {
      fontSize: '0.95em',
      marginBottom: '0.5em',
    },
    newsletterSubscribers: {
      fontSize: '0.8em',
      color: styles.mutedForeground, // Assuming mutedForeground is defined in HSL or a direct color
      marginBottom: '0.5em',
    },
    newsletterLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontFamily: styles.hyperlinkFont,
      color: styles.hyperlinkColor,
      textDecoration: 'none',
      border: '1px solid ' + styles.hyperlinkColor,
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.9em',
    }
  };


  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Newspaper className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Newsletter Preview</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div style={inlineStyles.container}>
          <h1 style={inlineStyles.h1}>Your Curated Newsletter</h1>

          {selectedAuthors.length > 0 && (
            <section>
              <h2 style={inlineStyles.h2}>Inspiring Authors & Quotes</h2>
              {selectedAuthors.map((authorItem, index) => (
                <div key={`${authorItem.id}-preview-${index}`} style={inlineStyles.quoteContainer}>
                  <h3 style={inlineStyles.h3}>
                    {authorItem.name}
                  </h3>
                  <p style={inlineStyles.authorTitle}>{authorItem.titleOrKnownFor}</p>
                  <blockquote style={inlineStyles.blockquote}>
                    "{authorItem.quote}"
                    <span style={inlineStyles.relevanceText}>(Relevance: {authorItem.relevanceScore.toFixed(1)})</span>
                  </blockquote>
                  <a href={authorItem.amazonLink} target="_blank" rel="noopener noreferrer" style={inlineStyles.quoteSourceLink}>
                    Source: {authorItem.quoteSource}
                  </a>
                </div>
              ))}
            </section>
          )}

          {selectedFunFacts.length > 0 && (
            <section>
              <h2 style={inlineStyles.h2}>Did You Know?</h2>
              <ul style={inlineStyles.ul}>
                {selectedFunFacts.map((fact) => (
                  <li key={fact.id} style={inlineStyles.li}>
                    <strong>{fact.type === 'fun' ? 'Fun Fact' : 'Science Fact'}:</strong> {fact.text}
                    {fact.relevanceScore && <span style={inlineStyles.relevanceText}>(Relevance: {fact.relevanceScore.toFixed(1)})</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {selectedTools.length > 0 && (
            <section>
              <h2 style={inlineStyles.h2}>Recommended Tools</h2>
              <ul style={inlineStyles.ul}>
                {selectedTools.map((tool) => (
                  <li key={tool.id} style={inlineStyles.li}>
                    {tool.name} ({tool.type === 'free' ? 'Free' : 'Paid'})
                    {tool.relevanceScore && <span style={inlineStyles.relevanceText}>(Relevance: {tool.relevanceScore.toFixed(1)})</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          {selectedAggregatedContent.length > 0 && ( // This is now selectedNewsletters
            <section>
              <h2 style={inlineStyles.h2}>Recommended Newsletters</h2>
               {selectedAggregatedContent.map((item) => ( // item is NewsletterItem
                 <div key={item.id} style={inlineStyles.newsletterItem}>
                   <div style={inlineStyles.newsletterTitle}>{item.name}</div>
                   <div style={inlineStyles.newsletterOperator}>By: {item.operator}</div>
                   <div style={inlineStyles.newsletterDescription}>{item.description}</div>
                   {item.subscribers && <div style={inlineStyles.newsletterSubscribers}>Subscribers: {item.subscribers}</div>}
                   {item.signUpLink && (
                    <a href={item.signUpLink} target="_blank" rel="noopener noreferrer" style={inlineStyles.newsletterLink}>
                        Sign Up <ExternalLink size={14} style={{marginLeft: '4px'}}/>
                    </a>
                   )}
                   {item.relevanceScore && <span style={inlineStyles.relevanceText}>(Relevance: {item.relevanceScore.toFixed(1)})</span>}
                  </div>
              ))}
            </section>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

