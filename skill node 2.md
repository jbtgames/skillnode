# SkillNode — Phase Two: Codex Prompts (D3.js NodeGraph Interactivity)

**Purpose:**  
This document contains the exact Codex prompts needed to complete Phase 2 of SkillNode (NodeGraph interactivity).  
Only copy/paste the Codex blocks.  
Follow `/docs/Codex_Guidelines.txt` for all output conventions.

---

## ⚙️ Overview

This phase introduces an **interactive D3.js graph** to visualize the user’s learning roadmap.  
Codex will handle all file creation, editing, and deletion automatically.  
Manual actions are only required when explicitly noted.

---

## ✅ Step 1 — Upgrade `/src/components/NodeGraph.js`

**Manual action:** None required (Codex will create or overwrite this file).

```
You are editing file: /src/components/NodeGraph.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Replace the placeholder with a D3 v7 force-directed graph.
- Import d3 via: import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
- Fetch /src/data/sampleRoadmap.json and render nodes/links.
- Nodes: radius = 6 + difficulty*2. Fill color by group (stable categorical scale).
- Stroke: status dependent (incomplete=muted, in_progress=accent, complete=accent-2).
- Hover: highlight node + incident links and adjacent nodes; show tooltip.
- Click: select node, add 'is-selected' class, and emit AppBus.emit('node:selected', datum).
- Zoom/pan: d3.zoom on SVG; drag behavior on nodes.
- Handle window resize (debounced 150ms) and preserve zoom transform.

CONSTRAINTS:
- Encapsulate in export function `mountGraph(el)`. Do not attach globals.
- Keep under ~220 lines. Comments minimal.
- No external libraries beyond d3 import above.
END.
```

---

## ✅ Step 2 — Append Graph Styles to `/src/styles/styles.css`

**Manual action:** None required.

```
You are editing file: /src/styles/styles.css
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Append graph-specific styles at the end of the file:
- .graph-container { position: relative; }
- .graph-root { width: 100%; height: 520px; display:block; border-radius: var(--radius); }
- .link { stroke: var(--border); stroke-width: 1.2; opacity: .7; }
- .node { cursor: pointer; stroke: #000; stroke-width: 1.2; }
- .node.is-hovered { stroke: var(--accent); stroke-width: 2; }
- .node.is-selected { stroke: var(--accent-2); stroke-width: 2.5; }
- .tooltip { position:absolute; pointer-events:none; background:var(--panel); color:var(--text); border:1px solid var(--border); border-radius:8px; padding:8px 10px; font-size:14px; box-shadow:0 6px 20px rgba(0,0,0,.35); }

CONSTRAINTS:
- Do not modify existing rules. Append only.
END.
```

---

## ✅ Step 3 — Populate `/src/data/sampleRoadmap.json`

**Manual action:** None required (Codex will create this file if it does not exist).

```
You are editing file: /src/data/sampleRoadmap.json
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Expand the sample roadmap to ~12 nodes across 3 groups with 14–18 links.
Respect the schema (id,label,group,difficulty,status) and link types.
END.
```

---

## ✅ Step 4 — Wire the Graph in `/src/main.js`

**Manual action:** None required.

```
You are editing file: /src/main.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
- Import { mountGraph } from "./components/NodeGraph.js".
- After placeholders render, wrap #app-canvas content in a <div class="graph-container"> and call mountGraph() with that element.
- Subscribe to AppBus.on('node:selected', ...) and console.log the datum id and label.
- Keep existing structure; do not remove prior placeholders.

CONSTRAINTS:
- Modify only the relevant region; no unrelated refactors.
END.
```

---

## ✅ Final Verification (Manual)

After Codex completes all steps, verify the following manually in your browser:

1. **Graph renders correctly** — nodes, links, and colors visible.
2. **Interactivity works** — hover, drag, zoom, and click selection functional.
3. **Console log triggers** — clicking a node prints its ID and label.
4. **No console errors** — open dev tools and confirm zero runtime issues.
5. **Styles applied** — verify `.node.is-selected` and `.tooltip` visual changes.

---

## 🧱 Phase 2 Completion Criteria

- D3 graph implemented with proper zoom, drag, and tooltip behavior.
- Graph loads dynamically from `sampleRoadmap.json`.
- Event bus integration functional (`node:selected` firing).
- Performance stable with 10–15 nodes.
- Repository remains modular and adheres to `/docs/Codex_Guidelines.txt`.

---

**End of Phase Two Codex Prompts**
