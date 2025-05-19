
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { Author, FunFactItem, ToolItem, NewsletterItem, PodcastItem, NewsletterStyles, PersonalizationSettings } from "./types";
import { generateQuoteNewsletterFormatAction } from "@/actions/newsletter-actions";
import type { GenerateQuoteNewsletterFormatOutput } from "@/ai/flows/generate-quote-newsletter-format-flow";
import { Eye, Loader2, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StyleCustomizer } from "./style-customizer";
import { PersonalizeNewsletterDialog } from "./personalize-newsletter-dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { PreviewAuthorSection } from './preview/preview-author-section';
import { PreviewFactsSection } from './preview/preview-facts-section';
import { PreviewToolsSection } from './preview/preview-tools-section';
import { PreviewNewslettersSection } from './preview/preview-newsletters-section';
import { PreviewPodcastsSection } from './preview/preview-podcasts-section';


export interface FormattedQuoteData extends GenerateQuoteNewsletterFormatOutput {
  id: string;
}

interface NewsletterPreviewProps {
  selectedAuthors: Author[];
  selectedFunFacts: FunFactItem[];
  selectedTools: ToolItem[];
  selectedAggregatedContent: NewsletterItem[];
  selectedPodcasts: PodcastItem[];
  styles: NewsletterStyles;
  projectTopic: string;
  onStylesChange: (newStyles: NewsletterStyles) => void;
  personalizationSettings: PersonalizationSettings;
  onPersonalizationChange: (settings: PersonalizationSettings) => void;
}

