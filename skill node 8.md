# SkillNode — Phase Eight: Codex Prompts (Interactive Tools and Feature Expansion)

**Purpose:**  
Enhance SkillNode’s front-end experience with interactive, user-focused features—no database required.  
This phase adds intelligent pop-ups, recommendations, theme control, and roadmap export options.

---

## ⚙️ Overview

The goal of Phase 8 is to enrich SkillNode’s functionality while maintaining a lightweight static architecture.  
All new interactions occur client-side using existing modules and the Groq API for optional AI skill recommendations.

---

## ✅ Step 1 — Add Node Info Expander (Modal Window)

**Manual action:** None.  

```
You are editing file: /src/components/NodeGraph.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
- When a node is clicked, open a floating modal window showing detailed info.
- Include: node label, group, difficulty, status, and optional AI-generated summary.
- Create a reusable helper `showNodeModal(node)` inside this file.
- The modal should be styled using existing dark theme colors (background: var(--panel), accent highlights).
- Add a close button (X) in the corner.

CONSTRAINTS:
- Append modal to document.body, not inside the SVG.
- Ensure clicking outside the modal closes it.
- Keep additions under 120 lines.
END.
```

---

## ✅ Step 2 — Create `/src/logic/recommendations.js` (Skill Suggestions)

**Manual action:** None.  

```
You are editing file: /src/logic/recommendations.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Create a function `getSkillRecommendations(nodeLabel)` that queries the Groq API for related skills.

Requirements:
- Import { GROQ_API_KEY, GROQ_API_URL } from './env.js'.
- Use fetch POST `${GROQ_API_URL}/chat/completions`.
- Model: "mixtral-8x7b".
- Prompt: "Suggest 5 advanced or related skills to {nodeLabel}, return JSON array of strings.".
- Return array of strings (fallback to empty array on failure).

CONSTRAINTS:
- No console logs.
- Keep under 80 lines.
END.
```

---

## ✅ Step 3 — Integrate Recommendations into Modal

**Manual action:** None.  

```
You are editing file: /src/components/NodeGraph.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Inside showNodeModal(node), import getSkillRecommendations() from recommendations.js.
After displaying node details, call getSkillRecommendations(node.label).
Render a sublist titled "Related Skills" with up to 5 recommendations.

CONSTRAINTS:
- Ensure async handling; display "Loading..." until results arrive.
- Handle API failure silently (show "No recommendations available").
END.
```

---

## ✅ Step 4 — Add Roadmap Exporter (JSON + PNG)

**Manual action:** None.  

```
You are editing file: /src/components/NodeGraph.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Add two buttons below the graph container:
1. "Export JSON" — downloads the current roadmap data as skillnode_roadmap.json.
2. "Export Image" — captures the SVG and downloads as skillnode_roadmap.png.

Requirements:
- Use Blob + URL.createObjectURL for JSON export.
- For image export, use SVG-to-canvas conversion (d3 or built-in methods).

CONSTRAINTS:
- Buttons must match theme (dark background, accent hover).
- Keep exports under 200 lines total.
END.
```

---

## ✅ Step 5 — Add Theme Toggle (Light/Dark Mode)

**Manual action:** None.  

```
You are editing file: /src/main.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Implement a theme toggle button in the header.

Requirements:
- Toggle between dark (current) and light theme.
- Persist user preference using localStorage (“theme”: “dark” | “light”).
- On page load, read preference and apply corresponding class to <body>.
- CSS variables should adjust background, text, and accent colors.

CONSTRAINTS:
- Keep logic under 80 lines.
- Ensure smooth CSS transitions when toggling.
END.
```

---

## ✅ Step 6 — Append Light Theme Variables to `/src/styles/styles.css`

**Manual action:** None.  

```
You are editing file: /src/styles/styles.css
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Append light theme variable set at the end of the file:

body.light-mode {
  --bg:#f4f4f8;
  --panel:#ffffff;
  --text:#111;
  --muted:#555;
  --accent:#0077ff;
  --accent-2:#22b34b;
  --border:#ccc;
}

CONSTRAINTS:
- Append only; no rewrites.
- Ensure smooth theme transition using CSS transitions on color/background.
END.
```

---

## ✅ Verification

After Codex completes all steps:
1. Clicking a node opens a modal with its info.  
2. Modal shows related skill suggestions from Groq.  
3. Users can export roadmap as JSON or PNG.  
4. Theme toggle persists user preference between sessions.  
5. No console errors or unstyled UI elements remain.

---

## 🧱 Phase 8 Completion Criteria

- Node info modal functional and styled.  
- AI-based skill recommendations integrated.  
- Export tools operational.  
- Theme toggle persistent and smooth.  
- Fully interactive and visually complete front-end.

---

**End of Phase Eight Codex Prompts**
