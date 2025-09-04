# Configuration Guide

## Overview

This guide covers all configuration aspects of the n8n LLM Document Workflow, including environment variables, system settings, and customization options.

## Environment Variables

### Required Variables

```bash
# Context7 MCP Server (optional but recommended)
CONTEXT7_API_BASE=https://your-context7-server.com

# Database connection (if not using credentials)
DATABASE_URL=postgresql://user:password@host:port/database

# GitHub configuration
GITHUB_OWNER=your-username
GITHUB_REPO=your-repository
```

### Optional Variables

```bash
# OpenAI configuration
OPENAI_ORG_ID=org-xxxxxxxxxxxxxxxxxxxxxxxx
OPENAI_BASE_URL=https://api.openai.com/v1

# Telegram configuration
TELEGRAM_WEBHOOK_URL=https://your-n8n-instance.com/webhook/telegram

# Logging configuration
LOG_LEVEL=info
N8N_LOG_LEVEL=info

# Performance tuning
N8N_PAYLOAD_SIZE_MAX=16777216
N8N_DEFAULT_BINARY_DATA_MODE=filesystem
```

## System Configuration

### n8n Configuration

#### Basic Settings
```json
{
  "endpoints": {
    "rest": "rest",
    "webhook": "webhook",
    "webhookWaiting": "webhook-waiting"
  },
  "timezone": "UTC",
  "execution": {
    "timeout": 3600,
    "maxTimeout": 3600
  }
}
```

#### Database Configuration
```json
{
  "database": {
    "type": "postgresdb",
    "host": "localhost",
    "port": 5432,
    "database": "n8n",
    "user": "n8n",
    "password": "password"
  }
}
```

#### Security Settings
```json
{
  "security": {
    "audit": {
      "daysAbandonedWorkflow": 90
    }
  }
}
```

### PostgreSQL Configuration

#### Database Setup
```sql
-- Create database
CREATE DATABASE n8n_workflow;

-- Create user
CREATE USER n8n_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE n8n_workflow TO n8n_user;

-- Install extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### Table Structure
```sql
-- Documents table for vector storage
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Index for conversation lookup
CREATE INDEX ON documents (conversation_id);
```

## Workflow Configuration

### Form Configuration

#### Form Fields
```yaml
form_fields:
  project_name:
    type: text
    required: true
    placeholder: "Enter project name"
  
  markdown_document:
    type: textarea
    required: true
    placeholder: "Paste your document content here"
  
  submission_brief:
    type: textarea
    required: true
    placeholder: "Describe your requirements and goals"
  
  style_instructions:
    type: textarea
    required: false
    placeholder: "Optional: Describe your preferred writing style"
  
  research_scope:
    type: select
    required: true
    options:
      - basic
      - comprehensive
      - regulatory
  
  github_owner:
    type: text
    required: true
    placeholder: "GitHub username or organization"
  
  github_repo:
    type: text
    required: true
    placeholder: "Repository name"
```

### AI Agent Configuration

#### Model Settings
```yaml
ai_agents:
  initial_enhancement:
    model: "gpt-4"
    temperature: 0.7
    max_tokens: 4000
    timeout: 300
  
  research:
    model: "gpt-4"
    temperature: 0.7
    max_tokens: 4000
    timeout: 300
  
  reviewer:
    model: "gpt-4"
    temperature: 0.3
    max_tokens: 2000
    timeout: 300
  
  editor_merge:
    model: "gpt-4"
    temperature: 0.5
    max_tokens: 4000
    timeout: 300
  
  ongoing_chat:
    model: "gpt-4"
    temperature: 0.7
    max_tokens: 2000
    timeout: 300
```

#### Prompt Configuration
```yaml
prompt_server:
  base_url: "http://localhost:3000"
  endpoints:
    system_prompt: "/api/system-prompt"
    user_prompt: "/api/prompts"
    health: "/api/health"
  
  caching:
    ttl: 3600
    max_size: 100
