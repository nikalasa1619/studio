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
import { validateUrlTool, type ValidateUrlOutput } from '@/ai/tools/validate-url-tool';

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
  sourceLink: z.string().url().optional().describe('A valid URL to a page where the user can find information verifying the fact. This link must be validated for accessibility.')
});

const GenerateFunFactsOutputSchema = z.object({
  funFacts: z.array(FactSchema).min(10).max(10).describe('An array of ten engaging fun facts related to the topic, each with a relevance score and an optional, validated sourceLink.'),
  scienceFacts: z
    .array(FactSchema)
    .min(10).max(10)
    .describe('An array of ten insightful science facts related to the topic, each with a relevance score and an optional, validated sourceLink.'),
});
export type GenerateFunFactsOutput = z.infer<typeof GenerateFunFactsOutputSchema>;

export async function generateFunFacts(input: GenerateFunFactsInput): Promise<GenerateFunFactsOutput> {
  return generateFunFactsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFunFactsPrompt',
  input: {schema: GenerateFunFactsInputSchema},
  output: {schema: GenerateFunFactsOutputSchema}, // Output schema for LLM, before our validation
  tools: [validateUrlTool],
  prompt: `You are an AI assistant designed to generate engaging content for newsletters.

  Your task is to generate fun facts and science facts related to the given topic.
  Provide exactly ten fun facts and ten science facts. For each fact, include:
  1. The text of the fact.
  2. A relevanceScore (a number from 0.1 to 99.9) indicating how relevant the fact is to the topic.
  3. An optional sourceLink: a valid, publicly accessible URL where the user can find information supporting the fact. If providing a sourceLink, it is CRITICAL to ensure it's a complete and valid URL (e.g., "https://example.com/fact-source"). Prioritize reliable sources.

  IMPORTANT: For EVERY sourceLink you generate, you MUST use the 'validateUrl' tool to verify it is accessible and does not result in a 404 error or other client/server error. Only include a sourceLink in the final output for a fact if it is validated successfully (isValid: true) by the tool. If a link is invalid or no suitable link is found, omit the sourceLink field for that fact.

  Make sure the facts are easily digestible and engaging for a general audience.

  Topic: {{{topic}}}

  Format your response as a JSON object with two fields:
  - funFacts: An array of ten engaging fun facts.
  - scienceFacts: An array of ten insightful science facts.
  Each fact object should contain "text", "relevanceScore", and an optional "sourceLink".

  Example for one fact object: { "text": "This is a fun fact.", "relevanceScore": 75.2, "sourceLink": "https://example.com/source" }
  Example for fact without source: { "text": "Another fact.", "relevanceScore": 60.0 }
  `,
});

const generateFunFactsFlow = ai.defineFlow(
  {
    name: 'generateFunFactsFlow',
    inputSchema: GenerateFunFactsInputSchema,
    outputSchema: GenerateFunFactsOutputSchema, // Final output schema
  },
  async (input: GenerateFunFactsInput): Promise<GenerateFunFactsOutput> => {
    const llmResponse = await prompt(input);
    
    if (!llmResponse.output || !llmResponse.output.funFacts || !llmResponse.output.scienceFacts) {
      console.error("GenerateFunFactsFlow: LLM output or one of its fact arrays was null or undefined.");
      throw new Error("The AI model did not return the expected output for fun facts.");
    }

    const validateFactLinks = async (facts: z.infer<typeof FactSchema>[]) => {
      const validatedFacts = [];
      for (const fact of facts) {
        let validatedFact = { ...fact };
        if (fact.sourceLink && typeof fact.sourceLink === 'string' && fact.sourceLink.trim() !== '') {
          try {
            // console.log(`Validating fact source link: ${fact.sourceLink}`);
            const validationResult: ValidateUrlOutput = await validateUrlTool({ url: fact.sourceLink });
            if (validationResult.isValid) {
              // console.log(`Link valid for fact source: ${fact.sourceLink}`);
              // Keep the link
            } else {
              console.warn(`Invalid or inaccessible fact source link: ${fact.sourceLink} (Status: ${validationResult.statusCode}, Error: ${validationResult.error}) - REMOVING LINK`);
              validatedFact.sourceLink = undefined; // Remove invalid link
            }
          } catch (e: any) {
            console.error(`Error during validation for fact source URL ${fact.sourceLink}: ${e.message}`, e);
            validatedFact.sourceLink = undefined; // Remove on error
          }
        } else {
          validatedFact.sourceLink = undefined; // Ensure empty or invalid format links are removed
        }
        validatedFacts.push(validatedFact);
      }
      return validatedFacts;
    };
    
    const validatedFunFacts = await validateFactLinks(llmResponse.output.funFacts);
    const validatedScienceFacts = await validateFactLinks(llmResponse.output.scienceFacts);
    
    // console.log(`Returning ${validatedFunFacts.length} validated fun facts and ${validatedScienceFacts.length} validated science facts.`);
    return { funFacts: validatedFunFacts, scienceFacts: validatedScienceFacts };
  }
);
