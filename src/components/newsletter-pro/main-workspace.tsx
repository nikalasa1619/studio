
"use client";

import React, { useState, useMemo } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { AiSectionCard } from "./ai-section-card";
import { ContentItemCard } from "./content-item-card";
import { NewsletterPreview } from "./newsletter-preview";
import { StyleCustomizer } from "./style-customizer";
import type {
  Author,
  FunFactItem,
  ToolItem,
  AggregatedContentItem,
  NewsletterStyles,
} from "./types";
import {
  getAuthorsAndQuotesAction,
  generateFunFactsAction,
  recommendToolsAction,
  aggregateContentAction,
} from "@/actions/newsletter-actions";
import type {
  FetchAuthorsAndQuotesOutput,
} from "@/ai/flows/fetch-authors-and-quotes";
import type {
  GenerateFunFactsOutput,
} from "@/ai/flows/generate-fun-facts";
import type {
  RecommendProductivityToolsOutput,
} from "@/ai/flows/recommend-productivity-tools";
import type {
  AggregateContentOutput,
} from "@/ai/flows/aggregate-content";

import { UsersRound, Lightbulb, Wrench, Link as LinkIcon, FileText } from "lucide-react";

// Schemas for AI Section Forms
const topicSchema = z.object({ topic: z.string().min(3, "Topic must be at least 3 characters long.") });
const contentAggregatorSchema = z.object({
  topic: z.string().min(3, "Topic is required."),
  urls: z.string().min(1, "At least one URL is required.").transform(value => value.split('\n').map(url => url.trim()).filter(url => url.length > 0)),
});


const initialStyles: NewsletterStyles = {
  headingFont: "Arial, sans-serif",
  paragraphFont: "Verdana, sans-serif",
  hyperlinkFont: "Verdana, sans-serif",
  headingColor: "#333333",
  paragraphColor: "#555555",
  hyperlinkColor: "#008080", // Teal
  backgroundColor: "#FFFFFF",
};

