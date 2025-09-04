# n8n LLM Document Workflow - Setup Guide

## Overview

This guide will help you import and configure the `llm-document-workflow.json` file in your n8n instance. This workflow uses n8n's native Form node, a multi-agent AI design (Editor, Researcher, Reviewer, Editor Merge, Ongoing Chat), a shared Memory Buffer Window, and a Context7 MCP analyzer step for content validation.

### Architecture Summary

The workflow proceeds in stages:
* **Form submission** captures project context and the initial document.
* **Initial Enhancement** agent drafts a structured version (uses system prompt + agent user prompt template; includes Submission Brief on first run and Writing Style Instructions if provided).
* **Retrieval system** searches for relevant context using semantic similarity.
* **Research agent** augments with addenda and citations (validated via Context7 analyzer).
* **Reviewer agent** provides quality notes and flags.
* **Editor Merge** produces the final markdown for GitHub.
* **Telegram integration** enables ongoing conversation updates using the same memory session.

## Prerequisites

### Required Services
- **n8n instance** (self-hosted or cloud)
- **GitHub repository** with API access
- **OpenAI API** account
- **PostgreSQL database** with pgvector extension
- **Telegram Bot** (optional, for ongoing chat)
- **Context7 MCP server** (optional, for content validation)

### Required Credentials
1. **GitHub API** - Repository access
2. **OpenAI API** - Embedding generation and AI processing
3. **PostgreSQL** - Vector database for similarity search
4. **Telegram Bot API** - Chat interface (optional)

## Step 1: Import the Workflow

1. **Download the workflow file**:
   - Get `llm-document-workflow.json` from the repository
   - This file contains all 27 nodes and their configurations

2. **Import into n8n**:
   - Open your n8n instance
   - Go to Workflows → Import from File
   - Select the `llm-document-workflow.json` file
   - Click "Import"

3. **Verify import**:
   - The workflow should show 27 nodes
   - Check that all nodes are properly connected
   - Verify the two trigger nodes (Form and Telegram)

## Step 2: Configure Credentials

### GitHub API Credentials
1. Go to Settings → Credentials → Add Credential
2. Select "GitHub API"
3. Configure with your GitHub token:
   ```yaml
   credential_type: "githubApi"
   credential_name: "GitHub API"
   credential_id: "github-credentials"
   access_token: "ghp_your_token_here"
   ```

### OpenAI API Credentials
1. Add new credential → "OpenAI"
2. Configure with your OpenAI API key:
   ```yaml
   credential_type: "openAiApi"
   credential_name: "OpenAI API"
   credential_id: "openai-credentials"
   api_key: "sk-your_key_here"
   ```

### PostgreSQL Credentials
1. Add new credential → "Postgres"
2. Configure database connection:
   ```yaml
   credential_type: "postgres"
   credential_name: "PostgreSQL"
   credential_id: "postgres-credentials"
   host: "your-db-host"
   database: "your-database"
   user: "your-username"
   password: "your-password"
   port: 5432
   ```

### Telegram Bot Credentials (Optional)
1. Create a bot via @BotFather on Telegram
2. Add credential → "Telegram"
3. Configure with bot token:
   ```yaml
   credential_type: "telegramApi"
   credential_name: "Telegram Bot"
   credential_id: "telegram-credentials"
   access_token: "your_bot_token"
   ```

## Step 3: Database Setup

### PostgreSQL with pgvector
1. **Install pgvector extension**:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

2. **Create the documents table**:
   ```sql
   CREATE TABLE documents (
       id SERIAL PRIMARY KEY,
       conversation_id VARCHAR(255) NOT NULL,
       content TEXT NOT NULL,
       embedding vector(1536),
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **Create index for similarity search**:
   ```sql
   CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
   ```

## Step 4: Environment Configuration

### Required Environment Variables
Set these in your n8n environment:

```bash
# Context7 MCP Server (optional)
CONTEXT7_API_BASE=https://your-context7-server.com

# Database connection (if not using credentials)
DATABASE_URL=postgresql://user:password@host:port/database

# GitHub configuration
GITHUB_OWNER=your-username
GITHUB_REPO=your-repository
```

## Step 5: Workflow Configuration

### Form Configuration
The Document Editor Form captures:
- **Project Name**: Unique identifier for the document
- **Markdown Document**: Initial document content
- **Submission Brief**: User requirements and goals
- **Style Instructions**: Writing style preferences (optional)
- **Research Scope**: basic/comprehensive/regulatory
- **GitHub Owner/Repo**: Target repository

### AI Agent Configuration
Each AI agent uses:
- **System Prompt**: Core instructions and guidelines
- **User Prompt Template**: Agent-specific prompt with variables
- **Temperature**: 0.7 for creative tasks, 0.3 for structured tasks
- **Model**: GPT-4 or equivalent

### Memory Buffer Configuration
- **Window Size**: 10-20 conversation turns
- **Storage**: Redis or PostgreSQL
- **Context Retrieval**: Semantic similarity search

## Step 6: Testing the Setup

### Test Form Submission
1. **Access the form**:
   - Go to your n8n instance
   - Find the "Document Editor Form" trigger
   - Click "Test" to get the form URL

2. **Submit test data**:
   ```yaml
   project_name: "test-document"
   markdown_document: "# Test Document\n\nThis is a test."
   submission_brief: "Test the workflow setup"
   research_scope: "basic"
   github_owner: "your-username"
   github_repo: "test-repo"
   ```

3. **Monitor execution**:
   - Check the workflow execution log
   - Verify each node completes successfully
   - Check GitHub for created files

### Test Telegram Integration (Optional)
1. **Start the bot**:
   - Send `/start` to your Telegram bot
   - The bot should respond with available commands

2. **Test conversation**:
   - Send a message to the bot
   - Verify it processes and responds
   - Check the workflow execution log

## Troubleshooting

### Common Issues

1. **Credential errors**
   - Verify all credentials are properly configured
   - Check credential IDs match workflow references
   - Test credentials individually

2. **Database connection issues**
   - Verify PostgreSQL is running and accessible
   - Check pgvector extension is installed
   - Validate table structure and indexes

3. **GitHub API errors**
   - Verify repository permissions
   - Check API rate limits
   - Validate file paths and content

4. **AI agent failures**
   - Check OpenAI API key and limits
   - Verify prompt templates are valid
   - Review agent configuration parameters

5. **Context7 analyzer errors**
   - Ensure `CONTEXT7_API_BASE` is set and reachable
   - Verify the `/mcp/document/analyze` endpoint exists
   - Check for CORS/firewall restrictions

6. **Retrieval issues (pgvector)**
   - Verify pgvector is installed and column type matches embedding size
   - Check that embeddings are being created and stored
   - Ensure similarity operator matches your index

### Debug Mode
Enable debug mode in n8n:
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

### Example Telegram Commands:
- "Add section about insurance requirements in Ireland"
- "Update the licensing fees table with current rates"
- "Include contact information for Irish aviation authority"
- "Compare UK and Ireland privacy laws for drone footage"

## Next Steps

1. **Customize prompts**: Modify agent prompts for your specific use case
2. **Configure validation**: Adjust Context7 validation rules
3. **Set up monitoring**: Implement logging and monitoring
4. **Scale deployment**: Consider Docker deployment for production

## Support

For issues with:
- **n8n setup**: Check n8n documentation
- **GitHub integration**: Verify repository permissions
- **OpenAI**: Check API documentation and rate limits
- **Telegram**: Review Telegram Bot API documentation

This workflow provides a complete foundation for AI-powered document editing with research capabilities. Customize the prompts, validation logic, and integrations based on your specific needs.
