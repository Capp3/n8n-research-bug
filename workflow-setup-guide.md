# n8n LLM Document Workflow - Setup Guide

## Overview

This guide will help you import and configure the `llm-document-workflow.json` file in your n8n instance. This workflow uses n8n's native Form node, a multi-agent AI design (Editor, Researcher, Reviewer, Editor Merge, Ongoing Chat), a shared Memory Buffer Window, and a Context7 MCP analyzer step for content validation.

### Architecture Summary

The workflow proceeds in stages:
* **Form submission** captures project context and the initial document.
* **Initial Enhancement** agent drafts a structured version.
* **Retrieval system** searches for relevant context using semantic similarity.
* **Research agent** augments with addenda and citations (validated via Context7 analyzer).
* **Reviewer agent** provides quality notes and flags.
* **Editor Merge** produces the final markdown for GitHub.
* **Telegram integration** enables ongoing conversation updates using the same memory session.

### Complete Node List (27 nodes)

The workflow contains the following nodes:

**Form & Initialization (3 nodes):**
- Document Editor Form (n8n Form Trigger)
- Generate Conversation ID (Function)
- GitHub Create File (GitHub API)

**AI Processing Pipeline (8 nodes):**
- AI Agent - Initial Enhancement (LangChain Agent)
- Build Retrieval Query (Function)
- Embed Retrieval Query (HTTP Request)
- Postgres Similarity Search (PostgreSQL)
- Format Retrieved Context (Function)
- AI Agent - Research (LangChain Agent)
- Parse Research Output (Function)
- Context7 MCP - Document Analyzer (HTTP Request)

**Review & Merge (4 nodes):**
- AI Agent - Reviewer (LangChain Agent)
- Parse Review Output (Function)
- AI Agent - Editor Merge (LangChain Agent)
- Parse Initial Output (Function)

**Validation & Storage (3 nodes):**
- Validation Check (IF condition)
- GitHub Update - Initial (GitHub API)
- Store Conversation State (Function)

**Telegram Integration (6 nodes):**
- Telegram Trigger (Telegram Webhook)
- Conversation Lookup (Function)
- GitHub Read Current (GitHub API)
- AI Agent - Ongoing Chat (LangChain Agent)
- Parse Ongoing Output (Function)
- GitHub Update - Ongoing (GitHub API)

**Memory & Notifications (3 nodes):**
- Memory Buffer Window (LangChain Memory)
- Error Notification (Telegram API)
- Success Notification (Telegram API)

## Prerequisites

Before importing, ensure you have:

1. **n8n instance** (cloud or self-hosted) with AI nodes enabled
2. **GitHub account** with a repository for documents
3. **Telegram Bot** (created via @BotFather)
4. **LLM provider credentials** (OpenAI, Anthropic, or other supported providers)
5. **Required n8n node packages** installed (LangChain nodes)
6. **PostgreSQL database** with pgvector extension for embeddings
7. **Context7 MCP endpoint** URL (set `CONTEXT7_API_BASE` in your environment)

## Step 1: Import the Workflow

1. Open your n8n instance
2. Click **"Workflows"** in the sidebar
3. Click **"Import from File"** or **"Import from URL"**
4. Upload the `llm-document-workflow.json` file
5. The workflow will appear with 27 connected nodes

## Step 2: Configure Credentials

You'll need to set up these credentials:

### GitHub API Credentials
```
Credential Name: github-credentials
Type: GitHub API
Settings:
  - Access Token: [Your GitHub Personal Access Token]
  - Permissions needed: repo (full repository access)
```

### LLM Provider Credentials
Choose one of the following based on your preferred provider:

#### Option A: OpenAI Credentials
```
Credential Name: openai-credentials
Type: OpenAI API
Settings:
  - API Key: [Your OpenAI API Key]
```

#### Option B: Anthropic Credentials
```
Credential Name: anthropic-credentials
Type: Anthropic API
Settings:
  - API Key: [Your Anthropic API Key]
```

#### Option C: Other LLM Providers
Configure according to your chosen provider's requirements in the AI Agent node.

