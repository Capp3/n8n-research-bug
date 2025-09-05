# ⚙️ CREATIVE PHASE: Algorithm – Retrieval, Caching, Assembly, Diff

🎨🎨🎨 ENTERING CREATIVE PHASE: ALGORITHM

## Component Description
Define lean algorithms for:
- Fetching `index.json` and selected prompt `.md` (public raw GitHub)
- Optional short-lived caching to reduce latency and rate usage
- Assembling LLM input from: user markdown + agent system prompt + agent user prompt template + optional Writing Style Instructions; Submission Brief included only on initial run
- Computing human-friendly unified diffs for preview

## Requirements & Constraints
- Public HTTP GET, no auth for prompt source
- Predictable, low-latency behavior with retries
- Respect GitHub rate limits; avoid excessive calls
- Keep memory and compute constrained for n8n Function nodes

## Options

### Retrieval & Caching
- Option R1: No cache, direct GET on each run
  - Pros: Simplest; Cons: More calls, higher latency
- Option R2: In-workflow ephemeral cache (recommended)
  - Store `index.json` and prompt text in a variable with TTL (e.g., 5 minutes)
  - Pros: Fewer calls, faster; Cons: Slight complexity
- Option R3: External cache (KV store)
  - Pros: Scales; Cons: Infra overhead

Decision: R2 (ephemeral cache) with TTL; fallback to R1 if not supported.

### Assembly
- Option A1: Concatenate prompt text + style preset + user doc (recommended)
  - Deterministic envelope with simple markers
- Option A2: YAML frontmatter merge
  - More structure; adds parsing complexity

Decision: A1. Keep envelope minimal and explicit.

### Diff
- Option D1: jsdiff unified diff (recommended)
  - O(n) on input size; readable; easy to render in markdown
- Option D2: Word-level diff
  - More granular; noisier for markdown docs

Decision: D1 with size guard and truncation for preview.

## Algorithms

### 1) GET with Retry and TTL Cache
- Inputs: url, timeoutMs, retryCount, ttlMs, cacheKey
- Process:
  1. If cache[cacheKey] exists and not expired → return cached.value
  2. For attempt in [1..retryCount]:
     - fetch(url, {timeout: timeoutMs})
     - if 2xx → cache[cacheKey] = {value, exp: now+ttlMs}; return value
     - if 429/403 rate-limited → backoff (exp attempt * 300ms)
     - else continue
  3. Throw last error
- Complexity: O(1) per call ignoring payload size

### 2) Prompt Assembly (Envelope)
- Inputs: userDoc (string), systemPrompt (string), userPromptTemplate (string), styleInstructions (string | optional), submissionBrief (string | optional on initial only)
- Output: modelInput (string)
- Template:
```
[[SYSTEM]]
{{systemPrompt}}

[AgentPrompt]
{{userPromptTemplate}}

[WritingStyleInstructions]
{{styleInstructions || 'N/A'}}

[SubmissionBrief]
{{submissionBrief || 'N/A'}}

[[USER_DOCUMENT]]
{{userDoc}}
```
- Complexity: O(n) with n = combined length of strings

### 3) Unified Diff (Preview)
- Inputs: existingText (string | null), newText (string)
- If existingText == null → mark as New File; preview first N lines
- Else: use jsdiff.createTwoFilesPatch(name1, name2, existingText, newText)
- Truncate preview to DIFF_PREVIEW_MAX_CHARS
- Complexity: O(n) on total text length

## Edge Cases
- index.json malformed → show error and stop selection
- prompt `.md` empty/huge → enforce size limits; warn if truncated
- user doc extremely large → cap size; notify user
- network flaps → retries; fail with clear message
- diff too large → truncate preview with note

## Parameters & Defaults
- RETRY_COUNT: 2
- HTTP_TIMEOUT_MS: 10000
- INDEX_TTL_MS: 300000 (5m)
- DIFF_PREVIEW_MAX_CHARS: 2000
- MAX_DOC_SIZE: 500KB
- MAX_PROMPT_SIZE: 200KB

## Verification Checkpoint
- Retrieval honors retry/backoff and TTL cache
- Assembly envelope deterministic and minimal
- Diff preview readable and truncated within limits
- Large inputs guarded with helpful messaging
- System prompt resolved for the active agent (inline or fetched)

## Prompt Retrieval with Two-Part Model

### Requirements
- Retrieve agent user prompt templates from `prompts/index.json` and corresponding `.md` files
- Provide system prompt(s) via one of: inline constant, shared remote URL, or per-agent remote URLs
- Minimize network calls via TTL cache; validate schemas and sizes

### Options for System Prompt Retrieval
- Option SP1: Inline system prompt(s) in workflow (RECOMMENDED for reliability)
  - Pros: Zero network dependency; deterministic; fastest
  - Cons: Requires workflow update to change prompt text
- Option SP2: Single shared system prompt via remote URL
  - Pros: Central update point; consistent across agents
  - Cons: Single point of failure; still no per-agent nuance
- Option SP3: Per-agent system prompts via remote URLs (with `system-prompts/index.json`)
  - Pros: Maximum flexibility
  - Cons: More moving parts; requires new index and schema validation

Decision: SP1 now (inline). Plan SP2/SP3 as future enhancement if dynamic updates are needed.

### Index Schema v2 (for agent templates)
- Keep current `prompts/index.json` structure and add optional fields for forward-compatibility:
```json
{
  "id": "form-initial",
  "name": "Form: Initial Enhancement",
  "path": "prompts/form/initial.md",
  "description": "Initial tone for form submissions",
  "tags": ["form", "initial"],
  "agent": "editor",
  "requires": ["submission_brief"],
  "optional": ["style_instructions"],
  "schema_version": 2
}
```
- Validation: unknown fields ignored; default behavior if `requires` missing

### Updated Retrieval Algorithm
1) GET `index.json` (TTL cache INDEX_TTL_MS)
2) Populate dropdown from entries
3) On selection, GET template `.md` at `path` (TTL cache TEMPLATE_TTL_MS)
4) Resolve system prompt by `SYSTEM_PROMPT_MODE`:
   - `inline`: use configured constant
   - `shared_url`: GET `SYSTEM_PROMPT_URL` (TTL cache SYS_TTL_MS)
   - `per_agent_urls`: GET from `SYSTEM_PROMPTS_INDEX_URL` then fetch agent-specific `.md`
5) Assemble model input with template + system prompt + `style_instructions` (+ `submission_brief` on initial only)

### Caching & Keys
- `cache[indexUrl]` → index.json
- `cache[templatePath]` → template `.md`
- `cache[systemPromptUrl]` (if remote) → system prompt text
- Eviction: time-based TTL; clear on selection change when necessary

### Schema & Content Validation
- JSON schema check for index.json (basic: array of objects with `id`, `name`, `path`)
- Size guards: `MAX_PROMPT_SIZE`, `MAX_DOC_SIZE`
- Encoding: enforce UTF-8; strip BOM; trim trailing whitespace
- Frontmatter: allow YAML frontmatter; parse or strip safely

### Parameters & Defaults (additions)
- SYSTEM_PROMPT_MODE: `inline` | `shared_url` | `per_agent_urls` (default: `inline`)
- SYSTEM_PROMPT_URL: string (used when mode = shared_url)
- SYSTEM_PROMPTS_INDEX_URL: string (used when mode = per_agent_urls)
- TEMPLATE_TTL_MS: 300000 (5m)
- SYS_TTL_MS: 300000 (5m)

🎨🎨🎨 EXITING CREATIVE PHASE: ALGORITHM
