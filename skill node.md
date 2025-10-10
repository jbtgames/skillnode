# SkillNode — Phase One Modular Build Guide (Codex-Ready)

**Version:** 1.0  
**Scope:** Phase One only (Base App Shell)  
**Audience:** Builder using OpenAI Codex (or equivalent) alongside this document  
**Authoring Date:** 2025‑10‑10

---

## 1. Purpose and Outcomes

This document specifies *exactly* how to build Phase One of **SkillNode**, a node‑based learning roadmap application, using modular techniques optimized for Codex. It provides:

- A minimal, production‑grade project scaffold.
- File‑by‑file acceptance criteria and test cases.
- Cut‑and‑paste prompts for Codex that limit context and save tokens.
- Coding conventions and guardrails to keep the codebase modular and maintainable.

**Phase One outcome:** a fully responsive, accessible **Base App Shell** with a clean layout, no business logic, and typed, documented placeholders for later modules. The shell loads without errors on GitHub Pages and provides clear insertion points for future phases.

---

## 2. Architecture Overview (Phase One)

### 2.1 Tech Choices
- **Frontend:** Vanilla HTML/CSS/JS (no framework in Phase One).  
- **Build tooling:** None required; keep zero‑config to reduce complexity.  
- **Module pattern:** ES Modules (native `type="module"`).  
- **Styling:** CSS custom properties and a simple CSS utility layer.  
- **Accessibility:** WCAG AA targets for contrast and keyboard navigation.  
- **Hosting:** GitHub Pages (static).  

Rationale: Phase One proves layout, modular wiring, and deploy flow. React, D3/React Flow, and API integrations are introduced in later phases.

### 2.2 Directory Structure
```
skillnode/
│
├─ index.html
├─ /src
│  ├─ main.js                  # Initializes app shell only
│  ├─ /components              # Placeholder modules only (no logic)
│  │   ├─ Header.js
│  │   ├─ Sidebar.js
│  │   ├─ NodeGraph.js
│  │   ├─ InputForm.js
│  │   └─ ProgressBar.js
│  ├─ /logic                   # Placeholders for later phases
│  │   ├─ graphGenerator.js
│  │   ├─ aiIntegration.js
│  │   └─ progressTracker.js
│  └─ /styles
│      └─ styles.css
└─ /assets
   └─ logo.svg                 # Optional placeholder
```

> **Note:** In Phase One, component and logic files are skeletal (exports with TODOs). This preserves import paths and prevents later refactors.

---

## 3. Coding Standards (Phase One)

- **File scope:** One responsibility per file.
- **No cross‑module imports** beyond what is explicitly shown in this guide.
- **No hidden global state.** If a temporary namespace is needed, use `window.App = {}` as a documented stopgap.
- **Semantics first:** use `<main>`, `<aside>`, `<header>`, `<nav>`, `<section>`, `<footer>`.
- **Accessibility:** all interactive elements must be reachable by keyboard; landmarks labeled with `aria‑label`.
- **Performance:** avoid layout thrash; prefer CSS for layout and transitions.
- **Comments:** top‑of‑file docblock (purpose, responsibilities, public surface), and `// TODO(phase):` tags for upcoming work.

---

## 4. Phase One Functional Requirements

### 4.1 Layout and Regions
- Persistent **Header** with product title and placeholder nav.
- Left **Sidebar** (collapsible) reserved for node details and future forms.
- Central **Graph Canvas** region (empty container for now).
- Top or bottom **Progress Summary** strip (placeholder).
- **Footer** with build info and links (About, Privacy placeholder).

### 4.2 Responsiveness
- Two‑column layout ≥ 1024px (sidebar ~24–28% width).  
- Single‑column stack < 1024px with sidebar collapsing into accordion.  
- Min tap target size 44×44px; maintain 16px base font size; use fluid typography.

### 4.3 Accessibility
- Document language set; page landmarks; skip‑to‑content link.  
- Focus states with visible outlines.  
- Color contrast ≥ 4.5:1 for body text.

