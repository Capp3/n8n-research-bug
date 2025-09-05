# Prompt System Simplification Plan

**Date**: 2025-01-28  
**Mode**: CREATIVE  
**Task**: Simplify overly complex prompt system  
**Status**: PLANNING

## 🎨🎨🎨 ENTERING CREATIVE PHASE: SYSTEM SIMPLIFICATION

## Component Description

The prompt system simplification component involves replacing the complex prompt-server with a simple, direct approach using GitHub raw URLs and embedded system prompts in the n8n workflow. This eliminates unnecessary complexity while maintaining all required functionality.

## Requirements & Constraints

1. **Eliminate Prompt Server**: Remove the entire Node.js prompt-server application
2. **Direct GitHub Access**: Use GitHub raw URLs for prompt retrieval via n8n HTTP Request nodes
3. **Embedded System Prompts**: Include system prompts directly in the n8n workflow
4. **Standalone Prompts**: Each prompt should be self-contained with n8n variable substitution
5. **Simple Organization**: Maintain folder structure but keep it simple
6. **No Runtime Scripts**: Avoid any server-side processing or complex logic

## Current System Analysis

### Current Complexity Issues
- **Prompt Server**: 626 lines of complex Node.js code with caching, retry logic, frontmatter parsing
- **Multiple Configuration Modes**: inline, shared_url, per_agent_urls with complex resolution logic
- **Over-Engineering**: TTL caching, exponential backoff, size limits, error handling
- **Unnecessary Abstraction**: JSON index file, complex metadata schema
- **Rate Limiting Concerns**: Complex caching system for simple use case

### Current Usage Pattern
- **Low Frequency**: Only 10 pulls per workflow run
- **Long Intervals**: 1-2 minutes between Telegram messages
- **Simple Needs**: Just fetch markdown files and substitute variables
- **GitHub Hosted**: All prompts already in GitHub repository

## Simplified Architecture Design

### New System Structure
```
prompts/
├── system-prompts/
│   ├── editor.md
│   ├── research.md
│   ├── reviewer.md
│   └── editor-merge.md
├── user-prompts/
│   ├── form-initial.md
│   ├── telegram-ongoing.md
│   ├── research-addendum.md
│   ├── reviewer-qa.md
│   └── editor-merge-final.md
└── README.md
```

### n8n Workflow Integration
- **System Prompts**: Embedded directly in AI Agent nodes
- **User Prompts**: Fetched via HTTP Request nodes to GitHub raw URLs
- **Variable Substitution**: Handled by n8n's built-in `{{$json.variable}}` syntax
- **No Caching**: Accept HTTP requests as needed (rate limits not a concern)

## Implementation Plan

### Phase 1: Create Simplified Prompt Structure

#### Step 1.1: Create New Directory Structure
```bash
mkdir -p prompts/system-prompts
mkdir -p prompts/user-prompts
```

#### Step 1.2: Extract System Prompts
Create individual system prompt files:

**prompts/system-prompts/editor.md**:
```markdown
You are a professional document collaborator operating in a multi-agent workflow. Read the entire document before writing. Maintain the author's tone, improve clarity and structure, and strictly follow markdown best practices (heading hierarchy, concise paragraphs, meaningful bullets, tables when helpful). Work iteratively with focused changes. Ask concise clarifying questions only when necessary.

Be deterministic and consistent. Prefer explicit, scannable outputs. Use mermaid diagrams only for brief plan visualizations when it significantly improves clarity.

- Emphasize small, targeted edits per turn
- Ask up to 3 clarifying questions only when blockers exist
- Include brief mermaid only for plan clarity
```

**prompts/system-prompts/research.md**:
```markdown
You are a professional document collaborator operating in a multi-agent workflow. Read the entire document before writing. Maintain the author's tone, improve clarity and structure, and strictly follow markdown best practices (heading hierarchy, concise paragraphs, meaningful bullets, tables when helpful). Work iteratively with focused changes. Ask concise clarifying questions only when necessary.

Be deterministic and consistent. Prefer explicit, scannable outputs. Use mermaid diagrams only for brief plan visualizations when it significantly improves clarity.

- Use specialized MCP tools for comprehensive research:
  - Brave Search: Web search and current information
  - Wikipedia: Factual knowledge and references
  - HTTP Request: Additional API access
- Cite official/primary sources; include inline links and a short References section
- Prefer concise, scannable outputs; use tables for comparisons
- Ask at most 2 clarifying questions if direction is ambiguous
```

#### Step 1.3: Simplify User Prompts
Convert existing prompts to standalone format with n8n variables:

