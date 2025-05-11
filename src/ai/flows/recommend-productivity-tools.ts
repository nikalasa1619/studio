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
  freeTrialPeriod: z.string().optional().describe('For paid tools, information about the free trial period (e.g., "14-day free trial", "7-day trial", "No free trial", "Free plan available"). Omit for free tools or if not applicable/found.'),
});

const RecommendProductivityToolsOutputSchema = z.object({
  freeTools: z.array(ToolSchema).min(5).max(5).describe('A list of 5 free productivity tools related to the topic, each with a name and relevanceScore.'),
  paidTools: z.array(ToolSchema).min(5).max(5).describe('A list of 5 paid productivity tools related to the topic, each with a name, relevanceScore, and optionally a freeTrialPeriod.'),
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

  Provide exactly 5 free tools and 5 paid tools.
  For each tool, include its name and a relevanceScore (a number from 0.1 to 99.9) indicating how relevant the tool is to the topic.
  For PAID tools, if information is available, also include a freeTrialPeriod (e.g., "14-day free trial", "Free plan available", "No free trial"). If no trial information is found for a paid tool, you can omit the freeTrialPeriod field or state "Not specified". For free tools, this field should generally be omitted.

  Format your response in the following JSON format:
  {
    "freeTools": [
      {"name": "Free Tool X", "relevanceScore": 90.5},
      // ... 4 more free tools
    ],
    "paidTools": [
      {"name": "Paid Tool Y", "relevanceScore": 92.1, "freeTrialPeriod": "14-day free trial"},
      {"name": "Paid Tool Z", "relevanceScore": 78.5, "freeTrialPeriod": "Free plan available"},
      // ... 3 more paid tools, with optional freeTrialPeriod
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

