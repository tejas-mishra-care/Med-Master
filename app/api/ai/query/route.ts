import { NextResponse } from 'next/server';
import { queryOpenAI } from '@/lib/openai'; // Assuming lib/openai.ts is in your project
import { DISCLAIMER_TEXT } from '@/lib/constants'; // Assuming lib/constants.ts is in your project
import { AIInteraction } from '@/lib/types'; // Assuming lib/types.ts for types
import { MEDMASTER_SYSTEM_PROMPT } from '@/lib/openaiPrompts'; // Assuming lib/openaiPrompts.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// This API route handles AI queries, processing user prompts,
// incorporating context from questions or SRS cards, querying OpenAI,
// rate-limiting users, caching responses, and logging interactions.

// Basic in-memory rate limiting for demonstration.
// In a production environment, consider using a persistent store like Redis.
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_PER_MINUTE = 5;

// Checks if a user is within the rate limit.
const checkRateLimit = (userId: string): boolean => {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (userLimit && now - userLimit.timestamp < 60 * 1000) {
    if (userLimit.count >= RATE_LIMIT_PER_MINUTE) {
      return false; // Rate limited
    }
    userLimit.count++;
    rateLimitMap.set(userId, userLimit);
  } else {
    rateLimitMap.set(userId, { count: 1, timestamp: now });
  }
  return true;
};

// Handles POST requests to the AI query endpoint.
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  // Authenticate the user
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    // Handle unauthenticated requests if allowed, possibly using a temporary ID
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Apply rate limiting
  if (!checkRateLimit(userId)) {
    return NextResponse.json({ error: 'Rate limit exceeded. Try again in a minute.' }, { status: 429 });
  }

  try {
    const { prompt, context_ids } = await request.json();

    let contextText = '';
    let sources: string[] = [];

    if (context_ids && context_ids.length > 0) {
      // If context_ids are provided, fetch the content of those questions or SRS cards.
      // Fetch content from context_ids (questions and SRS cards)
      // Truncate context text to avoid exceeding token limits (e.g., near 2000 tokens)
      // Placeholder implementation
      const { data: questions, error: qError } = await supabase
        .from('questions')
        .select('id, text')
        .in('id', context_ids);

      const { data: srsCards, error: srsError } = await supabase
        .from('srs_cards')
        .select('id, front, back')
        .in('id', context_ids);

      if (qError || srsError) {
        console.error('Error fetching context:', qError || srsError);
        // Continue without context
      } else {
        if (questions) {
          questions.forEach(q => {
            contextText += `Question ID: ${q.id}\nText: ${q.text}\n\n`;
            sources.push(`Question ID: ${q.id}`);
          });
        }
        if (srsCards) {
          srsCards.forEach(card => {
            contextText += `SRS Card ID: ${card.id}\nFront: ${card.front}\nBack: ${card.back}\n\n`;
            sources.push(`SRS Card ID: ${card.id}`);
          });
        }
        // Simple truncation example (adjust based on actual token calculation)
        const MAX_CONTEXT_TOKENS = 2000; // Estimate tokens
        if (contextText.length > MAX_CONTEXT_TOKENS * 4) { // Simple byte estimate for tokens
           contextText = contextText.substring(0, MAX_CONTEXT_TOKENS * 4) + "... [truncated]";
        }
      }


    } else {
      // If no context_ids are provided, perform a simple keyword search as a fallback.
      // Simple keyword search on questions (Placeholder for Vector DB)
      const { data: searchResults, error: searchError } = await supabase
        .from('questions')
        .select('id, text')
        .ilike('text', `%${prompt.split(' ')[0]}%`) // Simple example
        .limit(3);

      if (searchError) {
        console.error('Error performing keyword search:', searchError);
      } else if (searchResults && searchResults.length > 0) {
        contextText = "Relevant information found:\n\n";
        searchResults.forEach(q => {
            contextText += `Question ID: ${q.id}\nText: ${q.text}\n\n`;
            sources.push(`Keyword Match: Question ID: ${q.id}`);
        });
      }
    }

    // Construct the full prompt to send to the AI model, including context if available.
    const fullPrompt = contextText ? `Context:\n${contextText}\n\nUser Query: ${prompt}` : prompt;

    let openaiResponse;
    try {
      // Query the OpenAI model using the helper function
       openaiResponse = await queryOpenAI({
        prompt: fullPrompt,
        system: MEDMASTER_SYSTEM_PROMPT,
        maxTokens: 800, // Example max tokens
        userId: userId,
        contextHash: context_ids ? context_ids.join(',') : 'no_context', // Simple hash
      });
    } catch (openaiError) {
      console.error("Error querying OpenAI:", openaiError);
      // If OpenAI query fails, return a fallback response with local references.
      // Fallback response
      return NextResponse.json({
        answer: "I'm sorry, I couldn't process your request at this time. Here are some resources that might be helpful:",
        sources: ["Reference 1", "Reference 2"], // Local fallback references
        tokens_used: 0,
        disclaimer: DISCLAIMER_TEXT,
      }, { status: 500 });
    }


    // Save the AI interaction to the database for logging and potential analysis.
    // Save AI interaction
    const { data: aiInteraction, error: aiError } = await supabase
      .from('ai_interactions')
      .insert({
        user_id: userId,
        prompt: prompt,
        response: openaiResponse.answer,
        context: contextText,
        tokens_used: openaiResponse.tokens_used,
        cached: openaiResponse.cached,
        model: openaiResponse.model || 'unknown',
      });

    if (aiError) {
      console.error("Error saving AI interaction:", aiError);
      // Continue without saving interaction
    }

    // Return the AI's answer, sources, token usage, and the disclaimer.
    return NextResponse.json({
      answer: openaiResponse.answer,
      sources: sources.length > 0 ? sources : ["No specific sources identified."],
      tokens_used: openaiResponse.tokens_used,
      disclaimer: DISCLAIMER_TEXT,
      cached: openaiResponse.cached,
    });

  } catch (error) {
    // Handle any unexpected errors during the request processing.
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}