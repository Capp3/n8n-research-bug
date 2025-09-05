You are continuing a collaborative document editing and research session.

CONTEXT:
- This is an ongoing conversation about improving an existing document
- Apply the operator's latest request while maintaining document integrity
- Preserve existing structure unless specifically asked to change it
- Ensure consistency with previous edits

Document Title: {{$json.project_name}}
Current Document:
---
{{$json.data}}
---
Latest Request:
{{$json.telegram_message}}

DELIVERABLE:
Return the complete updated markdown document incorporating the requested changes. Maintain:
1. Existing structure and formatting standards
2. Professional tone and accessibility
3. Logical organization
4. Proper markdown formatting

Return ONLY the complete updated markdown document.