### Context7 MCP Configuration
```
Environment Variable: CONTEXT7_API_BASE
Example: https://context7.com
Used By: "Context7 MCP - Document Analyzer" node
Endpoint: /mcp/document/analyze
Payload: { content, project, scope }
```

**Important Notes:**
- The node uses `{{$env.CONTEXT7_API_BASE || 'https://context7.local'}}` with a fallback URL
- Default fallback `https://context7.local` will not work in production
- Authentication is set to "none" - add authentication if your Context7 instance requires it
- The node expects a JSON response from the analyzer endpoint
- If your Context7 endpoint requires authentication or a specific path, place a reverse proxy in front (for example with an API gateway) and keep the n8n node pointed at the stable base URL set in `CONTEXT7_API_BASE`

### Telegram Bot API Credentials
```
Credential Name: telegram-credentials
Type: Telegram API
Settings:
  - Access Token: [Your Telegram Bot Token from @BotFather]
```

### PostgreSQL Database Credentials
```
Credential Name: postgres-credentials
Type: Postgres
Settings:
  - Host: [Your PostgreSQL host]
  - Database: [Your database name]
  - Username: [Your PostgreSQL username]
  - Password: [Your PostgreSQL password]
  - Port: 5432 (default)
  - SSL: Enable if required
Requirements:
  - pgvector extension must be installed
  - Database schema must include chunks table (see schema below)
```

## Step 3: Configure n8n Form

1. **Activate the Document Editor Form node**
2. **Copy the form URL** from the node (something like: `https://your-n8n-instance.com/form/[form-id]`)
3. **The form is automatically generated** with these fields:
   - **Project Name**: Text input for document identification
   - **Markdown Document**: Large textarea for existing content
   - **Research Requirements**: Textarea for expansion requests
   - **Research Scope**: Dropdown (basic/comprehensive/regulatory)
   - **GitHub Owner**: Your GitHub username
   - **GitHub Repository**: Target repository name

4. **Share the form URL** with users who need to submit documents for AI enhancement
5. **The form includes built-in validation** and professional styling

## Step 4: Configure Telegram Bot

1. **Start your Telegram bot** (message @BotFather if needed)
2. **Get your bot token** and add it to credentials
3. **Activate the Telegram Trigger node**
4. **Test the bot** by sending it a message

## Step 5: Configure AI Agent Nodes

### AI Agent Configuration
Configure these nodes similarly, reusing the same provider credentials:

1. **AI Agent - Initial Enhancement (Editor - Draft)**
   - Purpose: Create the initial structured draft from form inputs.
   - Inputs: project_name, markdown_document, personal_thoughts.
   - Session ID: Uses `conversation_id` for memory persistence.
   - Prompt guidance: See "Prompt Templates" below.

2. **AI Agent - Research (Context7 Tools)**
   - Purpose: Generate research_addendum and citations.
   - Inputs: Retrieved context from semantic search, current draft, project scope.
   - Tools: Context7-derived tools invoked via analyzer or additional tool-exec (optional).
   - Session ID: Uses `conversation_id` to share memory.

3. **AI Agent - Reviewer**
   - Purpose: Provide reviewer_notes and quality_flags (style/structure).
   - Inputs: Research addendum, Context7 analyzer findings.
   - No tools. Deterministic QA focus.
   - Session ID: Uses `conversation_id` to share memory.

4. **AI Agent - Editor Merge**
   - Purpose: Merge draft + research_addendum + reviewer_notes into final markdown.
   - Inputs: Current draft, research addendum, reviewer notes.
   - Outputs feed the parser and GitHub update.
   - Session ID: Uses `conversation_id` to share memory.

5. **AI Agent - Ongoing Chat**
   - Purpose: Apply Telegram requests to current document.
   - Inputs: Current document from GitHub, Telegram message.
   - Use same credentials and memory session.
   - Session ID: Uses `conversation_id` to share memory.

### LLM Prompt Design Guidelines