### 4.4 Performance and Delivery
- Single CSS file and single module entry for Phase One.  
- No external runtime dependencies.  
- Load in < 1s on a typical broadband connection for a cold start on GitHub Pages.

### 4.5 Observability
- Console log `"SkillNode: shell initialized"` once.  
- Console warns for missing app containers if markup changes.

---

## 5. Token‑Efficient Workflow with Codex

**Principle:** Prompt per file with *just enough* context. Never paste the whole project.

1. Work file‑by‑file in VS Code. Open only the target file.  
2. Begin every prompt with the **file path** and **role** of the file.  
3. Provide **acceptance criteria**; avoid broad “make it nice” phrases.  
4. Ask for **idempotent** changes. Re‑prompts should not duplicate code.  
5. Use **diff‑only** follow‑ups: “Modify lines X–Y” or “Append below comment `// REGION: Layout`”.  
6. Keep prompts under 300–500 words where possible.

---

## 6. Step‑by‑Step Build (Phase One)

### Step 1 — Create `index.html`
**Goal:** Semantic shell with regions and IDs that later modules will hook into.

**Acceptance Criteria**
- Uses HTML5 semantics and accessible landmarks.
- Includes a skip link, header, sidebar, main canvas region, progress bar, and footer.
- Links `/src/styles/styles.css` and `/src/main.js` with `type="module"`.
- Provides stable element IDs: `#app-header`, `#app-sidebar`, `#app-canvas`, `#app-progress`, `#app-footer`.

**Codex Prompt (paste exactly)**
```
You are editing file: index.html in a new project "SkillNode".
Create a minimal, semantic HTML document for a node-based learning roadmap app.
Constraints:
- Link /src/styles/styles.css and /src/main.js (type="module").
- Provide regions with the following IDs:
  app-header, app-sidebar, app-canvas, app-progress, app-footer.
- Include a <a class="skip-link" href="#app-canvas">Skip to main</a> as the first focusable element.
- Use <header>, <aside>, <main>, <footer> with appropriate aria-labels.
- Include placeholder text only; no business logic.

Do not include inline styles or scripts.
```

**Reference Skeleton (for manual edits if needed)**
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SkillNode</title>
    <link rel="stylesheet" href="/src/styles/styles.css" />
  </head>
  <body>
    <a class="skip-link" href="#app-canvas">Skip to main</a>
    <header id="app-header" aria-label="Application header"></header>
    <div class="layout">
      <aside id="app-sidebar" aria-label="Sidebar"></aside>
      <main id="app-canvas" aria-label="Graph canvas region"></main>
    </div>
    <section id="app-progress" aria-label="Progress summary"></section>
    <footer id="app-footer" aria-label="Footer"></footer>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

---

### Step 2 — Create `/src/styles/styles.css`
**Goal:** Responsive two‑pane layout, dark theme, accessible colors, and baseline utilities.

**Acceptance Criteria**
- Defines a dark palette with CSS variables.
- Implements `.layout` as a responsive grid: sidebar column and main canvas.
- Includes styles for `.skip-link` with focus reveal.
- Provides utility classes: `.container`, `.visually-hidden`, `.sr-only`, `.divider`.
- No third‑party imports.

**Codex Prompt**
```
You are editing file: /src/styles/styles.css.
Create a dark, responsive CSS baseline for SkillNode with:
- CSS custom properties for colors, spacing, and font sizes.
- A two-column grid ".layout": sidebar 26%, canvas 74% on >= 1024px; single column below.
- Accessible focus outlines and a .skip-link that becomes visible on focus.
- Sections (#app-header, #app-sidebar, #app-canvas, #app-progress, #app-footer) styled as cards with subtle shadows and 12–16px padding.
- Body font-size 16px with a readable system stack. No CSS resets; no frameworks.
- Utility classes: .container (max-width 1280px), .sr-only, .divider.
```

