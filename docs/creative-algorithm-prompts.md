# ⚙️ CREATIVE PHASE: Algorithm – Retrieval, Caching, Assembly, Diff

🎨🎨🎨 ENTERING CREATIVE PHASE: ALGORITHM

## Component Description
Define lean algorithms for:
- Fetching `index.json` and selected prompt `.md` (public raw GitHub)
- Optional short-lived caching to reduce latency and rate usage
- Assembling LLM input from: user markdown + selected prompt text + writing style preset
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
- Inputs: userDoc (string), promptText (string), stylePreset (enum)
- Output: modelInput (string)
- Template:
```
[[SYSTEM]]
You are an editor. Apply the following prompt and style to the user document.

[Prompt]
{{promptText}}

[WritingStyle]
{{stylePreset}}

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

🎨🎨🎨 EXITING CREATIVE PHASE: ALGORITHM
