
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Author, FunFactItem, ToolItem, NewsletterItem, PodcastItem, NewsletterStyles } from "./types";
import { Newspaper, ExternalLink, MicVocal } from "lucide-react";

interface NewsletterPreviewProps {
  selectedAuthors: Author[];
  selectedFunFacts: FunFactItem[];
  selectedTools: ToolItem[];
  selectedAggregatedContent: NewsletterItem[]; // This is selectedNewsletters
  selectedPodcasts: PodcastItem[]; // Added
  styles: NewsletterStyles;
}

export function NewsletterPreview({
  selectedAuthors,
  selectedFunFacts,
  selectedTools,
  selectedAggregatedContent,
  selectedPodcasts, // Added
  styles,
}: NewsletterPreviewProps) {

  const renderableItems = [
    ...selectedAuthors,
    ...selectedFunFacts,
    ...selectedTools,
    ...selectedAggregatedContent,
    ...selectedPodcasts, // Added
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
    h3: { 
        fontFamily: styles.headingFont,
        color: styles.headingColor,
        fontSize: '1.2em',
        fontWeight: 'bold',
        marginBottom: '0.2em',
    },
    authorTitle: { 
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
    quoteContainer: { 
        marginBottom: '1.5em', 
        paddingBottom: '1em',
        borderBottom: '1px dashed #eee',
    },
    quoteSourceLink: { 
        fontFamily: styles.hyperlinkFont,
        color: styles.hyperlinkColor,
        textDecoration: 'underline',
        fontSize: '0.85em',
        display: 'block', 
        textAlign: 'left' as 'left',
        marginTop: '0.3em',
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
    newsletterItem: { // Also for PodcastItem
      marginBottom: '1.5em',
      paddingBottom: '1em',
      borderBottom: '1px dashed #eee',
    },
    itemTitle: { // Generic title for Newsletter & Podcast name/episode
      fontFamily: styles.headingFont,
      color: styles.headingColor,
      fontSize: '1.1em',
      fontWeight: 'bold',
      marginBottom: '0.2em',
    },
    itemSecondaryText: { // For operator or podcast episode title if different from main name
      fontSize: '0.9em',
      color: styles.paragraphColor,
      fontStyle: 'italic',
      marginBottom: '0.3em',
    },
    itemDescription: {
      fontSize: '0.95em',
      marginBottom: '0.5em',
    },
    itemMetaText: { // For subscribers or other small meta info
      fontSize: '0.8em',
      color: styles.paragraphColor, // Using paragraph color for better visibility than muted
      marginBottom: '0.5em',
    },
    itemLink: {
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
          
          {selectedAggregatedContent.length > 0 && ( 
            <section>
              <h2 style={inlineStyles.h2}>Recommended Newsletters</h2>
               {selectedAggregatedContent.map((item) => ( 
                 <div key={item.id} style={inlineStyles.newsletterItem}>
                   <div style={inlineStyles.itemTitle}>{item.name}</div>
                   <div style={inlineStyles.itemSecondaryText}>By: {item.operator}</div>
                   <div style={inlineStyles.itemDescription}>{item.description}</div>
                   {item.subscribers && <div style={inlineStyles.itemMetaText}>Subscribers: {item.subscribers}</div>}
                   {item.signUpLink && (
                    <a href={item.signUpLink} target="_blank" rel="noopener noreferrer" style={inlineStyles.itemLink}>
                        Sign Up <ExternalLink size={14} style={{marginLeft: '4px'}}/>
                    </a>
                   )}
                   {item.relevanceScore && <span style={inlineStyles.relevanceText}>(Relevance: {item.relevanceScore.toFixed(1)})</span>}
                  </div>
              ))}
            </section>
          )}

          {selectedPodcasts.length > 0 && (
            <section>
              <h2 style={inlineStyles.h2}>Recommended Podcasts</h2>
              {selectedPodcasts.map((podcast) => (
                <div key={podcast.id} style={inlineStyles.newsletterItem}> {/* Using newsletterItem style for podcasts too */}
                  <div style={inlineStyles.itemTitle}>{podcast.name}</div>
                  <div style={inlineStyles.itemSecondaryText}>Episode: {podcast.episodeTitle}</div>
                  <div style={inlineStyles.itemDescription}>{podcast.description}</div>
                  {podcast.podcastLink && (
                    <a href={podcast.podcastLink} target="_blank" rel="noopener noreferrer" style={inlineStyles.itemLink}>
                      Listen Here <MicVocal size={14} style={{marginLeft: '4px'}}/>
                    </a>
                  )}
                  {podcast.relevanceScore && <span style={inlineStyles.relevanceText}>(Relevance: {podcast.relevanceScore.toFixed(1)})</span>}
                </div>
              ))}
            </section>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
