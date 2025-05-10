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

const AuthorSchema = z.object({
  name: z.string().describe('The name of the author.'),
  titleOrKnownFor: z
    .string()
    .describe(
      "The author's title or what they are primarily known for (e.g., 'Economist', 'Author of Sapiens')."
    ),
  quote: z
    .string()
    .describe('An impactful quote from the author related to the topic.'),
  source: z
    .string()
    .describe(
      'The book title or publication from which the quote is sourced.'
    ),
});

const FetchAuthorsAndQuotesOutputSchema = z.object({
  authors: z
    .array(AuthorSchema)
    .min(3)
    .max(5)
    .describe(
      'A list of 3-5 relevant authors, their titles/known for, one quote each, and quote sources.'
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
Based on the topic "{{{topic}}}" provided by the user, provide a list of 3-5 well-known authors who have written about this topic.
For each author, include:
1. Author name
2. Author title or what they are primarily known for (e.g., 'Economist', 'Author of Sapiens').
3. One impactful quote from the author related to the topic, enclosed in quotation marks.
4. The source of the quote (book title or publication).

Ensure the output strictly follows the defined schema.
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
