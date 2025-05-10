import { config } from 'dotenv';
config();

import '@/ai/flows/fetch-authors-and-quotes.ts';
import '@/ai/flows/fetch-newsletters.ts';
import '@/ai/flows/recommend-productivity-tools.ts';
import '@/ai/flows/generate-fun-facts.ts';
import '@/ai/flows/fetch-podcasts.ts'; // Added podcast flow
