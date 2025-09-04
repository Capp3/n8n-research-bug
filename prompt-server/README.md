# Prompt Server

A lightweight HTTP GET endpoint server for retrieving prompt templates and system prompts with caching and error handling.

## Features

- **Prompt Template Retrieval**: Fetch agent user prompt templates from a GitHub repository
- **System Prompt Generation**: Generate system prompts using a hybrid approach (shared core + agent-specific addenda)
- **Caching**: In-memory caching with configurable TTL for all remote resources
- **Error Handling**: Retry logic with exponential backoff for transient errors
- **Frontmatter Parsing**: Parse YAML frontmatter from markdown templates
- **Configurable**: Environment variables for all settings

## API Endpoints

### GET /api/health
Health check endpoint.

### GET /api/prompts
Get list of all available prompts.

Query parameters:
- `ui_visible=true` - Filter prompts that should be shown in UI

### GET /api/prompts/:id
Get a specific prompt by ID.

Query parameters:
- `include_system=true` - Include the system prompt for the agent type

### GET /api/system-prompt/:agent
Get system prompt for a specific agent type.

Supported agent types:
- `editor`
- `research`
- `reviewer`
- `editor_merge`

### GET /api/config
Get server configuration.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   cd prompt-server
   npm install
   ```
3. Copy the example environment file:
   ```
   cp .env.example .env
   ```
4. Edit `.env` to configure your settings
5. Start the server:
   ```
   npm start
   ```

## Development

Run in development mode with auto-reload:
```
npm run dev
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| NODE_ENV | Environment | development |
| PROMPTS_INDEX_URL | URL to prompts index.json | https://raw.githubusercontent.com/... |
| PROMPTS_BASE_RAW | Base URL for raw content | https://raw.githubusercontent.com/... |
| SYSTEM_PROMPT_MODE | Mode for system prompts (inline/shared_url/per_agent_urls) | inline |
| SYSTEM_PROMPT_URL | URL for shared system prompt (if mode=shared_url) | |
| SYSTEM_PROMPTS_INDEX_URL | URL for system prompts index (if mode=per_agent_urls) | |
| INDEX_TTL_MS | Cache TTL for index.json | 300000 (5m) |
| TEMPLATE_TTL_MS | Cache TTL for templates | 300000 (5m) |
| SYS_TTL_MS | Cache TTL for system prompts | 300000 (5m) |
| HTTP_TIMEOUT_MS | HTTP request timeout | 10000 (10s) |
| RETRY_COUNT | Number of retry attempts | 2 |
| MAX_PROMPT_SIZE | Maximum prompt size in bytes | 204800 (200KB) |
| MAX_DOC_SIZE | Maximum document size in bytes | 512000 (500KB) |

## Usage with n8n

In your n8n workflow:

1. Use the HTTP Request node to fetch available prompts:
   ```
   GET http://localhost:3000/api/prompts?ui_visible=true
   ```

2. Use the results to populate a dropdown in a Form node

3. When a prompt is selected, fetch the prompt template and system prompt:
   ```
   GET http://localhost:3000/api/prompts/{{$json.promptId}}?include_system=true
   ```

4. Use the response to assemble the LLM input:
   ```javascript
   // Function node for assembling LLM input
   const systemPrompt = $json.system_prompt;
   const userPromptTemplate = $json.template;
   const styleInstructions = $json.style_instructions || '';
   const submissionBrief = $json.submission_brief || '';
   const userDoc = $json.markdown_document || '';
   
   // Assemble the final prompt
   const modelInput = `[[SYSTEM]]
   ${systemPrompt}
   
   [AgentPrompt]
   ${userPromptTemplate}
   
   [WritingStyleInstructions]
   ${styleInstructions || 'N/A'}
   
   [SubmissionBrief]
   ${submissionBrief || 'N/A'}
   
   [[USER_DOCUMENT]]
   ${userDoc}`;
   
   return { json: { ...items[0].json, modelInput } };
   ```

## Testing

Run tests:
```
npm test
```
