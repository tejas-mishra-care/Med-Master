// lib/constants.ts

// Define color tokens used throughout the application.
// Ensure these match the definitions in tailwind.config.ts for consistency.
export const COLORS = {
  PRIMARY: '#1E3A8A',
  ACCENT: '#14B8A6',
  HIGHLIGHT: '#F59E0B',
  BG: '#F8FAFC',
  // Add dark variants if needed, e.g.:
  // PRIMARY_DARK: '#102A5F', // Example darker shade
  // ACCENT_DARK: '#0F8C7E', // Example darker shade
  // HIGHLIGHT_DARK: '#BF7D09', // Example darker shade
  // BG_DARK: '#1A202C', // Example darker shade
};

// Disclaimer text for AI responses
// This is prepended to all AI answers to manage user expectations.
export const DISCLAIMER_TEXT = '⚠️ For educational purposes only — not a substitute for professional medical advice.';

// AI Rate limits (per user)
// Defines how many AI requests a single user can make within a minute.
export const AI_RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 5,
};

// Cache TTL in seconds
// Time-to-live for cached AI responses.
export const CACHE_TTL_SECONDS = 24 * 60 * 60; // 24 hours

// Example usage:
// import { COLORS, DISCLAIMER_TEXT } from './constants';
// const primaryColor = COLORS.PRIMARY;
// console.log(DISCLAIMER_TEXT);
