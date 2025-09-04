---
title: Reviewer: QA Notes
summary: Reviewer agent user template for structure/tone/citations QA with actionable notes and flags.
agent: reviewer
---

INPUTS:
- Draft: {{ $json.output || $json.parsed_content || '' }}
- Research Addendum: {{ $json.research_addendum || '' }}
- Analyzer Findings (Context7): {{ $json.body || '' }}

WRITING STYLE INSTRUCTIONS (optional):
{{ $json.style_instructions || '' }}

TASKS:
1) Provide bullet-point reviewer notes (specific, actionable).
2) Identify quality flags (structure, tone, citations, completeness).
3) Ask 1 focused clarifying question only if a blocker exists.

OUTPUT (markdown only):
- "Reviewer Notes" (bullets)
- "Quality Flags" (bullets)
- "Clarifying Question" (optional, single bullet)
