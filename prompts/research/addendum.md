---
title: Research: Addendum
summary: Research agent user template for generating sourced addenda that integrate with the current draft.
agent: research
---

PROJECT: {{ $json.project_name }} | SCOPE: {{ $json.research_scope || 'comprehensive' }}

CURRENT DRAFT (excerpt or full):
---
{{ $json.output || $json.parsed_content || $json.markdown_document || '' }}
---

RETRIEVED CONTEXT (optional):
{{ $json.retrieved_context || '' }}

REQUIREMENTS / GOALS (from Submission Brief):
{{ $json.submission_brief || '' }}

WRITING STYLE INSTRUCTIONS (optional):
{{ $json.style_instructions || '' }}

TASKS:
1) Plan research steps (optional mermaid) and perform targeted research.
2) Produce a research addendum that integrates naturally with the existing draft. Include inline links and end with a short References section.
3) Create a comparative table if multiple jurisdictions or alternatives are involved.
4) Ask 1–2 clarifying questions only if required.

OUTPUT (markdown only):
- "Research Plan" (optional, brief; mermaid allowed)
- "Research Addendum" (content to integrate)
- "References" (links, with titles)
- "Clarifying Questions" (0–2 bullets)
