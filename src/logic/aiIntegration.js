// aiIntegration.js — Groq API integration (chat completions)
// Dependencies: ./env.js

import { GROQ_API_KEY, GROQ_API_URL } from './env.js';

const toJson = (s) => {
  try { return JSON.parse(s); } catch (_) {}
  const m = s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
  return null;
};

export async function requestRoadmap(goal) {
  const endpoint = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ROADMAP_API_URL) || '/api/roadmap';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal })
  });
  if (!res.ok) throw new Error('Roadmap request failed');
  const parsed = await res.json();
  if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.links)) {
    throw new Error('Invalid roadmap format');
  }
  return parsed;
}
