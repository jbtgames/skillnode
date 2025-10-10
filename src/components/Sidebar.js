// Sidebar.js — Dynamic detail panel
// Dependencies: none

// REGION: Render
export function renderSidebar(el, data) {
  if (!el) return;
  el.innerHTML = '';

  const container = document.createElement('div');
  container.className = 'container';

  const section = document.createElement('section');
  section.setAttribute('aria-labelledby', 'sidebar-title');

  const title = document.createElement('h2');
  title.id = 'sidebar-title';

  if (!data) {
    title.textContent = 'No node selected.';
    section.appendChild(title);
    container.appendChild(section);
    el.appendChild(container);
    return;
  }

  title.textContent = data.label || data.id || 'Node';
  section.appendChild(title);

  const dl = document.createElement('dl');
  const addRow = (term, value) => {
    const dt = document.createElement('dt'); dt.textContent = term;
    const dd = document.createElement('dd'); dd.textContent = value;
    dl.append(dt, dd);
  };
  const addRowEl = (term, node) => {
    const dt = document.createElement('dt'); dt.textContent = term;
    const dd = document.createElement('dd'); dd.appendChild(node);
    dl.append(dt, dd);
  };

  const group = data.group ?? '—';
  const diff = Number.isFinite(+data.difficulty) ? `Level ${+data.difficulty}` : (data.difficulty ?? '—');
  const status = (data.status || 'incomplete');

  addRow('Group', String(group));
  addRow('Difficulty', String(diff));

  const badge = document.createElement('span');
  badge.className = `badge badge--${status}`;
  badge.textContent = String(status).replace('_', ' ');
  addRowEl('Status', badge);

  section.appendChild(dl);

  const listNeighbors = Array.isArray(data.neighbors) ? data.neighbors : [];
  if (listNeighbors.length) {
    const rel = document.createElement('section');
    rel.setAttribute('aria-label', 'Related nodes');
    const h3 = document.createElement('h3'); h3.textContent = 'Related nodes';
    const ul = document.createElement('ul');
    const labelOf = (n) => (n && typeof n === 'object') ? (n.label || n.id || String(n)) : String(n);
    for (const n of listNeighbors) {
      const li = document.createElement('li');
      li.textContent = labelOf(n);
      ul.appendChild(li);
    }
    rel.append(h3, ul);
    container.appendChild(rel);
  }

  container.appendChild(section);
  el.appendChild(container);
}
