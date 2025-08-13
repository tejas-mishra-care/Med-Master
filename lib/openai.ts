import crypto from 'crypto';
import OpenAI from 'openai';

// Replace with your actual OpenAI API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory cache
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory rate limiter
const rateLimitCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_PER_MINUTE = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function generateHash(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export async function queryOpenAI({
  prompt,
  system,
  maxTokens,
  userId,
  contextHash,
}: {
  prompt: string;
  system: string;
  maxTokens: number;
  userId: string;
  contextHash?: string; // Optional hash of context data for caching
}): Promise<{ answer: string; tokens_used: number; cached: boolean; model: string } | { answer: string; tokens_used: 0; cached: false; model: 'fallback' }> {
  const queryHash = generateHash(prompt + (contextHash || ''));

  // Check cache
  const cachedEntry = cache.get(queryHash);
  if (cachedEntry && cachedEntry.expiry > Date.now()) {
    console.log('Returning cached response for hash:', queryHash);
    return { ...cachedEntry.data, cached: true };
  }

  // Check rate limit
  const now = Date.now();
  const userLimit = rateLimitCounts.get(userId) || { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS };

  if (userLimit.resetTime < now) {
    userLimit.count = 0;
    userLimit.resetTime = now + RATE_LIMIT_WINDOW_MS;
  }

  if (userLimit.count >= RATE_LIMIT_PER_MINUTE) {
    console.warn(`Rate limit exceeded for user: ${userId}`);
    // Return a fallback or throw an error, depending on desired behavior
    return {
      answer: "I'm sorry, you've exceeded the rate limit. Please try again in a moment.",
      tokens_used: 0,
      cached: false,
      model: 'fallback',
    };
  }

  userLimit.count++;
  rateLimitCounts.set(userId, userLimit);

  try {
    const messages: any[] = [];
    if (system) {
      messages.push({ role: 'system', content: system });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Or another suitable model
      messages,
      max_tokens: maxTokens,
    });

    const answer = completion.choices[0].message.content || '';
    const tokens_used = completion.usage?.total_tokens || 0;
    const model = completion.model;

    const responseData = { answer, tokens_used, model };

    // Cache the response
    cache.set(queryHash, { data: responseData, expiry: Date.now() + CACHE_TTL_MS });

    return { ...responseData, cached: false };

  } catch (error) {
    console.error('Error querying OpenAI:', error);
    // Implement a more sophisticated fallback if needed
    return {
      answer: "I'm currently unable to provide a response. Please try again later.",
      tokens_used: 0,
      cached: false,
      model: 'fallback',
    };
  }
  // TODO: Integrate with Redis for production cache and rate limiting
  // TODO: Integrate with a vector database (e.g., Supabase, Pinecone) for RAG context retrieval
}

// Export for testing purposes
export function clearCache() {
  cache.clear();
}

// Example Usage (commented out)
/*
async function exampleUsage() {
  const userId = 'user123';
  const prompt = 'Explain the Krebs cycle.';
  const system = 'You are a biochemistry expert.';
  const maxTokens = 500;

  const result = await queryOpenAI({ prompt, system, maxTokens, userId });
  console.log('OpenAI Response:', result);

  const cachedResult = await queryOpenAI({ prompt, system, maxTokens, userId });
  console.log('Cached Response:', cachedResult); // Should show cached: true

  // Example with context hash (e.g., based on PDF content hash)
  const contextHash = 'abcdef12345';
  const promptWithContext = 'What is mentioned about glycolysis in this document?';
  const resultWithContext = await queryOpenAI({ prompt: promptWithContext, system, maxTokens, userId, contextHash });
  console.log('OpenAI Response with context:', resultWithContext);
}

exampleUsage();
*/