```

### Memory Buffer Configuration

#### Redis Configuration (if using Redis)
```yaml
redis:
  host: "localhost"
  port: 6379
  password: "password"
  db: 0
  
  memory_buffer:
    window_size: 20
    ttl: 86400
    max_memory: "100mb"
```

#### PostgreSQL Memory Configuration
```yaml
postgres_memory:
  table: "conversation_memory"
  window_size: 20
  cleanup_interval: 3600
```

## Integration Configuration

### GitHub Integration

#### Repository Structure
```
your-repository/
├── projects/
│   ├── project-name/
│   │   ├── initial.md
│   │   ├── final.md
│   │   └── versions/
│   │       ├── v1.md
│   │       └── v2.md
│   └── another-project/
└── templates/
    ├── research-template.md
    └── review-template.md
```

#### GitHub App Configuration
```yaml
github_app:
  app_id: "123456"
  installation_id: "789012"
  private_key_path: "/path/to/private-key.pem"
  
  permissions:
    contents: "write"
    metadata: "read"
    pull_requests: "write"
```

### Telegram Integration

#### Bot Configuration
```yaml
telegram_bot:
  token: "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
  webhook_url: "https://your-n8n-instance.com/webhook/telegram"
  
  commands:
    - command: "start"
      description: "Start a new conversation"
    - command: "help"
      description: "Show available commands"
    - command: "status"
      description: "Check workflow status"
```

#### Webhook Configuration
```yaml
webhook:
  path: "/webhook/telegram"
  method: "POST"
  timeout: 30
  
  security:
    secret_token: "your-secret-token"
    ip_whitelist: []
```

### Context7 MCP Configuration

#### Server Configuration
```yaml
context7:
  base_url: "https://your-context7-server.com"
  timeout: 30
  
  endpoints:
    analyze: "/mcp/document/analyze"
    validate: "/mcp/document/validate"
    health: "/mcp/health"
  
  authentication:
    type: "bearer"
    token: "your-api-token"
```

## Performance Configuration

### Caching Configuration

#### n8n Caching
```yaml
caching:
  enabled: true
  type: "memory"
  ttl: 3600
  
  redis:
    host: "localhost"
    port: 6379
    db: 1
```

#### Prompt Server Caching
```yaml
prompt_caching:
  enabled: true
  ttl: 3600
  max_size: 100
  
  cache_keys:
    system_prompts: "system:{agent}"
    user_prompts: "user:{prompt_id}"
    templates: "template:{template_id}"
```

### Resource Limits

#### Memory Limits
```yaml
memory_limits:
  workflow_execution: "512mb"
  node_execution: "128mb"
  data_processing: "256mb"
```

#### Timeout Configuration
```yaml
timeouts:
  workflow_execution: 3600
  node_execution: 300
  api_requests: 30
  database_queries: 10
```

## Security Configuration

### Authentication

#### n8n Authentication
```yaml
authentication:
  type: "ldap"  # or "oauth2", "saml"
  
  ldap:
    server_url: "ldap://your-ldap-server"
    bind_dn: "cn=admin,dc=example,dc=com"
    bind_password: "password"
    base_dn: "dc=example,dc=com"
    user_filter: "(uid={{username}})"
```

#### API Security
```yaml
api_security:
  rate_limiting:
    enabled: true
    requests_per_minute: 100
  
  cors:
    enabled: true
    origins: ["https://your-frontend.com"]
  
  headers:
    x_frame_options: "DENY"
    x_content_type_options: "nosniff"
    x_xss_protection: "1; mode=block"
```

### Data Protection

#### Encryption
```yaml
encryption:
  algorithm: "aes-256-gcm"
  key_rotation: 90  # days
  
  sensitive_fields:
    - "password"
    - "token"
    - "api_key"
    - "private_key"
