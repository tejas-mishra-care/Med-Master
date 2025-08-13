// src/ai/flows/annotate-pdf-with-ai.ts
'use server';
/**
 * @fileOverview An AI agent that provides explanations for highlighted text in a PDF.
 *
 * - annotatePdfWithAI - A function that takes highlighted text from a PDF and returns an AI explanation.
 * - AnnotatePdfWithAIInput - The input type for the annotatePdfWithAI function.
 * - AnnotatePdfWithAIOutput - The return type for the annotatePdfWithAI function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnnotatePdfWithAIInputSchema = z.object({
  highlightedText: z.string().describe('The highlighted text from the PDF to be explained.'),
});
export type AnnotatePdfWithAIInput = z.infer<typeof AnnotatePdfWithAIInputSchema>;

const AnnotatePdfWithAIOutputSchema = z.object({
  explanation: z.string().describe('The AI-generated explanation of the highlighted text.'),
});
export type AnnotatePdfWithAIOutput = z.infer<typeof AnnotatePdfWithAIOutputSchema>;

export async function annotatePdfWithAI(input: AnnotatePdfWithAIInput): Promise<AnnotatePdfWithAIOutput> {
  return annotatePdfWithAIFlow(input);
}

const prompt = ai.definePrompt({
  name: 'annotatePdfWithAIPrompt',
  input: {schema: AnnotatePdfWithAIInputSchema},
  output: {schema: AnnotatePdfWithAIOutputSchema},
  prompt: `You are an expert medical assistant specializing in explaining complex medical concepts.

  You will receive highlighted text from a PDF document and provide a clear and concise explanation of the content.

  Highlighted Text: {{{highlightedText}}}
  `,
});

const annotatePdfWithAIFlow = ai.defineFlow(
  {
    name: 'annotatePdfWithAIFlow',
    inputSchema: AnnotatePdfWithAIInputSchema,
    outputSchema: AnnotatePdfWithAIOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
