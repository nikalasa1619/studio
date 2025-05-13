'use server';
/**
 * @fileOverview Reformats an author's quote for newsletter presentation.
 *
 * - generateQuoteNewsletterFormat - A function that reformats a quote.
 * - GenerateQuoteNewsletterFormatInput - The input type for the function.
 * - GenerateQuoteNewsletterFormatOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateQuoteNewsletterFormatInputSchema = z.object({
  authorName: z.string().describe("The name of the author."),
  authorTitleOrKnownFor: z.string().describe("The author's title or what they are primarily known for."),
  quote: z.string().describe("The original quote text."),
  quoteSourceBookTitle: z.string().describe("The title of the book from which the quote is sourced."),
  originalTopic: z.string().describe("The original newsletter topic for context."),
  newsletterDescription: z.string().optional().describe("The overall description of the newsletter for context."),
  targetAudience: z.string().optional().describe("The target audience of the newsletter for context."),
});
export type GenerateQuoteNewsletterFormatInput = z.infer<typeof GenerateQuoteNewsletterFormatInputSchema>;

// Schema for the LLM's direct output
const LLMGenerateQuoteFormatOutputSchema = z.object({
    headline: z.string().describe("A short, intriguing headline (1 line, max 10 words) that captures the essence or an interesting take on the quote's message, relevant to the original newsletter topic and overall newsletter context."),
    introductoryCopy: z.string().describe("Introductory copy following the framework: '[Short Author Title - under 5 words], [Author Name], on [Main Theme of the Quote - under 5 words]'. The theme should be relevant to the original topic and overall newsletter context."),
});

// Schema for the Flow's final output
const GenerateQuoteNewsletterFormatOutputSchema = z.object({
  headline: z.string(),
  introductoryCopy: z.string(),
  formattedQuote: z.string().describe("The original quote, enclosed in quotation marks."),
  bookTitle: z.string().describe("The original book title."),
  goodreadsLink: z.string().url().describe("A Goodreads search URL for the book."),
});
export type GenerateQuoteNewsletterFormatOutput = z.infer<typeof GenerateQuoteNewsletterFormatOutputSchema>;

export async function generateQuoteNewsletterFormat(input: GenerateQuoteNewsletterFormatInput): Promise<GenerateQuoteNewsletterFormatOutput> {
  const llmResponse = await generateQuoteNewsletterFormatFlow(input);

  let finalQuote = input.quote.trim();
  // Remove any existing surrounding quotes (single or double, potentially multiple layers)
  // and ensure the string doesn't become empty or just whitespace after stripping.
  while (finalQuote.length > 0 && ((finalQuote.startsWith('"') && finalQuote.endsWith('"')) || (finalQuote.startsWith("'") && finalQuote.endsWith("'")))) {
    if (finalQuote.length <= 2) { // Avoid issues with "''" or '""' becoming empty
      finalQuote = ""; // Or handle as an error/empty quote
      break;
    }
    finalQuote = finalQuote.substring(1, finalQuote.length - 1).trim(); // Trim again after stripping
  }
  // Ensure it's enclosed in a single pair of double quotes if not empty
  finalQuote = finalQuote ? `"${finalQuote}"` : "";


  return {
    headline: llmResponse.headline,
    introductoryCopy: llmResponse.introductoryCopy,
    formattedQuote: finalQuote,
    bookTitle: input.quoteSourceBookTitle,
    goodreadsLink: `https://www.goodreads.com/search?q=${encodeURIComponent(input.quoteSourceBookTitle)}`
  };
}

const generateQuoteNewsletterFormatPrompt = ai.definePrompt({
  name: 'generateQuoteNewsletterFormatPrompt',
  input: { schema: GenerateQuoteNewsletterFormatInputSchema },
  output: { schema: LLMGenerateQuoteFormatOutputSchema }, // LLM outputs headline and intro
  prompt: `You are an expert newsletter editor specializing in crafting compelling presentations for quotes.
Given the author's details, a quote, the book it's from, the original newsletter topic, and optionally a general newsletter description and target audience, your task is to:

1.  **Generate a Headline:** A short, intriguing headline (1 line, max 10 words). This headline should capture the essence or an interesting take on the quote's message. It must be relevant to the original newsletter topic: "{{originalTopic}}" and consider the broader context if provided.
2.  **Generate Introductory Copy:** Follow this strict framework:
    "[Short Author Title - under 5 words, derived from '{{authorTitleOrKnownFor}}'], [{{authorName}}], on [Main Theme of the Quote - under 5 words, derived from the '{{quote}}' and relevant to '{{originalTopic}}' and overall newsletter context]."
    Example if authorTitleOrKnownFor is "Organizational psychologist and bestselling author" and authorName is "Adam M. Grant" and quote is about challenge: "Organizational psychologist, Adam M. Grant, on the value of challenge."
    Example if authorTitleOrKnownFor is "Marketing Expert" and authorName is "Seth Godin" and quote is about marketing: "Marketing Expert, Seth Godin, on remarkable products."

Contextual Information (use if provided):
{{#if newsletterDescription}}
Newsletter Description: {{newsletterDescription}}
{{/if}}
{{#if targetAudience}}
Target Audience: {{targetAudience}}
{{/if}}

Inputs for this specific quote:
Author Name: {{authorName}}
Author Title/Known For: {{authorTitleOrKnownFor}}
Quote: "{{quote}}"
Quote Source Book Title: {{quoteSourceBookTitle}}
Original Newsletter Topic: {{originalTopic}}

Please provide ONLY the headline and introductoryCopy in the specified JSON format.
Constraints:
- Headline: Max 10 words.
- Author Title in Intro: Max 5 words (use the most impactful part of 'authorTitleOrKnownFor').
- Main Theme in Intro: Max 5 words.
`,
});

const generateQuoteNewsletterFormatFlow = ai.defineFlow(
  {
    name: 'generateQuoteNewsletterFormatFlow',
    inputSchema: GenerateQuoteNewsletterFormatInputSchema,
    outputSchema: LLMGenerateQuoteFormatOutputSchema, // Flow outputs what LLM produces
  },
  async (input: GenerateQuoteNewsletterFormatInput) => {
    const llmResponse = await generateQuoteNewsletterFormatPrompt(input);
    if (!llmResponse.output) {
        console.error("GenerateQuoteNewsletterFormatFlow: LLM output was null or undefined.");
        throw new Error("The AI model did not return the expected output for quote formatting.");
    }
    return llmResponse.output;
  }
);
