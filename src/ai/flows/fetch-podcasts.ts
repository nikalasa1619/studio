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
import { validateUrlTool, type ValidateUrlOutput } from '@/ai/tools/validate-url-tool';

const FetchPodcastsInputSchema = z.object({
  topic: z.string().describe('The topic for which to find podcasts.'),
});
export type FetchPodcastsInput = z.infer<typeof FetchPodcastsInputSchema>;

const PodcastItemSchema = z.object({
  name: z.string().describe('The name of the podcast series.'),
  episodeTitle: z.string().describe('The title of a relevant episode. Can be a general recommendation if a specific episode is not paramount.'),
  podcastLink: z.string().describe('A direct link to listen to the podcast episode or the main podcast show page. This must be a valid URL string e.g. https://example.com/podcast or a YouTube link. It is not a Zod URL type for schema validation purposes with the LLM, but will be validated by a tool.'),
  description: z.string().describe('A brief summary of the podcast or specific episode and its relevance to the topic (1-2 sentences).'),
  relevanceScore: z
    .number()
    .min(0.1)
    .max(99.9)
    .describe('A relevance score for the podcast/episode from 0.1 to 99.9, indicating how relevant it is to the topic.'),
  frequency: z.string().optional().describe('The typical release frequency of new episodes, e.g., "Weekly", "Monthly", "Bi-weekly".'),
  topics: z.array(z.string()).optional().describe('A list of 2-3 main topics typically covered by the podcast.'),
});
export type PodcastItem = z.infer<typeof PodcastItemSchema>;


// Schema for LLM's direct output - it should aim for 5.
const LLMFetchPodcastsOutputSchema = z.object({
  podcasts: z
    .array(PodcastItemSchema)
    .min(5) 
    .max(5)
    .describe('A list of 5 relevant podcast episodes or series with their details, relevance scores, frequency, and topics. Only includes podcasts with valid, working links. Prioritize YouTube links if available.'),
});

// Schema for the Flow's final output - can be less than 5 if validation fails for some.
const FlowFetchPodcastsOutputSchema = z.object({
  podcasts: z
    .array(PodcastItemSchema)
    .min(0) // Allow 0 items if all validations fail or LLM provides fewer valid items
    .max(5)
    .describe('A list of up to 5 relevant podcast episodes or series with their details, relevance scores, frequency, and topics. Only includes podcasts with valid, working links. Prioritize YouTube links if available.'),
});
export type FetchPodcastsOutput = z.infer<typeof FlowFetchPodcastsOutputSchema>;


export async function fetchPodcasts(input: FetchPodcastsInput): Promise<FetchPodcastsOutput> {
  return fetchPodcastsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fetchPodcastsPrompt',
  input: {schema: FetchPodcastsInputSchema},
  output: {schema: LLMFetchPodcastsOutputSchema}, // LLM aims for 5
  tools: [validateUrlTool],
  prompt: `You are an expert podcast curator.
Based on the topic "{{topic}}", find exactly 5 relevant podcast episodes or series.
For each podcast, provide:
1. Podcast Name (Series Name)
2. Episode Title (A specific relevant episode title is preferred. If not applicable, state "General Recommendation")
3. Podcast Link (A direct URL to the episode if possible, otherwise to the main podcast page. CRITICAL: Must be a complete and valid URL string starting with http or https. Prioritize well-known and stable websites, especially YouTube links if available and relevant for listening, that are unlikely to return a 404 error.)
4. A brief Description (1-2 sentences explaining the podcast or specific episode's relevance to the topic.)
5. A relevanceScore (a number from 0.1 to 99.9) indicating how relevant the podcast/episode is to the topic.
6. Frequency (e.g., "Weekly", "Monthly")
7. Topics (A list of 2-3 main topics, e.g., ["Tech Interviews", "Startup Stories"])

IMPORTANT: You MUST use the 'validateUrl' tool for EACH 'podcastLink' you generate to verify it is accessible and does not result in a 404 error or other client/server error. Only include podcasts in the final output if their 'podcastLink' is validated successfully (isValid: true) by the tool. If a link is invalid, discard that podcast entry and try to find another to meet the count of 5 if possible. Your final output should aim for 5 validated podcasts.
Strictly follow the defined output schema. Focus on well-known and high-quality podcasts.
`,
});

const fetchPodcastsFlow = ai.defineFlow(
  {
    name: 'fetchPodcastsFlow',
    inputSchema: FetchPodcastsInputSchema,
    outputSchema: FlowFetchPodcastsOutputSchema, // Flow's output schema allows 0-5
  },
  async (input: FetchPodcastsInput): Promise<FetchPodcastsOutput> => {
    const llmResponse = await prompt(input);

    if (!llmResponse.output || !llmResponse.output.podcasts) {
      console.error("FetchPodcastsFlow: LLM output or podcasts array was null or undefined.");
      throw new Error("The AI model did not return the expected output for podcasts.");
    }

    const validatedPodcasts = [];
    for (const podcast of llmResponse.output.podcasts) {
      if (podcast.podcastLink && typeof podcast.podcastLink === 'string' && podcast.podcastLink.trim() !== '') {
        try {
          // console.log(`Validating podcast link: ${podcast.podcastLink}`);
          const validationResult: ValidateUrlOutput = await validateUrlTool({ url: podcast.podcastLink });
          if (validationResult.isValid) {
            validatedPodcasts.push(podcast);
            //  console.log(`Link valid: ${podcast.podcastLink}`);
          } else {
            console.warn(`Invalid podcast link: ${podcast.podcastLink} (Status: ${validationResult.statusCode}, Error: ${validationResult.error}) - SKIPPING`);
          }
        } catch (e: any) {
            console.error(`Error during podcast URL validation for ${podcast.podcastLink}: ${e.message}`, e);
        }
      } else {
         console.warn(`Skipping podcast "${podcast.name}" due to missing or invalid podcastLink format.`);
      }
    }
    
    // console.log(`Returning ${validatedPodcasts.length} validated podcasts.`);
    return { podcasts: validatedPodcasts };
  }
);