Use these principles when tuning agent prompts:
* Be explicit about output: “Return ONLY valid markdown.”
* Constrain style: heading hierarchy, tables, bullet lists, and tone.
* Separate roles: Editor (structure), Researcher (facts + citations), Reviewer (QA), Editor Merge (final).
* Prefer determinism: keep temperature low for Reviewer and Editor Merge; allow slightly higher for Researcher if needed.
* Keep inputs small and focused: provide the exact context needed for each agent.

### Prompt Templates (copy/paste)

Use these templates as drop-in prompts for each AI Agent node. They are designed for iterative improvement with focused clarifying questions, tone preservation, and explicit use of memory and MCP resources. Replace placeholders with your node variable mapping as needed.

General rules (apply to all agents):
- Always read the entire current document before writing.
- Maintain the author’s tone and style; extend it consistently.
- Work in small, focused sections while following a grand plan.
- Ask at most 1–3 focused clarifying questions per turn when needed.
- Prefer deterministic settings for QA/merge agents; allow slight creativity for research.
- Outputs must be valid markdown; use mermaid diagrams only when helpful to explain a plan.

Resources available to agents:
- Conversation memory via Memory Buffer Window (session `{{$json.conversation_id}}`).
- Retrieved context: `{{$json.retrieved_context || ''}}`.
- Context7 Analyzer endpoint at `{{$env.CONTEXT7_API_BASE}}/mcp/document/analyze` (HTTP node in flow).
- Optional tool-exec HTTP for web/regulatory searches (JSON only, size-limited).

—

Agent: Editor – Initial Enhancement
System
```text
You are the Lead Editor. Your job is to assess, plan, and gently improve the document while preserving tone and intent. Read the entire document first, form a clear plan, then proceed iteratively in focused sections. Ask concise clarifying questions when critical information is missing.

Follow professional markdown standards: correct heading hierarchy, descriptive headings, tight paragraphs, bullets and tables where useful, and accessible language. Maintain the original voice and extend it consistently.

Use conversation memory (session: {{ $json.conversation_id }}) for continuity. When proposing a multi-step plan, include a brief mermaid diagram to visualize the flow.
```

Turn Prompt
```text
PROJECT: {{ $json.project_name }}
SCOPE: {{ $json.research_scope || 'comprehensive' }}

INITIAL DOCUMENT:
---
{{ $json.markdown_document }}
---

OPERATOR THOUGHTS / GOALS:
{{ $json.personal_thoughts || '' }}

RETRIEVED CONTEXT (optional):
{{ $json.retrieved_context || '' }}

TASKS:
1) Read the full document and summarize current strengths, gaps, and tone in 3–5 bullets.
2) Propose a high-level improvement plan broken into focused sections. If major changes are proposed, include a mermaid diagram outlining the editing flow.
3) Ask up to 3 specific clarifying questions if needed to proceed confidently.
4) Apply a first, light-touch improvement pass to the most impactful section only (do not rewrite everything at once). Preserve tone.

OUTPUT FORMAT (markdown only):
1. "Editor Assessment" (bullets)
2. "Improvement Plan" (bullets and optional mermaid)
3. "Clarifying Questions" (0–3 bullets)
4. "Updated Draft (Focused Section)" – include only the improved section(s)
```

—

Agent: Research – Addendum (tools-enabled)
System
```text
You are the Researcher. Produce factual, sourced additions that complement the current draft. Favor official and primary references. Keep content concise and scannable using tables where appropriate. When proposing research steps, include a small mermaid diagram to outline the plan.

Use available tools (web/regulatory search via tool-exec HTTP) and Context7 Analyzer for validation. Maintain the document’s tone and formatting conventions. Ask concise clarifying questions only if the research direction is ambiguous.
```

Turn Prompt
```text
PROJECT: {{ $json.project_name }} | SCOPE: {{ $json.research_scope || 'comprehensive' }}

CURRENT DRAFT (excerpt or full):
---
{{ $json.output || $json.parsed_content || $json.markdown_document || '' }}
---

RETRIEVED CONTEXT:
{{ $json.retrieved_context || '' }}

REQUIREMENTS / GOALS:
{{ $json.personal_thoughts || '' }}

TASKS:
1) Plan research steps (optional mermaid) and perform targeted research.
2) Produce a research addendum that integrates naturally with the existing draft. Include inline links and end with a short References section.
3) Create a comparative table if multiple jurisdictions or alternatives are involved.
4) Ask 1–2 clarifying questions only if required.

OUTPUT FORMAT (markdown only):
1. "Research Plan" (optional, brief; mermaid allowed)
2. "Research Addendum" (the content to integrate)
3. "References" (links, with titles)
4. "Clarifying Questions" (0–2 bullets)
```

