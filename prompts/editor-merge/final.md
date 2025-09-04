---
title: Editor Merge: Final
summary: Editor Merge agent user template for integrating all pieces into a coherent final markdown.
agent: editor_merge
---

PROJECT: {{ $json.project_name }}

CURRENT DRAFT:
---
{{ $json.output || $json.parsed_content || $json.markdown_document || '' }}
---

RESEARCH ADDENDUM:
{{ $json.research_addendum || '' }}

REVIEWER NOTES:
{{ $json.reviewer_notes || '' }}

WRITING STYLE INSTRUCTIONS (optional):
{{ $json.style_instructions || '' }}

TASKS:
1) Merge draft + addendum + reviewer notes into a single, final markdown.
2) Ensure heading hierarchy, integrated citations, and coherent flow.
3) Maintain tone and readability; include brief comparative tables where helpful.
4) If substantial reordering was performed, include a small mermaid diagram illustrating the final structure (optional, at end).

OUTPUT (markdown only):
Return ONLY the complete final markdown document.
