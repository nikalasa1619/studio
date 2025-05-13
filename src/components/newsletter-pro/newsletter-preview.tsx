
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Author, FunFactItem, ToolItem, NewsletterItem, PodcastItem, NewsletterStyles } from "./types";
import { generateQuoteNewsletterFormatAction } from "@/actions/newsletter-actions";
import type { GenerateQuoteNewsletterFormatOutput } from "@/ai/flows/generate-quote-newsletter-format-flow";
import { Eye, Loader2, Palette, Link as LinkIcon, ExternalLink, MicVocal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StyleCustomizer } from "./style-customizer"; // Import StyleCustomizer
import { cn } from "@/lib/utils";

interface FormattedQuoteData extends GenerateQuoteNewsletterFormatOutput {
  id: string; // To map back to the original author item
}

interface NewsletterPreviewProps {
  selectedAuthors: Author[];
  selectedFunFacts: FunFactItem[];
  selectedTools: ToolItem[];
  selectedAggregatedContent: NewsletterItem[];
  selectedPodcasts: PodcastItem[];
  styles: NewsletterStyles;
  projectTopic: string;
  onStylesChange: (newStyles: NewsletterStyles) => void; // Added prop
}

export function NewsletterPreview({
  selectedAuthors,
  selectedFunFacts,
  selectedTools,
  selectedAggregatedContent,
  selectedPodcasts,
  styles,
  projectTopic,
  onStylesChange, // Added prop
}: NewsletterPreviewProps) {
  const [formattedQuotes, setFormattedQuotes] = useState<Record<string, FormattedQuoteData>>({});
  const [isLoadingFormats, setIsLoadingFormats] = useState(false);

  useEffect(() => {
    if (selectedAuthors.length > 0) {
      setIsLoadingFormats(true);
      const fetchFormats = async () => {
        const newFormattedQuotesData: Record<string, FormattedQuoteData> = {};
        for (const author of selectedAuthors) {
          try {
            const result = await generateQuoteNewsletterFormatAction({
              authorName: author.name,
              authorTitleOrKnownFor: author.titleOrKnownFor,
              quote: author.quote,
              quoteSourceBookTitle: author.quoteSource,
              originalTopic: projectTopic || "general wisdom",
            });
            newFormattedQuotesData[author.id] = { ...result, id: author.id };
          } catch (error) {
            console.error("Error formatting quote for:", author.name, error);
            newFormattedQuotesData[author.id] = {
              id: author.id,
              headline: "Insightful Words",
              introductoryCopy: `${author.titleOrKnownFor.split(' ').slice(0,4).join(' ')}, ${author.name}, on wisdom.`,
              formattedQuote: `"${author.quote.replace(/^"+|"+$/g, '')}"`,
              bookTitle: author.quoteSource,
              goodreadsLink: `https://www.goodreads.com/search?q=${encodeURIComponent(author.quoteSource)}`
            };
          }
        }
        setFormattedQuotes(newFormattedQuotesData);
        setIsLoadingFormats(false);
      };
      fetchFormats();
    } else {
      setFormattedQuotes({});
    }
  }, [selectedAuthors, projectTopic]);

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
      color: 'hsl(var(--sidebar-foreground))',
      fontSize: '1.25em',
      fontWeight: '600' as '600',
    },
    previewHeaderIcon: {
      color: 'hsl(var(--sidebar-foreground))',
    },
    cardContainer: {
      fontFamily: styles.paragraphFont,
      color: styles.paragraphColor,
      backgroundColor: styles.backgroundColor,
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid hsl(var(--border))', // Use theme border color
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
      marginTop: '1.5em',
      marginBottom: '0.5em',
    },
    quoteSectionHeadline: {
      fontFamily: styles.headingFont,
      color: styles.headingColor,
      fontSize: '1.3em',
      fontWeight: 'bold' as 'bold',
      marginBottom: '0.3em',
    },
    quoteIntroductoryCopy: {
      fontFamily: styles.paragraphFont,
      color: styles.paragraphColor,
      fontSize: '1em',
      marginBottom: '0.5em',
      fontStyle: 'italic',
    },
    quoteText: {
      fontFamily: styles.paragraphFont,
      color: styles.paragraphColor,
      fontSize: '1.1em',
      lineHeight: '1.6',
      margin: '0.8em 0',
      paddingLeft: '1em',
      borderLeft: `3px solid ${styles.hyperlinkColor || 'hsl(var(--accent))'}`,
    },
    quoteSourceLinkContainer: {
      fontFamily: styles.paragraphFont,
      color: styles.paragraphColor,
      fontSize: '0.9em',
      marginTop: '0.5em',
    },
    quoteSourceLink: {
      fontFamily: styles.hyperlinkFont,
      color: styles.hyperlinkColor,
      textDecoration: 'underline',
    },
    p: {
      fontFamily: styles.paragraphFont,
      color: styles.paragraphColor,
      lineHeight: '1.6',
      marginBottom: '1em',
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
      borderBottom: '1px dashed hsl(var(--border))',
    },
    itemTitle: {
      fontFamily: styles.headingFont,
      color: styles.headingColor,
      fontSize: '1.1em',
      fontWeight: 'bold' as 'bold',
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
      border: '1px solid ' + (styles.hyperlinkColor || 'hsl(var(--accent))'),
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '0.9em',
      marginTop: '0.3em',
    },
    loadingContainer: {
      display: 'flex',
      flexDirection: 'column' as 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center' as 'center',
      minHeight: '200px',
    }
  };

  return (
    <div style={inlineStyles.previewContainer}>
      <div style={inlineStyles.previewHeader}>
        <Eye size={20} style={inlineStyles.previewHeaderIcon} />
        <span style={inlineStyles.previewHeaderText} className="ml-2">Preview</span>
        <StyleCustomizer initialStyles={styles} onStylesChange={onStylesChange}>
          <Button variant="ghost" size="sm" className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent px-3 py-1.5 h-auto">
            <Palette size={16} className="mr-1.5" />
            Customize
          </Button>
        </StyleCustomizer>
      </div>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          {renderableItems.length === 0 && !isLoadingFormats ? (
            <div style={{padding: '20px', ...inlineStyles.cardContainer}}>
              <p className="text-muted-foreground">Select or import some content items to see a preview here.</p>
            </div>
          ) : (
            <div style={inlineStyles.cardContainer}>
              <h1 style={inlineStyles.h1}>{styles.subjectLineText || "Your Curated Newsletter"}</h1>

              {selectedAuthors.length > 0 && (
                <section>
                  <h2 style={inlineStyles.h2}>{styles.authorsHeadingText || "Inspiring Authors & Quotes"}</h2>
                  {isLoadingFormats && selectedAuthors.length > 0 && (
                    <div style={inlineStyles.loadingContainer}>
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                      <p style={{fontFamily: styles.paragraphFont, color: styles.paragraphColor}}>Formatting quotes...</p>
                    </div>
                  )}
                  {!isLoadingFormats && selectedAuthors.map((authorItem) => {
                    const formatted = formattedQuotes[authorItem.id];
                    if (!formatted) return null;

                    return (
                      <div key={`${authorItem.id}-preview-formatted`} style={{ marginBottom: '2em', paddingBottom: '1em', borderBottom: '1px solid hsl(var(--border))' }}>
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

