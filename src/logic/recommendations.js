// recommendations.js — Related skills via Groq
// Dependencies: ./env.js

import { GROQ_API_KEY, GROQ_API_URL } from './env.js';

const toArray = (s) => {
  if (!s) return [];
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : []; } catch {}
  const m = String(s).match(/\[[\s\S]*\]/);
  if (m) { try { const v = JSON.parse(m[0]); return Array.isArray(v) ? v : []; } catch {} }
  return [];
};

export async function getSkillRecommendations(nodeLabel) {
  try {
    const inferred = (typeof window !== 'undefined' && window.SKILLNODE_API_URL) || null;
    if (inferred) {
      const res = await fetch(inferred, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationsFor: String(nodeLabel || '') })
      });
      if (!res.ok) return [];
      const arr = await res.json();
      return Array.isArray(arr) ? arr.map(String).filter(Boolean) : [];
    }
    const base = (GROQ_API_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
    const url = base + '/chat/completions';
    const body = {
      model: 'mixtral-8x7b',
      messages: [
        { role: 'system', content: 'Output JSON array only.' },
        { role: 'user', content: `Suggest 5 advanced or related skills to ${nodeLabel}, return JSON array of strings.` }
      ],
      temperature: 0,
      max_tokens: 256
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY || ''}`
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const arr = toArray(content).map(String).filter(Boolean);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
