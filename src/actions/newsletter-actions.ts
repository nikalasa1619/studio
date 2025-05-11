"use server";

import { 
  fetchAuthorsAndQuotes,
  type FetchAuthorsAndQuotesInput,
  type FetchAuthorsAndQuotesOutput
} from "@/ai/flows/fetch-authors-and-quotes";
import { 
  generateFunFacts,
  type GenerateFunFactsInput,
  type GenerateFunFactsOutput
} from "@/ai/flows/generate-fun-facts";
import { 
  recommendProductivityTools,
  type RecommendProductivityToolsInput,
  type RecommendProductivityToolsOutput
} from "@/ai/flows/recommend-productivity-tools";
import { 
  fetchNewsletters,
  type FetchNewslettersInput,
  type FetchNewslettersOutput
} from "@/ai/flows/fetch-newsletters";
import { 
  fetchPodcasts,
  type FetchPodcastsInput,
  type FetchPodcastsOutput
} from "@/ai/flows/fetch-podcasts";
import {
  generateNewsletterStyles,
  type GenerateNewsletterStylesInput,
  type GenerateNewsletterStylesOutput,
} from "@/ai/flows/generate-newsletter-styles-flow";

const handleApiKeyError = (error: any, defaultMessage: string): string => {
  let errorMessage = defaultMessage;
  if (error.message && error.message.includes("API key not valid")) {
    errorMessage = "API Key Error: The GEMINI_API_KEY provided to Google is not valid. Please verify the key in your .env file, ensure it's enabled for the Gemini API in Google Cloud Console, and has correct permissions. Original Google Error: " + error.message;
  } else if (error.message) {
    errorMessage += " Details: " + error.message;
  }
  return errorMessage;
};

export async function getAuthorsAndQuotesAction(
  input: FetchAuthorsAndQuotesInput
): Promise<FetchAuthorsAndQuotesOutput> {
  try {
    const result = await fetchAuthorsAndQuotes(input);
    return result;
  } catch (error: any) {
    console.error("Error in getAuthorsAndQuotesAction:", error);
    throw new Error(handleApiKeyError(error, "Failed to fetch authors and quotes."));
  }
}

export async function generateFunFactsAction(
  input: GenerateFunFactsInput
): Promise<GenerateFunFactsOutput> {
  try {
    const result = await generateFunFacts(input);
    return result;
  } catch (error: any) {
    console.error("Error in generateFunFactsAction:", error);
    throw new Error(handleApiKeyError(error, "Failed to generate fun facts."));
  }
}

export async function recommendToolsAction(
  input: RecommendProductivityToolsInput
): Promise<RecommendProductivityToolsOutput> {
  try {
    const result = await recommendProductivityTools(input);
    return result;
  } catch (error: any) {
    console.error("Error in recommendToolsAction:", error);
    throw new Error(handleApiKeyError(error, "Failed to recommend tools."));
  }
}

export async function fetchNewslettersAction(
  input: FetchNewslettersInput
): Promise<FetchNewslettersOutput> {
  try {
    const result = await fetchNewsletters(input);
    return result;
  } catch (error: any) {
    console.error("Error in fetchNewslettersAction:", error);
    throw new Error(handleApiKeyError(error, "Failed to fetch newsletters."));
  }
}

export async function fetchPodcastsAction(
  input: FetchPodcastsInput
): Promise<FetchPodcastsOutput> {
  try {
    const result = await fetchPodcasts(input);
    return result;
  } catch (error: any) {
    console.error("Error in fetchPodcastsAction:", error);
    throw new Error(handleApiKeyError(error, "Failed to fetch podcasts."));
  }
}

export async function generateStylesFromChatAction(
  input: GenerateNewsletterStylesInput
): Promise<GenerateNewsletterStylesOutput> {
  try {
    const result = await generateNewsletterStyles(input);
    return result;
  } catch (error: any) {
    console.error("Error in generateStylesFromChatAction:", error);
    throw new Error(handleApiKeyError(error, "Failed to generate styles from chat description."));
  }
}
