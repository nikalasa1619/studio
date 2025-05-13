'use server';
/**
 * @fileOverview Generates newsletter styles based on a user's text description.
 *
 * - generateNewsletterStyles - A function that generates newsletter styles.
 * - GenerateNewsletterStylesInput - The input type for the generateNewsletterStyles function.
 * - GenerateNewsletterStylesOutput - The return type for the generateNewsletterStyles function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NewsletterStylesSchema = z.object({
  headingFont: z.string().describe("The font family for headings (e.g., 'Arial, sans-serif', 'Georgia, serif'). Default to 'Inter, sans-serif' if unsure."),
  paragraphFont: z.string().describe("The font family for paragraphs. Default to 'Inter, sans-serif' if unsure."),
  hyperlinkFont: z.string().describe("The font family for hyperlinks. Default to 'Inter, sans-serif' if unsure."),
  headingColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code").describe("The hex color code for headings (e.g., '#333333'). Default to '#111827' if unsure."),
  paragraphColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code").describe("The hex color code for paragraphs. Default to '#374151' if unsure."),
  hyperlinkColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code").describe("The hex color code for hyperlinks. Default to '#008080' if unsure."),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code").describe("The hex color code for the newsletter background. Default to '#FFFFFF' if unsure."),
});

const GenerateNewsletterStylesInputSchema = z.object({
  styleDescription: z.string().describe('A natural language description of the desired newsletter styles.'),
});
export type GenerateNewsletterStylesInput = z.infer<typeof GenerateNewsletterStylesInputSchema>;

const GenerateNewsletterStylesOutputSchema = z.object({
  styles: NewsletterStylesSchema.describe("The generated newsletter styles based on the user's description."),
});
export type GenerateNewsletterStylesOutput = z.infer<typeof GenerateNewsletterStylesOutputSchema>;

export async function generateNewsletterStyles(input: GenerateNewsletterStylesInput): Promise<GenerateNewsletterStylesOutput> {
  return generateNewsletterStylesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNewsletterStylesPrompt',
  input: { schema: GenerateNewsletterStylesInputSchema },
  output: { schema: GenerateNewsletterStylesOutputSchema },
  prompt: `You are an AI assistant that helps users style their newsletters.
Based on the user's description: "{{styleDescription}}", generate a JSON object that defines the newsletter styles.

Available font families (examples): "Inter, sans-serif", "Arial, sans-serif", "Verdana, sans-serif", "Georgia, serif", "Times New Roman, serif", "Courier New, monospace", "Roboto, sans-serif", "Lato, sans-serif", "Montserrat, sans-serif", "Open Sans, sans-serif".
If the user requests a general type of font like "modern sans-serif", choose "Inter, sans-serif". If "classic serif", choose "Georgia, serif".
Colors must be valid 6-digit hex codes (e.g., '#FF0000' for red).
If a specific style (e.g., headingColor) is not mentioned or unclear, use a sensible default:
- headingFont: "Inter, sans-serif"
- paragraphFont: "Inter, sans-serif"
- hyperlinkFont: "Inter, sans-serif"
- headingColor: "#111827" (very dark gray)
- paragraphColor: "#374151" (dark gray)
- hyperlinkColor: "#008080" (teal)
- backgroundColor: "#FFFFFF" (white)

Interpret descriptions like "light blue background", "bold red headings", "professional look with a serif font for text".
Ensure the output strictly follows the defined output schema, providing values for all style properties.
`,
});

const generateNewsletterStylesFlow = ai.defineFlow(
  {
    name: 'generateNewsletterStylesFlow',
    inputSchema: GenerateNewsletterStylesInputSchema,
    outputSchema: GenerateNewsletterStylesOutputSchema,
  },
  async (input) => {
    const llmResponse = await prompt(input);
    if (!llmResponse.output || !llmResponse.output.styles) {
        console.error("GenerateNewsletterStylesFlow: LLM output or styles object was null or undefined.");
        throw new Error("Failed to generate styles from the description. The AI model did not return the expected output.");
    }
    // Ensure all fields are present, even if AI missed some, by merging with defaults.
    // This is a fallback, the prompt encourages AI to fill all fields.
    const defaultStyles = {
        headingFont: "Inter, sans-serif",
        paragraphFont: "Inter, sans-serif",
        hyperlinkFont: "Inter, sans-serif",
        headingColor: "#111827",
        paragraphColor: "#374151",
        hyperlinkColor: "#008080",
        backgroundColor: "#FFFFFF",
    };
    return { styles: { ...defaultStyles, ...llmResponse.output.styles } };
  }
);
