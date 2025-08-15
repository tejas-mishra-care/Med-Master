// Use runtime require to avoid TypeScript module resolution errors when types are not present.
let ai: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const g = require('genkit');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const google = require('@genkit-ai/googleai');
  const genkitFn = g?.genkit || g;
  const googleAIFn = google?.googleAI || google;
  if (typeof genkitFn === 'function') {
    ai = genkitFn({ plugins: [googleAIFn ? googleAIFn() : undefined], model: 'googleai/gemini-2.0-flash' });
  }
} catch (err) {
  // If packages aren't installed at runtime (e.g., in CI/typecheck), fall back to null.
  ai = null;
}

export { ai };
