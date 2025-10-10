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
  const url = (GROQ_API_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '') + '/chat/completions';
  const body = {
    model: 'mixtral-8x7b-32768',
    messages: [
      { role: 'system', content: 'You are a planner. Output JSON only.' },
      { role: 'user', content: `Generate a learning roadmap for the goal: ${goal}. Return JSON with nodes[] and links[].` }
    ],
    temperature: 0
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY || ''}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Roadmap request failed');
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || '';
  const parsed = toJson(content);
  if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.links)) {
    throw new Error('Invalid roadmap format');
  }
  return parsed;
}
