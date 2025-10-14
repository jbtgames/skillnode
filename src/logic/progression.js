// progression.js — Next-step career roles via Groq
// Dependencies: ./env.js

import { GROQ_API_KEY, GROQ_API_URL } from './env.js';

const toArray = (s) => {
  if (!s) return [];
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : []; } catch {}
  const m = String(s).match(/\[[\s\S]*\]/);
  if (m) { try { const v = JSON.parse(m[0]); return Array.isArray(v) ? v : []; } catch {} }
  return [];
};

export async function getCareerProgressions(currentRole) {
  try {
    const worker = (typeof window !== 'undefined' && window.SKILLNODE_API_URL) || null;
    if (worker) {
      const rs = await fetch(worker, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ progressionsFor: String(currentRole||'') }) });
      if (rs.ok) {
        const arr = await rs.json();
        return Array.isArray(arr) ? arr.map(String).filter(Boolean) : [];
      }
    }
    const base = (GROQ_API_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
    const url = base + '/chat/completions';
    const body = {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'Output JSON array only.' },
        { role: 'user', content: `Given the role ${currentRole}, suggest up to 5 realistic next career positions. Return JSON array of strings.` }
      ],
      temperature: 0,
      max_tokens: 256
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY || ''}` },
      body: JSON.stringify(body)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const arr = toArray(content).map(String).filter(Boolean);
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}