—

Agent: Reviewer – QA Notes
System
```text
You are the Reviewer. Be deterministic and concise. Evaluate structure, clarity, tone consistency, and citation sufficiency. Provide specific, actionable notes and quality flags. Maintain the author’s tone in examples.
```

Turn Prompt
```text
INPUTS:
- Draft: {{ $json.output || $json.parsed_content || '' }}
- Research Addendum: {{ $json.research_addendum || '' }}
- Context7 Analyzer Findings: {{ $json.body || '' }}

TASKS:
1) Provide bullet-point reviewer notes (specific, actionable).
2) Identify quality flags (structure, tone, citations, completeness).
3) Ask 1 focused clarifying question only if a blocker exists.

OUTPUT FORMAT (markdown only):
- "Reviewer Notes" (bullets)
- "Quality Flags" (bullets)
- "Clarifying Question" (optional, single bullet)
```

—

Agent: Editor – Final Merge
System
```text
You are the Final Editor responsible for integrating all pieces into a coherent, polished document. Preserve the original tone and enhance clarity and structure. Read the entire document before writing. Keep deterministic settings for consistency.
```

Turn Prompt
```text
PROJECT: {{ $json.project_name }}

CURRENT DRAFT:
---
{{ $json.output || $json.parsed_content || $json.markdown_document || '' }}
---

RESEARCH ADDENDUM:
{{ $json.research_addendum || '' }}

REVIEWER NOTES:
{{ $json.reviewer_notes || '' }}

TASKS:
1) Merge draft + addendum + reviewer notes into a single, final markdown.
2) Ensure heading hierarchy, integrated citations, and coherent flow.
3) Maintain tone and readability; include brief comparative tables where helpful.
4) If substantial reordering was performed, include a small mermaid diagram illustrating the final structure (optional, at end).

OUTPUT (markdown only):
Return ONLY the complete final markdown document.
```

—

Agent: Ongoing Chat – Focused Edits
System
```text
You are the ongoing Editor. Apply targeted edits requested via Telegram while preserving tone and structure. Always read the entire current document first. Work in small, well-scoped changes and keep the document coherent as a whole.
```

Turn Prompt
```text
PROJECT: {{ $json.project_name }} | REQUEST: {{ $json.telegram_message }}

CURRENT DOCUMENT (from GitHub):
---
{{ $json.markdown_document || $json.output || $json.parsed_content || '' }}
---

TASKS:
1) Summarize the intent of the user’s request in 1–2 bullets.
2) Apply a focused update to the relevant section(s) only, preserving tone.
3) If the request is ambiguous, ask 1–2 clarifying questions.
4) If a broader plan emerges, append a short mermaid diagram for the multi-step path.

OUTPUT (markdown only):
Return ONLY the complete updated markdown document.
```

### Memory Buffer Window Configuration
1. **The Memory Buffer Window is pre-configured** with:
   - Session ID: Uses the conversation_id for persistence
   - Window size: 10 messages (k=10, adjustable)
   - Automatic memory management
   - Connected to all 5 AI Agent nodes via ai_memory connections

**Memory Connections:**
- AI Agent - Initial Enhancement
- AI Agent - Research (Context7 Tools)
- AI Agent - Reviewer
- AI Agent - Editor Merge
- AI Agent - Ongoing Chat

If you expect long sessions, consider pairing this with an external cache (for example, Redis) to store compact turn summaries keyed by `conversation_id`.

### Context7 MCP Analyzer Node
1. **Node Configuration:**
   - Type: HTTP Request
   - URL: `{{$env.CONTEXT7_API_BASE || 'https://context7.local'}}/mcp/document/analyze`
   - Method: POST
   - Authentication: None (configure if required)
   - Content-Type: application/json

