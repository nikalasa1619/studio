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
  fetchNewsletters,
  type FetchNewslettersInput,
  type FetchNewslettersOutput,
} from "@/ai/flows/fetch-newsletters";
import {
  fetchPodcasts,
  type FetchPodcastsInput,
  type FetchPodcastsOutput,
} from "@/ai/flows/fetch-podcasts";

export async function getAuthorsAndQuotesAction(
  input: FetchAuthorsAndQuotesInput
): Promise<FetchAuthorsAndQuotesOutput> {
  try {
    return await fetchAuthorsAndQuotes(input);
  } catch (error) {
    console.error("Error in getAuthorsAndQuotesAction:", error);
    // It's better to throw the original error or a custom error with more context
    // For now, re-throwing a generic one as per existing pattern
    if (error instanceof Error) {
        throw new Error(`Failed to fetch authors and quotes: ${error.message}`);
    }
    throw new Error("Failed to fetch authors and quotes due to an unknown error.");
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
    if (error instanceof Error) {
        throw new Error(`Failed to generate fun facts: ${error.message}`);
    }
    throw new Error("Failed to generate fun facts due to an unknown error.");
  }
}

export async function recommendToolsAction(
  input: RecommendProductivityToolsInput
): Promise<RecommendProductivityToolsOutput> {
   try {
    return await recommendProductivityTools(input);
  } catch (error) {
    console.error("Error in recommendToolsAction:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to recommend tools: ${error.message}`);
    }
    throw new Error("Failed to recommend tools due to an unknown error.");
  }
}

export async function fetchNewslettersAction(
  input: FetchNewslettersInput
): Promise<FetchNewslettersOutput> {
   try {
    return await fetchNewsletters(input);
  } catch (error) {
    console.error("Error in fetchNewslettersAction:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch newsletters: ${error.message}`);
    }
    throw new Error("Failed to fetch newsletters due to an unknown error.");
  }
}

export async function fetchPodcastsAction(
  input: FetchPodcastsInput
): Promise<FetchPodcastsOutput> {
  try {
    return await fetchPodcasts(input);
  } catch (error) {
    console.error("Error in fetchPodcastsAction:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to fetch podcasts: ${error.message}`);
    }
    throw new Error("Failed to fetch podcasts due to an unknown error.");
  }
}