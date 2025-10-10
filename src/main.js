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
    console.log("SkillNode: shell initialized");
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
