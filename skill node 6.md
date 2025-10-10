# SkillNode — Phase Six: Codex Prompts (UI Polish and Deployment Optimization)

**Purpose:**  
Finalize SkillNode’s user interface, accessibility, and performance for production deployment.  
Codex will optimize visuals, streamline performance, and ensure GitHub Pages / Vercel compatibility.

---

## ⚙️ Overview

This phase focuses on polish and delivery — refining layout, improving responsiveness, enhancing accessibility, and preparing the build for continuous deployment.  
No new features — only refinements and optimizations.

---

## ✅ Step 1 — UI Polish in `/src/styles/styles.css`

**Manual action:** None.  

```
You are editing file: /src/styles/styles.css
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Refine global UI and component visuals for production.

- Improve overall typography (adjust line-height, weights, and heading spacing).
- Add hover/focus transitions for links and buttons.
- Refine color contrast for better readability.
- Ensure dark-mode contrast ratios ≥ 4.5:1.
- Add media queries for mobile breakpoints (<768px).
- Ensure NodeGraph container resizes smoothly on smaller screens.

CONSTRAINTS:
- Append enhancements; do not replace existing declarations.
- Keep the file under 400 total lines after edits.
END.
```

---

## ✅ Step 2 — Add Accessibility and SEO Metadata to `index.html`

**Manual action:** None.  

```
You are editing file: index.html
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
- Add <meta> tags for description, author, and Open Graph (og:title, og:description, og:image).
- Add proper <title> and <meta name="description"> values.
- Include <link rel="icon"> reference for favicon.
- Add ARIA labels where appropriate.
- Ensure <main>, <header>, <aside>, and <footer> landmarks are valid.

CONSTRAINTS:
- Do not alter script paths.
- Keep semantic layout intact.
END.
```

---

## ✅ Step 3 — Optimize Loading and Performance in `/src/main.js`

**Manual action:** None.  

```
You are editing file: /src/main.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Improve app load and runtime efficiency.

- Defer non-critical rendering until DOMContentLoaded.
- Use requestAnimationFrame for any canvas animations.
- Lazy-load large assets if possible (D3, graph data).
- Add try/catch around initialization routines.
- Ensure all console logs are removed in production.

CONSTRAINTS:
- Keep functional structure identical.
- Maintain AppBus event system.
END.
```

---

## ✅ Step 4 — Add Build and Deployment Scripts

**Manual action:** None.  

```
You are editing the SkillNode project root.
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
1. Create a `package.json` file if it does not exist.
2. Add scripts for build and deployment:

{
  "scripts": {
    "start": "npx serve .",
    "build": "echo 'Static build complete'",
    "deploy": "vercel --prod"
  }
}

3. Ensure dependencies section includes d3@7.

CONSTRAINTS:
- Do not overwrite existing dependencies if present.
- Keep commands minimal for static hosting.
END.
```

---

## ✅ Step 5 — Add Sitemap and Robots.txt for SEO

**Manual action:** None.  

```
You are editing the SkillNode project root.
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
1. Create `/sitemap.xml` listing key pages (index.html, data, docs).
2. Create `/robots.txt` allowing all crawlers:

User-agent: *
Allow: /

CONSTRAINTS:
- Ensure correct XML structure in sitemap.
- Keep files under 2KB.
END.
```

---

## ✅ Step 6 — Verify Production Readiness

After Codex completes all tasks:
1. Site is responsive and visually consistent.  
2. Metadata and favicon load properly.  
3. Graph and sidebar render cleanly on mobile.  
4. No console warnings or CORS issues.  
5. Deployment succeeds on GitHub Pages and Vercel.

---

## 🧱 Phase 6 Completion Criteria

- Fully polished UI with mobile responsiveness.  
- Proper meta tags and accessibility compliance.  
- Optimized load and render performance.  
- Build/deploy scripts functional.  
- SEO and production files present (sitemap, robots).  
- No development logs or placeholder content remain.

---

**End of Phase Six Codex Prompts**
