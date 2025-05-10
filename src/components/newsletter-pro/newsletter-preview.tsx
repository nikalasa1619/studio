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
    ...selectedAuthors.map(author => ({ type: 'author', ...author, quotes: author.quotes.filter(q => q.selected) })).filter(a => a.quotes.length > 0),
    ...selectedFunFacts.filter(item => item.selected),
    ...selectedTools.filter(item => item.selected),
    ...selectedAggregatedContent.filter(item => item.selected),
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
    p: {
      fontFamily: styles.paragraphFont,
      color: styles.paragraphColor,
      lineHeight: '1.6',
      marginBottom: '1em',
    },
    a: {
      fontFamily: styles.hyperlinkFont, // Typically inherits from paragraph
      color: styles.hyperlinkColor,
      textDecoration: 'underline',
    },
    ul: {
      listStyleType: 'disc',
      marginLeft: '20px',
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
                author.quotes.some(q => q.selected) && (
                  <div key={author.id} style={{ marginBottom: '1.5em' }}>
                    <h3 style={{ ...inlineStyles.h2, fontSize: '1.2em', fontStyle: 'italic' }}>{author.name}</h3>
                    <ul style={inlineStyles.ul}>
                      {author.quotes.filter(q => q.selected).map((quote) => (
                        <li key={quote.id} style={inlineStyles.li}>"{quote.text}"</li>
                      ))}
                    </ul>
                  </div>
                )
              ))}
            </section>
          )}

          {selectedFunFacts.filter(f => f.selected).length > 0 && (
            <section>
              <h2 style={inlineStyles.h2}>Did You Know?</h2>
              <ul style={inlineStyles.ul}>
                {selectedFunFacts.filter(f => f.selected).map((fact) => (
                  <li key={fact.id} style={inlineStyles.li}>
                    <strong>{fact.type === 'fun' ? 'Fun Fact' : 'Science Fact'}:</strong> {fact.text}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {selectedTools.filter(t => t.selected).length > 0 && (
            <section>
              <h2 style={inlineStyles.h2}>Recommended Tools</h2>
              <ul style={inlineStyles.ul}>
                {selectedTools.filter(t => t.selected).map((tool) => (
                  <li key={tool.id} style={inlineStyles.li}>
                    {tool.name} ({tool.type})
                  </li>
                ))}
              </ul>
            </section>
          )}
          
          {selectedAggregatedContent.filter(ac => ac.selected).length > 0 && (
            <section>
              <h2 style={inlineStyles.h2}>From Around The Web</h2>
               {selectedAggregatedContent.filter(ac => ac.selected).map((item) => (
                 <p key={item.id} style={inlineStyles.p}>{item.text}</p>
              ))}
            </section>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
