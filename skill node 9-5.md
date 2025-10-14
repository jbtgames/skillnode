# SkillNode — Phase 9.5: Codex Prompts (Structured Linear + Branching Pathways)

**Purpose:**  
Refine SkillNode’s Career Pathway Engine to produce organized, linear-first career progressions with optional branching alternatives.  
This phase ensures all generated and static pathways follow a clear, readable hierarchy and realistic progression flow.

---

## ⚙️ Overview

Users should see a **primary linear route** to their target career (e.g., “Software Developer”) with **optional branches** for alternate education or experience paths.  
The D3 layout will render a clear “spine” for the main route and display optional branches off to the side.

---

## ✅ Step 1 — Standardize Pathway Data Structure

**Manual action:** None.  

```
You are editing file: /src/logic/aiIntegration.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Update the AI prompt to output standardized pathway data with both linear and branching routes.

Prompt:
"Generate one primary linear career path and optional alternate branches leading to {goal}. 
Return JSON: {goal, primary[], branches[][]}. Each node includes {id, label, type (education|work|cert|goal), description, difficulty, stage}."

CONSTRAINTS:
- Primary = main route (linear).
- Branches = alternate routes (arrays joining to same goal node).
- Fallback: static dataset from /data/careers/{goal}.json if API fails.
- Keep total additions under 80 lines.
END.
```

---

## ✅ Step 2 — Create `/data/careers/` Static Seed Files

**Manual action:** Add initial JSONs for 10 example careers.  

Example file: `/data/careers/web_developer.json`

```
{
  "goal": "Web Developer",
  "primary": [
    { "id": 1, "label": "Computer Science Degree", "type": "education" },
    { "id": 2, "label": "Internship", "type": "work" },
    { "id": 3, "label": "Junior Developer", "type": "work" },
    { "id": 4, "label": "Web Developer", "type": "goal" }
  ],
  "branches": [
    [
      { "id": 5, "label": "Coding Bootcamp", "type": "education" },
      { "id": 6, "label": "Freelance Projects", "type": "work" },
      { "id": 4, "label": "Web Developer", "type": "goal" }
    ]
  ]
}
```

CONSTRAINTS:
- Each file mirrors this format.
- Use lowercase snake_case for filenames.
- Keep files under 2 KB each.
END.

---

## ✅ Step 3 — Update `/src/components/NodeGraph.js` for Structured Layout

**Manual action:** None.  

```
You are editing file: /src/components/NodeGraph.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Modify mountGraph(el, data) to treat data.primary as the main spine and data.branches as offshoots.

Requirements:
- Render primary path vertically or diagonally as the main flow.
- Render branch paths angled from relevant primary node toward goal.
- Fix Y-axis ordering by stage: Education → Entry Level → Mid Career → Goal.
- Color adjustments: lighter hue for branches, solid for primary.
- Add toggle button "Show Alternate Routes" to collapse/expand branch paths.

CONSTRAINTS:
- Keep graph performant (≤ 400 nodes).
- Ensure branches merge back at the goal node.
- Maintain D3 zoom/pan and tooltip behavior.
END.
```

---

## ✅ Step 4 — Add Branch Toggle Logic to `/src/main.js`

**Manual action:** None.  

```
You are editing file: /src/main.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Add toggle UI for showing or hiding alternate branches.

Requirements:
- Create button #toggle-branches with label “Show Alternate Routes”.
- On click, toggle localStorage("showBranches") and emit AppBus.emit('branches:toggle', value).
- Update label dynamically (“Hide Alternate Routes” when active).

CONSTRAINTS:
- Keep logic under 50 lines.
- Maintain modular event handling via AppBus.
END.
```

---

## ✅ Step 5 — Enhance Node Type Styling for Hierarchy

**Manual action:** None.  

```
You are editing file: /src/styles/styles.css
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Append new rules for hierarchical visibility and branch styling.

.node-primary { opacity: 1; }
.node-branch { opacity: 0.8; stroke-dasharray: 3 2; }
.node-hidden { display: none; }

.link-branch { stroke-opacity: 0.6; stroke-dasharray: 4 3; }
.link-primary { stroke-width: 2; }

CONSTRAINTS:
- Append only; do not modify base graph colors.
- Include transition effects for smooth show/hide.
END.
```

---

## ✅ Step 6 — Verification

After Codex completes all steps:
1. Enter any goal (e.g., “Software Developer”).  
2. Graph displays a linear main route and optional branches.  
3. “Show Alternate Routes” toggle hides or reveals branches dynamically.  
4. Static JSONs load instantly when Groq API is offline.  
5. Graph remains readable, color-coded, and responsive.

---

## 🧱 Phase 9.5 Completion Criteria

- Structured, linear + branching career graph implemented.  
- Consistent data format across AI and static sources.  
- Toggle UI fully functional.  
- Performance stable and visually organized.  
- System ready for final polish and public release (Phase 10).  

---

**End of Phase 9.5 Codex Prompts**