2. **Request Payload:**
   ```json
   {
     "content": "{{$json.research_addendum || $json.output || $json.parsed_content || ''}}",
     "project": "{{$json.project_name}}",
     "scope": "{{$json.research_scope}}"
   }
   ```

3. **Setup Steps:**
   - Set `CONTEXT7_API_BASE` environment variable (for example `https://context7.com`)
   - The node sends JSON `{ content, project, scope }` from the Research output
   - Verify a 2xx response. Use the Execution log to inspect analyzer output
   - The analyzer response is passed to the Reviewer agent as `{{$json.body}}`

**Important:** The default fallback URL `https://context7.local` will not work in production. You must set a valid `CONTEXT7_API_BASE` environment variable.

Optional "Tool Exec" pattern: you can add a general-purpose HTTP Request node that accepts JSON tool-call payloads from the Research agent (for example, web_search, regulatory_database) and returns results the agent can consume. Keep the contract strict (JSON only) and limit result sizes for predictability.

Example tool-call envelope:
```json
{
  "tool": "web_search",
  "args": { "query": "drone insurance requirements Ireland 2025" },
  "max_results": 5
}
```
You can route this through Context7 if you expose these tools behind your Context7 deployment.

### Environment Variables (cheat sheet)
```
# Context7 Configuration (CRITICAL - must be valid endpoint)
CONTEXT7_API_BASE = https://your-actual-context7-endpoint.com
# DO NOT use the default 'https://context7.local' - it won't work

# LLM Provider
OPENAI_API_KEY    = ... (or ANTHROPIC_API_KEY, depending on provider)

# GitHub Integration
GITHUB_TOKEN      = ...

# Telegram Bot
TELEGRAM_TOKEN    = ...

# PostgreSQL Database (for embeddings)
POSTGRES_HOST     = your-postgres-host
POSTGRES_DB       = your-database-name
POSTGRES_USER     = your-username
POSTGRES_PASSWORD = your-password
```

### Conversation Lookup Node
```javascript
// Replace the simulated lookup with actual database integration
// Options: Redis, PostgreSQL, MongoDB, or n8n's built-in storage

// Example with n8n's built-in storage:
const conversationId = await this.helpers.getWorkflowStaticData('node')
  .conversations?.[chatId];
```

### Quality Scoring Functions
The `calculateStructureScore` and `calculateCompletenessScore` functions can be enhanced based on your specific requirements.

## Step 6: Test the Workflow

### Test Form Submission
1. Fill out your form with test data.
2. Submit the form.
3. Confirm multi-agent sequence in Executions: Editor → Research → Context7 → Reviewer → Editor Merge.
4. Check GitHub for the created/updated document.
5. Verify the conversation state is stored.

### Test Telegram Integration
1. Message your bot with editing requests.
2. Verify document updates in GitHub.
3. Check quality scores and notifications.

Validation checklist:
* ✅ **Retrieval flow**: Already connected and functional
* ✅ **Final commit messages**: Include word count and quality %
* ✅ **Research addendum**: Contains inline links and References section
* ✅ **Reviewer notes**: Present in execution data (not committed) and influence Editor Merge
* ✅ **Telegram edits**: Preserve structure and tone
* ⚠️ **Context7 setup**: Must configure valid `CONTEXT7_API_BASE` environment variable
* ⚠️ **Database setup**: Ensure PostgreSQL with pgvector extension is configured
* ⚠️ **Credentials**: All API credentials must be properly configured

## Step 7: Production Considerations

### Error Handling
- Add try-catch blocks in function nodes
- Implement retry logic for API calls
- Set up monitoring and alerting

### Security
- Use environment variables for sensitive data
- Implement rate limiting
- Add user authentication if needed

### Storage
- Replace simulated conversation storage with persistent storage
- Consider using Redis for fast lookups
- Implement cleanup for old conversations

### (Optional) Retrieval Layer with Postgres + pgvector

