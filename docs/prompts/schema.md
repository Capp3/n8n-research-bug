# Prompt Templates Schema

## Frontmatter fields (in `.md` templates)
- title (string): Human-readable name
- summary (string): Short description
- agent (string): One of `editor`, `research`, `reviewer`, `editor_merge`
- ui_visible (bool, optional): Whether to show in UI dropdown (default false)
- requires (array[string], optional): Required variables (e.g., `submission_brief`)
- optional (array[string], optional): Optional variables (e.g., `style_instructions`)
- schema_version (number, optional): Template schema version (default 1)

## Index file (`prompts/index.json`) v2 fields
- id (string): Stable identifier
- name (string): Display name
- path (string): Repository-relative path to `.md`
- description (string): Short description
- tags (array[string]): Keywords
- agent (string): Agent this template targets
- requires (array[string], optional)
- optional (array[string], optional)
- schema_version (number, optional)
- ui_visible (bool, optional)

## Notes
- The UI should list only entries with `ui_visible: true` (frontmatter or index) for user selection.
- Unknown fields must be ignored by the loader for forward compatibility.
- YAML frontmatter should be parsed safely; fallback to treating the entire file as template if parsing fails.
