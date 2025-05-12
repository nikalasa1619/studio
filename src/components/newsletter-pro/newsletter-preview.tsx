
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card"; 
import type { Author, FunFactItem, ToolItem, NewsletterItem, PodcastItem, NewsletterStyles } from "./types";
import { Newspaper, ExternalLink, MicVocal, Link as LinkIcon, Eye } from "lucide-react";

interface NewsletterPreviewProps {
  selectedAuthors: Author[];
  selectedFunFacts: FunFactItem[];
  selectedTools: ToolItem[];
  selectedAggregatedContent: NewsletterItem[]; 
  selectedPodcasts: PodcastItem[]; 
  styles: NewsletterStyles;
}

export function NewsletterPreview({
  selectedAuthors,
  selectedFunFacts,
  selectedTools,
  selectedAggregatedContent,
  selectedPodcasts, 
  styles,
}: NewsletterPreviewProps) {

  const renderableItems = [
    ...selectedAuthors,
    ...selectedFunFacts,
    ...selectedTools,
    ...selectedAggregatedContent,
    ...selectedPodcasts, 
  ];

  
  const inlineStyles = {
    previewContainer: { 
      width: '100%',
    },
    previewHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 0px 10px 0px', 
      marginBottom: '10px', 
    },
    previewHeaderText: {
      fontFamily: styles.headingFont,
      color: 'hsl(var(--sidebar-foreground))', // Changed to use sidebar foreground
      fontSize: '1.25em', 
      fontWeight: '600' as '600',
    },
    previewHeaderIcon: { // Style for the icon
        color: 'hsl(var(--sidebar-foreground))', // Changed to use sidebar foreground
    },
    cardContainer: { 
      fontFamily: styles.paragraphFont,
      color: styles.paragraphColor,
      backgroundColor: styles.backgroundColor,
      padding: '10px', 
      borderRadius: '8px', 
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
    factSourceLink: {
        fontFamily: styles.hyperlinkFont,
        color: styles.hyperlinkColor,
        textDecoration: 'underline',
        fontSize: '0.85em',
        marginLeft: '10px',
    },
    toolTrialText: {
        fontSize: '0.85em',
        fontStyle: 'italic',
        color: styles.paragraphColor,
        marginLeft: '5px',
    },
    newsletterItem: { 
      marginBottom: '1.5em',
      paddingBottom: '1em',
      borderBottom: '1px dashed #eee',
    },
    itemTitle: { 
      fontFamily: styles.headingFont,
      color: styles.headingColor,
      fontSize: '1.1em',
      fontWeight: 'bold',
      marginBottom: '0.2em',
    },
    itemSecondaryText: { 
      fontSize: '0.9em',
      color: styles.paragraphColor,
      fontStyle: 'italic',
      marginBottom: '0.3em',
    },
    itemDescription: {
      fontSize: '0.95em',
      marginBottom: '0.5em',
    },
    itemMetaText: { 
      fontSize: '0.8em',
      color: styles.paragraphColor, 
      marginBottom: '0.3em',
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
      marginTop: '0.3em',
    }
  };


  return (
    <div style={inlineStyles.previewContainer}>
      <div style={inlineStyles.previewHeader}>
        <Eye size={20} style={inlineStyles.previewHeaderIcon} /> 
        <span style={inlineStyles.previewHeaderText}>Preview</span>
      </div>
      <Card className="shadow-lg"> 
        <CardContent className="p-0"> 
          {renderableItems.length === 0 ? (
            <div style={{padding: '20px', ...inlineStyles.cardContainer}}>
              <p className="text-muted-foreground">Select or import some content items to see a preview here.</p>
            </div>
          ) : (
            <div style={inlineStyles.cardContainer}>
              <h1 style={inlineStyles.h1}>{styles.subjectLineText || "Your Curated Newsletter"}</h1>

              {selectedAuthors.length > 0 && (
                <section>
                  <h2 style={inlineStyles.h2}>{styles.authorsHeadingText || "Inspiring Authors & Quotes"}</h2>
                  {selectedAuthors.map((authorItem, index) => (
                    <div key={`${authorItem.id}-preview-${index}`} style={inlineStyles.quoteContainer}>
                      <h3 style={inlineStyles.h3}>
                        {authorItem.name}
                      </h3>
                      <p style={inlineStyles.authorTitle}>{authorItem.titleOrKnownFor}</p>
                      <blockquote style={inlineStyles.blockquote}>
                        "{authorItem.quote}"
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
                  <h2 style={inlineStyles.h2}>{styles.factsHeadingText || "Did You Know?"}</h2>
                  <ul style={inlineStyles.ul}>
                    {selectedFunFacts.map((fact) => (
                      <li key={fact.id} style={inlineStyles.li}>
                        <strong>{fact.type === 'fun' ? 'Fun Fact' : 'Science Fact'}:</strong> {fact.text}
                        {fact.sourceLink && (
                            <a href={fact.sourceLink} target="_blank" rel="noopener noreferrer" style={inlineStyles.factSourceLink}>
                                <LinkIcon size={12} style={{display: 'inline-block', marginRight: '3px', verticalAlign: 'middle'}} />Source
                            </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {selectedTools.length > 0 && (
                <section>
                  <h2 style={inlineStyles.h2}>{styles.toolsHeadingText || "Recommended Tools"}</h2>
                  <ul style={inlineStyles.ul}>
                    {selectedTools.map((tool) => (
                      <li key={tool.id} style={inlineStyles.li}>
                        {tool.name} ({tool.type === 'free' ? 'Free' : 'Paid'})
                        {tool.type === 'paid' && tool.freeTrialPeriod && <span style={inlineStyles.toolTrialText}>({tool.freeTrialPeriod})</span>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              
              {selectedAggregatedContent.length > 0 && ( 
                <section>
                  <h2 style={inlineStyles.h2}>{styles.newslettersHeadingText || "Recommended Newsletters"}</h2>
                   {selectedAggregatedContent.map((item) => ( 
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
                            Sign Up <ExternalLink size={14} style={{marginLeft: '4px'}}/>
                        </a>
                       )}
                      </div>
                  ))}
                </section>
              )}

              {selectedPodcasts.length > 0 && (
                <section>
                  <h2 style={inlineStyles.h2}>{styles.podcastsHeadingText || "Recommended Podcasts"}</h2>
                  {selectedPodcasts.map((podcast) => (
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
                          Listen Here <MicVocal size={14} style={{marginLeft: '4px'}}/>
                        </a>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

