import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-pdf.ts';
import '@/ai/flows/medical-assistant.ts';
import '@/ai/flows/annotate-pdf-with-ai.ts';
import '@/ai/flows/generate-quiz-questions.ts';