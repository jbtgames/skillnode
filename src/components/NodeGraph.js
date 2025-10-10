// NodeGraph.js — Mount static canvas placeholder
// Dependencies: none

// REGION: Mount
export function mountGraph(el) {
  if (!el) return;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Roadmap canvas (placeholder)');
  el.appendChild(canvas);
}

