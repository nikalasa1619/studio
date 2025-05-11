/**
 * @fileOverview A tool to validate if a URL is accessible and not a 404.
 *
 * - validateUrlTool - A Genkit tool to check URL validity.
 * - ValidateUrlInputSchema - Input schema for the tool.
 * - ValidateUrlOutputSchema - Output schema for the tool.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ValidateUrlInputSchema = z.object({
  url: z.string().describe('The URL to validate. It should be a complete URL including protocol (http/https).'),
});
export type ValidateUrlInput = z.infer<typeof ValidateUrlInputSchema>;

export const ValidateUrlOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the URL is valid and accessible (e.g., returns a 2xx status code and is not a 404).'),
  statusCode: z.number().optional().describe('The HTTP status code, if a request was made.'),
  error: z.string().optional().describe('Error message if validation failed due to network issues or non-2xx status other than common redirects.'),
});
export type ValidateUrlOutput = z.infer<typeof ValidateUrlOutputSchema>;

// Defines reasonable timeout values for the fetch requests.
const FETCH_HEAD_TIMEOUT_MS = 5000; // 5 seconds for HEAD requests
const FETCH_GET_TIMEOUT_MS = 8000;  // 8 seconds for GET requests (if HEAD fails)

export const validateUrlTool = ai.defineTool(
  {
    name: 'validateUrl',
    description: 'Checks if a given URL is accessible and returns a non-404 status. Prioritizes HEAD requests for efficiency, falls back to GET if necessary. Returns true if the URL returns a 2xx status code.',
    inputSchema: ValidateUrlInputSchema,
    outputSchema: ValidateUrlOutputSchema,
  },
  async (input: ValidateUrlInput): Promise<ValidateUrlOutput> => {
    if (!input.url.startsWith('http://') && !input.url.startsWith('https://')) {
      return { isValid: false, error: 'Invalid URL format: Missing http:// or https:// protocol.' };
    }

    try {
      // Try HEAD request first
      let response = await fetch(input.url, { 
        method: 'HEAD', 
        redirect: 'follow', // Allow following redirects
        signal: AbortSignal.timeout(FETCH_HEAD_TIMEOUT_MS) // Use AbortSignal for timeout
      });
      
      // If HEAD is not allowed or not implemented, try GET
      if (response.status === 405 || response.status === 501) { 
        console.warn(`HEAD request to ${input.url} returned ${response.status}. Falling back to GET.`);
        response = await fetch(input.url, { 
            method: 'GET', 
            redirect: 'follow',
            signal: AbortSignal.timeout(FETCH_GET_TIMEOUT_MS)
        });
      }

      if (response.ok) { // Status codes in the range 200-299 are considered OK
        return { isValid: true, statusCode: response.status };
      } else {
        // For non-OK responses, mark as invalid and provide status
        return { isValid: false, statusCode: response.status, error: `HTTP status ${response.status}` };
      }
    } catch (e: any) {
      // Handle network errors, timeouts, AbortError etc.
      let errorMessage = 'Network error or timeout during validation';
      if (e.name === 'AbortError') {
        errorMessage = 'Request timed out.';
      } else if (e.message) {
        errorMessage = e.message;
      }
      console.warn(`URL validation error for ${input.url}: ${errorMessage}`);
      return { isValid: false, error: errorMessage };
    }
  }
);

