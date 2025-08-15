// Medical assistant
'use server';
/**
 * @fileOverview An AI-powered medical assistant that provides evidence-based explanations with sources.
 *
 * - getMedicalExplanation - A function that handles the medical explanation process.
 * - GetMedicalExplanationInput - The input type for the getMedicalExplanation function.
 * - GetMedicalExplanationOutput - The return type for the getMedicalExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GetMedicalExplanationInputSchema = z.object({
  prompt: z.string().describe('The medical question to be answered.'),
  contextText: z.string().optional().describe('Relevant context to provide a more accurate answer.'),
  userRole: z.string().optional().describe('The role of the user asking the question.'),
});
export type GetMedicalExplanationInput = z.infer<typeof GetMedicalExplanationInputSchema>;

const GetMedicalExplanationOutputSchema = z.object({
  answer: z.string().describe('The evidence-based explanation with sources.'),
  sources: z.array(z.string()).describe('A list of sources used to generate the explanation.'),
  tokens_used: z.number().describe('The number of tokens used to generate the explanation.'),
  disclaimer: z.string().describe('A disclaimer for the medical explanation.'),
});
export type GetMedicalExplanationOutput = z.infer<typeof GetMedicalExplanationOutputSchema>;

export async function getMedicalExplanation(input: GetMedicalExplanationInput): Promise<GetMedicalExplanationOutput> {
  return getMedicalExplanationFlow(input);
}

const MEDMASTER_SYSTEM_PROMPT = `You are MedMaster's educational medical assistant. Provide evidence-based explanations only. Always include sources. Add disclaimer: '⚠️ For educational purposes only — not a substitute for professional medical advice.' Refuse patient-specific advice.`

const prompt = ai.definePrompt({
  name: 'medicalExplanationPrompt',
  input: {
    schema: GetMedicalExplanationInputSchema,
  },
  output: {
    schema: GetMedicalExplanationOutputSchema,
  },
  prompt: `{{#if contextText}}Context: {{{contextText}}}\n{{/if}}User question: {{{prompt}}}\n\n${MEDMASTER_SYSTEM_PROMPT}`,
});

const getMedicalExplanationFlow = ai.defineFlow(
  {
    name: 'getMedicalExplanationFlow',
    inputSchema: GetMedicalExplanationInputSchema,
    outputSchema: GetMedicalExplanationOutputSchema,
  },
  async (input: GetMedicalExplanationInput) => {
    const {output} = await prompt(input);
    // Assuming the model returns the answer and sources as a single string,
    // you might need to parse the output to extract the sources.
    // This is a placeholder, and the actual implementation will depend on the model's output format.
    const answer = output!.answer;
    const sources = [] as string[]; // Replace with actual source extraction logic
    const tokens_used = 0; // Replace with actual token usage logic
    const disclaimer = '⚠️ For educational purposes only — not a substitute for professional medical advice.';
    return {
      answer: answer,
      sources: sources,
      tokens_used: tokens_used,
      disclaimer: disclaimer,
    };
  }
);

