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
  quote: z.string().describe('An impactful quote from the author related to the topic.'),
  relevanceScore: z
    .number()
    .min(0.1)
    .max(99.9)
    .describe('A relevance score for the quote from 0.1 to 99.9, indicating how relevant the quote is to the topic.'),
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
    .describe('Five impactful quotes from the author related to the topic, each with a relevance score. All five quotes must come from the same book.'),
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
      'A list of exactly 4 relevant authors, their titles/known for, five quotes each (with relevance scores) from a single book, and the book source.'
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
3. Exactly five impactful quotes from the author related to the topic, enclosed in quotation marks.
   - For each quote, provide a relevanceScore (a number from 0.1 to 99.9) indicating how relevant the quote is to the topic.
   - All five quotes for an author MUST come from the SAME book or publication.
4. The source of the quotes (book title or publication).

Ensure the output strictly follows the defined schema, providing exactly 4 authors and 5 quotes per author.
Example for one quote object: { "quote": "This is a quote.", "relevanceScore": 85.5 }
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
    const {output} = await fetchAuthorsAndQuotesPrompt(input);
    return output!;
  }
);

