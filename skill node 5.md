# SkillNode — Phase Five: Codex Prompts (Groq API Integration)

**Purpose:**  
Convert SkillNode from mock roadmap generation to live AI-powered roadmap creation using the Groq API.  
Codex will connect to Groq’s endpoint, read environment variables, and securely fetch generated data.

---

## ⚙️ Overview

This phase replaces the mock generator from Phase 4 with real-time Groq API responses.  
The app will send the user’s goal to the Groq model and render the returned roadmap JSON on the NodeGraph.

---

## ✅ Step 1 — Verify `.env` and `env.js` Configuration

**Manual action:** None (Codex will create these if missing).  

```
You are editing the SkillNode project root.
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
1. Create `.env` file if it does not exist.
2. Add:
   GROQ_API_KEY="YOUR_API_KEY_HERE"
   GROQ_API_URL="https://api.groq.com/v1"
3. Create `/src/logic/env.js` that reads and exports these values:
   export const GROQ_API_KEY = process.env.GROQ_API_KEY || import.meta.env.GROQ_API_KEY;
   export const GROQ_API_URL = process.env.GROQ_API_URL || import.meta.env.GROQ_API_URL;
4. Update `.gitignore` to ensure `.env` is ignored.

CONSTRAINTS:
- Never log keys or expose them in code.
- All keys remain local and untracked by GitHub.
END.
```

---

## ✅ Step 2 — Upgrade `/src/logic/aiIntegration.js` for Live API Calls

**Manual action:** None.  

```
You are editing file: /src/logic/aiIntegration.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Replace mock wrapper with a real Groq API request.

Requirements:
- Import { GROQ_API_KEY, GROQ_API_URL } from './env.js'.
- Send POST request to `${GROQ_API_URL}/chat/completions`.
- Headers:
  {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${GROQ_API_KEY}`
  }
- Body:
  {
    "model": "mixtral-8x7b",
    "messages": [
      { "role": "system", "content": "You generate structured learning roadmaps as JSON with nodes[] and links[]." },
      { "role": "user", "content": `Generate a learning roadmap for the goal: ${goal}.` }
    ]
  }
- Parse and return the roadmap JSON from response.  
- On error, fallback to a minimal mock roadmap.

CONSTRAINTS:
- Do not log raw responses or API keys.
- Keep total under 120 lines.
END.
```

---

## ✅ Step 3 — Update `/src/main.js` for API Integration Feedback

**Manual action:** None.  

```
You are editing file: /src/main.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
- Display a loading message or spinner when a roadmap request is in progress.
- If the API call fails, display a short error notice in the canvas area.
- Once data is received, call mountGraph(el, data) to render the roadmap.

CONSTRAINTS:
- Do not block UI interactions.
- Keep visual feedback minimal and aligned with existing dark theme.
END.
```

---

## ✅ Step 4 — Add Optional Model Configuration Support

**Manual action:** None.  

```
You are editing file: /src/logic/aiIntegration.js
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Add support for choosing a model dynamically.

Requirements:
- Accept optional parameter { model } in requestRoadmap(goal, options).
- Default to "mixtral-8x7b" if not provided.
- Ensure flexibility for future Groq models.

CONSTRAINTS:
- Keep under 20 additional lines.
END.
```

---

## ✅ Step 5 — Update `/src/styles/styles.css` (Optional Visual Feedback)

**Manual action:** None.  

```
You are editing file: /src/styles/styles.css
Follow /docs/Codex_Guidelines.txt for all output conventions.

TASK:
Append minimal loader and message styles.

- .loading-msg { text-align:center; color:var(--muted); margin-top:20px; }
- .error-msg { color:var(--accent); text-align:center; font-weight:bold; }

CONSTRAINTS:
- Append only; do not modify existing CSS.
END.
```

---

## ✅ Verification

After Codex completes all steps:
1. Input a goal (e.g., “Frontend Engineer”).  
2. SkillNode sends a live Groq API request and renders the AI-generated roadmap.  
3. Loading and error states appear appropriately.  
4. No sensitive data is logged or committed.

---

## 🧱 Phase 5 Completion Criteria

- Live roadmap generation from Groq API operational.
- Secure environment handling via `.env` and `env.js`.
- Graceful fallback behavior on API failure.
- Optional model switching supported.
- UI feedback integrated into main.js.

---

**End of Phase Five Codex Prompts**
