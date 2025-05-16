
'use server';
/**
 * @fileOverview Generates newsletter styles and suggests textual personalization based on a user's text description.
 *
 * - generateNewsletterStyles - A function that generates newsletter styles and suggestions.
 * - GenerateNewsletterStylesInput - The input type for the function.
 * - GenerateNewsletterStylesOutput - The return type for the function.
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

const SuggestedPersonalizationSchema = z.object({
    subjectLine: z.string().optional().describe("A suggested subject line if strongly implied by the style description. Otherwise omit."),
    introText: z.string().optional().describe("A suggested introductory text if strongly implied by the style description. Otherwise omit."),
    authorsHeading: z.string().optional().describe("A suggested heading for the authors/quotes section if strongly implied. Otherwise omit."),
    factsHeading: z.string().optional().describe("A suggested heading for the facts section if strongly implied. Otherwise omit."),
    toolsHeading: z.string().optional().describe("A suggested heading for the tools section if strongly implied. Otherwise omit."),
    newslettersHeading: z.string().optional().describe("A suggested heading for the newsletters section if strongly implied. Otherwise omit."),
    podcastsHeading: z.string().optional().describe("A suggested heading for the podcasts section if strongly implied. Otherwise omit."),
}).describe("Optional textual personalization suggestions if strongly implied by the style description.");


const GenerateNewsletterStylesInputSchema = z.object({
  styleDescription: z.string().describe('A natural language description of the desired newsletter styles, which might also imply textual content like titles or headings.'),
});
export type GenerateNewsletterStylesInput = z.infer<typeof GenerateNewsletterStylesInputSchema>;

const GenerateNewsletterStylesOutputSchema = z.object({
  styles: NewsletterStylesSchema.describe("The generated newsletter visual styles based on the user's description."),
  suggestedPersonalization: SuggestedPersonalizationSchema.optional().describe("Optional textual personalization suggestions if strongly implied by the style description."),
});
export type GenerateNewsletterStylesOutput = z.infer<typeof GenerateNewsletterStylesOutputSchema>;

export async function generateNewsletterStyles(input: GenerateNewsletterStylesInput): Promise<GenerateNewsletterStylesOutput> {
  return generateNewsletterStylesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNewsletterStylesPrompt',
  input: { schema: GenerateNewsletterStylesInputSchema },
  output: { schema: GenerateNewsletterStylesOutputSchema },
  prompt: `You are an AI assistant that helps users design their newsletters.
Based on the user's description: "{{styleDescription}}", generate a JSON object.

This object must contain:
1.  A 'styles' object defining the visual newsletter styles.
    - Available font families (examples): "Inter, sans-serif", "Arial, sans-serif", "Verdana, sans-serif", "Georgia, serif", "Times New Roman, serif", "Courier New, monospace", "Roboto, sans-serif", "Lato, sans-serif", "Montserrat, sans-serif", "Open Sans, sans-serif".
    - If the user requests a general type of font like "modern sans-serif", choose "Inter, sans-serif". If "classic serif", choose "Georgia, serif".
    - Colors must be valid 6-digit hex codes (e.g., '#FF0000' for red).
    - If a specific visual style (e.g., headingColor) is not mentioned or unclear, use a sensible default:
        - headingFont: "Inter, sans-serif"
        - paragraphFont: "Inter, sans-serif"
        - hyperlinkFont: "Inter, sans-serif"
        - headingColor: "#111827" (very dark gray)
        - paragraphColor: "#374151" (dark gray)
        - hyperlinkColor: "#008080" (teal)
        - backgroundColor: "#FFFFFF" (white)
    - The 'styles' object MUST be fully populated with all visual style properties.

2.  An optional 'suggestedPersonalization' object.
    - If the user's description STRONGLY IMPLIES specific text for any of the following, include them in this object: 'subjectLine', 'introText', 'authorsHeading', 'factsHeading', 'toolsHeading', 'newslettersHeading', 'podcastsHeading'.
    - For example, if the user says "Create a newsletter called 'Cosmic Chronicles' about space, with a futuristic theme and dark blue headings", you should suggest "Cosmic Chronicles" for 'subjectLine' within 'suggestedPersonalization'.
    - If the description is purely visual (e.g., "light blue background, dark text for paragraphs"), then either omit the 'suggestedPersonalization' object entirely, or include it with its fields omitted/empty. Only provide suggestions you are confident about based on the input.

Interpret descriptions like "light blue background", "bold red headings", "professional look with a serif font for text and a main title of 'Weekly Business Insights'".
Ensure the output strictly follows the defined output schema.
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
        throw new Error("Failed to generate styles from the description. The AI model did not return the expected output for styles.");
    }
    
    // Ensure styles object is complete with defaults if AI misses some (fallback)
    const defaultStyles = {
        headingFont: "Inter, sans-serif",
        paragraphFont: "Inter, sans-serif",
        hyperlinkFont: "Inter, sans-serif",
        headingColor: "#111827",
        paragraphColor: "#374151",
        hyperlinkColor: "#008080",
        backgroundColor: "#FFFFFF",
    };

    const mergedStyles = { ...defaultStyles, ...llmResponse.output.styles };

    return { 
        styles: mergedStyles,
        suggestedPersonalization: llmResponse.output.suggestedPersonalization 
    };
  }
);

