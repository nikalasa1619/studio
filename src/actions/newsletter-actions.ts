// src/actions/newsletter-actions.ts
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

function checkApiKey() {
  if (!process.env.GEMINI_API_KEY) {
    const errorMessage = "GEMINI_API_KEY is not set in the server environment. Please configure it in your .env file to use AI features.";
    console.error(errorMessage);
    throw new Error(errorMessage); // This specific message will be caught by handleActionError
  }
}

// Generic error handler for actions
function handleActionError(error: unknown, actionDisplayName: string): never {
    console.error(`Error in ${actionDisplayName} generation:`, error);
    if (error instanceof Error) {
        // Case 1: GEMINI_API_KEY environment variable is not set at all (caught by checkApiKey)
        if (error.message.includes("GEMINI_API_KEY is not set")) {
             throw new Error("Configuration Error: The GEMINI_API_KEY is not set in your server environment. Please add it to your .env file and restart the server.");
        }
        // Case 2: GEMINI_API_KEY is set, but Google API says it's invalid
        if (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID")) {
            throw new Error("API Key Error: The GEMINI_API_KEY provided to Google is not valid. Please verify the key in your .env file, ensure it's enabled for the Gemini API in Google Cloud Console, and has correct permissions.");
        }
        // Case 3: Other errors from the AI service or network issues
        throw new Error(`Failed to generate ${actionDisplayName.toLowerCase()}. Original error: ${error.message}`);
    }
    // Fallback for non-Error objects
    throw new Error(`Failed to generate ${actionDisplayName.toLowerCase()} due to an unknown error.`);
}


export async function getAuthorsAndQuotesAction(
  input: FetchAuthorsAndQuotesInput
): Promise<FetchAuthorsAndQuotesOutput> {
  try {
    checkApiKey();
    return await fetchAuthorsAndQuotes(input);
  } catch (error) {
    handleActionError(error, "Authors & Quotes");
  }
}

export async function generateFunFactsAction(
  input: GenerateFunFactsInput
): Promise<GenerateFunFactsOutput> {
   try {
    checkApiKey();
    return await generateFunFacts(input);
  } catch (error) {
    handleActionError(error, "Fun Facts");
  }
}

export async function recommendToolsAction(
  input: RecommendProductivityToolsInput
): Promise<RecommendProductivityToolsOutput> {
   try {
    checkApiKey();
    return await recommendProductivityTools(input);
  } catch (error) {
    handleActionError(error, "Productivity Tools");
  }
}

export async function fetchNewslettersAction(
  input: FetchNewslettersInput
): Promise<FetchNewslettersOutput> {
   try {
    checkApiKey();
    return await fetchNewsletters(input);
  } catch (error) {
    handleActionError(error, "Newsletters");
  }
}

export async function fetchPodcastsAction(
  input: FetchPodcastsInput
): Promise<FetchPodcastsOutput> {
  try {
    checkApiKey();
    return await fetchPodcasts(input);
  } catch (error) {
    handleActionError(error, "Podcasts");
  }
}
