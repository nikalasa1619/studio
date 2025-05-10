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

const FactSchema = z.object({
  text: z.string().describe('The text of the fact.'),
  relevanceScore: z
    .number()
    .min(0.1)
    .max(99.9)
    .describe('A relevance score for the fact from 0.1 to 99.9, indicating how relevant the fact is to the topic.'),
});

const GenerateFunFactsOutputSchema = z.object({
  funFacts: z.array(FactSchema).describe('An array of five engaging fun facts related to the topic, each with a relevance score.'),
  scienceFacts: z
    .array(FactSchema)
    .describe('An array of five insightful science facts related to the topic, each with a relevance score.'),
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
  Provide five fun facts and five science facts. For each fact, include its text and a relevanceScore (a number from 0.1 to 99.9) indicating how relevant the fact is to the topic.
  Make sure the facts are easily digestible and engaging for a general audience.

  Topic: {{{topic}}}

  Format your response as a JSON object with two fields:
  - funFacts: An array of five engaging fun facts, each an object with "text" and "relevanceScore".
  - scienceFacts: An array of five insightful science facts, each an object with "text" and "relevanceScore".

  Example for one fact object: { "text": "This is a fun fact.", "relevanceScore": 75.2 }
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