```

#### Backup Configuration
```yaml
backup:
  enabled: true
  schedule: "0 2 * * *"  # Daily at 2 AM
  
  destinations:
    - type: "s3"
      bucket: "your-backup-bucket"
      path: "n8n-backups/"
    - type: "local"
      path: "/backups/n8n/"
  
  retention:
    days: 30
    weeks: 4
    months: 12
```

## Monitoring Configuration

### Logging

#### Log Levels
```yaml
logging:
  level: "info"
  format: "json"
  
  files:
    - path: "/var/log/n8n/workflow.log"
      level: "info"
    - path: "/var/log/n8n/error.log"
      level: "error"
  
  rotation:
    max_size: "100mb"
    max_files: 10
```

#### Metrics Collection
```yaml
metrics:
  enabled: true
  
  prometheus:
    enabled: true
    port: 9090
    path: "/metrics"
  
  custom_metrics:
    - name: "workflow_executions"
      type: "counter"
    - name: "node_execution_time"
      type: "histogram"
    - name: "api_requests"
      type: "counter"
```

### Health Checks

#### Health Check Endpoints
```yaml
health_checks:
  enabled: true
  
  endpoints:
    - path: "/health"
      method: "GET"
      timeout: 5
    
    - path: "/health/database"
      method: "GET"
      timeout: 10
    
    - path: "/health/external"
      method: "GET"
      timeout: 30
```

## Customization Options

### Workflow Customization

#### Custom Nodes
```yaml
custom_nodes:
  enabled: true
  
  directories:
    - "/custom-nodes"
    - "/community-nodes"
  
  whitelist:
    - "n8n-nodes-custom"
    - "n8n-nodes-community"
```

#### Custom Functions
```yaml
custom_functions:
  enabled: true
  
  directories:
    - "/custom-functions"
  
  modules:
    - "custom-utils"
    - "business-logic"
```

### UI Customization

#### Theme Configuration
```yaml
ui:
  theme: "dark"  # or "light"
  
  colors:
    primary: "#6366f1"
    secondary: "#8b5cf6"
    success: "#10b981"
    warning: "#f59e0b"
    error: "#ef4444"
  
  branding:
    logo: "/custom-logo.png"
    favicon: "/custom-favicon.ico"
```

## Configuration Validation

### Validation Script
```bash
#!/bin/bash
# validate-config.sh

echo "Validating n8n configuration..."

# Check environment variables
required_vars=("CONTEXT7_API_BASE" "GITHUB_OWNER" "GITHUB_REPO")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "ERROR: Required environment variable $var is not set"
        exit 1
    fi
done

# Check database connection
if ! pg_isready -h localhost -p 5432; then
    echo "ERROR: PostgreSQL is not accessible"
    exit 1
fi

# Check pgvector extension
if ! psql -h localhost -U n8n_user -d n8n_workflow -c "SELECT 1 FROM pg_extension WHERE extname = 'vector';" | grep -q "1"; then
    echo "ERROR: pgvector extension is not installed"
    exit 1
fi

echo "Configuration validation passed!"
```

### Configuration Testing
```bash
# Test GitHub API
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user

# Test OpenAI API
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Test Telegram Bot
curl https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe

# Test Context7 MCP
curl -H "Authorization: Bearer $CONTEXT7_TOKEN" $CONTEXT7_API_BASE/mcp/health
```

## Best Practices

### Configuration Management
1. **Use environment variables** for sensitive data
2. **Version control** configuration files
3. **Validate configuration** before deployment
4. **Document all settings** and their purposes
5. **Test configuration changes** in development first

### Security Best Practices
1. **Rotate credentials** regularly
2. **Use least privilege** access principles
3. **Enable audit logging** for sensitive operations
4. **Implement rate limiting** for API endpoints
5. **Use encryption** for sensitive data at rest

### Performance Best Practices
1. **Monitor resource usage** and set appropriate limits
2. **Implement caching** for frequently accessed data
3. **Use connection pooling** for database connections
4. **Optimize queries** and indexes
5. **Implement proper error handling** and retry logic
