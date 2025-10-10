// Sidebar.js — Render placeholder sidebar
// Dependencies: none

// REGION: Render
export function renderSidebar(el) {
  if (!el) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'container';

  const heading = document.createElement('h2');
  heading.textContent = 'Sidebar';

  const text = document.createElement('p');
  text.textContent = 'Placeholder sidebar content.';

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Sidebar');

  wrapper.append(heading, text, nav);
  el.appendChild(wrapper);
}

