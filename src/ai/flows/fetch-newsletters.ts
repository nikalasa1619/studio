'use server';

/**
 * @fileOverview Fetches newsletters relevant to a specific topic.
 *
 * - fetchNewsletters - A function that fetches newsletter information.
 * - FetchNewslettersInput - The input type for the fetchNewsletters function.
 * - FetchNewslettersOutput - The return type for the fetchNewsletters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FetchNewslettersInputSchema = z.object({
  topic: z.string().describe('The topic for which to find newsletters.'),
});
export type FetchNewslettersInput = z.infer<typeof FetchNewslettersInputSchema>;

const NewsletterSchema = z.object({
  name: z.string().describe('The name of the newsletter.'),
  operator: z.string().describe('The person or company operating the newsletter.'),
  signUpLink: z.string().describe('The direct URL to the newsletter sign-up page. This must be a valid URL string e.g. https://example.com/newsletter.'),
  description: z.string().describe('A brief description of the newsletter (1-2 sentences).'),
  subscribers: z.string().optional().describe('Subscriber count (e.g., "10k+", "Not Publicly Available").'),
  relevanceScore: z
    .number()
    .min(0.1)
    .max(99.9)
    .describe('A relevance score for the newsletter from 0.1 to 99.9, indicating how relevant it is to the topic.'),
});

const FetchNewslettersOutputSchema = z.object({
  newsletters: z
    .array(NewsletterSchema)
    .max(10)
    .describe('A list of up to 10 relevant newsletters with their details and relevance scores.'),
});
export type FetchNewslettersOutput = z.infer<typeof FetchNewslettersOutputSchema>;

export async function fetchNewsletters(input: FetchNewslettersInput): Promise<FetchNewslettersOutput> {
  return fetchNewslettersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fetchNewslettersPrompt',
  input: {schema: FetchNewslettersInputSchema},
  output: {schema: FetchNewslettersOutputSchema},
  prompt: `You are an expert newsletter curator.
Based on the topic "{{topic}}", find 10 relevant newsletters.
For each newsletter, provide:
1. Newsletter Name
2. Operator (Person or Company running it)
3. Sign-up Link (direct URL to the sign-up page, ensure this is a complete and valid URL string starting with http or https)
4. A brief Description (1-2 sentences)
5. Subscriber Count (if publicly available, state "Not Publicly Available" if not found)
6. A relevanceScore (a number from 0.1 to 99.9) indicating how relevant the newsletter is to the topic.

Ensure the output strictly follows the defined schema.
The 'newsletters' field should be an array of 10 such newsletter objects.
If you cannot find 10, provide as many as you can find up to 10.
`,
});

const fetchNewslettersFlow = ai.defineFlow(
  {
    name: 'fetchNewslettersFlow',
    inputSchema: FetchNewslettersInputSchema,
    outputSchema: FetchNewslettersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

