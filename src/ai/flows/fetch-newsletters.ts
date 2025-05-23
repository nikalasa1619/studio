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
import { validateUrlTool, type ValidateUrlOutput } from '@/ai/tools/validate-url-tool';

const FetchNewslettersInputSchema = z.object({
  topic: z.string().describe('The topic for which to find newsletters.'),
});
export type FetchNewslettersInput = z.infer<typeof FetchNewslettersInputSchema>;

const NewsletterSchema = z.object({
  name: z.string().describe('The name of the newsletter.'),
  operator: z.string().describe('The person or company operating the newsletter.'),
  signUpLink: z.string().describe('The direct URL to the newsletter sign-up page. This must be a valid URL string e.g. https://example.com/newsletter. It is not a Zod URL type for schema validation purposes with the LLM, but will be validated by a tool.'),
  description: z.string().describe('A brief description of the newsletter (1-2 sentences).'),
  subscribers: z.string().optional().describe('Subscriber count (e.g., "10k+", "Not Publicly Available").'),
  relevanceScore: z
    .number()
    .min(0.1)
    .max(99.9)
    .describe('A relevance score for the newsletter from 0.1 to 99.9, indicating how relevant it is to the topic.'),
  frequency: z.string().optional().describe('The typical posting frequency, e.g., "Weekly", "Bi-weekly", "Monthly", "Daily".'),
  coveredTopics: z.array(z.string()).optional().describe('A list of 2-3 main topics typically covered by the newsletter.'),
});

// Schema for LLM's direct output - it should aim for 10.
const LLMFetchNewslettersOutputSchema = z.object({
  newsletters: z
    .array(NewsletterSchema)
    .min(10)
    .max(10)
    .describe('A list of 10 relevant newsletters with their details, relevance scores, frequency, and covered topics. Only includes newsletters with valid, working sign-up links.'),
});

// Schema for the Flow's final output - can be less than 10 if validation fails for some.
const FlowFetchNewslettersOutputSchema = z.object({
  newsletters: z
    .array(NewsletterSchema)
    .min(0) // Allow 0 items if all validations fail or LLM provides fewer valid items
    .max(10)
    .describe('A list of up to 10 relevant newsletters with their details, relevance scores, frequency, and covered topics. Only includes newsletters with valid, working sign-up links.'),
});
export type FetchNewslettersOutput = z.infer<typeof FlowFetchNewslettersOutputSchema>;

export async function fetchNewsletters(input: FetchNewslettersInput): Promise<FetchNewslettersOutput> {
  return fetchNewslettersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fetchNewslettersPrompt',
  input: {schema: FetchNewslettersInputSchema},
  output: {schema: LLMFetchNewslettersOutputSchema}, // LLM aims for 10
  tools: [validateUrlTool], 
  prompt: `You are an expert newsletter curator.
Based on the topic "{{topic}}", find exactly 10 relevant newsletters.
For each newsletter, provide:
1. Newsletter Name
2. Operator (Person or Company running it)
3. Sign-up Link (The direct URL to the newsletter sign-up page. CRITICAL: Ensure this is a complete and valid URL string starting with http or https. Prioritize well-known and stable websites that are unlikely to return a 404 error.)
4. A brief Description (1-2 sentences)
5. Subscriber Count (if publicly available, state "Not Publicly Available" if not found)
6. A relevanceScore (a number from 0.1 to 99.9) indicating how relevant the newsletter is to the topic.
7. Frequency (e.g., "Weekly", "Daily", "Monthly")
8. Covered Topics (A list of 2-3 main topics, e.g., ["AI in marketing", "Growth Hacking"])

IMPORTANT: You MUST use the 'validateUrl' tool for EACH 'signUpLink' you generate to verify it is accessible and does not result in a 404 error or other client/server error. Only include newsletters in the final output if their 'signUpLink' is validated successfully (isValid: true) by the tool. If a link is invalid, discard that newsletter entry and try to find another to meet the count of 10 if possible. Your final output should aim for 10 validated newsletters.
Strictly follow the defined output schema.
`,
});

const fetchNewslettersFlow = ai.defineFlow(
  {
    name: 'fetchNewslettersFlow',
    inputSchema: FetchNewslettersInputSchema,
    outputSchema: FlowFetchNewslettersOutputSchema, // Flow's output schema allows 0-10
  },
  async (input: FetchNewslettersInput): Promise<FetchNewslettersOutput> => {
    const llmResponse = await prompt(input);
    
    if (!llmResponse.output || !llmResponse.output.newsletters) {
      console.error("FetchNewslettersFlow: LLM output or newsletters array was null or undefined.");
      throw new Error("The AI model did not return the expected output for newsletters.");
    }

    const validatedNewsletters = [];
    for (const newsletter of llmResponse.output.newsletters) {
      if (newsletter.signUpLink && typeof newsletter.signUpLink === 'string' && newsletter.signUpLink.trim() !== '') {
        try {
          // console.log(`Validating newsletter link: ${newsletter.signUpLink}`);
          const validationResult: ValidateUrlOutput = await validateUrlTool({ url: newsletter.signUpLink });
          if (validationResult.isValid) {
            validatedNewsletters.push(newsletter);
            // console.log(`Link valid: ${newsletter.signUpLink}`);
          } else {
            console.warn(`Invalid newsletter link: ${newsletter.signUpLink} (Status: ${validationResult.statusCode}, Error: ${validationResult.error}) - SKIPPING`);
          }
        } catch (e: any) {
          console.error(`Error during newsletter URL validation for ${newsletter.signUpLink}: ${e.message}`, e);
        }
      } else {
        console.warn(`Skipping newsletter "${newsletter.name}" due to missing or invalid signUpLink format.`);
      }
    }
    
    // console.log(`Returning ${validatedNewsletters.length} validated newsletters.`);
    return { newsletters: validatedNewsletters }; 
  }
);
