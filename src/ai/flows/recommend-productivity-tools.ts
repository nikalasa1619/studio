// src/ai/flows/recommend-productivity-tools.ts
'use server';
/**
 * @fileOverview Recommends productivity tools related to a given topic.
 *
 * - recommendProductivityTools - A function that recommends productivity tools.
 * - RecommendProductivityToolsInput - The input type for the recommendProductivityTools function.
 * - RecommendProductivityToolsOutput - The return type for the recommendProductivityTools function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendProductivityToolsInputSchema = z.object({
  topic: z.string().describe('The topic for which to recommend productivity tools.'),
});
export type RecommendProductivityToolsInput = z.infer<typeof RecommendProductivityToolsInputSchema>;

const RecommendProductivityToolsOutputSchema = z.object({
  freeTools: z.array(z.string()).describe('A list of 5 free productivity tools related to the topic.'),
  paidTools: z.array(z.string()).describe('A list of 5 paid productivity tools related to the topic.'),
});
export type RecommendProductivityToolsOutput = z.infer<typeof RecommendProductivityToolsOutputSchema>;

export async function recommendProductivityTools(
  input: RecommendProductivityToolsInput
): Promise<RecommendProductivityToolsOutput> {
  return recommendProductivityToolsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendProductivityToolsPrompt',
  input: {schema: RecommendProductivityToolsInputSchema},
  output: {schema: RecommendProductivityToolsOutputSchema},
  prompt: `You are a productivity expert. Recommend productivity tools related to the topic provided by the user.

  Topic: {{{topic}}}

  Provide 5 free tools and 5 paid tools in the following JSON format:
  {
    "freeTools": ["tool1", "tool2", "tool3", "tool4", "tool5"],
    "paidTools": ["tool1", "tool2", "tool3", "tool4", "tool5"]
  }`,
});

const recommendProductivityToolsFlow = ai.defineFlow(
  {
    name: 'recommendProductivityToolsFlow',
    inputSchema: RecommendProductivityToolsInputSchema,
    outputSchema: RecommendProductivityToolsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
