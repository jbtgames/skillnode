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
    ensureContainers();
    renderPlaceholders();
    // REGION: Graph bootstrap
    const host = document.getElementById("app-canvas");
    if (host) {
      const wrapper = document.createElement('div');
      wrapper.className = 'graph-container';
      while (host.firstChild) wrapper.appendChild(host.firstChild);
      host.appendChild(wrapper);
      try { mountGraph(wrapper); } catch (e) { console.error(e); }
    }

    if (window.AppBus && typeof window.AppBus.on === 'function') {
      window.AppBus.on('node:selected', (d) => {
        const sidebar = document.getElementById('app-sidebar');
        if (sidebar) renderSidebar(sidebar, d);
      });
    }

    // REGION: Goal input → generate roadmap
    const headerEl = document.getElementById('app-header');
    if (headerEl) {
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
      form.append(input, btn);
      headerEl.appendChild(form);

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

        let data;
        try {
          data = await requestRoadmap(goal);
          if (data && Array.isArray(data.nodes)) {
            data.nodes = data.nodes.map((n, i) => ({
              id: n.id ?? n.slug ?? String(n.name ?? n.label ?? i),
              label: n.label ?? n.name ?? String(n.id ?? `Node ${i+1}`),
              group: (n.group != null && n.group !== '') ? n.group : '-',
              difficulty: Number.isFinite(+n.difficulty) ? +n.difficulty : 1,
              status: n.status ?? 'incomplete'
            }));
          }
        } catch (err) {
          const msg = document.createElement('p');
          msg.style.color = 'var(--muted)';
          msg.textContent = 'Unable to generate roadmap.';
          wrapper.appendChild(msg);
          return;
        }

        try { mountGraph(wrapper, data); } catch (err) { console.error(err); }
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
import { mountGraph } from "./components/NodeGraph.js";
import { renderSidebar } from "./components/Sidebar.js";
import { requestRoadmap } from './logic/aiIntegration.js';
