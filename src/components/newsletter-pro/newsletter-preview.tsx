"use client";

import React, { useMemo } from "react";
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

  const groupedSelectedAuthors = useMemo(() => {
    const groups: Record<string, {
      name: string;
      titleOrKnownFor: string;
      quotes: Array<{ text: string; relevance: number }>;
      quoteSource: string;
    }> = {};

    selectedAuthors.forEach(item => {
      if (!groups[item.authorNameKey]) {
        groups[item.authorNameKey] = {
          name: item.name,
          titleOrKnownFor: item.titleOrKnownFor,
          quoteSource: item.quoteSource,
          quotes: [],
        };
      }
      groups[item.authorNameKey].quotes.push({ text: item.quote, relevance: item.relevanceScore });
    });
    return Object.values(groups);
  }, [selectedAuthors]);


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
    h3: {
        fontFamily: styles.headingFont,
        color: styles.headingColor,
        fontSize: '1.2em',
        fontStyle: 'italic',
        marginBottom: '0.2em',
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
      marginBottom: '0.75em', 
      paddingLeft: '1em',
      borderLeft: '2px solid #ccc', 
      fontStyle: 'italic',
      fontSize: '0.95em', 
    },
    quoteContainer: {
        marginBottom: '1em', 
    },
    footer: {
        fontSize: '0.85em', 
        marginTop: '0.5em',
        fontStyle: 'normal',
        color: styles.paragraphColor, 
        textAlign: 'right' as 'right', 
    },
    relevanceText: {
      fontSize: '0.8em',
      fontStyle: 'normal',
      color: styles.paragraphColor, 
      marginLeft: '8px',
    },
    a: {
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
      color: styles.mutedForeground,
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

          {groupedSelectedAuthors.length > 0 && (
            <section>
              <h2 style={inlineStyles.h2}>Inspiring Authors & Quotes</h2>
              {groupedSelectedAuthors.map((authorGroup, groupIndex) => (
                <div key={`${authorGroup.name}-${groupIndex}`} style={{ marginBottom: '2em' }}>
                  <h3 style={inlineStyles.h3}>
                    {authorGroup.name} 
                    <span style={{fontSize: '0.8em', fontWeight: 'normal', fontStyle: 'normal'}}> ({authorGroup.titleOrKnownFor})</span>
                  </h3>
                  <div style={inlineStyles.quoteContainer}>
                    {authorGroup.quotes.map((quoteItem, index) => (
                      <blockquote key={`${authorGroup.name}-previewquote-${index}`} style={inlineStyles.blockquote}>
                        "{quoteItem.text}"
                        <span style={inlineStyles.relevanceText}>(Relevance: {quoteItem.relevance.toFixed(1)})</span>
                      </blockquote>
                    ))}
                     <footer style={inlineStyles.footer}>Source: {authorGroup.quoteSource}</footer>
                  </div>
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
                   <a href={item.signUpLink} target="_blank" rel="noopener noreferrer" style={inlineStyles.newsletterLink}>
                     Sign Up <ExternalLink size={14} style={{marginLeft: '4px'}}/>
                   </a>
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
