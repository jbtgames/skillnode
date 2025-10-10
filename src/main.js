export const App = (() => {
  const required = ["app-header","app-sidebar","app-canvas","app-progress","app-footer"];

  function ensureContainers() {
    required.forEach(id => {
      if (!document.getElementById(id)) {
        console.warn(`[SkillNode] Missing container: #${id}`);
      }
    });
  }

  function renderPlaceholders(){
    const header = document.getElementById("app-header");
    if (header) header.innerHTML = `<h1>SkillNode</h1>`;

    const sidebar = document.getElementById("app-sidebar");
    if (sidebar) sidebar.innerHTML = `<h2>Sidebar</h2><p>Reserved for node details and forms.</p>`;

    const canvas = document.getElementById("app-canvas");
    if (canvas) canvas.innerHTML = `<h2>Graph Canvas</h2><p>Interactive roadmap will render here.</p>`;

    const progress = document.getElementById("app-progress");
    if (progress) progress.innerHTML = `<h2>Progress</h2><p>0% complete</p>`;

    const footer = document.getElementById("app-footer");
    if (footer) footer.innerHTML = `<small>&copy; ${new Date().getFullYear()} SkillNode</small>`;
  }

  function init(){
    try {
      // REGION: Theme setup
      const THEME_KEY = 'theme';
      const lightVars = {
        '--bg': '#f6f8fb', '--panel': '#ffffff', '--text': '#111827', '--muted': '#6b7280',
        '--accent': '#2563eb', '--accent-2': '#059669', '--border': '#e5e7eb'
      };
      const applyTheme = (mode) => {
        const root = document.documentElement; const isLight = mode === 'light';
        for (const [k, v] of Object.entries(lightVars)) root.style.setProperty(k, isLight ? v : '');
        document.body.classList.toggle('theme-light', isLight);
        document.body.classList.toggle('theme-dark', !isLight);
        try { localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark'); } catch {}
      };
      const ensureTransitionCSS = () => {
        if (document.getElementById('sn-theme-trans')) return;
        const s = document.createElement('style'); s.id = 'sn-theme-trans';
        s.textContent = `
          body, #app-header, #app-sidebar, #app-canvas, #app-progress, #app-footer,
          .goal-button, .node, .link { transition: background-color .2s ease, color .2s ease, border-color .2s ease, fill .2s ease, stroke .2s ease; }
        `; document.head.appendChild(s);
      };
      ensureTransitionCSS();
      const saved = (()=>{ try { return localStorage.getItem(THEME_KEY); } catch { return null; } })();
      applyTheme(saved === 'light' ? 'light' : 'dark');
      ensureContainers();
      renderPlaceholders();
      // REGION: Graph bootstrap (lazy-load D3 graph)
      const host = document.getElementById("app-canvas");
      if (host) {
        const wrapper = document.createElement('div');
        wrapper.className = 'graph-container';
        while (host.firstChild) wrapper.appendChild(host.firstChild);
        host.appendChild(wrapper);
        const loadGraph = (() => { let p; return () => (p ||= import('./components/NodeGraph.js')); })();
        requestAnimationFrame(() => {
          loadGraph().then(mod => { try { mod.mountGraph(wrapper); } catch {} }).catch(() => {});
        });
      }

      if (window.AppBus && typeof window.AppBus.on === 'function') {
        window.AppBus.on('node:selected', async (d) => {
          const sidebar = document.getElementById('app-sidebar');
          if (!sidebar) return;
          try { const { renderSidebar } = await import('./components/Sidebar.js'); renderSidebar(sidebar, d); } catch {}
        });
      }
    } catch {}

    // REGION: Goal input → generate roadmap
    const headerEl = document.getElementById('app-header');
    if (headerEl) {
      // Theme toggle button
      const modeNow = document.body.classList.contains('theme-light') ? 'light' : 'dark';
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'goal-button';
      toggle.setAttribute('aria-pressed', String(modeNow === 'light'));
      const updateLabel = (m) => { toggle.textContent = m === 'light' ? 'Dark Mode' : 'Light Mode'; };
      updateLabel(modeNow);

      const form = document.createElement('form');
      form.setAttribute('aria-label', 'Generate roadmap');
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'goal';
      input.placeholder = 'Target goal (e.g., UI Designer)';
      input.required = true;
      input.className = 'goal-input';
      const btn = document.createElement('button');
      btn.type = 'submit';
      btn.textContent = 'Generate';
      btn.className = 'goal-button';
      const actions = document.createElement('div');
      actions.style.display = 'flex'; actions.style.gap = '8px'; actions.style.flexWrap = 'wrap';
      actions.append(toggle, form);
      form.append(input, btn);
      headerEl.appendChild(actions);

      toggle.addEventListener('click', () => {
        const to = document.body.classList.contains('theme-light') ? 'dark' : 'light';
        updateLabel(to); const THEME_KEY = 'theme';
        const lightVars = {
          '--bg': '#f6f8fb', '--panel': '#ffffff', '--text': '#111827', '--muted': '#6b7280',
          '--accent': '#2563eb', '--accent-2': '#059669', '--border': '#e5e7eb'
        };
        const root = document.documentElement; const isLight = to === 'light';
        for (const [k, v] of Object.entries(lightVars)) root.style.setProperty(k, isLight ? v : '');
        document.body.classList.toggle('theme-light', isLight);
        document.body.classList.toggle('theme-dark', !isLight);
        try { localStorage.setItem(THEME_KEY, isLight ? 'light' : 'dark'); } catch {}
        toggle.setAttribute('aria-pressed', String(isLight));
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const goal = input.value.trim();
        if (!goal) return;
        if (window.AppBus?.emit) window.AppBus.emit('roadmap:requested', goal);

        const host = document.getElementById('app-canvas');
        if (!host) return;
        const wrapper = host.querySelector('.graph-container') || (() => {
          const w = document.createElement('div');
          w.className = 'graph-container';
          while (host.firstChild) w.appendChild(host.firstChild);
          host.appendChild(w);
          return w;
        })();

        while (wrapper.firstChild) wrapper.removeChild(wrapper.firstChild);

        // Loading state
        const loading = document.createElement('p');
        loading.textContent = 'Generating roadmap…';
        loading.setAttribute('aria-live', 'polite');
        wrapper.appendChild(loading);
        input.disabled = true; btn.disabled = true;

        let data;
        try {
          data = await requestRoadmap(goal);
          // Normalize nodes
          const nodes = Array.isArray(data?.nodes) ? data.nodes.map((n, i) => ({
            id: n.id ?? n.slug ?? String(n.name ?? n.label ?? i),
            label: n.label ?? n.name ?? String(n.id ?? `Node ${i+1}`),
            group: (n.group != null && n.group !== '') ? n.group : '-',
            difficulty: Number.isFinite(+n.difficulty) ? +n.difficulty : 1,
            status: n.status ?? 'incomplete'
          })) : [];
          const byIndexId = (idx) => (nodes[idx]?.id ?? String(idx));
          const toId = (ref) => {
            if (ref && typeof ref === 'object') return ref.id ?? ref.slug ?? String(ref.name ?? '');
            if (typeof ref === 'number') return byIndexId(ref);
            if (typeof ref === 'string' && /^\d+$/.test(ref)) return byIndexId(+ref);
            return String(ref ?? '');
          };
          // Normalize links to id->id
          const rawLinks = Array.isArray(data?.links) ? data.links : (Array.isArray(data?.edges) ? data.edges : []);
          const links = rawLinks.map((l) => ({
            source: toId(l.source ?? l.from),
            target: toId(l.target ?? l.to),
            type: l.type ?? 'related'
          }));
          data = { nodes, links };
        } catch (err) {
          loading.remove();
          input.disabled = false; btn.disabled = false;
          const msg = document.createElement('p');
          msg.style.color = 'var(--muted)';
          msg.textContent = 'Unable to generate roadmap.';
          wrapper.appendChild(msg);
          return;
        } finally {
          // Clear loading
          if (loading.isConnected) loading.remove();
          input.disabled = false; btn.disabled = false;
        }

        // Lazy-load graph module and render on next frame
        const loadGraph = (() => { let p; return () => (p ||= import('./components/NodeGraph.js')); })();
        requestAnimationFrame(() => {
          loadGraph().then(mod => { try { mod.mountGraph(wrapper, data); } catch {} }).catch(() => {});
        });
        if (window.AppBus?.emit) window.AppBus.emit('roadmap:loaded', { goal, count: data?.nodes?.length || 0 });
      });
    }
  }

  return { init };
})();

// Tiny event bus stub for later phases
(function attachEventBus(){
  const events = new Map();
  window.AppBus = {
    on(type, handler){ const set = events.get(type) || new Set(); set.add(handler); events.set(type, set); },
    off(type, handler){ const set = events.get(type); if (set) set.delete(handler); },
    emit(type, payload){ const set = events.get(type); if (set) for (const h of set) h(payload); }
  };
})();

document.addEventListener("DOMContentLoaded", () => App.init());
import { requestRoadmap } from './logic/aiIntegration.js';