**Reference Skeleton**
```css
:root{
  --bg:#0e0f12; --panel:#15171b; --text:#e6e8ef; --muted:#9aa0aa;
  --accent:#5aa6ff; --accent-2:#7bd389; --border:#252932;
  --radius:12px; --space-1:8px; --space-2:12px; --space-3:16px; --space-4:24px;
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0; background:var(--bg); color:var(--text);
  font:400 16px/1.5 system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,"Helvetica Neue",Arial;
}

.skip-link{
  position:absolute; left:-9999px; top:auto; width:1px; height:1px; overflow:hidden;
}
.skip-link:focus{
  position:static; width:auto; height:auto; padding:var(--space-2);
  background:var(--accent); color:#000; border-radius:var(--radius);
}

.layout{
  display:grid; gap:var(--space-3);
  grid-template-columns: 1fr;
  padding: var(--space-4);
}
@media (min-width:1024px){
  .layout{ grid-template-columns: 26% 1fr; }
}

#app-header,#app-sidebar,#app-canvas,#app-progress,#app-footer{
  background:var(--panel); border:1px solid var(--border); border-radius:var(--radius);
  padding:var(--space-3); box-shadow:0 1px 0 rgba(255,255,255,.04) inset, 0 6px 20px rgba(0,0,0,.25);
}

a,button,[role="button"],[tabindex]{
  outline:none;
}
a:focus,button:focus,[role="button"]:focus,[tabindex]:focus{
  outline:2px solid var(--accent); outline-offset:2px;
}

.container{ max-width:1280px; margin:0 auto; }
.sr-only{ position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); border:0; }
.divider{ height:1px; background:var(--border); margin:var(--space-3) 0; }
```

---

### Step 3 — Create `/src/main.js`
**Goal:** Initialize the shell, attach minimal renderers, and guard future extension points.

**Acceptance Criteria**
- Uses ES module syntax.
- Exports a minimal `App` object with `init()`.
- On DOMContentLoaded: populates each region with placeholder content and ARIA labels.
- Logs a single initialization message.
- Provides a namespaced event bus stub for later modules.

**Codex Prompt**
```
You are editing file: /src/main.js.
Create a minimal module that:
- Defines and exports `App` with an `init()` method.
- Waits for DOMContentLoaded, verifies required containers (by IDs), injects placeholder headings into each region, and logs one init message.
- Creates a simple event bus (on, off, emit) on `window.AppBus` for later phases. Keep <50 lines for the bus.
- Do not import other modules yet; only native APIs.
```

**Reference Skeleton**
```js
// /src/main.js
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
```

---

### Step 4 — Create skeletal component modules (placeholders only)
Create empty export shells to lock interfaces and future import paths.

**Files and Prompts**

- `/src/components/Header.js`
```
You are editing: /src/components/Header.js
Export a function `renderHeader(el)` that inserts a placeholder header with a product title and a stub nav. No side effects. No imports.
```

- `/src/components/Sidebar.js`
```
You are editing: /src/components/Sidebar.js
Export a function `renderSidebar(el)` that inserts placeholder text and an empty <nav aria-label="Sidebar">.
```

- `/src/components/NodeGraph.js`
```
You are editing: /src/components/NodeGraph.js
Export a function `mountGraph(el)` that inserts a static <canvas role="img" aria-label="Roadmap canvas (placeholder)">.
Do not implement drawing or data.
```

- `/src/components/InputForm.js`
```
You are editing: /src/components/InputForm.js
Export a function `mountInputForm(el)` that returns a minimal form element with no handlers.
```

- `/src/components/ProgressBar.js`
```
You are editing: /src/components/ProgressBar.js
Export a function `renderProgress(el, value=0)` that renders a basic progress bar element with ARIA role="progressbar".
```

> **Note:** Do not import these in `main.js` during Phase One. Leave them unused to confirm tree integrity only.

---

## 7. Acceptance Tests (Manual)

1. **Load Test:** Open `index.html` locally (Live Server) and on GitHub Pages.  
   - Expect visible header, sidebar, canvas placeholder, progress, footer.  
   - One console message: `SkillNode: shell initialized`.

