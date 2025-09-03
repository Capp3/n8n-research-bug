# 🏗️ CREATIVE PHASE: Architecture – Prompt Retrieval & Docs Pipeline

🎨🎨🎨 ENTERING CREATIVE PHASE: ARCHITECTURE

## Component Description
End-to-end architecture for:
- Runtime prompt retrieval from the public repo via HTTP GET
- Assembly of the selected prompt with writing style into LLM input
- Diff preview generation against a target repo file
- Safe write (create/update) to the target repo
- Simple docs generation flow for MkDocs (GitHub Pages)

## Requirements & Constraints
- Public prompt source: `prompts/index.json` + human-readable `.md` prompt files
- No token required for prompt fetch (public raw GitHub)
- Output repo/branch/path configurable at runtime
- Writes require credentials (GitHub token) separate from prompt source
- Minimal moving parts; reliability > aesthetics
- Provide actionable errors and safe confirmations

## Architectural Options

### A) Prompt Discovery & Fetch
- Option A1: Raw GitHub JSON index (RECOMMENDED)
  - Fetch `https://raw.githubusercontent.com/Capp3/n8n-research-bug/main/prompts/index.json`
  - Then fetch selected `.md` via raw URL
  - Pros: Simple, no auth, fast; Cons: requires index maintenance
- Option A2: GitHub API list + read with token
  - Pros: No manual index; Cons: token required, more logic

Decision: A1 now; A2 later if needed.

### B) Diff Generation
- Option B1: In-node diff (jsdiff in n8n Function) (RECOMMENDED)
  - Pros: Local, flexible, no external dependencies
  - Cons: Add small lib/function code
- Option B2: GitHub compare API
  - Pros: Externalized; Cons: needs repo commit refs, less control over formatting

Decision: B1 (jsdiff) unified diff as markdown code block.

### C) Repo Write Strategy
- Option C1: GitHub Contents API (create/update file) (RECOMMENDED)
  - Pros: Straightforward via HTTP Request node
  - Cons: Requires token/permissions
- Option C2: Git CLI in a runner
  - Pros: Full control; Cons: infra overhead
- Option C3: GitHub Actions dispatch to write
  - Pros: Secure; Cons: async, adds complexity

Decision: C1 now; consider C3 later for hardening.

### D) MkDocs Docs Generation
- Option D1: Pre-build copy: mirror `prompts/*.md` → `docs/prompts/` (RECOMMENDED)
  - Pros: No extra plugins; easy to reason about
  - Cons: Duplication unless automated
- Option D2: mkdocs-gen-files / awesome-pages plugins
  - Pros: Auto-generation; Cons: introduce new deps
- Option D3: Symlink `prompts/` into `docs/`
  - Pros: Simple locally; Cons: symlinks can be tricky on some platforms/hosting

Decision: D1 now via simple script/Make target; revisit plugins later.

## High-Level Data Flow
1) HTTP GET index.json (public raw GitHub)
2) Populate dropdown for prompt selection
3) HTTP GET selected prompt `.md`
4) Form 1 submit → build LLM request with writing style preset
5) Read target repo file (if exists) via GitHub API (using configured credentials)
6) Generate candidate content
7) Compute diff (jsdiff) vs existing (or mark as new file)
8) Show Form 2 (summary + diff preview)
9) On confirm → create/update file via GitHub Contents API
10) Notify/telemetry

## Node-Level Implementation Guidelines (n8n)
- HTTP Request (Index): GET raw index.json
- Function (Map Options): map to `{name, value, description}` for dropdown
- HTTP Request (Prompt): GET selected `.md`
- Form 1: Intake fields (project, doc, prompt, style, output repo/branch/path, creds flag)
- IF: creds flag true → continue; else → error/abort
- HTTP Request (Read File): GET `repos/:owner/:repo/contents/:path?ref=:branch` (handle 404)
- Function (Assemble LLM Input): combine user doc + prompt + style preset
- LLM Node (Generate Draft): produce updated markdown
- Function (Diff): jsdiff unified diff vs existing (or mark new)
- Form 2: Confirmation with summary + diff preview
- IF: Confirm Yes → HTTP Request (Write File): PUT to contents API with base64 content and `sha` if updating
- Success path: notify

## Configuration & Env
- PROMPTS_INDEX_URL: default `https://raw.githubusercontent.com/Capp3/n8n-research-bug/main/prompts/index.json`
- PROMPTS_BASE_RAW: default `https://raw.githubusercontent.com/Capp3/n8n-research-bug/main/`
- OUTPUT_REPO_URL: e.g., `https://github.com/org/repo`
- OUTPUT_BRANCH: default `main`
- OUTPUT_PATH: default `docs/<project>.md`
- GITHUB_TOKEN (credentials): for writes to output repo
- HTTP_TIMEOUT_MS: default 10000
- RETRY_COUNT: default 2
- DIFF_PREVIEW_MAX_CHARS: default 2000

## Error Handling Strategy
- Index fetch failure → show retry prompt; block prompt selection
- Prompt `.md` 404 → allow reselection; log incident
- Output repo read 404 → proceed as new file
- 401/403 on write → instruct to configure token/permissions
- 409 conflict on update (SHA mismatch) → re-read latest, recompute diff, re-confirm
- Network timeouts → retry with backoff (limited)

## Caching & Rate Limits
- Optional: cache index.json for short TTL (e.g., 5m) in memory/variable
- Respect GitHub rate limits; backoff on 403 with rate-limit headers

## Security Considerations
- Store tokens in n8n credentials; never log secrets
- Validate user-provided output repo URL to expected pattern
- Limit max doc size and diff preview length

## MkDocs Docs Generation Plan
- Add a Make target/script to copy `prompts/**/*.md` → `docs/prompts/`
- Generate `docs/prompts/index.md` from `index.json` (list with links)
- Update `mkdocs.yml` nav to include:
  - Prompts:
    - index.md
    - (generated) individual prompt pages
- Future: consider `mkdocs-gen-files` for auto-generation

## Verification Checkpoint
- Prompt fetch via raw GitHub works without auth
- Diff preview renders correctly (existing/new)
- Writes succeed with token; conflicts handled
- MkDocs build includes prompt docs under `Prompts`

🎨🎨🎨 EXITING CREATIVE PHASE: ARCHITECTURE