Add semantic retrieval if your Research agent needs deeper project memory:
1. After each GitHub update, chunk the markdown (1–2k tokens, ~10% overlap).
2. Embed each chunk (HTTP Request to your embedding provider).
3. Upsert embeddings into Postgres with pgvector.
4. Before the Research agent, run a similarity search (top‑k) and pass a formatted `retrieved_context` string into the Research prompt.

Example schema (simplified):
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  project_name TEXT NOT NULL,
  path TEXT NOT NULL,
  sha TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chunks (
  id UUID PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now()
);
```

In n8n, wire nodes: Chunk → Embed → Postgres Upsert (after initial/ongoing GitHub updates), and Similarity Search → Format Retrieved Context (before Research agent).

### Scaling
- Monitor API rate limits (OpenRouter, GitHub, Telegram)
- Consider implementing queues for high-volume usage
- Add load balancing if running multiple n8n instances

## Known Issues in Current Workflow

⚠️ **IMPORTANT**: The current workflow JSON contains several issues that need to be addressed:

### 1. **Retrieval Flow Connection** ✅ **FIXED**
- **Status**: The retrieval components are properly connected in the JSON
- **Flow**: AI Agent - Initial Enhancement → Build Retrieval Query → Embed Retrieval Query → Postgres Similarity Search → Format Retrieved Context → AI Agent - Research
- **Impact**: Semantic search is fully functional

### 2. **JavaScript Function Code Issues** ⚠️ **PARTIAL**
- **Status**: Most function nodes use correct syntax
- **Remaining Issue**:
  - "Format Retrieved Context": Uses `$items()` reference that may fail in some n8n versions
- **Fix Required**: Update to use `$input.first().json` for better compatibility

### 3. **Context7 Configuration Problems** ⚠️ **REQUIRES SETUP**
- **Issue**: Context7 MCP node has fallback URL that won't work in production
- **Problems**:
  - Default fallback URL `'https://context7.local'` is not accessible
  - Authentication set to "none" (may need configuration)
  - Endpoint `/mcp/document/analyze` must exist in your Context7 setup
- **Fix Required**: Set valid `CONTEXT7_API_BASE` environment variable

### 4. **Missing Error Handling** ⚠️ **ENHANCEMENT NEEDED**
- **Issue**: No retry logic or rate limiting
- **Impact**: Workflow may fail on temporary API issues
- **Fix Required**: Add error handling nodes and retry mechanisms

### 5. **Validation Check Configuration** ✅ **WORKING**
- **Status**: Validation Check node is properly connected and configured
- **Logic**: Checks `validation_passed` field from Parse Initial Output
- **Flow**: True path → GitHub Update, False path → Error Notification

## Required Fixes Before Use

### Fix 1: Retrieval Flow ✅ **ALREADY CONNECTED**
- **Status**: The retrieval flow is properly connected in the JSON file
- **Flow**: AI Agent - Initial Enhancement → Build Retrieval Query → Embed Retrieval Query → Postgres Similarity Search → Format Retrieved Context → AI Agent - Research
- **Action Required**: None - import and test

### Fix 2: Update Function Node Code (Optional)

**Build Retrieval Query node:** ✅ **ALREADY CORRECT**
```javascript
// Current code is correct:
const parts = [];
if ($json.project_name) parts.push($json.project_name);
if ($json.personal_thoughts) parts.push($json.personal_thoughts);
if ($json.telegram_message) parts.push($json.telegram_message);
const query = parts.join(' \n');
return [{ json: { ...items[0].json, retrieval_query: query.slice(0, 4000) } }];
```

**Format Retrieved Context node:** ⚠️ **OPTIONAL IMPROVEMENT**
```javascript
// Current code (works but could be improved):
const rows = items.map(i => i.json);
const ctx = rows.map(r => `- ${r.chunk}`).join('\n');
const base = $items("AI Agent - Initial Enhancement", 0, 0).json || {};
return [{ json: { ...base, retrieved_context: ctx } }];

