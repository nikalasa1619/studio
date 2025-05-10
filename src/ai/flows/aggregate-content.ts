'use server';

/**
 * @fileOverview A content aggregation AI agent.
 *
 * - aggregateContent - A function that handles the content aggregation process.
 * - AggregateContentInput - The input type for the aggregateContent function.
 * - AggregateContentOutput - The return type for the aggregateContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AggregateContentInputSchema = z.object({
  urls: z
    .array(z.string().url())
    .describe('An array of URLs to fetch content from.'),
  topic: z.string().describe('The main topic to filter the content for.'),
});
export type AggregateContentInput = z.infer<typeof AggregateContentInputSchema>;

const AggregateContentOutputSchema = z.object({
  extractedInformation: z
    .array(z.string())
    .describe('An array of extracted information from the URLs, filtered by the topic.'),
});
export type AggregateContentOutput = z.infer<typeof AggregateContentOutputSchema>;

export async function aggregateContent(input: AggregateContentInput): Promise<AggregateContentOutput> {
  return aggregateContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aggregateContentPrompt',
  input: {schema: AggregateContentInputSchema},
  output: {schema: AggregateContentOutputSchema},
  prompt: `You are an expert content aggregator, skilled at extracting relevant information from web pages based on a specific topic.

You will be provided with a list of URLs and a main topic. Your task is to visit each URL, extract the content, and filter it to only include information that is relevant to the specified topic.

URLs: {{#each urls}}{{{this}}} {{/each}}

Main Topic: {{{topic}}}

Extract information from each URL that is relevant to the main topic. Return the extracted information in an array of strings. Each element should contain the content extracted from a single URL.

Ensure the information is accurate, concise, and directly related to the main topic.
`,}
);

const aggregateContentFlow = ai.defineFlow(
  {
    name: 'aggregateContentFlow',
    inputSchema: AggregateContentInputSchema,
    outputSchema: AggregateContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