export function MainWorkspace() {
  const [globalTopic, setGlobalTopic] = useState<string>("");

  const [authors, setAuthors] = useState<Author[]>([]);
  const [funFacts, setFunFacts] = useState<FunFactItem[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [aggregatedContent, setAggregatedContent] = useState<AggregatedContentItem[]>([]);
  
  const [styles, setStyles] = useState<NewsletterStyles>(initialStyles);

  const handleAuthorsData = (data: FetchAuthorsAndQuotesOutput) => {
    setAuthors(
      data.authors.map((author, authorIndex) => ({
        id: `author-${authorIndex}-${Date.now()}`,
        name: author.name,
        titleOrKnownFor: author.titleOrKnownFor,
        quoteText: author.quote,
        quoteSource: author.source,
        selected: false, 
      }))
    );
  };

  const handleFunFactsData = (data: GenerateFunFactsOutput) => {
    const newFunFacts: FunFactItem[] = [];
    data.funFacts.forEach((fact, index) =>
      newFunFacts.push({ id: `fun-${index}-${Date.now()}`, text: fact, type: "fun", selected: false })
    );
    data.scienceFacts.forEach((fact, index) =>
      newFunFacts.push({ id: `science-${index}-${Date.now()}`, text: fact, type: "science", selected: false })
    );
    setFunFacts(newFunFacts);
  };

  const handleToolsData = (data: RecommendProductivityToolsOutput) => {
    const newTools: ToolItem[] = [];
    data.freeTools.forEach((toolName, index) =>
      newTools.push({ id: `free-tool-${index}-${Date.now()}`, name: toolName, type: "free", selected: false })
    );
    data.paidTools.forEach((toolName, index) =>
      newTools.push({ id: `paid-tool-${index}-${Date.now()}`, name: toolName, type: "paid", selected: false })
    );
    setTools(newTools);
  };

  const handleAggregatedData = (data: AggregateContentOutput) => {
    setAggregatedContent(
      data.extractedInformation.map((text, index) => ({
        id: `agg-${index}-${Date.now()}`,
        text,
        selected: false,
      }))
    );
  };

  const toggleItemSelection = (itemId: string, selected: boolean) => {
    setAuthors(prev => prev.map(author => author.id === itemId ? { ...author, selected } : author));
    setFunFacts(prev => prev.map(item => item.id === itemId ? { ...item, selected } : item));
    setTools(prev => prev.map(item => item.id === itemId ? { ...item, selected } : item));
    setAggregatedContent(prev => prev.map(item => item.id === itemId ? { ...item, selected } : item));
  };
  
  const selectedAuthors = useMemo(() => authors.filter(author => author.selected), [authors]);
  const selectedFunFacts = useMemo(() => funFacts.filter(item => item.selected), [funFacts]);
  const selectedTools = useMemo(() => tools.filter(item => item.selected), [tools]);
  const selectedAggregatedContent = useMemo(() => aggregatedContent.filter(item => item.selected), [aggregatedContent]);


  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-primary">NewsLetterPro</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Craft compelling newsletters with AI-powered content generation.
        </p>
      </header>

      <Card className="p-6 shadow-xl">
        <Label htmlFor="globalTopic" className="text-lg font-semibold">
          Newsletter Topic
        </Label>
        <Input
          id="globalTopic"
          type="text"
          value={globalTopic}
          onChange={(e) => setGlobalTopic(e.target.value)}
          placeholder="e.g., Sustainable Living, AI in Healthcare, Future of Remote Work"
          className="mt-2 text-base"
        />
        {!globalTopic && <p className="text-sm text-destructive mt-1">Please enter a topic to enable content generation.</p>}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AiSectionCard
          title="Author & Quote Finder"
          description="Discover relevant authors and their impactful quotes based on your topic."
          icon={<UsersRound size={24} />}
          formSchema={topicSchema}
          formFields={[]} 
          sharedTopic={globalTopic}
          topicFieldName="topic"
          action={getAuthorsAndQuotesAction}
          onDataReceived={handleAuthorsData}
        />
        <AiSectionCard
          title="Fun Fact Generator"
          description="Generate engaging fun facts and insightful science facts related to your topic."
          icon={<Lightbulb size={24} />}
          formSchema={topicSchema}
          formFields={[]} 
          sharedTopic={globalTopic}
          topicFieldName="topic"
          action={generateFunFactsAction}
          onDataReceived={handleFunFactsData}
        />
        <AiSectionCard
          title="Tool Recommender"
          description="Get suggestions for free and paid productivity tools relevant to your topic."
          icon={<Wrench size={24} />}
          formSchema={topicSchema}
          formFields={[]} 
          sharedTopic={globalTopic}
          topicFieldName="topic"
          action={recommendToolsAction}
          onDataReceived={handleToolsData}
        />
        <AiSectionCard
          title="Content Aggregator"
          description="Fetch and filter content from URLs based on your main topic."
          icon={<LinkIcon size={24} />}
          formSchema={contentAggregatorSchema}
          formFields={[
            { name: "urls", label: "Enter URLs (one per line)", type: "textarea", placeholder: "https://example.com/article1\nhttps://blog.example.com/post2" },
          ]}
          sharedTopic={globalTopic}
          topicFieldName="topic"
          action={aggregateContentAction}
          onDataReceived={handleAggregatedData}
        />
      </div>

      <Separator className="my-8" />

      <div className="flex justify-end">
        <StyleCustomizer initialStyles={styles} onStylesChange={setStyles} />
      </div>

      <Tabs defaultValue="authors" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="authors" className="gap-1"><UsersRound size={16}/> Authors</TabsTrigger>
          <TabsTrigger value="facts" className="gap-1"><Lightbulb size={16}/> Facts</TabsTrigger>
          <TabsTrigger value="tools" className="gap-1"><Wrench size={16}/> Tools</TabsTrigger>
          <TabsTrigger value="aggregated" className="gap-1"><FileText size={16}/> Aggregated</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[500px] p-1 rounded-md border">
          <TabsContent value="authors" className="p-4">
            <div className="space-y-4">
              {authors.length > 0 ? authors.map((author) => (
                <ContentItemCard
                  key={author.id}
                  id={author.id}
                  title={author.name}
                  typeBadge="Author"
                  isSelected={author.selected}
                  onToggleSelect={toggleItemSelection}
                  content={
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-muted-foreground">{author.titleOrKnownFor}</p>
                      <blockquote className="pl-3 italic border-l-2 border-border text-foreground/90">
                          <p>"{author.quoteText}"</p>
                          <footer className="text-xs text-muted-foreground mt-0.5 not-italic">- {author.quoteSource}</footer>
                      </blockquote>
                    </div>
                  }
                />
              )) : <p className="text-muted-foreground">No authors generated yet.</p>}
            </div>
          </TabsContent>
          <TabsContent value="facts" className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {funFacts.length > 0 ? funFacts.map((fact) => (
                <ContentItemCard
                  key={fact.id}
                  id={fact.id}
                  content={fact.text}
                  typeBadge={fact.type === "fun" ? "Fun Fact" : "Science Fact"}
                  isSelected={fact.selected}
                  onToggleSelect={toggleItemSelection}
                />
              )) : <p className="text-muted-foreground">No facts generated yet.</p>}
            </div>
          </TabsContent>
          <TabsContent value="tools" className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.length > 0 ? tools.map((tool) => (
                <ContentItemCard
                  key={tool.id}
                  id={tool.id}
                  title={tool.name}
                  typeBadge={tool.type === "free" ? "Free Tool" : "Paid Tool"}
                  isSelected={tool.selected}
                  onToggleSelect={toggleItemSelection}
                  content="" 
                />
              )) : <p className="text-muted-foreground">No tools recommended yet.</p>}
            </div>
          </TabsContent>
          <TabsContent value="aggregated" className="p-4">
            <div className="space-y-4">
              {aggregatedContent.length > 0 ? aggregatedContent.map((item) => (
                <ContentItemCard
                  key={item.id}
                  id={item.id}
                  content={item.text}
                  typeBadge="Aggregated Content"
                  isSelected={item.selected}
                  onToggleSelect={toggleItemSelection}
                />
              )) : <p className="text-muted-foreground">No content aggregated yet.</p>}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      <NewsletterPreview
        selectedAuthors={selectedAuthors}
        selectedFunFacts={selectedFunFacts}
        selectedTools={selectedTools}
        selectedAggregatedContent={selectedAggregatedContent}
        styles={styles}
      />
    </div>
  );
}
