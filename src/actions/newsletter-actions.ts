"use server";

import {
  fetchAuthorsAndQuotes,
  type FetchAuthorsAndQuotesInput,
  type FetchAuthorsAndQuotesOutput,
} from "@/ai/flows/fetch-authors-and-quotes";
import {
  generateFunFacts,
  type GenerateFunFactsInput,
  type GenerateFunFactsOutput,
} from "@/ai/flows/generate-fun-facts";
import {
  recommendProductivityTools,
  type RecommendProductivityToolsInput,
  type RecommendProductivityToolsOutput,
} from "@/ai/flows/recommend-productivity-tools";
import {
  aggregateContent,
  type AggregateContentInput,
  type AggregateContentOutput,
} from "@/ai/flows/aggregate-content";

export async function getAuthorsAndQuotesAction(
  input: FetchAuthorsAndQuotesInput
): Promise<FetchAuthorsAndQuotesOutput> {
  try {
    return await fetchAuthorsAndQuotes(input);
  } catch (error) {
    console.error("Error in getAuthorsAndQuotesAction:", error);
    throw new Error("Failed to fetch authors and quotes.");
  }
}

export async function generateFunFactsAction(
  input: GenerateFunFactsInput
): Promise<GenerateFunFactsOutput> {
   try {
    return await generateFunFacts(input);
  } catch (error)
  {
    console.error("Error in generateFunFactsAction:", error);
    throw new Error("Failed to generate fun facts.");
  }
}

export async function recommendToolsAction(
  input: RecommendProductivityToolsInput
): Promise<RecommendProductivityToolsOutput> {
   try {
    return await recommendProductivityTools(input);
  } catch (error) {
    console.error("Error in recommendToolsAction:", error);
    throw new Error("Failed to recommend tools.");
  }
}

export async function aggregateContentAction(
  input: AggregateContentInput
): Promise<AggregateContentOutput> {
   try {
    return await aggregateContent(input);
  } catch (error) {
    console.error("Error in aggregateContentAction:", error);
    throw new Error("Failed to aggregate content.");
  }
}