export function NewsletterPreview({
  selectedAuthors,
  selectedFunFacts,
  selectedTools,
  selectedAggregatedContent,
  selectedPodcasts,
  styles,
  projectTopic,
  onStylesChange,
  personalizationSettings,
  onPersonalizationChange,
}: NewsletterPreviewProps) {
  const [formattedQuotes, setFormattedQuotes] = useState<Record<string, FormattedQuoteData>>({});
  const [isLoadingFormats, setIsLoadingFormats] = useState(false);
  const [isPersonalizeDialogOpen, setIsPersonalizeDialogOpen] = useState(false);
  const { toast } = useToast();

  const currentPersonalization = useMemo(() => personalizationSettings || {}, [personalizationSettings]);
  const currentStyles = useMemo(() => styles || {}, [styles]);

  useEffect(() => {
    const fetchFormattedQuotes = async () => {
      if (selectedAuthors.length > 0) {
        setIsLoadingFormats(true);
        const newFormattedQuotesData: Record<string, FormattedQuoteData> = {};
        for (const author of selectedAuthors) {
          try {
            const result = await generateQuoteNewsletterFormatAction({
              authorName: author.name,
              authorTitleOrKnownFor: author.titleOrKnownFor,
              quote: author.quote,
              quoteSourceBookTitle: author.quoteSource,
              originalTopic: projectTopic || "general wisdom",
              newsletterDescription: currentPersonalization?.newsletterDescription,
              targetAudience: currentPersonalization?.targetAudience,
            });
            newFormattedQuotesData[author.id] = { ...result, id: author.id };
          } catch (error) {
            console.error("Error formatting quote for:", author.name, error);
            toast({ title: "Quote Formatting Error", description: `Could not format quote for ${author.name}. Using fallback.`, variant: "destructive" });
            newFormattedQuotesData[author.id] = {
              id: author.id,
              headline: "Insightful Words",
              introductoryCopy: `${author.titleOrKnownFor.split(' ').slice(0, 4).join(' ')}, ${author.name}, on wisdom.`,
              formattedQuote: `"${author.quote.replace(/^"+|"+$/g, '')}"`,
              bookTitle: author.quoteSource,
              goodreadsLink: `https://www.goodreads.com/search?q=${encodeURIComponent(author.quoteSource)}`
            };
          }
        }
        setFormattedQuotes(newFormattedQuotesData);
        setIsLoadingFormats(false);
      } else {
        setFormattedQuotes({});
      }
    };
    fetchFormattedQuotes();
  }, [selectedAuthors, projectTopic, currentPersonalization, toast]);

  const renderableItems = [
    ...selectedAuthors,
    ...selectedFunFacts,
    ...selectedTools,
    ...selectedAggregatedContent,
    ...selectedPodcasts,
  ];

  const displaySubjectLine = useMemo(() => {
    if (currentPersonalization.generateSubjectLine && currentPersonalization.subjectLine) return currentPersonalization.subjectLine;
    if (!currentPersonalization.generateSubjectLine && currentPersonalization.subjectLine) return currentPersonalization.subjectLine;
    return currentStyles.subjectLineText || "Your Curated Newsletter";
  }, [currentPersonalization.generateSubjectLine, currentPersonalization.subjectLine, currentStyles.subjectLineText]);

  const displayIntroText = useMemo(() => {
    if (currentPersonalization.generateIntroText && currentPersonalization.introText) return currentPersonalization.introText;
    if (!currentPersonalization.generateIntroText && currentPersonalization.introText) return currentPersonalization.introText;
    return currentStyles.previewLineText || "Catch up on the latest trends and ideas!";
  }, [currentPersonalization.generateIntroText, currentPersonalization.introText, currentStyles.previewLineText]);


  const inlineStyles = {
    previewContainer: {
      width: '100%',
    },
    cardContainer: {
      fontFamily: currentStyles.paragraphFont,
      color: currentStyles.paragraphColor,
      backgroundColor: currentStyles.backgroundColor,
      padding: '20px',
      borderRadius: '8px',
      border: `1px solid ${currentStyles.borderColor || 'hsl(var(--border))'}`,
    },
    h1: {
      fontFamily: currentStyles.headingFont,
      color: currentStyles.headingColor,
      fontSize: '2em',
      marginBottom: '0.5em',
    },
    h2: {
      fontFamily: currentStyles.headingFont,
      color: currentStyles.headingColor,
      fontSize: '1.5em',
      marginTop: '1.5em',
      marginBottom: '0.5em',
    },
    quoteSectionHeadline: {
      fontFamily: currentStyles.headingFont,
      color: currentStyles.headingColor,
      fontSize: '1.3em',
      fontWeight: 'bold' as 'bold',
      marginBottom: '0.3em',
    },
    quoteIntroductoryCopy: {
      fontFamily: currentStyles.paragraphFont,
      color: currentStyles.paragraphColor,
      fontSize: '1em',
      marginBottom: '0.5em',
      fontStyle: 'italic' as 'italic',
    },
    quoteText: {
      fontFamily: currentStyles.paragraphFont,
      color: currentStyles.paragraphColor,
      fontSize: '1.1em',
      lineHeight: '1.6',
      margin: '0.8em 0',
      paddingLeft: '1em',
      borderLeft: `3px solid ${currentStyles.hyperlinkColor || 'hsl(var(--accent))'}`,
    },
    quoteSourceLinkContainer: {
      fontFamily: currentStyles.paragraphFont,
      color: currentStyles.paragraphColor,
      fontSize: '0.9em',
      marginTop: '0.5em',
    },
    quoteSourceLink: {
      fontFamily: currentStyles.hyperlinkFont,
      color: currentStyles.hyperlinkColor,
      textDecoration: 'underline',
    },
    p: {
      fontFamily: currentStyles.paragraphFont,
      color: currentStyles.paragraphColor,
      lineHeight: '1.6',
      marginBottom: '1em',
    },
    ul: {
      listStyleType: 'disc',
      marginLeft: '20px',
      fontFamily: currentStyles.paragraphFont,
      color: currentStyles.paragraphColor,
    },
    li: {
      marginBottom: '0.5em',
    },
    factSourceLink: {
      fontFamily: currentStyles.hyperlinkFont,
      color: currentStyles.hyperlinkColor,
      textDecoration: 'underline',
      fontSize: '0.85em',
      marginLeft: '10px',
    },
    toolTrialText: {
      fontSize: '0.85em',
      fontStyle: 'italic' as 'italic',
      color: currentStyles.paragraphColor,
      marginLeft: '5px',
    },
    newsletterItem: {
      marginBottom: '1.5em',
      paddingBottom: '1em',
      borderBottom: `1px dashed ${currentStyles.borderColor || 'hsl(var(--border))'}`,
    },
    itemTitle: {
      fontFamily: currentStyles.headingFont,
      color: currentStyles.headingColor,
      fontSize: '1.1em',
      fontWeight: 'bold' as 'bold',
      marginBottom: '0.2em',
    },
    itemSecondaryText: {
      fontSize: '0.9em',
      color: currentStyles.paragraphColor,
      fontStyle: 'italic' as 'italic',
      marginBottom: '0.3em',
    },
    itemDescription: {
      fontSize: '0.95em',
      marginBottom: '0.5em',
    },
    itemMetaText: {
      fontSize: '0.8em',
      color: currentStyles.paragraphColor,
      marginBottom: '0.3em',
    },
    itemLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontFamily: currentStyles.hyperlinkFont,
      color: currentStyles.hyperlinkColor,
      textDecoration: 'none',
      border: `1px solid ${currentStyles.hyperlinkColor || 'hsl(var(--accent))'}`,
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
      minHeight: '100px',
    }
  };

  return (
    <div style={inlineStyles.previewContainer}>
      <Card className="shadow-lg">
        <CardContent className="p-0">
          {renderableItems.length === 0 && !isLoadingFormats ? (
            <div style={{ padding: '20px', ...inlineStyles.cardContainer }}>
              <p style={{ color: currentStyles.paragraphColor }}>Select or import some content items to see a preview here.</p>
            </div>
          ) : (
            <div style={inlineStyles.cardContainer}>
              <h1 style={inlineStyles.h1}>{displaySubjectLine}</h1>
              {displayIntroText && <p style={inlineStyles.p}>{displayIntroText}</p>}

              <PreviewAuthorSection
                authors={selectedAuthors}
                formattedQuotes={formattedQuotes}
                isLoadingFormats={isLoadingFormats}
                styles={currentStyles}
                personalization={currentPersonalization}
                inlineStyles={inlineStyles}
              />
              <PreviewFactsSection
                facts={selectedFunFacts}
                styles={currentStyles}
                personalization={currentPersonalization}
                inlineStyles={inlineStyles}
              />
              <PreviewToolsSection
                tools={selectedTools}
                styles={currentStyles}
                personalization={currentPersonalization}
                inlineStyles={inlineStyles}
              />
              <PreviewNewslettersSection
                newsletters={selectedAggregatedContent}
                styles={currentStyles}
                personalization={currentPersonalization}
                inlineStyles={inlineStyles}
              />
              <PreviewPodcastsSection
                podcasts={selectedPodcasts}
                styles={currentStyles}
                personalization={currentPersonalization}
                inlineStyles={inlineStyles}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
