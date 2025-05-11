// src/actions/newsletter-actions.ts
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

export async function getAuthorsAndQuotesAction(
  input: FetchAuthorsAndQuotesInput
): Promise<FetchAuthorsAndQuotesOutput> {
  try {
    const result = await fetchAuthorsAndQuotes(input);
    return result;
  } catch (error: any) {
    console.error("Error in getAuthorsAndQuotesAction:", error);
    // Construct a more informative error message
    let errorMessage = "Failed to fetch authors and quotes.";
    if (error.message && error.message.includes("API key not valid")) {
        errorMessage = "API Key Error: The GEMINI_API_KEY provided to Google is not valid. Please verify the key in your .env file, ensure it's enabled for the Gemini API in Google Cloud Console, and has correct permissions. Original Google Error: " + error.message;
    } else if (error.message) {
        errorMessage += " Details: " + error.message;
    }
    throw new Error(errorMessage);
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
    let errorMessage = "Failed to generate fun facts.";
     if (error.message && error.message.includes("API key not valid")) {
        errorMessage = "API Key Error: The GEMINI_API_KEY provided to Google is not valid. Please verify the key in your .env file, ensure it's enabled for the Gemini API in Google Cloud Console, and has correct permissions. Original Google Error: " + error.message;
    } else if (error.message) {
        errorMessage += " Details: " + error.message;
    }
    throw new Error(errorMessage);
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
    let errorMessage = "Failed to recommend tools.";
     if (error.message && error.message.includes("API key not valid")) {
        errorMessage = "API Key Error: The GEMINI_API_KEY provided to Google is not valid. Please verify the key in your .env file, ensure it's enabled for the Gemini API in Google Cloud Console, and has correct permissions. Original Google Error: " + error.message;
    } else if (error.message) {
        errorMessage += " Details: " + error.message;
    }
    throw new Error(errorMessage);
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
    let errorMessage = "Failed to fetch newsletters.";
    if (error.message && error.message.includes("API key not valid")) {
        errorMessage = "API Key Error: The GEMINI_API_KEY provided to Google is not valid. Please verify the key in your .env file, ensure it's enabled for the Gemini API in Google Cloud Console, and has correct permissions. Original Google Error: " + error.message;
    } else if (error.message) {
        errorMessage += " Details: " + error.message;
    }
    throw new Error(errorMessage);
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
    let errorMessage = "Failed to fetch podcasts.";
    if (error.message && error.message.includes("API key not valid")) {
        errorMessage = "API Key Error: The GEMINI_API_KEY provided to Google is not valid. Please verify the key in your .env file, ensure it's enabled for the Gemini API in Google Cloud Console, and has correct permissions. Original Google Error: " + error.message;
    } else if (error.message) {
        errorMessage += " Details: " + error.message;
    }
    throw new Error(errorMessage);
  }
}
