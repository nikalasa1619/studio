
"use client";

import React, { useState, useMemo } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiSectionCard } from "./ai-section-card";
import { ContentItemCard } from "./content-item-card";
import { NewsletterPreview } from "./newsletter-preview";
import { StyleCustomizer } from "./style-customizer";
import type {
  Author, // This will now be the modified Author type (single quote)
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

import { UsersRound, Lightbulb, Wrench, Link as LinkIcon, Palette, Filter } from "lucide-react";

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

  const [authors, setAuthors] = useState<Author[]>([]); // Author[] now means each item has one quote
  const [funFacts, setFunFacts] = useState<FunFactItem[]>([]);
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [aggregatedContent, setAggregatedContent] = useState<AggregatedContentItem[]>([]);
  
  const [styles, setStyles] = useState<NewsletterStyles>(initialStyles);
  const [isGenerating, setIsGenerating] = useState(false); // Global loading state
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<string>("all");


  const handleAuthorsData = (data: FetchAuthorsAndQuotesOutput) => {
    const amazonBaseUrl = "https://www.amazon.com/s";
    const amazonTrackingTag = "growthshuttle-20";
    const newAuthorItems: Author[] = [];
    data.authors.forEach((fetchedAuthorEntry) => { // fetchedAuthorEntry has .quotes array
      fetchedAuthorEntry.quotes.forEach((quoteText, quoteIndex) => {
        newAuthorItems.push({
          id: `author-${fetchedAuthorEntry.name.replace(/\s+/g, '-')}-quote-${quoteIndex}-${Date.now()}`,
          name: fetchedAuthorEntry.name,
          titleOrKnownFor: fetchedAuthorEntry.titleOrKnownFor,
          quote: quoteText, // Single quote
          quoteSource: fetchedAuthorEntry.source,
          selected: false, 
          amazonLink: `${amazonBaseUrl}?k=${encodeURIComponent(fetchedAuthorEntry.source)}&tag=${amazonTrackingTag}`,
          authorNameKey: fetchedAuthorEntry.name, // For grouping/filtering
        });
      });
    });
    setAuthors(newAuthorItems);
    setSelectedAuthorFilter("all"); 
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

  const callAiAction = async <TInput, TOutput>(
    action: (input: TInput) => Promise<TOutput>,
    input: TInput,
    onSuccess: (output: TOutput) => void
  ) => {
    setIsGenerating(true);
    try {
      const result = await action(input);
      onSuccess(result);
    } catch (error) {
      console.error("Global AI Action Error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const uniqueAuthorNamesForFilter = useMemo(() => {
    const names = new Set(authors.map(author => author.authorNameKey));
    return Array.from(names);
  }, [authors]);

  const filteredAuthors = useMemo(() => {
    if (selectedAuthorFilter === "all" || !selectedAuthorFilter) {
      return authors;
    }
    return authors.filter(author => author.authorNameKey === selectedAuthorFilter);
  }, [authors, selectedAuthorFilter]);


  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-primary">NewsLetterPro</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Craft compelling newsletters with AI-powered content generation.
        </p>
      </header>

      <Card className="p-6 shadow-xl">
        <CardHeader className="p-0 pb-2">
          <CardTitle>
            <Label htmlFor="globalTopic" className="text-lg font-semibold">
              Newsletter Topic
            </Label>
          </CardTitle>
          <CardDescription>
            Enter the main topic for your newsletter. This will be used to generate relevant content.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Input
            id="globalTopic"
            type="text"
            value={globalTopic}
            onChange={(e) => setGlobalTopic(e.target.value)}
            placeholder="e.g., Sustainable Living, AI in Healthcare, Future of Remote Work"
            className="mt-2 text-base"
          />
          {!globalTopic && <p className="text-sm text-destructive mt-1">Please enter a topic to enable content generation.</p>}
        </CardContent>
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
          action={(data) => callAiAction(getAuthorsAndQuotesAction, data, handleAuthorsData)}
          onDataReceived={() => {}} 
          ctaText="Find Authors"
          isDisabled={isGenerating || !globalTopic}
        />
        <AiSectionCard
          title="Fun Fact Generator"
          description="Generate engaging fun facts and insightful science facts related to your topic."
          icon={<Lightbulb size={24} />}
          formSchema={topicSchema}
          formFields={[]} 
          sharedTopic={globalTopic}
          topicFieldName="topic"
          action={(data) => callAiAction(generateFunFactsAction, data, handleFunFactsData)}
          onDataReceived={() => {}}
          ctaText="Generate Facts"
          isDisabled={isGenerating || !globalTopic}
        />
        <AiSectionCard
          title="Tool Recommender"
          description="Get suggestions for free and paid productivity tools relevant to your topic."
          icon={<Wrench size={24} />}
          formSchema={topicSchema}
          formFields={[]} 
          sharedTopic={globalTopic}
          topicFieldName="topic"
          action={(data) => callAiAction(recommendToolsAction, data, handleToolsData)}
          onDataReceived={() => {}}
          ctaText="Recommend Tools"
          isDisabled={isGenerating || !globalTopic}
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
          action={(data) => callAiAction(aggregateContentAction, data, handleAggregatedData)}
          onDataReceived={() => {}}
          ctaText="Aggregate Content"
          isDisabled={isGenerating || !globalTopic}
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
          <TabsTrigger value="aggregated" className="gap-1"><LinkIcon size={16}/> Aggregated</TabsTrigger>
        </TabsList>
        
        <TabsContent value="authors" className="p-0">
            {authors.length > 0 && (
              <div className="mb-4 flex items-center gap-2">
                <Filter size={16} className="text-muted-foreground" />
                <Label htmlFor="authorFilter" className="text-sm font-medium">Filter by Author:</Label>
                <Select value={selectedAuthorFilter} onValueChange={setSelectedAuthorFilter}>
                  <SelectTrigger id="authorFilter" className="w-[250px]">
                    <SelectValue placeholder="Select an author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Authors</SelectItem>
                    {uniqueAuthorNamesForFilter.map(name => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          <ScrollArea className="h-[500px] p-1 rounded-md border">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {filteredAuthors.length > 0 ? filteredAuthors.map((authorItem) => ( // authorItem is now single-quote Author
                <ContentItemCard
                  key={authorItem.id}
                  id={authorItem.id}
                  title={authorItem.name}
                  typeBadge="Author"
                  isSelected={authorItem.selected}
                  onToggleSelect={toggleItemSelection}
                  className="flex flex-col h-full"
                  content={
                    <div className="space-y-2 text-sm flex-grow flex flex-col">
                      <p className="font-medium text-muted-foreground">{authorItem.titleOrKnownFor}</p>
                      <blockquote className="pl-3 italic border-l-2 border-primary/40 text-foreground/90 text-xs flex-grow">
                          <p className="leading-snug">"{authorItem.quote}"</p>
                      </blockquote>
                      <p className="text-xs text-muted-foreground pt-2 mt-auto">
                         Source: <span className="font-semibold">{authorItem.quoteSource}</span>
                      </p>
                    </div>
                  }
                  amazonLink={authorItem.amazonLink}
                  itemData={authorItem}
                />
              )) : <p className="text-muted-foreground text-center col-span-full">{authors.length > 0 ? "No authors match the filter." : "No authors generated yet. Enter a topic and click \"Find Authors\"."}</p>}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="facts" className="p-0">
          <ScrollArea className="h-[500px] p-1 rounded-md border">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {funFacts.length > 0 ? funFacts.map((fact) => (
                <ContentItemCard
                  key={fact.id}
                  id={fact.id}
                  content={fact.text}
                  typeBadge={fact.type === "fun" ? "Fun Fact" : "Science Fact"}
                  isSelected={fact.selected}
                  onToggleSelect={toggleItemSelection}
                  className="flex flex-col h-full"
                />
              )) : <p className="text-muted-foreground text-center col-span-full">No facts generated yet. Enter a topic and click "Generate Facts".</p>}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="tools" className="p-0">
         <ScrollArea className="h-[500px] p-1 rounded-md border">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
              {tools.length > 0 ? tools.map((tool) => (
                <ContentItemCard
                  key={tool.id}
                  id={tool.id}
                  title={tool.name}
                  typeBadge={tool.type === "free" ? "Free Tool" : "Paid Tool"}
                  isSelected={tool.selected}
                  onToggleSelect={toggleItemSelection}
                  content="" 
                  className="flex flex-col h-full"
                />
              )) : <p className="text-muted-foreground text-center col-span-full">No tools recommended yet. Enter a topic and click "Recommend Tools".</p>}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="aggregated" className="p-0">
          <ScrollArea className="h-[500px] p-1 rounded-md border">
            <div className="space-y-4 p-4">
              {aggregatedContent.length > 0 ? aggregatedContent.map((item) => (
                <ContentItemCard
                  key={item.id}
                  id={item.id}
                  content={item.text}
                  typeBadge="Aggregated Content"
                  isSelected={item.selected}
                  onToggleSelect={toggleItemSelection}
                  className="flex flex-col h-full"
                />
              )) : <p className="text-muted-foreground text-center">No content aggregated yet. Enter URLs and a topic, then click "Aggregate Content".</p>}
            </div>
          </ScrollArea>
        </TabsContent>
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
