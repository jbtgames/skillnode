// Cloudflare Worker: Roadmap API proxy (GitHub Pages CORS)
// Allowed UI origin(s): update as needed

const ALLOWED_ORIGINS = [
  'https://jbtgames.github.io'
];

const toJson = (s) => {
  try { return JSON.parse(s); } catch {}
  const m = String(s).match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
};

const corsHeaders = (origin) => {
  const isLocal = typeof origin === 'string' && (
    origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')
  );
  const allow = (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin) || isLocal)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET, HEAD',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
};

const json = (body, status, headers) => new Response(
  JSON.stringify(body),
  { status, headers: { 'Content-Type': 'application/json', ...headers } }
);

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const CORS = corsHeaders(origin);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Friendly GET/HEAD handlers to avoid noisy 405s when visiting the Worker URL
    if (request.method === 'GET' || request.method === 'HEAD') {
      const { pathname } = new URL(request.url);
      if (pathname === '/favicon.ico') {
        return new Response(null, { status: 204, headers: { ...CORS, 'Content-Type': 'image/x-icon' } });
      }
      // Support simple GET testing: /?goal=UI%20Designer
      const goal = new URL(request.url).searchParams.get('goal');
      if (request.method === 'GET' && goal) {
        return handleRoadmap(goal, env, CORS);
      }
      if (request.method === 'HEAD') {
        return new Response(null, { status: 204, headers: CORS });
      }
      return json({ ok: true, service: 'SkillNode Roadmap Worker' }, 200, CORS);
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method Not Allowed' }, 405, CORS);
    }

    if (!env.GROQ_API_KEY) {
      return json({ error: 'Server not configured' }, 500, CORS);
    }

    let goal = '', recommendationsFor = '', pathwaysFor = '', progressionsFor = '';
    try {
      const b = await request.json();
      goal = (b?.goal || '').trim();
      recommendationsFor = (b?.recommendationsFor || '').trim();
      pathwaysFor = (b?.pathwaysFor || '').trim();
      progressionsFor = (b?.progressionsFor || '').trim();
    } catch {}
    if (recommendationsFor) {
      return handleRecommendations(recommendationsFor, env, CORS);
    }
    if (pathwaysFor) {
      return handlePathways(pathwaysFor, env, CORS);
    }
    if (progressionsFor) {
      return handleProgressions(progressionsFor, env, CORS);
    }
    if (!goal) return json({ error: 'Missing goal' }, 400, CORS);
    return handleRoadmap(goal, env, CORS);
  }
}

async function handleRoadmap(goal, env, CORS) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  // If model error persists, try 'llama-3.1-70b-versatile'
  const payload = {
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: 'You are a planner. Output JSON only.' },
      { role: 'user', content: `Generate a learning roadmap for the goal: ${goal}. Return JSON with nodes[] and links[].` }
    ],
    temperature: 0,
    max_tokens: 1024
  };
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    const text = await r.text();
    if (!r.ok) {
      return json({ error: 'Upstream error', status: r.status, body: text }, r.status, CORS);
    }
    const data = JSON.parse(text);
    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = toJson(content);
    if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.links)) {
      return json({ error: 'Invalid roadmap format', raw: content }, 502, CORS);
    }
    return json(parsed, 200, CORS);
  } catch (e) {
    return json({ error: 'Request failed' }, 500, CORS);
  }
}

async function handleRecommendations(label, env, CORS) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const payload = {
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: 'Output JSON array only.' },
      { role: 'user', content: `Suggest 5 advanced or related skills to ${label}, return JSON array of strings.` }
    ],
    temperature: 0,
    max_tokens: 500
  };
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });
    const text = await r.text();
    if (!r.ok) return json({ error: 'Upstream error', status: r.status, body: text }, r.status, CORS);
    let out = [];
    try { const data = JSON.parse(text); out = toJson(data?.choices?.[0]?.message?.content || '') || []; }
    catch {}
    if (!Array.isArray(out)) out = [];
    return json(out, 200, CORS);
  } catch {
    return json([], 200, CORS);
  }
}

async function handlePathways(label, env, CORS) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const payload = {
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: 'Output JSON only.' },
      { role: 'user', content: 'Generate one primary linear career path and optional alternate branches leading to ' + label + '. Return JSON: {goal, primary[], branches[][]}. Each node includes {id, label, type (education|work|cert|goal), description, difficulty, stage}.' }
    ],
    temperature: 0,
    max_tokens: 1400
  };
  try {
    const r = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer ' + env.GROQ_API_KEY }, body: JSON.stringify(payload) });
    const text = await r.text();
    if (!r.ok) return json({ error:'Upstream error', status:r.status, body:text }, r.status, CORS);
    let obj = {};
    try { const data = JSON.parse(text); obj = toJson(data?.choices?.[0]?.message?.content || '') || {}; } catch {}
    if (!obj || (!Array.isArray(obj.primary) && !Array.isArray(obj.branches))) obj = { goal: label, primary: [], branches: [] };
    return json(obj, 200, CORS);
  } catch { return json({ goal: label, primary: [], branches: [] }, 200, CORS); }
}

async function handleProgressions(label, env, CORS) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const payload = {
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: 'Output JSON array only.' },
      { role: 'user', content: 'Given the role ' + label + ', suggest up to 5 realistic next career positions. Return JSON array of strings.' }
    ],
    temperature: 0,
    max_tokens: 256
  };
  try {
    const r = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer ' + env.GROQ_API_KEY }, body: JSON.stringify(payload) });
    const text = await r.text();
    if (!r.ok) return json([], 200, CORS);
    let out = [];
    try { const data = JSON.parse(text); out = toJson(data?.choices?.[0]?.message?.content || '') || []; } catch {}
    if (!Array.isArray(out)) out = [];
    return json(out, 200, CORS);
  } catch { return json([], 200, CORS); }
}
