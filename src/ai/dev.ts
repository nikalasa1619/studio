import { config } from 'dotenv';
config();

import '@/ai/flows/fetch-authors-and-quotes.ts';
import '@/ai/flows/fetch-newsletters.ts'; // Renamed from aggregate-content.ts
import '@/ai/flows/recommend-productivity-tools.ts';
import '@/ai/flows/generate-fun-facts.ts';
