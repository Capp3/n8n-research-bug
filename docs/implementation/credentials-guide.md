# N8N Workflow Credentials Guide

## Overview

This document provides a comprehensive list of all credentials required for the LLM Document Conversation Workflow in n8n. Each credential is analyzed node-by-node with configuration examples and current variable requirements.

## Workflow Analysis Summary

The workflow contains **27 nodes** with **4 distinct credential types** required:
- GitHub API credentials (used by 4 nodes)
- OpenAI API credentials (used by 1 node)
- Telegram Bot API credentials (used by 3 nodes)
- PostgreSQL credentials (used by 1 node)

## Credential Requirements by Node

### 1. GitHub API Credentials

**Nodes Using This Credential:**
- `github-create-file` (GitHub Create File)
- `github-update-initial` (GitHub Update - Initial)
- `github-read-current` (GitHub Read Current)
- `github-update-ongoing` (GitHub Update - Ongoing)

**Credential ID:** `github-credentials`
**Credential Name:** `GitHub API`

**Configuration Example:**
```yaml
# GitHub API Credential Configuration
credential_type: "githubApi"
credential_name: "GitHub API"
credential_id: "github-credentials"

# Required Fields:
access_token: "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# OR for GitHub App:
app_id: "123456"
private_key: |
  -----BEGIN RSA PRIVATE KEY-----
  MIIEpAIBAAKCAQEA...
  -----END RSA PRIVATE KEY-----
installation_id: "789012"

# Optional Fields:
base_url: "https://api.github.com"  # Default for GitHub.com
```

**JSON Configuration:**
```json
{
  "credential_type": "githubApi",
  "credential_name": "GitHub API",
  "credential_id": "github-credentials",
  "access_token": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "base_url": "https://api.github.com"
}
```

**Setup Instructions:**
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token with scopes: `repo`, `workflow`, `write:packages`
3. Copy token and paste into n8n credential configuration
4. Test connection by running a simple GitHub API call

**Security Considerations:**
- Use fine-grained personal access tokens when possible
- Limit token scope to required repositories only
- Rotate tokens regularly
- Store tokens securely in n8n credential store

### 2. OpenAI API Credentials

**Nodes Using This Credential:**
- `embed-retrieval-query` (Embed Retrieval Query)

**Credential ID:** `openai-credentials`
**Credential Name:** `OpenAI API`

**Configuration Example:**
```yaml
# OpenAI API Credential Configuration
credential_type: "openAiApi"
credential_name: "OpenAI API"
credential_id: "openai-credentials"

# Required Fields:
api_key: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
organization_id: "org-xxxxxxxxxxxxxxxxxxxxxxxx"  # Optional

# Optional Fields:
base_url: "https://api.openai.com/v1"  # Default OpenAI endpoint
```

**JSON Configuration:**
```json
{
  "credential_type": "openAiApi",
  "credential_name": "OpenAI API",
  "credential_id": "openai-credentials",
  "api_key": "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "organization_id": "org-xxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Setup Instructions:**
1. Go to OpenAI Platform → API Keys
2. Create new secret key
3. Copy key and paste into n8n credential configuration
4. Test connection by running a simple embedding request

**Security Considerations:**
- Keep API keys secure and never commit to version control
- Monitor API usage and set spending limits
- Use organization ID for team accounts
- Consider using Azure OpenAI for enterprise deployments

### 3. Telegram Bot API Credentials

**Nodes Using This Credential:**
- `telegram-trigger` (Telegram Trigger)
- `error-notification` (Error Notification)
- `success-notification` (Success Notification)

**Credential ID:** `telegram-credentials`
**Credential Name:** `Telegram Bot API`

**Configuration Example:**
```yaml
# Telegram Bot API Credential Configuration
credential_type: "telegramApi"
credential_name: "Telegram Bot API"
credential_id: "telegram-credentials"

# Required Fields:
access_token: "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
```

**JSON Configuration:**
```json
{
  "credential_type": "telegramApi",
  "credential_name": "Telegram Bot API",
  "credential_id": "telegram-credentials",
  "access_token": "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
}
```

**Setup Instructions:**
1. Message @BotFather on Telegram
2. Send `/newbot` command
3. Follow prompts to create bot and get token
4. Copy token and paste into n8n credential configuration
5. Test by sending a message to your bot

**Security Considerations:**
- Keep bot tokens secure
- Use webhook mode for production deployments
- Implement rate limiting for bot interactions
- Monitor bot usage and implement abuse prevention

### 4. PostgreSQL Credentials

**Nodes Using This Credential:**
- `postgres-similarity-search` (Postgres Similarity Search)

**Credential ID:** `postgres-credentials`
**Credential Name:** `PostgreSQL`

**Configuration Example:**
```yaml
# PostgreSQL Credential Configuration
credential_type: "postgres"
credential_name: "PostgreSQL"
credential_id: "postgres-credentials"