**prompts/user-prompts/form-initial.md**:
```markdown
You are starting a new collaborative document editing and research session.

TASK OVERVIEW:
- Analyze the provided document for structure, completeness, and clarity  
- Apply the operator's research requirements and expansion requests
- Conduct any necessary research to fulfill the requirements
- Create a comprehensive, well-structured document
- Ensure the document meets professional standards

Document Title: {{$json.project_name}}
Initial Document:
---
{{$json.markdown_document}}
---
Research and Expansion Requirements:
{{$json.submission_brief}}

DELIVERABLE:
Return a complete, enhanced markdown document that addresses all requirements. Include:
1. Improved structure and organization
2. Research findings integrated naturally  
3. Clear section divisions
4. Professional formatting
5. Table of contents if document exceeds 1000 words

Return ONLY the updated markdown document.
```

### Phase 2: Update n8n Workflow

#### Step 2.1: Embed System Prompts
Update AI Agent nodes to include system prompts directly:

```json
{
  "parameters": {
    "text": "=You are a professional document collaborator operating in a multi-agent workflow...",
    "options": {}
  },
  "name": "AI Agent - Initial Enhancement"
}
```

#### Step 2.2: Add HTTP Request Nodes for User Prompts
Add HTTP Request nodes to fetch user prompts:

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

#### Step 2.3: Update AI Agent Nodes
Modify AI Agent nodes to use fetched prompts:

```json
{
  "parameters": {
    "text": "={{$json.form_initial_prompt}}\n\nDocument Title: {{$json.project_name}}\nInitial Document:\n---\n{{$json.markdown_document}}\n---\nResearch and Expansion Requirements:\n{{$json.submission_brief}}",
    "options": {}
  },
  "name": "AI Agent - Initial Enhancement"
}
```

### Phase 3: Remove Prompt Server

#### Step 3.1: Remove Prompt Server Files
```bash
rm -rf prompt-server/
```

#### Step 3.2: Update Docker Compose
Remove prompt-server service from compose.yml

#### Step 3.3: Update Environment Variables
Remove prompt-server related environment variables from .env and sample.env

#### Step 3.4: Update Documentation
Update all documentation to reflect the simplified approach

## Benefits of Simplified Approach

### 1. **Dramatic Complexity Reduction**
- **Before**: 626 lines of Node.js code + complex configuration
- **After**: Simple HTTP requests in n8n workflow
- **Reduction**: ~95% complexity reduction

### 2. **Improved Reliability**
- **Before**: Complex caching, retry logic, error handling
- **After**: Simple HTTP requests with n8n's built-in error handling
- **Benefit**: Fewer failure points, easier debugging

### 3. **Better Performance**
- **Before**: Server startup time, caching overhead, complex logic
- **After**: Direct HTTP requests, no server overhead
- **Benefit**: Faster execution, lower resource usage

### 4. **Easier Maintenance**
- **Before**: Complex Node.js application with dependencies
- **After**: Simple markdown files and n8n workflow
- **Benefit**: Easier to understand, modify, and debug

### 5. **Simplified Deployment**
- **Before**: Docker container, environment variables, health checks
- **After**: No additional services required
- **Benefit**: Simpler deployment, fewer moving parts

## Implementation Details

### GitHub Raw URL Pattern
```
https://raw.githubusercontent.com/Capp3/n8n-research-bug/main/prompts/user-prompts/[filename].md
```

### n8n Variable Substitution
- Use `{{$json.variable_name}}` for dynamic content
- Support all existing variables: `project_name`, `markdown_document`, `submission_brief`, etc.
- No complex template engine needed

### Error Handling
- Use n8n's built-in HTTP Request error handling
- Simple retry logic if needed (n8n supports this)
- Fallback to embedded prompts if GitHub is unavailable

## Migration Strategy

### Step 1: Create New Structure
1. Create new prompt directories
2. Extract and simplify system prompts
3. Convert user prompts to standalone format

### Step 2: Update Workflow
1. Add HTTP Request nodes for user prompts
2. Embed system prompts in AI Agent nodes
3. Test with sample data

### Step 3: Remove Old System
1. Remove prompt-server directory
2. Update Docker Compose
3. Update environment variables
4. Update documentation

### Step 4: Testing
1. Test all workflow paths
2. Verify variable substitution works
3. Test error handling scenarios

## Verification Checkpoint

This simplified approach meets all requirements:
- ✅ **Eliminate Prompt Server**: Complete removal of complex Node.js application
- ✅ **Direct GitHub Access**: Simple HTTP requests to GitHub raw URLs
- ✅ **Embedded System Prompts**: System prompts included directly in workflow
- ✅ **Standalone Prompts**: Each prompt is self-contained with n8n variables
- ✅ **Simple Organization**: Clean folder structure with minimal complexity
- ✅ **No Runtime Scripts**: Pure n8n workflow with HTTP requests

🎨🎨🎨 EXITING CREATIVE PHASE

## Conclusion

This simplification plan transforms the prompt system from a complex, over-engineered solution to a simple, maintainable approach that meets all requirements while dramatically reducing complexity. The new system leverages n8n's built-in capabilities and GitHub's hosting, eliminating the need for custom server infrastructure.

The approach maintains all functionality while providing better reliability, performance, and maintainability. The migration can be done incrementally with minimal risk, and the resulting system will be much easier to understand and modify.
