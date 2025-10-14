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
  const inferred = (typeof location !== 'undefined' && /github\.io$/i.test(location.hostname))
    ? 'https://curly-bird-87ae.thejamiebt.workers.dev'
    : '/api/roadmap';
  const endpoint = (typeof window !== 'undefined' && window.SKILLNODE_API_URL)
    || ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ROADMAP_API_URL) ? import.meta.env.VITE_ROADMAP_API_URL : null)
    || inferred;
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

// REGION: Career pathways
const slug = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'node';
const toNum = (v, d=1) => (Number.isFinite(+v) ? +v : d);

const normalizeCareerPathways = (goal, pathways) => {
  const nodes = [];
  const links = [];
  const seen = new Map();
  const addNode = (n) => {
    const id = n.id || `${n.routeIndex}-${n.idx}-${slug(n.label)}`;
    if (!seen.has(id)) {
      const type = n.type || (/cert/i.test(n.label) ? 'cert' : /degree|university|bootcamp|course/i.test(n.label) ? 'education' : /intern|junior|developer|engineer|work|job/i.test(n.label) ? 'work' : (String(n.label).toLowerCase() === String(goal).toLowerCase() ? 'goal' : 'work'));
      const node = { id, label: n.label || `Step ${n.idx+1}`, type, description: n.description || '', difficulty: toNum(n.difficulty, 1), routeIndex: n.routeIndex };
      nodes.push(node); seen.set(id, node);
    }
    return seen.get(id).id;
  };
  (Array.isArray(pathways) ? pathways : []).forEach((path, ri) => {
    const steps = Array.isArray(path?.nodes) ? path.nodes : (Array.isArray(path) ? path : []);
    let prevId = null;
    steps.forEach((raw, idx) => {
      const id = addNode({ ...raw, idx, routeIndex: ri });
      if (prevId) links.push({ source: prevId, target: id, type: 'path', routeIndex: ri });
      prevId = id;
    });
  });
  return { nodes, links };
};

const careerFallback = (goal) => normalizeCareerPathways(goal, [
  [
    { label: 'Foundations (HTML/CSS/JS)', type: 'education', difficulty: 1 },
    { label: 'Junior ' + goal, type: 'work', difficulty: 2 },
    { label: 'Mid ' + goal, type: 'work', difficulty: 3 },
    { label: goal, type: 'goal', difficulty: 3 }
  ],
  [
    { label: 'Computer Science Degree', type: 'education', difficulty: 2 },
    { label: 'Internship', type: 'work', difficulty: 2 },
    { label: 'Cert: Professional', type: 'cert', difficulty: 2 },
    { label: goal, type: 'goal', difficulty: 3 }
  ],
  [
    { label: 'Bootcamp', type: 'education', difficulty: 2 },
    { label: 'Freelance Projects', type: 'work', difficulty: 2 },
    { label: 'Associate Certification', type: 'cert', difficulty: 2 },
    { label: goal, type: 'goal', difficulty: 3 }
  ]
]);

export async function requestCareerPathways(goal) {
  const toPathways = (obj) => {
    if (!obj) return [];
    if (Array.isArray(obj.pathways)) return obj.pathways;
    const primary = Array.isArray(obj.primary) ? obj.primary : [];
    const branches = Array.isArray(obj.branches) ? obj.branches : [];
    const combined = [];
    if (primary.length) combined.push(primary);
    for (const b of branches) if (Array.isArray(b) && b.length) combined.push(b);
    return combined;
  };
  try {
    // Prefer serverless proxy if configured
    const worker = (typeof window !== 'undefined' && window.SKILLNODE_API_URL) || null;
    if (worker) {
      const r = await fetch(worker, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ pathwaysFor: String(goal||'') }) });
      if (r.ok) {
        const obj = await r.json();
        const paths = toPathways(obj);
        if (paths.length) return normalizeCareerPathways(goal, paths);
      }
    }
    const base = (GROQ_API_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
    const url = base + '/chat/completions';
    const prompt = `Generate one primary linear career path and optional alternate branches leading to ${goal}.\nReturn JSON: {goal, primary[], branches[][]}. Each node includes {id, label, type (education|work|cert|goal), description, difficulty, stage}.`;
    const body = {
      model: 'mixtral-8x7b',
      messages: [
        { role: 'system', content: 'Output JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0,
      max_tokens: 1400
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY || ''}` },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('upstream');
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = toJson(content) || {};
    const pathways = toPathways(parsed);
    if (!pathways.length) throw new Error('empty');
    return normalizeCareerPathways(goal, pathways);
  } catch {
    // static fallback: /data/careers/{goal}.json
    try {
      const g = slug(goal);
      const urls = [`./data/careers/${g}.json?v=2.0`, `./data/careers/${g}.json`];
      for (const u of urls) {
        const r = await fetch(u, { cache: 'no-store' });
        if (r.ok) {
          const obj = await r.json();
          const pathways = toPathways(obj);
          if (pathways.length) return normalizeCareerPathways(goal, pathways);
        }
      }
    } catch {}
    return careerFallback(goal);
  }
}
