// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview Generates fun and science facts related to a specific topic for newsletter content.
 *
 * - generateFunFacts - A function that generates engaging fun facts and insightful science facts related to a topic.
 * - GenerateFunFactsInput - The input type for the generateFunFacts function.
 * - GenerateFunFactsOutput - The return type for the generateFunFacts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFunFactsInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate fun facts.'),
});
export type GenerateFunFactsInput = z.infer<typeof GenerateFunFactsInputSchema>;

const GenerateFunFactsOutputSchema = z.object({
  funFacts: z.array(z.string()).describe('An array of engaging fun facts related to the topic.'),
  scienceFacts: z
    .array(z.string())
    .describe('An array of insightful science facts related to the topic.'),
});
export type GenerateFunFactsOutput = z.infer<typeof GenerateFunFactsOutputSchema>;

export async function generateFunFacts(input: GenerateFunFactsInput): Promise<GenerateFunFactsOutput> {
  return generateFunFactsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFunFactsPrompt',
  input: {schema: GenerateFunFactsInputSchema},
  output: {schema: GenerateFunFactsOutputSchema},
  prompt: `You are an AI assistant designed to generate engaging content for newsletters.

  Your task is to generate fun facts and science facts related to the given topic.
  Provide five fun facts and five science facts. Make sure the facts are easily digestible and engaging for a general audience.

  Topic: {{{topic}}}

  Format your response as a JSON object with two fields:
  - funFacts: An array of five engaging fun facts.
  - scienceFacts: An array of five insightful science facts.
  `,
});

const generateFunFactsFlow = ai.defineFlow(
  {
    name: 'generateFunFactsFlow',
    inputSchema: GenerateFunFactsInputSchema,
    outputSchema: GenerateFunFactsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
