import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Placeholder function to query an external medical dictionary API.
 * Replace with actual API call logic.
 * Uses environment variables for API URL and key if enabled.
 * @param word The word to look up.
 * @returns The definition as a string, or null if not found or disabled.
 */
async function queryExternalDictionary(word: string): Promise<string | null> {
  // Implement external API call logic here
  // Use process.env.EXTERNAL_DICT_API_URL and API key if enabled
  console.log(`Attempting to query external dictionary for: ${word}`);
  return null; // Return null if external lookup fails or is disabled
}

/**
 * Simple in-memory cache for dictionary lookups.
 * Keyed by the lowercase word.
 */
const dictionaryCache = new Map<string, { definition: string, source: string, timestamp: number }>();
/**
 * Time-to-live for the cache in milliseconds (7 days).
 */
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/** In-memory storage for local glossary data once loaded. */
let localGlossary: Record<string, string> | null = null;

async function loadLocalGlossary() {
  if (localGlossary) {
    return;
  }
  try {
    const glossaryPath = path.join(process.cwd(), 'data', 'glossary.json');
    const fileContents = await fs.readFile(glossaryPath, 'utf-8');
    localGlossary = JSON.parse(fileContents);
  } catch (error) {
    console.error('Failed to load local glossary:', error);
    localGlossary = {}; // Initialize as empty object on error
  }
}

/**
 * API route to define a medical term.
 * It first checks the cache, then tries an external dictionary (if enabled), and finally falls back to a local glossary.
 * @param req The Next.js request object containing the word in search parameters.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get('word');

  if (!word) {
    return NextResponse.json({ error: 'Missing word parameter' }, { status: 400 });
  }

  const lowerCaseWord = word.toLowerCase();

  // Check cache first
  const cached = dictionaryCache.get(lowerCaseWord);
  // Check if cached definition exists and is still within the TTL
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    console.log(`Cache hit for ${lowerCaseWord}`);
    return NextResponse.json({ word, definition: cached.definition, source: cached.source });
  }

  let definition = null;
  let source = null;

  // Try external dictionary if enabled
  // Check for environment variable ENABLE_EXTERNAL_DICT
  if (process.env.ENABLE_EXTERNAL_DICT === 'true') {
    definition = await queryExternalDictionary(lowerCaseWord);
    if (definition) {
      source = 'External Dictionary'; // Or specific source name
    }
  }

  // Fallback to local glossary
  // Load the local glossary data if not already loaded
  if (!definition) {
    await loadLocalGlossary();
    if (localGlossary && localGlossary[lowerCaseWord]) {
      definition = localGlossary[lowerCaseWord];
      source = 'Local Glossary';
    }
  }

  if (definition) {
    // If a definition was found (either external or local), cache the result
    dictionaryCache.set(lowerCaseWord, { definition, source: source || 'Unknown', timestamp: Date.now() });
    // Return the found definition and source
    return NextResponse.json({ word, definition, source: source || 'Unknown' });
  } else {
    // If no definition was found after checking all sources
    return NextResponse.json({ error: 'Definition not found' }, { status: 404 });
  }
}