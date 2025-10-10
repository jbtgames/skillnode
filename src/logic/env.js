// env.js — Local environment accessors
// Dependencies: none

const getFromVite = (key) => (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) || undefined;
const getFromProcess = (key) => (typeof process !== 'undefined' && process.env && process.env[key]) || undefined;

const pick = (a, b, fallback = undefined) => (a != null ? a : (b != null ? b : fallback));

export const GROQ_API_KEY = pick(
  getFromVite('VITE_GROQ_API_KEY'),
  pick(getFromVite('GROQ_API_KEY'), getFromProcess('GROQ_API_KEY'), '')
);

export const GROQ_API_URL = pick(
  getFromVite('VITE_GROQ_API_URL'),
  pick(getFromVite('GROQ_API_URL'), getFromProcess('GROQ_API_URL'), 'https://api.groq.com/openai/v1')
);
