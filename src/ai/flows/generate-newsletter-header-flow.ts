'use server';
/**
 * @fileOverview Generates a newsletter subject line and introductory text.
 *
 * - generateNewsletterHeader - A function that generates the newsletter header.
 * - GenerateNewsletterHeaderInput - The input type for the function.
 * - GenerateNewsletterHeaderOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateNewsletterHeaderInputSchema = z.object({
  topic: z.string().describe("The main topic of the newsletter."),
  newsletterDescription: z.string().optional().describe("A brief description of the newsletter's purpose and typical content, for AI context."),
  targetAudience: z.string().optional().describe("The target audience of the newsletter, for AI context."),
  contentSummary: z.string().describe("A brief summary of the types and quantity of content selected for the newsletter (e.g., 'Includes quotes from 2 authors, 5 fun facts, and 3 productivity tools')."),
  generateSubjectLine: z.boolean().describe("Whether to generate a subject line. If false, subjectLine in output will be empty."),
  generateIntroText: z.boolean().describe("Whether to generate introductory text. If false, introText in output will be empty."),
});
export type GenerateNewsletterHeaderInput = z.infer<typeof GenerateNewsletterHeaderInputSchema>;

const GenerateNewsletterHeaderOutputSchema = z.object({
  subjectLine: z.string().describe("The generated subject line for the newsletter. Empty if generateSubjectLine was false."),
  introText: z.string().describe("The generated introductory text for the newsletter. Empty if generateIntroText was false."),
});
export type GenerateNewsletterHeaderOutput = z.infer<typeof GenerateNewsletterHeaderOutputSchema>;

export async function generateNewsletterHeader(input: GenerateNewsletterHeaderInput): Promise<GenerateNewsletterHeaderOutput> {
  return generateNewsletterHeaderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNewsletterHeaderPrompt',
  input: { schema: GenerateNewsletterHeaderInputSchema },
  output: { schema: GenerateNewsletterHeaderOutputSchema },
  prompt: `You are an expert newsletter editor. Your task is to generate a compelling subject line and an engaging introductory paragraph for a newsletter.

Newsletter Topic: {{topic}}

{{#if newsletterDescription}}
Newsletter Description (for context): {{newsletterDescription}}
{{/if}}

{{#if targetAudience}}
Target Audience (for context): {{targetAudience}}
{{/if}}

Summary of Content to be Included: {{contentSummary}}

Instructions:
1.  {{#if generateSubjectLine}}
    Generate a concise and engaging Subject Line (max 15 words) that reflects the newsletter topic and content summary. Make it intriguing to encourage opens.
    {{else}}
    Subject line generation is disabled. Output an empty string for subjectLine.
    {{/if}}
2.  {{#if generateIntroText}}
    Generate a short Introductory Text (1-2 sentences, max 50 words) that welcomes the reader and briefly teases the content outlined in the summary, aligning with the topic.
    {{else}}
    Introductory text generation is disabled. Output an empty string for introText.
    {{/if}}

Ensure the output strictly follows the defined JSON schema.
If generation for a field is disabled, its corresponding output field MUST be an empty string.
`,
});

const generateNewsletterHeaderFlow = ai.defineFlow(
  {
    name: 'generateNewsletterHeaderFlow',
    inputSchema: GenerateNewsletterHeaderInputSchema,
    outputSchema: GenerateNewsletterHeaderOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    if (!llmResponse.output) {
      console.error("GenerateNewsletterHeaderFlow: LLM output was null or undefined.");
      // Return empty strings if generation failed or specific generation was off.
      return {
        subjectLine: input.generateSubjectLine ? "Error: Could not generate subject" : "",
        introText: input.generateIntroText ? "Error: Could not generate intro" : "",
      };
    }
    // Ensure that if generation was off for a field, it's an empty string
    return {
        subjectLine: input.generateSubjectLine ? (llmResponse.output.subjectLine || "Default Subject: Exciting News!") : "",
        introText: input.generateIntroText ? (llmResponse.output.introText || "Welcome to your newsletter!") : "",
    };
  }
);
