import { config } from 'dotenv';
config();

import '@/ai/flows/fetch-authors-and-quotes.ts';
import '@/ai/flows/fetch-newsletters.ts';
import '@/ai/flows/recommend-productivity-tools.ts';
import '@/ai/flows/generate-fun-facts.ts';
import '@/ai/flows/fetch-podcasts.ts'; 
import '@/ai/flows/generate-newsletter-styles-flow.ts';
import '@/ai/flows/generate-quote-newsletter-format-flow.ts'; // Added new flow
import '@/ai/tools/validate-url-tool.ts';

