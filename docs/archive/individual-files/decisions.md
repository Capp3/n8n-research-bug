# Creative Decisions

This page summarizes key decisions made during creative phases.

## UI/UX
- Two-step form (Intake → Confirm) for safety and clarity
- LLM Template dropdown populated via `prompts/index.json`
- Submission Brief (required) and Writing Style Instructions (optional)

## Architecture
- Prompt fetch via raw GitHub index (`index.json` → `.md`)
- Diff via jsdiff locally; writes via GitHub Contents API
- Assembly: system prompt + agent user prompt template (+ style instructions; + submission brief on initial)

## Algorithm
- GET with retry and TTL cache for index/template
- Deterministic envelope assembly
- Unified diff with truncation limits
- System prompt retrieval mode = inline (for now)

## Follow-ups
- Evaluate shared vs agent-specific system prompts (see `system-prompts.md`)
- Consider remote system prompt retrieval (shared/per-agent) if needed
- Explore preset writing style dropdown as a future enhancement