// Recommended update for better compatibility:
const rows = $input.all().map(item => item.json);
const ctx = rows.map(r => `- ${r.chunk}`).join('\n');
const baseData = $input.first().json;
return [{ json: { ...baseData, retrieved_context: ctx } }];
```

### Fix 3: Update Context7 Configuration ⚠️ **REQUIRED**
1. **Set Environment Variable:**
   ```bash
   CONTEXT7_API_BASE=https://your-actual-context7-endpoint.com
   ```
   ⚠️ **CRITICAL**: Do not use the default `https://context7.local` - it will not work

2. **Verify Endpoint:**
   - Ensure `/mcp/document/analyze` endpoint exists in your Context7 setup
   - Test the endpoint manually before importing the workflow

3. **Add Authentication (if required):**
   - Change authentication from "none" to your preferred method
   - Add credentials if your Context7 instance requires authentication

4. **Test Configuration:**
   - Run a test execution to verify the Context7 node receives proper responses
   - Check execution logs for any HTTP errors or timeouts

### Fix 4: Validation Check Configuration ✅ **ALREADY WORKING**
- **Status**: Validation Check node is properly connected and configured
- **Logic**: Checks `validation_passed` field from Parse Initial Output
- **Condition:** `{{$json.validation_passed}}` equals `true`
- **True Path:** Goes to "GitHub Update - Initial"
- **False Path:** Goes to "Error Notification"
- **Action Required**: None - ready to use

## Troubleshooting

### Common Issues:

1. **Webhook not receiving data**
   - Check form action URL
   - Verify webhook is activated
   - Check n8n logs

2. **GitHub operations failing**
   - Verify repository exists
   - Check GitHub token permissions
   - Ensure file paths are correct

3. **AI Agent node errors**
   - Verify LLM provider credentials are correct
   - Check model availability and permissions
   - Monitor API rate limits and quotas
   - Ensure LangChain nodes are installed

5. **Context7 analyzer errors**
   - Ensure `CONTEXT7_API_BASE` is set and reachable (not the default `https://context7.local`)
   - Verify the `/mcp/document/analyze` endpoint exists in your Context7 setup
   - Inspect the analyzer node response body in the execution log
   - Validate that `content` sent is non-empty markdown
   - Check for CORS/firewall/network restrictions
   - Test the Context7 endpoint manually before running the workflow
   - Add authentication if your Context7 instance requires it

6. **Retrieval issues (pgvector)**
   - Verify pgvector is installed and column type matches your embedding size
   - Check that embeddings are being created and stored for new document versions
   - Ensure the similarity operator matches your index (e.g., ivfflat cosine)

7. **Memory drift**
   - Reduce Memory Buffer Window size or summarize turns into Redis
   - Keep Editor/Reviewer deterministic (low temperature) to stabilize outputs

4. **Telegram bot not responding**
   - Verify bot token
   - Check if bot is started
   - Review Telegram webhook settings

### Debug Mode
Enable debug mode in n8n to see detailed execution logs:
1. Go to Settings → Debug
2. Enable "Save Execution Progress"
3. Review execution details for failed runs

## Usage Examples

### Example Form Submission:
- **Project Name**: `drone-regulations-uk-ireland`
- **Markdown Document**: [Paste your existing drone regulation content]
- **Research Requirements**: `"Expand to include Republic of Ireland regulations, compare with UK requirements, add compliance checklist"`
- **Research Scope**: `regulatory`
- **GitHub Owner**: `your-username`
- **GitHub Repository**: `documents`

The multi-agent system will automatically:
- Editor: structure and format the document.
- Researcher: add researched content and citations (Context7 validated).
- Reviewer: provide quality notes and flags.
- Editor Merge: produce the final consolidated markdown.
- Memory: maintain context with Memory Buffer Window.

### Example Telegram Commands:
- "Add section about insurance requirements in Ireland"
- "Update the licensing fees table with current rates"
- "Include contact information for Irish aviation authority"
- "Compare UK and Ireland privacy laws for drone footage"

## Support

For issues with:
- **n8n setup**: Check n8n documentation
- **GitHub integration**: Verify repository permissions
- **OpenRouter**: Check API documentation and rate limits
- **Telegram**: Review Telegram Bot API documentation

This workflow provides a complete foundation for AI-powered document editing with research capabilities. Customize the prompts, validation logic, and integrations based on your specific needs.
