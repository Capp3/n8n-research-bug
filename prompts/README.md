# Simplified Prompt System

This directory contains the simplified prompt system for the n8n Research Bug project. The system uses direct GitHub raw URLs and embedded system prompts instead of a complex prompt server.

## Structure

### System Prompts (`system-prompts/`)
These prompts define the behavior and capabilities of each AI agent:
- `editor.md` - Editor agent system prompt
- `research.md` - Research agent system prompt  
- `reviewer.md` - Reviewer agent system prompt
- `editor-merge.md` - Editor merge agent system prompt

### User Prompts (`user-prompts/`)
These prompts define the specific tasks and context for each workflow step:
- `form-initial.md` - Initial document enhancement from form submission
- `telegram-ongoing.md` - Ongoing document editing via Telegram
- `research-addendum.md` - Research agent task for creating addenda
- `reviewer-qa.md` - Reviewer agent task for QA notes
- `editor-merge-final.md` - Final merge task for combining all elements

## Usage in n8n Workflow

### System Prompts
System prompts are embedded directly in AI Agent nodes:

```json
{
  "parameters": {
    "text": "=You are a professional document collaborator operating in a multi-agent workflow...",
    "options": {}
  },
  "name": "AI Agent - Initial Enhancement"
}
```

### User Prompts
User prompts are fetched via HTTP Request nodes:

```json
{
  "parameters": {
    "url": "=https://raw.githubusercontent.com/Capp3/n8n-research-bug/main/prompts/user-prompts/form-initial.md",
    "method": "GET",
    "options": {}
  },
  "name": "Fetch Form Initial Prompt"
}
```

Then used in AI Agent nodes:

```json
{
  "parameters": {
    "text": "={{$json.form_initial_prompt}}",
    "options": {}
  },
  "name": "AI Agent - Initial Enhancement"
}
```

## Variable Substitution

All prompts support n8n variable substitution using `{{$json.variable_name}}` syntax:

- `{{$json.project_name}}` - Project name from form
- `{{$json.markdown_document}}` - Initial document content
- `{{$json.submission_brief}}` - Research requirements
- `{{$json.telegram_message}}` - Telegram message content
- `{{$json.retrieved_context}}` - Retrieved context from database
- `{{$json.research_scope}}` - Research scope setting

## Benefits

- **Simple**: No complex server or caching logic
- **Reliable**: Direct GitHub access with n8n error handling
- **Maintainable**: Easy to edit and understand
- **Fast**: No server overhead or complex processing
- **Flexible**: Easy to add new prompts or modify existing ones

## GitHub Raw URLs

All prompts are accessible via GitHub raw URLs:
```
https://raw.githubusercontent.com/Capp3/n8n-research-bug/main/prompts/user-prompts/[filename].md
https://raw.githubusercontent.com/Capp3/n8n-research-bug/main/prompts/system-prompts/[filename].md
```
