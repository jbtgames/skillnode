# SkillNode — Phase Nine: Codex Prompts (Career Pathway Engine)

**Purpose:**  
Transform SkillNode into an AI-driven **Career Pathway Explorer**.  
This phase allows users to explore multiple routes toward their desired career — through education, experience, or hybrid paths — powered by Groq API intelligence.

---

## ⚙️ Overview

The user enters a target career (e.g., “Web Developer”).  
SkillNode generates **3–5 realistic pathways** showing how people can reach that career, including school, work experience, and certification routes.  
Each route will appear as a distinct branch on the D3 graph, complete with category colors, click interactivity, and pathway toggles.

---

## ✅ Step 1 — Extend `/src/logic/aiIntegration.js` for Career Pathways

**Manual action:** None.  

```
You are editing file: /src/logic/aiIntegration.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Add a new function `requestCareerPathways(goal)` that fetches and parses AI-generated career routes.

Requirements:
- Import { GROQ_API_KEY, GROQ_API_URL } from './env.js'.
- POST to `${GROQ_API_URL}/chat/completions`.
- Model: "mixtral-8x7b".
- Prompt:
  "Generate 3–5 distinct pathways to become a {goal}. Each pathway is an array of nodes representing jobs, education, or certifications. Include education-first, experience-first, and hybrid routes. Return JSON with `pathways` array, each containing nodes[{ id, label, type, description, difficulty, routeIndex }]."

CONSTRAINTS:
- Parse and flatten the response into a unified graph format.
- Each node must include a `type` field (education, work, cert, goal).
- Gracefully handle API errors with fallback data.
- Keep under 150 lines.
END.
```

---

## ✅ Step 2 — Update `/src/components/NodeGraph.js` for Multi-Branch Graphs

**Manual action:** None.  

```
You are editing file: /src/components/NodeGraph.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Upgrade mountGraph(el, data) to support multi-pathway rendering.

Requirements:
- Support multiple routes (data.pathways[]).
- Render each route in a unique color gradient.
- Automatically center the goal node.
- Apply node colors by type:
  • Education → Blue (#5aa6ff)
  • Work → Green (#22b34b)
  • Certification → Yellow (#f9c74f)
  • Goal → Gradient (accent + accent-2)
- Add zoom/pan reset buttons.
- Animate transitions when switching modes.

CONSTRAINTS:
- Maintain D3 performance.
- Retain hover and click events.
- Keep additions under 200 lines.
END.
```

---

## ✅ Step 3 — Add “View Mode” Toggle (Linear / Branching / Requirements)

**Manual action:** None.  

```
You are editing file: /src/main.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Create a toggle UI to switch between three graph modes:
1. Linear Path
2. Branching Pathways
3. Requirements Only

Behavior:
- On change, filter or transform data and re-render with mountGraph().
- Persist selected mode in localStorage (“viewMode”).
- Broadcast changes via AppBus.emit('mode:changed', value).

CONSTRAINTS:
- No global variables.
- Keep UI under 60 lines.
END.
```

---

## ✅ Step 4 — Add “Next Career Steps” Reverse Lookup

**Manual action:** None.  

```
You are editing file: /src/logic/progression.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Create `getCareerProgressions(currentRole)` that fetches potential next-step roles via Groq API.

Requirements:
- POST to `${GROQ_API_URL}/chat/completions`.
- Prompt:
  "Given the role {currentRole}, suggest up to 5 realistic next career positions. Return JSON array of strings."
- Return array of roles.
- Handle failure with empty array.

CONSTRAINTS:
- Keep under 60 lines.
- Do not log API keys or raw responses.
END.
```

---

## ✅ Step 5 — Integrate Reverse Lookup into Graph

**Manual action:** None.  

```
You are editing file: /src/components/NodeGraph.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
When a node is clicked, display a floating card or sidebar section titled “Next Possible Roles.”

Requirements:
- Call getCareerProgressions(node.label).
- Display up to 5 results.
- If none found, show “No further data.”
- Style with dark panel and accent highlights.

CONSTRAINTS:
- Debounce API calls (200ms minimum).
- Close the card on outside click.
END.
```

---

## ✅ Step 6 — Add Node Type Styling

**Manual action:** None.  

```
You are editing file: /src/styles/styles.css
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Append color rules for node categories:

.node-education { fill: #5aa6ff; }
.node-work { fill: #22b34b; }
.node-cert { fill: #f9c74f; }
.node-goal { fill: url(#goal-gradient); stroke: #fff; stroke-width: 2; }

CONSTRAINTS:
- Append only; no overwrites.
END.
```

---

## ✅ Step 7 — Verification

After Codex completes all steps:
1. Input a career goal (“Web Developer”).  
2. Graph renders 3–5 distinct routes with color-coded nodes.  
3. Toggle modes to filter between simplified or complete routes.  
4. Clicking a node shows next possible career roles.  
5. All transitions smooth, no console errors.  

---

## 🧱 Phase 9 Completion Criteria

- Multi-route career graph functional.  
- AI pathways accurately categorized.  
- “Next Possible Roles” reverse lookup working.  
- Toggle modes responsive and persistent.  
- Stable performance across desktop and mobile.  

---

**End of Phase Nine Codex Prompts**