2. **Responsive Test:**  
   - Desktop ≥ 1280px: two‑column layout; sidebar left, canvas right.  
   - Tablet ~ 768–1023px: stacked layout, no overflow.  
   - Mobile ≤ 480px: readable text, adequate spacing, no horizontal scroll.

3. **Accessibility Quick Pass:**  
   - Tab to skip‑link; activation focuses main region.  
   - Focus outlines are visible on interactive elements.  
   - Axe or Lighthouse shows no critical violations.

4. **Performance Quick Pass:**  
   - Lighthouse Performance ≥ 95 for a cold load on GitHub Pages.

5. **Integrity Checks:**  
   - All links resolve; CSS and JS load; no 404s.  
   - No runtime errors in console.  
   - Event bus exists: `typeof window.AppBus.emit === "function"`.

---

## 8. Deployment (GitHub Pages)

1. Push repository to GitHub.  
2. In repo settings → Pages → Deploy from `/ (root)` on branch `main` (or `/docs` if you prefer).  
3. Wait for build; visit the Pages URL.  
4. Verify tests above on the hosted site.

> If you prefer `/docs`, place `index.html` and `/src` under `/docs` and update relative paths accordingly.

---

## 9. Deferral Boundaries (Out of Scope for Phase One)

- No data models, API keys, or AI calls.  
- No graph rendering libraries.  
- No user state or persistence.  
- No routing, forms logic, or analytics.  
- No design systems or component libraries.

These will be introduced in Phases Two through Seven.

---

## 10. Prompt Library (Token‑Efficient)

Use these canonical prompts to keep Codex focused and idempotent. Each targets one file only.

**A. Create `index.html`**
```
File: index.html
Task: Create semantic shell with regions and IDs (see constraints). Link /src/styles/styles.css and /src/main.js (type="module"). No inline styles/scripts. Meet acceptance criteria in Section 6 Step 1.
Output: Complete HTML document only.
```

**B. Create `/src/styles/styles.css`**
```
File: /src/styles/styles.css
Task: Dark, responsive baseline; two-column grid; focus outlines; .skip-link; utilities.
Constraints described in Section 6 Step 2. No third-party imports.
Output: Full CSS file only.
```

**C. Create `/src/main.js`**
```
File: /src/main.js
Task: Export App.init(); DOMContentLoaded; placeholders; tiny event bus on window.AppBus.
Constraints described in Section 6 Step 3. Do not import other modules.
Output: Complete JS module only.
```

**D. Skeletal Components**
```
Files: /src/components/*.js
Task: Export minimal render/mount functions with placeholder markup only.
Output: Function exports only; no side effects or imports.
```

**E. Diff‑Only Update Example**
```
File: /src/styles/styles.css
Task: Add .container class and media query at 1440px. Append after the @media (min-width:1024px) block. No other changes.
```

---

## 11. Phase Exit Criteria

Phase One is complete when all of the following are true:

- The site renders correctly across mobile/tablet/desktop with accessible focus and semantics.
- All required containers exist and are styled as cards.
- Initialization message appears once and no errors are thrown.
- GitHub Pages deployment is live and accessible.
- Placeholder component files compile (even if unused).

---

## 12. Next Phase Preview (Do Not Build Yet)

- **Phase Two:** Interactive node placeholders (canvas sizing, panning scaffold, selection state).  
- **Phase Three:** Sidebar wiring and resource panels.  
- **Phase Four:** Input form and schema validation.  
- **Phase Five:** Mock graph generator and data contracts.  
- **Phase Six:** Persistence (localStorage), progress bar live updates.  
- **Phase Seven:** AI integration and dynamic graph build.

---

### Appendix A — Minimal Commit Plan

- `feat(shell): add semantic layout and regions`
- `feat(styles): add dark theme, responsive grid, utilities`
- `feat(core): add App.init and event bus`
- `chore(components): scaffold placeholder modules`
- `docs: add Phase One build guide`

---

**End of Phase One Guide**
