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

const ToolSchema = z.object({
  name: z.string().describe('The name of the productivity tool.'),
  relevanceScore: z
    .number()
    .min(0.1)
    .max(99.9)
    .describe('A relevance score for the tool from 0.1 to 99.9, indicating how relevant the tool is to the topic.'),
});

const RecommendProductivityToolsOutputSchema = z.object({
  freeTools: z.array(ToolSchema).describe('A list of 5 free productivity tools related to the topic, each with a name and relevanceScore.'),
  paidTools: z.array(ToolSchema).describe('A list of 5 paid productivity tools related to the topic, each with a name and relevanceScore.'),
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

  Provide 5 free tools and 5 paid tools. For each tool, include its name and a relevanceScore (a number from 0.1 to 99.9) indicating how relevant the tool is to the topic.

  Format your response in the following JSON format:
  {
    "freeTools": [
      {"name": "tool1", "relevanceScore": 90.5},
      {"name": "tool2", "relevanceScore": 85.0}
    ],
    "paidTools": [
      {"name": "toolA", "relevanceScore": 92.1},
      {"name": "toolB", "relevanceScore": 78.5}
    ]
  }
  Ensure you provide 5 free and 5 paid tools.`,
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

