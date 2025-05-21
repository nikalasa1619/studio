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
import {
  generateNewsletterStyles,
  type GenerateNewsletterStylesInput,
  type GenerateNewsletterStylesOutput,
} from "@/ai/flows/generate-newsletter-styles-flow";
import {
  generateQuoteNewsletterFormat,
  type GenerateQuoteNewsletterFormatInput,
  type GenerateQuoteNewsletterFormatOutput,
} from "@/ai/flows/generate-quote-newsletter-format-flow";
import {
  generateNewsletterHeader,
  type GenerateNewsletterHeaderInput,
  type GenerateNewsletterHeaderOutput,
} from "@/ai/flows/generate-newsletter-header-flow";


const handleApiKeyError = (error: any, defaultMessage: string, contentType?: string): string => {
  let detailedErrorMessage = `${contentType ? `[${contentType}] ` : ''}${defaultMessage}`;
  const consoleErrorPrefix = contentType ? `[${contentType} Action Error]` : "[Action Error]";

  // Check if GEMINI_API_KEY is missing in environment variables
  if (typeof process !== 'undefined' && !process.env.GEMINI_API_KEY) {
    detailedErrorMessage = `${contentType ? `[${contentType}] ` : ''}Configuration Error: The GEMINI_API_KEY is not set in your .env file. Please add it, ensure it's correctly loaded, rebuild (if necessary), and restart the development server. This key is required for AI features to function.`;
    console.error(`${consoleErrorPrefix} Critical: GEMINI_API_KEY is missing from server environment variables.`);
  }
  // Check for common API key validity messages from Google
  else if (error.message && (error.message.includes("API key not valid") || error.message.includes("API_KEY_INVALID") || error.message.includes("permission_denied") || error.message.includes("PERMISSION_DENIED"))) {
    detailedErrorMessage = `${contentType ? `[${contentType}] ` : ''}API Key Error: The GEMINI_API_KEY provided to Google is not valid or is missing permissions. Please verify the key in your .env file, ensure it's enabled for the Gemini API in Google Cloud Console, and has the correct permissions. If you've recently changed your .env file, remember to restart your development server. Original Google Error: ${error.message}`;
    console.error(`${consoleErrorPrefix} Invalid API Key or insufficient permissions reported by Google:`, error.message);
  }
  // General error message handling
  else if (error.message) {
    detailedErrorMessage = `${defaultMessage} Details: ${error.message}`;
    console.error(`${consoleErrorPrefix} - ${defaultMessage}: Message: ${error.message}`, error.stack);
  } else if (typeof error === 'string') {
    detailedErrorMessage = `${defaultMessage} Details: ${error}`;
    console.error(`${consoleErrorPrefix} - ${defaultMessage}: Received string error:`, error);
  } else {
    detailedErrorMessage = `${defaultMessage} An unexpected error occurred. Check server logs for more details.`;
    console.error(`${consoleErrorPrefix} - ${defaultMessage}: Unknown error structure:`, error);
  }
  
  return detailedErrorMessage;
};

export async function getAuthorsAndQuotesAction(
  input: FetchAuthorsAndQuotesInput
): Promise<FetchAuthorsAndQuotesOutput> {
  try {
    const result = await fetchAuthorsAndQuotes(input);
    return result;
  } catch (error: any) {
    const errorMessage = handleApiKeyError(error, "Failed to fetch authors and quotes.", "Authors & Quotes");
    console.error("[getAuthorsAndQuotesAction] Error to be thrown to client:", errorMessage);
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
    const errorMessage = handleApiKeyError(error, "Failed to generate fun facts.", "Fun Facts");
    console.error("[generateFunFactsAction] Error to be thrown to client:", errorMessage);
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
    const errorMessage = handleApiKeyError(error, "Failed to recommend tools.", "Productivity Tools");
    console.error("[recommendToolsAction] Error to be thrown to client:", errorMessage);
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
    const errorMessage = handleApiKeyError(error, "Failed to fetch newsletters.", "Newsletters");
    console.error("[fetchNewslettersAction] Error to be thrown to client:", errorMessage);
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
    const errorMessage = handleApiKeyError(error, "Failed to fetch podcasts.", "Podcasts");
    console.error("[fetchPodcastsAction] Error to be thrown to client:", errorMessage);
    throw new Error(errorMessage);
  }
}

export async function generateStylesFromChatAction(
  input: GenerateNewsletterStylesInput
): Promise<GenerateNewsletterStylesOutput> {
  try {
    const result = await generateNewsletterStyles(input);
    return result;
  } catch (error: any) {
    const errorMessage = handleApiKeyError(error, "Failed to generate styles from chat description.", "Newsletter Styles");
    console.error("[generateStylesFromChatAction] Error to be thrown to client:", errorMessage);
    throw new Error(errorMessage);
  }
}

export async function generateQuoteNewsletterFormatAction(
  input: GenerateQuoteNewsletterFormatInput
): Promise<GenerateQuoteNewsletterFormatOutput> {
  try {
    const result = await generateQuoteNewsletterFormat(input);
    return result;
  } catch (error: any) {
    const errorMessage = handleApiKeyError(error, "Failed to format quote for newsletter.", "Quote Formatting");
    console.error("[generateQuoteNewsletterFormatAction] Error to be thrown to client:", errorMessage);
    throw new Error(errorMessage);
  }
}

export async function generateNewsletterHeaderAction(
  input: GenerateNewsletterHeaderInput
): Promise<GenerateNewsletterHeaderOutput> {
  try {
    const result = await generateNewsletterHeader(input);
    return result;
  } catch (error: any) {
    const errorMessage = handleApiKeyError(error, "Failed to generate newsletter header.", "Newsletter Header");
    console.error("[generateNewsletterHeaderAction] Error to be thrown to client:", errorMessage);
    throw new Error(errorMessage);
  }
}
