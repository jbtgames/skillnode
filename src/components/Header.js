// Header.js — Render placeholder header
// Dependencies: none

// REGION: Render
export function renderHeader(el) {
  if (!el) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'container';

  const title = document.createElement('h1');
  title.textContent = 'SkillNode';

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Primary');

  const list = document.createElement('ul');
  const items = ['Roadmap', 'Progress', 'About'];
  for (const label of items) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = label;
    li.appendChild(a);
    list.appendChild(li);
  }
  nav.appendChild(list);

  wrapper.appendChild(title);
  wrapper.appendChild(nav);
  el.appendChild(wrapper);
}

