// use server'

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
  quotes: z.array(z.string()).describe('A list of impactful quotes from the author\s books.'),
});

const FetchAuthorsAndQuotesOutputSchema = z.object({
  authors: z.array(AuthorSchema).describe('A list of relevant authors and their quotes.'),
});
export type FetchAuthorsAndQuotesOutput = z.infer<typeof FetchAuthorsAndQuotesOutputSchema>;

export async function fetchAuthorsAndQuotes(input: FetchAuthorsAndQuotesInput): Promise<FetchAuthorsAndQuotesOutput> {
  return fetchAuthorsAndQuotesFlow(input);
}

const fetchAuthorsAndQuotesPrompt = ai.definePrompt({
  name: 'fetchAuthorsAndQuotesPrompt',
  input: {schema: FetchAuthorsAndQuotesInputSchema},
  output: {schema: FetchAuthorsAndQuotesOutputSchema},
  prompt: `You are an expert in identifying authors and their impactful quotes.
  Based on the topic provided by the user, you will identify five relevant authors who published books on the specified topic after 2010.
  Scrape Goodreads to extract three impactful quotes from each author's book.

  Topic: {{{topic}}}
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
