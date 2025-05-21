
"use client";

import React from 'react';
import { ContentItemCard } from "../content-item-card";
import type { ContentType, Author, FunFactItem, ToolItem, NewsletterItem, PodcastItem, WorkspaceView, GeneratedContent } from "../types";
import { contentTypeToLabel } from "../utils/workspace-helpers";

interface ContentGridProps {
    activeUITab: ContentType;
    getRawItemsForView: (type: ContentType) => GeneratedContent[];
    sortedAndFilteredAuthors: Author[];
    filteredFunFacts: FunFactItem[];
    filteredTools: ToolItem[];
    filteredNewsletters: NewsletterItem[];
    filteredPodcasts: PodcastItem[];
    showOnlySelected: Record<ContentType, boolean>;
    currentContentDisplayView: WorkspaceView;
    onToggleItemImportStatus: (itemId: string, imported: boolean, type: ContentType) => void;
    onToggleItemSavedStatus: (itemId: string, saved: boolean, type: ContentType) => void;
}


export function ContentGrid({
    activeUITab,
    getRawItemsForView,
    sortedAndFilteredAuthors,
    filteredFunFacts,
    filteredTools,
    filteredNewsletters,
    filteredPodcasts,
    showOnlySelected,
    currentContentDisplayView,
    onToggleItemImportStatus,
    onToggleItemSavedStatus,
}: ContentGridProps) {

    const renderContent = () => {
        const rawItems = getRawItemsForView(activeUITab);
        const typeLabel = contentTypeToLabel(activeUITab);

        if (rawItems.length === 0) {
            return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">{currentContentDisplayView === 'savedItems' ? `No ${typeLabel.toLowerCase()} saved.` : `${typeLabel} not generated yet for this project.`}</p>;
        }


        switch (activeUITab) {
            case 'authors':
                if (sortedAndFilteredAuthors.length === 0) {
                    const message = showOnlySelected['authors'] && currentContentDisplayView !== 'savedItems' ? `No selected ${typeLabel.toLowerCase()} to display for the current filters.` : `No authors match current filters.`;
                    return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">{message}</p>;
                }
                return sortedAndFilteredAuthors.map((authorItem, index) => (
                    <ContentItemCard 
                        key={authorItem.id} 
                        id={authorItem.id} 
                        title={authorItem.name} 
                        typeBadge="Author" 
                        isImported={authorItem.imported} 
                        isSaved={authorItem.saved} 
                        onToggleImport={(id, imp) => onToggleItemImportStatus(id, imp, 'authors')} 
                        onToggleSave={(id, svd) => onToggleItemSavedStatus(id, svd, 'authors')} 
                        className="flex flex-col h-full" 
                        relevanceScore={authorItem.relevanceScore} 
                        content={(
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground italic">{authorItem.titleOrKnownFor}</p>
                                <blockquote className="border-l-2 pl-3 text-sm italic">{authorItem.quote.replace(/^"+|"+$/g, '')}</blockquote>
                                <p className="text-xs text-muted-foreground">
                                    Source: <a href={authorItem.amazonLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{authorItem.quoteSource}</a>
                                </p>
                            </div>
                        )} 
                        amazonLink={authorItem.amazonLink} 
                        itemData={authorItem} 
                        animationIndex={index}
                    />
                ));
            case 'facts':
                if (filteredFunFacts.length === 0) {
                    const message = showOnlySelected['facts'] && currentContentDisplayView !== 'savedItems' ? `No selected ${typeLabel.toLowerCase()} to display for the current filters.` : `No ${typeLabel.toLowerCase()} found for the current filters.`;
                    return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">{message}</p>;
                }
                return filteredFunFacts.map((fact, index) => (
                    <ContentItemCard 
                        key={fact.id} 
                        id={fact.id} 
                        content={fact.text} 
                        typeBadge={fact.type === "fun" ? "Fun Fact" : "Science Fact"} 
                        isImported={fact.selected} 
                        isSaved={fact.saved} 
                        onToggleImport={(id, sel) => onToggleItemImportStatus(id, sel, 'facts')} 
                        onToggleSave={(id, svd) => onToggleItemSavedStatus(id, svd, 'facts')} 
                        relevanceScore={fact.relevanceScore} 
                        sourceLinkFact={fact.sourceLink} 
                        itemData={fact} 
                        animationIndex={index}
                    />
                ));
            case 'tools':
                 if (filteredTools.length === 0) {
                    const message = showOnlySelected['tools'] && currentContentDisplayView !== 'savedItems' ? `No selected ${typeLabel.toLowerCase()} to display for the current filters.` : `No ${typeLabel.toLowerCase()} found for the current filters.`;
                    return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">{message}</p>;
                }
                return filteredTools.map((tool, index) => (
                    <ContentItemCard 
                        key={tool.id} 
                        id={tool.id} 
                        title={tool.name} 
                        typeBadge={tool.type === "free" ? "Free Tool" : "Paid Tool"} 
                        isImported={tool.selected} 
                        isSaved={tool.saved} 
                        onToggleImport={(id, sel) => onToggleItemImportStatus(id, sel, 'tools')} 
                        onToggleSave={(id, svd) => onToggleItemSavedStatus(id, svd, 'tools')} 
                        relevanceScore={tool.relevanceScore} 
                        freeTrialPeriod={tool.freeTrialPeriod} 
                        itemData={tool} 
                        content="" 
                        animationIndex={index}
                    />
                ));
            case 'newsletters':
                 if (filteredNewsletters.length === 0) {
                    const message = showOnlySelected['newsletters'] && currentContentDisplayView !== 'savedItems' ? `No selected ${typeLabel.toLowerCase()} to display for the current filters.` : `No ${typeLabel.toLowerCase()} found for the current filters.`;
                    return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">{message}</p>;
                }
                return filteredNewsletters.map((nl, index) => (
                    <ContentItemCard 
                        key={nl.id} 
                        id={nl.id} 
                        title={nl.name} 
                        typeBadge="Newsletter" 
                        isImported={nl.selected} 
                        isSaved={nl.saved} 
                        onToggleImport={(id, sel) => onToggleItemImportStatus(id, sel, 'newsletters')} 
                        onToggleSave={(id, svd) => onToggleItemSavedStatus(id, svd, 'newsletters')} 
                        relevanceScore={nl.relevanceScore} 
                        content="" 
                        newsletterOperator={nl.operator} 
                        newsletterDescription={nl.description} 
                        newsletterSubscribers={nl.subscribers} 
                        signUpLink={nl.signUpLink} 
                        newsletterFrequency={nl.frequency} 
                        newsletterCoveredTopics={nl.coveredTopics} 
                        itemData={nl} 
                        animationIndex={index}
                    />
                ));
            case 'podcasts':
                if (filteredPodcasts.length === 0) {
                    const message = showOnlySelected['podcasts'] && currentContentDisplayView !== 'savedItems' ? `No selected ${typeLabel.toLowerCase()} to display for the current filters.` : `No ${typeLabel.toLowerCase()} found for the current filters.`;
                    return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">{message}</p>;
                }
                return filteredPodcasts.map((podcast, index) => (
                    <ContentItemCard 
                        key={podcast.id} 
                        id={podcast.id} 
                        title={podcast.name} 
                        typeBadge="Podcast" 
                        isImported={podcast.selected} 
                        isSaved={podcast.saved} 
                        onToggleImport={(id, sel) => onToggleItemImportStatus(id, sel, 'podcasts')} 
                        onToggleSave={(id, svd) => onToggleItemSavedStatus(id, svd, 'podcasts')} 
                        relevanceScore={podcast.relevanceScore} 
                        content={<div className="space-y-1 text-sm"><p className="font-medium text-muted-foreground">{podcast.episodeTitle}</p><p className="text-xs text-foreground/80 line-clamp-3">{podcast.description}</p></div>} 
                        itemData={podcast} 
                        signUpLink={podcast.podcastLink} 
                        podcastFrequency={podcast.frequency} 
                        podcastTopics={podcast.topics} 
                        animationIndex={index}
                    />
                ));
            default:
                return <p className="text-muted-foreground text-center col-span-full py-10 sm:py-12">Select a content type to view items.</p>;
        }
    };
    
    const allItemsForCurrentTab = getRawItemsForView(activeUITab);
    const noContentToDisplay = allItemsForCurrentTab.length === 0 || 
        (activeUITab === 'authors' && sortedAndFilteredAuthors.length === 0) ||
        (activeUITab === 'facts' && filteredFunFacts.length === 0) ||
        (activeUITab === 'tools' && filteredTools.length === 0) ||
        (activeUITab === 'newsletters' && filteredNewsletters.length === 0) ||
        (activeUITab === 'podcasts' && filteredPodcasts.length === 0);


    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 pb-8 px-1 md:px-2">
            {renderContent()}
        </div>
    );
}
