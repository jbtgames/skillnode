// Vercel Serverless Function: /api/roadmap
// Proxies requests to Groq using server-side secret

const ALLOW_ORIGIN = '*'; // Optionally restrict to your site origin

const send = (res, status, body, headers = {}) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
};

const readJson = async (req) => {
  const chunks = [];
  for await (const ch of req) chunks.push(ch);
  const raw = Buffer.concat(chunks).toString('utf8');
  try { return JSON.parse(raw || '{}'); } catch { return {}; }
};

const toJson = (s) => {
  try { return JSON.parse(s); } catch (_) {}
  const m = typeof s === 'string' && s.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (_) {} }
  return null;
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, '');
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed' });

  const { goal } = await readJson(req);
  if (!goal || typeof goal !== 'string') return send(res, 400, { error: 'Missing goal' });

  const apiKey = process.env.GROQ_API_KEY || '';
  const base = (process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
  if (!apiKey) return send(res, 500, { error: 'Server not configured' });

  const url = base + '/chat/completions';
  const body = {
    model: 'mixtral-8x7b-32768',
    messages: [
      { role: 'system', content: 'You are a planner. Output JSON only.' },
      { role: 'user', content: `Generate a learning roadmap for the goal: ${goal}. Return JSON with nodes[] and links[].` }
    ],
    temperature: 0
  };

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
    if (!r.ok) return send(res, r.status, { error: 'Upstream error' });
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = toJson(content);
    if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.links)) {
      return send(res, 502, { error: 'Invalid roadmap format' });
    }
    return send(res, 200, parsed);
  } catch (err) {
    return send(res, 500, { error: 'Request failed' });
  }
};

