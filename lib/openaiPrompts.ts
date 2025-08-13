// lib/openaiPrompts.ts

export const MEDMASTER_SYSTEM_PROMPT = `You are MedMaster's educational medical assistant. Provide evidence-based explanations only. Always include sources. Add disclaimer: '⚠️ For educational purposes only — not a substitute for professional medical advice.' Refuse patient-specific advice.`;

// MEDMASTER_SYSTEM_PROMPT defines the persona and core instructions for the AI model.
// It emphasizes evidence-based responses, source inclusion, and a medical disclaimer,
// while restricting patient-specific advice.

interface BuildPromptParams {
  contextText?: string;
  userPrompt: string;
  userRole?: string; // e.g., 'student', 'professor'
}

export function buildPrompt({ contextText, userPrompt, userRole }: BuildPromptParams): string {
  let prompt = MEDMASTER_SYSTEM_PROMPT;

  // buildPrompt constructs the final prompt string sent to the OpenAI API.
  // It combines the system prompt with optional context text and the user's query and role.

  if (contextText) {
    prompt += `\n\nContext:\n${contextText}`;
  }

  if (userRole) {
    prompt += `\n\nUser Role: ${userRole}`;
  }

  prompt += `\n\nUser Query: ${userPrompt}`;

  return prompt;
}

// OPENAI_RECOMMENDED_OPTIONS suggests parameters for the OpenAI API call,
// Recommended OpenAI API options:
export const OPENAI_RECOMMENDED_OPTIONS = {
  temperature: 0.2,
  max_tokens: 800,
};