
// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview Fetches authors and quotes based on a given topic.
 *
 * - fetchAuthorsAndQuotes - A function that fetches authors and quotes.
 * - FetchAuthorsAndQuotesInput - The input type for the fetchAuthorsAndQuotes function.
 * - FetchAuthorsAndQuotesOutput - The return type for the fetchAuthorsAndQuotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FetchAuthorsAndQuotesInputSchema = z.object({
  topic: z.string().describe('The topic to find authors and quotes for.'),
});
export type FetchAuthorsAndQuotesInput = z.infer<typeof FetchAuthorsAndQuotesInputSchema>;

const AuthorQuoteSchema = z.object({
  quote: z.string().max(280).describe('An impactful quote (ideally around 120 characters, max 280) from the author related to the topic.'),
  relevanceScore: z
    .number()
    .min(0.1)
    .max(99.9)
    .describe('A relevance score for the quote from 0.1 to 99.9, indicating how relevant the quote is to the topic.'),
  quoteCardHeadline: z
    .string()
    .max(60)
    .describe('A short, intriguing headline for this specific quote, in sentence case, max 60 characters. This is for display on an initial content card.'),
  publicationYear: z.string().optional().describe("The publication year of the source book/article."),
  pageNumber: z.string().optional().describe("The page number(s) from which the quote is sourced, if applicable/findable."),
  contextSentence: z.string().optional().describe("A brief sentence providing context for the quote (e.g., 'In Chapter 3, the author argues...')."),
  themeTags: z.array(z.string()).optional().describe("A list of 2-3 relevant theme tags for the quote (e.g., ['Flow', 'Peak Performance', 'Motivation']). Max 3 tags."),
});

const AuthorSchema = z.object({
  name: z.string().describe('The name of the author.'),
  titleOrKnownFor: z
    .string()
    .describe(
      "The author's title or what they are primarily known for (e.g., 'Economist', 'Author of Sapiens')."
    ),
  quotes: z
    .array(AuthorQuoteSchema)
    .min(5)
    .max(5)
    .describe('Five impactful quotes from the author related to the topic, each with a relevance score, quoteCardHeadline, and other requested metadata. All five quotes must come from the same book.'),
  source: z
    .string()
    .describe(
      'The book title or publication from which all five quotes are sourced.'
    ),
});

const FetchAuthorsAndQuotesOutputSchema = z.object({
  authors: z
    .array(AuthorSchema)
    .min(4)
    .max(4)
    .describe(
      'A list of exactly 4 relevant authors, their titles/known for, five quotes each (with relevance scores, quoteCardHeadlines, publication year, page number, context sentence, theme tags) from a single book, and the book source.'
    ),
});
export type FetchAuthorsAndQuotesOutput = z.infer<typeof FetchAuthorsAndQuotesOutputSchema>;

export async function fetchAuthorsAndQuotes(input: FetchAuthorsAndQuotesInput): Promise<FetchAuthorsAndQuotesOutput> {
  return fetchAuthorsAndQuotesFlow(input);
}

const fetchAuthorsAndQuotesPrompt = ai.definePrompt({
  name: 'fetchAuthorsAndQuotesPrompt',
  input: {schema: FetchAuthorsAndQuotesInputSchema},
  output: {schema: FetchAuthorsAndQuotesOutputSchema},
  prompt: `You are an expert curator of thought leadership quotes.
Based on the topic "{{{topic}}}" provided by the user, provide a list of exactly 4 well-known authors who have written about this topic.
For each author, include:
1. Author name
2. Author title or what they are primarily known for (e.g., 'Economist', 'Author of Sapiens').
3. Exactly five impactful quotes from the author related to the topic.
   - For each quote:
     - Provide the 'quote' text, enclosed in quotation marks. Aim for quotes around 120 characters, but ensure they are impactful, max 280 characters.
     - Provide a 'relevanceScore' (a number from 0.1 to 99.9) indicating how relevant the quote is to the topic.
     - Provide a 'quoteCardHeadline' (a short, intriguing headline for this specific quote, in sentence case, max 60 characters).
     - Provide the 'publicationYear' of the source.
     - Provide the 'pageNumber' from the source, if applicable and findable.
     - Provide a 'contextSentence' (e.g., "In the introduction, the author discusses...").
     - Provide 'themeTags' (an array of 2-3 short keywords, e.g., ["Leadership", "Innovation"]).
   - All five quotes for an author MUST come from the SAME book or publication.
4. The source of the quotes (book title or publication).

Ensure the output strictly follows the defined schema, providing exactly 4 authors and 5 quotes per author with all requested metadata for each quote.
Example for one quote object: { "quote": "This is a quote.", "relevanceScore": 85.5, "quoteCardHeadline": "A headline for this quote.", "publicationYear": "2021", "pageNumber": "42", "contextSentence": "Discussing the core idea, the author states...", "themeTags": ["Focus", "Productivity"] }
The 'quotes' field should be an array of such objects.
`,
});

const fetchAuthorsAndQuotesFlow = ai.defineFlow(
  {
    name: 'fetchAuthorsAndQuotesFlow',
    inputSchema: FetchAuthorsAndQuotesInputSchema,
    outputSchema: FetchAuthorsAndQuotesOutputSchema,
  },
  async input => {
    const llmResponse = await fetchAuthorsAndQuotesPrompt(input);
    if (!llmResponse.output) {
        console.error("FetchAuthorsAndQuotesFlow: LLM output was null or undefined.");
        throw new Error("The AI model did not return the expected output for authors and quotes.");
    }
    return llmResponse.output;
  }
);