# Required Fields:
host: "localhost"
database: "n8n_workflow"
user: "n8n_user"
password: "secure_password"
port: 5432

# Optional Fields:
ssl: true
ssl_cert: "/path/to/client-cert.pem"
ssl_key: "/path/to/client-key.pem"
ssl_ca: "/path/to/ca-cert.pem"
```

**JSON Configuration:**
```json
{
  "credential_type": "postgres",
  "credential_name": "PostgreSQL",
  "credential_id": "postgres-credentials",
  "host": "localhost",
  "database": "n8n_workflow",
  "user": "n8n_user",
  "password": "secure_password",
  "port": 5432,
  "ssl": true
}
```

**Setup Instructions:**
1. Install PostgreSQL with pgvector extension
2. Create database and user:
   ```sql
   CREATE DATABASE n8n_workflow;
   CREATE USER n8n_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE n8n_workflow TO n8n_user;
   ```
3. Install pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
4. Create required tables and indexes
5. Test connection from n8n

**Security Considerations:**
- Use strong passwords and limit user privileges
- Enable SSL/TLS for encrypted connections
- Implement connection pooling for production
- Regular security updates and monitoring

## Environment Variables

### Required Environment Variables
```bash
# Context7 MCP Server (optional)
CONTEXT7_API_BASE=https://your-context7-server.com

# Database connection (if not using credentials)
DATABASE_URL=postgresql://user:password@host:port/database

# GitHub configuration
GITHUB_OWNER=your-username
GITHUB_REPO=your-repository
```

### Optional Environment Variables
```bash
# OpenAI configuration
OPENAI_ORG_ID=org-xxxxxxxxxxxxxxxxxxxxxxxx

# Telegram configuration
TELEGRAM_WEBHOOK_URL=https://your-n8n-instance.com/webhook/telegram

# Logging configuration
LOG_LEVEL=info
N8N_LOG_LEVEL=info
```

## Credential Testing

### Test GitHub API
```bash
curl -H "Authorization: token YOUR_TOKEN" \
     https://api.github.com/user
```

### Test OpenAI API
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"input": "test", "model": "text-embedding-ada-002"}' \
     https://api.openai.com/v1/embeddings
```

### Test Telegram Bot
```bash
curl https://api.telegram.org/botYOUR_BOT_TOKEN/getMe
```

### Test PostgreSQL
```bash
psql -h localhost -U n8n_user -d n8n_workflow -c "SELECT version();"
```

## Troubleshooting

### Common Credential Issues

1. **GitHub API Rate Limits**
   - Check rate limit status: `curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit`
   - Implement exponential backoff in workflow
   - Consider using GitHub App instead of personal access token

2. **OpenAI API Errors**
   - Verify API key is valid and has sufficient credits
   - Check model availability and pricing
   - Monitor usage through OpenAI dashboard

3. **Telegram Bot Issues**
   - Verify bot token is correct
   - Check webhook configuration
   - Ensure bot is not blocked by users

4. **PostgreSQL Connection Issues**
   - Verify database is running and accessible
   - Check firewall and network connectivity
   - Validate user permissions and database existence

### Debug Steps
1. Test each credential individually
2. Check n8n execution logs for specific error messages
3. Verify environment variables are set correctly
4. Test API endpoints manually using curl or similar tools
5. Check network connectivity and firewall rules

## Security Best Practices

### General Security
- Use strong, unique passwords for all services
- Enable two-factor authentication where available
- Regularly rotate API keys and tokens
- Monitor usage and access logs
- Implement least-privilege access principles

### n8n Specific
- Store all credentials in n8n's secure credential store
- Never hardcode credentials in workflow code
- Use environment variables for non-sensitive configuration
- Regularly audit credential usage and permissions
- Implement proper backup and recovery procedures

### Production Deployment
- Use dedicated service accounts with minimal required permissions
- Implement proper network security and firewall rules
- Use SSL/TLS for all external communications
- Monitor and log all credential usage
- Implement automated security scanning and updates
