# SkillNode — Phase Four: Codex Prompts (AI Roadmap Generation)

**Purpose:**  
Introduce AI-powered roadmap generation. Users can input a goal, and SkillNode generates a roadmap dynamically using OpenAI’s API (via Codex or future integration).  
Codex will implement local mock behavior first; full API integration can be added later.

---

## ⚙️ Overview

This phase enables the app to create skill roadmaps automatically based on a target role or career goal.  
For now, the AI logic will use mock responses (static JSON generated in `graphGenerator.js`) to simulate AI output.

---

## ✅ Step 1 — Create `/src/logic/graphGenerator.js`

**Manual action:** None.  

```
You are editing file: /src/logic/graphGenerator.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Create a module that exports an async function generateRoadmap(goal) which returns mock roadmap data.

Requirements:
- Input: goal (string)
- Output: roadmap object with nodes[] and links[] matching the schema used in sampleRoadmap.json
- Use deterministic mock data (no randomness) — enough nodes to show structure (8–10 nodes).  
- Example groups: Design, UX, Frontend, Leadership
- Include progression links between nodes.

CONSTRAINTS:
- No API calls yet (mock only).
- Keep under 150 lines.
END.
```

---

## ✅ Step 2 — Add AI Integration Stub `/src/logic/aiIntegration.js`

**Manual action:** None.  

```
You are editing file: /src/logic/aiIntegration.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Create a function requestRoadmap(goal) that wraps generateRoadmap(goal).

Requirements:
- This acts as a placeholder for future OpenAI or Groq integration.
- Import generateRoadmap from './graphGenerator.js'.
- Return await generateRoadmap(goal).
- Export as async function requestRoadmap(goal).

CONSTRAINTS:
- Keep under 40 lines.
- No API key or network code.
END.
```

---

## ✅ Step 3 — Update `/src/main.js` to Handle User Input for Goal

**Manual action:** None.  

```
You are editing file: /src/main.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
- Add an input field and button to accept a user’s target goal (e.g., "UI Designer").
- On submit, call requestRoadmap(goal) and pass the result to mountGraph(el, data).
- Clear any existing graph before rendering the new roadmap.

CONSTRAINTS:
- Import requestRoadmap from './logic/aiIntegration.js'.
- Use existing AppBus for extensibility.
- Keep additions under 80 lines.
END.
```

---

## ✅ Step 4 — Modify `/src/components/NodeGraph.js` to Accept Data Input

**Manual action:** None.  

```
You are editing file: /src/components/NodeGraph.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
- Update mountGraph(el) to accept an optional data parameter.
- If data is provided, render directly from it instead of fetching sampleRoadmap.json.
- Maintain all D3 layout and interactivity.
- Skip fetch if data exists.

CONSTRAINTS:
- Preserve backward compatibility with existing behavior.
- No redundant fetch calls.
END.
```

---

## ✅ Step 5 — Append Basic Input Styling to `/src/styles/styles.css`

**Manual action:** None.  

```
You are editing file: /src/styles/styles.css
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Append input and button styles for goal submission UI.

- .goal-input { width:100%; padding:10px; border-radius:var(--radius); border:1px solid var(--border); background:var(--panel); color:var(--text); margin-bottom:12px; }
- .goal-button { display:inline-block; padding:8px 14px; border-radius:var(--radius); background:var(--accent); color:#000; font-weight:bold; cursor:pointer; }
- .goal-button:hover { background:var(--accent-2); }

CONSTRAINTS:
- Append only, no rewrites.
END.
```

---

## ✅ Step 6 — Verification

After Codex completes all steps:
1. Page loads with a text field and “Generate Roadmap” button.
2. Enter a goal (e.g., “UX Designer”).
3. Mock roadmap appears interactively on the NodeGraph.
4. No external API calls or console errors.

---

## 🧱 Phase 4 Completion Criteria

- User can generate mock AI roadmaps by entering a goal.
- Graph dynamically updates using generated data.
- Logic modularized under `/src/logic/`.
- Ready for future Groq API integration.
- Styling consistent with SkillNode theme.

---

**End of Phase Four Codex Prompts**
