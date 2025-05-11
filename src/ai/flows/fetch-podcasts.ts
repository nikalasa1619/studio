'use server';
/**
 * @fileOverview Fetches podcasts relevant to a specific topic.
 *
 * - fetchPodcasts - A function that fetches podcast information.
 * - FetchPodcastsInput - The input type for the fetchPodcasts function.
 * - FetchPodcastsOutput - The return type for the fetchPodcasts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FetchPodcastsInputSchema = z.object({
  topic: z.string().describe('The topic for which to find podcasts.'),
});
export type FetchPodcastsInput = z.infer<typeof FetchPodcastsInputSchema>;

const PodcastItemSchema = z.object({
  name: z.string().describe('The name of the podcast series.'),
  episodeTitle: z.string().describe('The title of a relevant episode. Can be a general recommendation if a specific episode is not paramount.'),
  podcastLink: z.string().describe('A direct link to listen to the podcast episode or the main podcast show page. This must be a valid URL string e.g. https://example.com/podcast.'),
  description: z.string().describe('A brief summary of the podcast or specific episode and its relevance to the topic (1-2 sentences).'),
  relevanceScore: z
    .number()
    .min(0.1)
    .max(99.9)
    .describe('A relevance score for the podcast/episode from 0.1 to 99.9, indicating how relevant it is to the topic.'),
});
export type PodcastItem = z.infer<typeof PodcastItemSchema>;


const FetchPodcastsOutputSchema = z.object({
  podcasts: z
    .array(PodcastItemSchema)
    .min(3)
    .max(5)
    .describe('A list of 3-5 relevant podcast episodes or series with their details and relevance scores.'),
});
export type FetchPodcastsOutput = z.infer<typeof FetchPodcastsOutputSchema>;

export async function fetchPodcasts(input: FetchPodcastsInput): Promise<FetchPodcastsOutput> {
  return fetchPodcastsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fetchPodcastsPrompt',
  input: {schema: FetchPodcastsInputSchema},
  output: {schema: FetchPodcastsOutputSchema},
  prompt: `You are an expert podcast curator.
Based on the topic "{{topic}}", find 5 relevant podcast episodes or series.
For each podcast, provide:
1. Podcast Name (Series Name)
2. Episode Title (A specific relevant episode title is preferred. If not applicable, state "General Recommendation")
3. Podcast Link (A direct URL to the episode if possible, otherwise to the main podcast page. Must be a valid URL string starting with http or https.)
4. A brief Description (1-2 sentences explaining the podcast or specific episode's relevance to the topic.)
5. A relevanceScore (a number from 0.1 to 99.9) indicating how relevant the podcast/episode is to the topic.

Ensure the output strictly follows the defined schema.
The 'podcasts' field should be an array of up to 5 such podcast objects.
If you cannot find 5, provide as many as you can find (minimum 3).
Focus on well-known and high-quality podcasts.
`,
});

const fetchPodcastsFlow = ai.defineFlow(
  {
    name: 'fetchPodcastsFlow',
    inputSchema: FetchPodcastsInputSchema,
    outputSchema: FetchPodcastsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

