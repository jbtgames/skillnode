# SkillNode — Phase Three: Codex Prompts (Sidebar Integration and Node Details)

**Purpose:**  
Integrate the Sidebar with NodeGraph selections. When a user clicks a node, its details appear in the sidebar, including title, group, difficulty, and status.  

Codex performs all edits and file creation. Manual action will be explicitly stated.

---

## ⚙️ Overview

This phase connects the graph’s selection events to a dynamic Sidebar display.  
When a node is selected, the sidebar updates in real time with its details.

---

## ✅ Step 1 — Extend the Event Bus Listener in `/src/main.js`

**Manual action:** None.  

```
You are editing file: /src/main.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
- Subscribe to AppBus.on('node:selected', …).
- On event, call renderSidebar(el, datum) passing the node data to update details.
- The sidebar element is #app-sidebar.
- Keep initialization order consistent.

CONSTRAINTS:
- Do not reformat unrelated code.
- Do not console.log after this phase; use renderSidebar only.
END.
```

---

## ✅ Step 2 — Upgrade `/src/components/Sidebar.js`

**Manual action:** None.  

```
You are editing file: /src/components/Sidebar.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Convert the placeholder sidebar into a dynamic detail panel that updates with selected node data.

Requirements:
- Export function renderSidebar(el, data).
- If no data is provided, render “No node selected.”
- When data is provided, display:
  • Node label (as <h2>)
  • Group name
  • Difficulty (numeric or “Level X”)
  • Status with color-coded badge (incomplete, in_progress, complete)
- Optional section: Related nodes (list neighbors by label if included in data.neighbors).

CONSTRAINTS:
- Do not depend on D3 directly.
- Keep under 120 lines.
- Use semantic markup (<section>, <dl>, etc.).
END.
```

---

## ✅ Step 3 — Modify `NodeGraph.js` to Send Context with Events

**Manual action:** None.  

```
You are editing file: /src/components/NodeGraph.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
- When a node is clicked, include connected node labels (neighbors) in the emitted payload.
- Structure:
  AppBus.emit('node:selected', {
    id, label, group, difficulty, status, neighbors: [array of neighbor labels]
  })

CONSTRAINTS:
- Maintain encapsulation inside mountGraph(el).
- Use the existing D3 data join; no global variables.
END.
```

---

## ✅ Step 4 — Update Sidebar Styling in `/src/styles/styles.css`

**Manual action:** None.  

```
You are editing file: /src/styles/styles.css
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Append styles for the sidebar detail view.

- #app-sidebar h2 { font-size: 1.4rem; margin-bottom: 0.5rem; color: var(--accent); }
- #app-sidebar dl { margin: 0; }
- #app-sidebar dt { font-weight: bold; color: var(--muted); margin-top: 0.3rem; }
- #app-sidebar dd { margin-left: 0; margin-bottom: 0.6rem; }
- .status-badge { display:inline-block; padding:4px 8px; border-radius:6px; font-size:0.8rem; }
- .status-incomplete { background: #333; color: var(--text); }
- .status-in_progress { background: var(--accent); color: #000; }
- .status-complete { background: var(--accent-2); color: #000; }

CONSTRAINTS:
- Append only; do not alter existing sections.
END.
```

---

## ✅ Step 5 — Verify Integration

**Manual action:** None (Codex tasks handle full implementation).

After Codex completes all steps:
1. Click a node — the sidebar should populate dynamically.
2. Sidebar shows node details and color-coded status.
3. Clicking a new node updates the details.
4. No console logs remain.  

---

## 🧱 Phase 3 Completion Criteria

- Sidebar dynamically reflects selected node information.
- NodeGraph emits detailed node data with neighbors.
- EventBus successfully links NodeGraph → Sidebar → DOM.
- Visual styling matches dark theme and accent palette.
- No redundant logs or global variables.

---

**End of Phase Three Codex Prompts**
