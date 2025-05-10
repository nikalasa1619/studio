"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Author, FunFactItem, ToolItem, AggregatedContentItem, NewsletterStyles } from "./types";
import { Newspaper } from "lucide-react";

interface NewsletterPreviewProps {
  selectedAuthors: Author[];
  selectedFunFacts: FunFactItem[];
  selectedTools: ToolItem[];
  selectedAggregatedContent: AggregatedContentItem[];
  styles: NewsletterStyles;
}

export function NewsletterPreview({
  selectedAuthors,
  selectedFunFacts,
  selectedTools,
  selectedAggregatedContent,
  styles,
}: NewsletterPreviewProps) {

  const renderableItems = [
    ...selectedAuthors,
    ...selectedFunFacts,
    ...selectedTools,
    ...selectedAggregatedContent,
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
          <p className="text-muted-foreground">Select some content items to see a preview here.</p>
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
      lineHeight: '1.4', // Slightly reduced for better readability of multiple quotes
      marginBottom: '0.75em', // Space between quotes
      paddingLeft: '1em',
      borderLeft: '2px solid #ccc', 
      fontStyle: 'italic',
      fontSize: '0.95em', // Slightly smaller for quotes
    },
    quoteContainer: {
        marginBottom: '1em', // Space after all quotes from one author + source
    },
    footer: {
        fontSize: '0.85em', // Smaller for source
        marginTop: '0.5em',
        fontStyle: 'normal',
        color: styles.paragraphColor, 
        textAlign: 'right' as 'right', // Explicitly type textAlign
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
              {selectedAuthors.map((author) => (
                <div key={author.id} style={{ marginBottom: '2em' }}>
                  <h3 style={inlineStyles.h3}>
                    {author.name} 
                    <span style={{fontSize: '0.8em', fontWeight: 'normal', fontStyle: 'normal'}}> ({author.titleOrKnownFor})</span>
                  </h3>
                  <div style={inlineStyles.quoteContainer}>
                    {author.quotes.map((quote, index) => (
                      <blockquote key={`${author.id}-previewquote-${index}`} style={inlineStyles.blockquote}>
                        "{quote}"
                      </blockquote>
                    ))}
                     <footer style={inlineStyles.footer}>Source: {author.quoteSource}</footer>
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
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          {selectedAggregatedContent.length > 0 && (
            <section>
              <h2 style={inlineStyles.h2}>From Around The Web</h2>
               {selectedAggregatedContent.map((item) => (
                 <p key={item.id} style={inlineStyles.p}>{item.text}</p>
              ))}
            </section>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

