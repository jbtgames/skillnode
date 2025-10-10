// ProgressBar.js — Render basic progress bar
// Dependencies: none

// REGION: Render
export function renderProgress(el, value = 0) {
  if (!el) return;
  const v = Math.max(0, Math.min(100, Number.isFinite(+value) ? +value : 0));

  const wrapper = document.createElement('div');
  wrapper.className = 'progress';

  const bar = document.createElement('div');
  bar.className = 'progress__bar';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-label', 'Progress');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', String(v));
  bar.style.width = v + '%';

  const sr = document.createElement('span');
  sr.className = 'sr-only';
  sr.textContent = v + '%';
  bar.appendChild(sr);

  wrapper.appendChild(bar);
  el.appendChild(wrapper);
}

