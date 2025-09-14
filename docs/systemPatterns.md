# System Patterns

- Multi-agent pipeline in n8n:
  - Editor → Research → Reviewer → Merge → Ongoing Chat
- Conversation memory via PostgreSQL + pgvector powering context retrieval for agents
- Research via MCP servers (self-hosted preferred): Firecrawl, Searxng
- GitHub as document store for file creation/updates and version control
- Telegram as the chat interface for ongoing conversation and notifications
- Prompt templates fetched via HTTP and applied consistently across agents
- Strict, incremental improvements with conversation loop and citations

References: `../projectbrief.md`, `../support/compose.yml`.
