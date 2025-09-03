# 🎨 CREATIVE PHASE: UI/UX – Prompt Documentation Workflow (n8n Vanilla Forms)

🎨🎨🎨 ENTERING CREATIVE PHASE: UI/UX

## Component Description
Design a simple, reliable UI using vanilla n8n Forms for selecting a prompt from the repo and confirming the action before running the workflow that generates/updates a documentation file in a target repo.

## Requirements & Constraints
- Use vanilla n8n Forms (no custom styling; focus on clarity and safety)
- Prompts live in `prompts/` with human-readable `.md` files
- Runtime prompt metadata loaded via `prompts/index.json` (public repo, raw GitHub fetch)
- Source document provided as pasted markdown (textarea)
- Output target configurable (repo URL, branch, file path); GitHub credentials must be configured for writes
- No custom prompt override (avoid unpredictable multi-agent interactions)
- Provide a confirmation step; show a diff preview when feasible
- Offer a “writing style” selection via presets (Brainstorm, Executive, Technical, Neutral)

## Options
1) Single-step form
- Pros: Fastest to use; minimal UI
- Cons: Easy to misconfigure; no final review; riskier for writes

2) Two-step (Intake → Confirm) [RECOMMENDED]
- Pros: Clear summary and safety gate; still simple to build; works well for public prompt fetch
- Cons: One extra submit

3) Multi-step wizard (3+ steps)
- Pros: Fine-grained control and validation
- Cons: Higher complexity; slower to use; unnecessary for scope

## Options Analysis
- Safety is a primary concern due to write operations; two-step flow provides a lightweight guard without complexity overhead. Single-step is too risky; multi-step is overkill. Therefore, two-step wins.

## Recommended Approach
Adopt the two-step flow:
- Step 1 (Intake): capture project info, input markdown, prompt selection, writing style, output target
- Step 2 (Confirm): show summary + diff preview; user confirms Yes/No

## UI Field Specification

Form 1: Project Intake
- Project name (text, required)
- Source document (textarea, required)
- Prompt (dropdown; populated from `prompts/index.json` via HTTP GET)
- Writing style (dropdown presets: Brainstorm, Executive, Technical, Neutral)
- Output repo URL (text; e.g., https://github.com/org/repo)
- Output branch (text; default: main)
- Output file path (text; default: docs/<project>.md)
- I have configured GitHub credentials for the output repo (checkbox, required)
- Continue →

Form 2: Confirm & Run
- Summary display:
  - Selected prompt name + description
  - Output repo/branch/path
  - Document length preview (first N chars)
- Diff preview:
  - If file exists: show unified diff (markdown code block)
  - If missing: show “New file will be created” and first N lines preview
- Confirm (Yes/No)

## Runtime Prompt Loading (UI behavior)
- Fetch `prompts/index.json` from raw GitHub (public):
  - GET `https://raw.githubusercontent.com/Capp3/n8n-research-bug/main/prompts/index.json`
- Populate dropdown from JSON entries: `{ id, name, path, description, tags }`
- On selection, fetch the associated `.md` at `path` (raw URL) to pass along to the LLM step

## Error States & User Feedback
- Network error fetching index.json → Show friendly error and retry option
- Invalid/missing index.json → Inform user; disable dropdown; provide retry
- Selected prompt path 404 → Inform user; allow reselection
- Output repo write precheck fails → Inform user to configure credentials
- Validation errors → Inline messages on required fields

## Minimal MkDocs UX (documentation site)
- Keep ReadTheDocs theme
- Add a "Prompts" section grouping by categories (read from frontmatter/tags)
- Ensure search is enabled (already in mkdocs.yml)

## Implementation Guidelines (UI wiring)
- Nodes:
  - HTTP Request: GET index.json
  - Function: map index to dropdown options and descriptions
  - HTTP Request: GET selected prompt .md
  - Form 1: fields as specified
  - Branch/IF: verify GitHub credentials flag
  - HTTP Request (output repo): read existing file (if exists)
  - Function: compute diff (e.g., jsdiff) or show "new file" preview
  - Form 2: render summary + diff preview
  - IF: Confirm == Yes → proceed to AI + commit; else abort/loop back

## Verification Checkpoint
- Two-step flow implemented
- Prompt dropdown populated from `index.json`
- Writing style presets available and passed to processing
- Diff preview shown when target exists; new-file preview otherwise
- Clear errors and retry paths for network/validation issues

🎨🎨🎨 EXITING CREATIVE PHASE: UI/UX
