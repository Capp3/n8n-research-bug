# PostgreSQL Chat Memory System

This document describes the PostgreSQL-based chat memory system that provides persistent storage for conversation data in the prompt-server application.

## Overview

The chat memory system replaces the basic in-memory cache with a robust PostgreSQL-based solution for handling long conversations. It provides persistent storage, conversation threading, and agent-specific context management.

## Features

- **Persistent Storage**: Chat memories survive server restarts
- **Conversation Threading**: Support for multiple concurrent conversations
- **Agent Context**: Maintain separate context for different agent types
- **Pagination**: Efficient handling of long conversation histories
- **Automatic Cleanup**: Configurable TTL for old memories
- **Conversation Summaries**: Optional conversation summarization
- **Statistics**: Conversation analytics and metrics
- **Connection Pooling**: Optimized database performance

## Quick Start

### 1. Environment Setup

Copy the sample environment file and configure your settings:

```bash
cp sample.env .env
```

See [Environment Setup](environment-setup.md) for detailed configuration instructions.

### 2. Start Services

Start the PostgreSQL database and other services:

```bash
docker compose up -d
```

### 3. Start Prompt Server

```bash
cd prompt-server
npm install
npm start
```

### 4. Test the System

```bash
# Test database connection
node test-db-connection.js

# Test API endpoints
curl http://localhost:3000/api/health
```

## API Reference

### Chat Memory Management

#### Store Chat Memory
```http
POST /api/chat-memories
Content-Type: application/json

{
  "conversationId": "conv-123",
  "userId": "user-456",
  "agentType": "editor",
  "role": "user",
  "content": "Hello, can you help me edit this document?",
  "metadata": {
    "source": "web",
    "priority": "high"
  }
}
```

#### Get Conversation History
```http
GET /api/chat-memories/conv-123?limit=50&offset=0&agent_type=editor
```

#### Get Recent Context for Agent
```http
GET /api/chat-memories/conv-123/context/editor?context_length=10
```

#### Update Chat Memory
```http
PUT /api/chat-memories/memory-id
Content-Type: application/json

{
  "content": "Updated message content",
  "metadata": {
    "updated": true
  }
}
```

#### Delete Chat Memory
```http
DELETE /api/chat-memories/memory-id
```

### Conversation Management

#### List User Conversations
```http
GET /api/conversations?user_id=user-456&limit=20&offset=0
```

#### Create Conversation Summary
```http
POST /api/conversations/conv-123/summarize
Content-Type: application/json

{
  "summary": "User requested help with document editing",
  "message_count": 15
}
```

#### Get Conversation Statistics
```http
GET /api/conversations/conv-123/stats
```

### Maintenance

#### Cleanup Old Memories
```http
POST /api/cleanup
Content-Type: application/json

{
  "days_old": 30
}
```

## Database Schema

### chat_memories Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| conversation_id | VARCHAR(255) | Conversation identifier |
| user_id | VARCHAR(255) | User identifier (optional) |
| agent_type | VARCHAR(50) | Agent type (editor, research, etc.) |
| role | VARCHAR(20) | Message role (user, assistant, system) |
| content | TEXT | Message content |
| metadata | JSONB | Additional metadata |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### conversation_summaries Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| conversation_id | VARCHAR(255) | Conversation identifier (unique) |
| summary | TEXT | Conversation summary |
| message_count | INTEGER | Number of messages |
| last_activity | TIMESTAMP | Last activity timestamp |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Configuration

### Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=support
DB_USER=support-user
DB_PASSWORD=support-password
DB_SSL=false

# Chat Memory Configuration
CHAT_MEMORY_TTL_DAYS=30
MAX_CONVERSATION_LENGTH=1000
```

### Docker Integration

The system uses the existing PostgreSQL instance from the Docker Compose setup. No additional containers are required.

## Usage Examples

### JavaScript/Node.js

```javascript
const ChatMemoryService = require('./services/ChatMemoryService');

const chatMemory = new ChatMemoryService();

// Store a memory
const memory = await chatMemory.storeMemory({
  conversationId: 'conv-123',
  userId: 'user-456',
  agentType: 'editor',
  role: 'user',
  content: 'Please help me edit this document',
  metadata: { source: 'web' }
});

// Get conversation history
const history = await chatMemory.getConversationHistory('conv-123', {
  limit: 50,
  agentType: 'editor'
});

// Get recent context for agent
const context = await chatMemory.getRecentContext('conv-123', 'editor', 10);
```

### cURL Examples

```bash
# Store a memory
curl -X POST http://localhost:3000/api/chat-memories \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv-123",
    "userId": "user-456",
    "agentType": "editor",
    "role": "user",
    "content": "Hello, can you help me?",
    "metadata": {"source": "web"}
  }'

# Get conversation history
curl "http://localhost:3000/api/chat-memories/conv-123?limit=20"

# Get recent context
curl "http://localhost:3000/api/chat-memories/conv-123/context/editor?context_length=5"
```

## Performance Considerations

### Connection Pooling

The system uses PostgreSQL connection pooling with:
- Maximum 20 connections
- 30-second idle timeout
- 2-second connection timeout

### Indexing

Optimized indexes for common query patterns:
- `conversation_id` for conversation lookups
- `user_id` for user-specific queries
- `created_at` for time-based queries
- `agent_type` for agent-specific filtering

### Pagination

All list endpoints support pagination:
- `limit`: Maximum number of results (default: 100)
- `offset`: Number of results to skip (default: 0)

## Testing

### Run Tests

```bash
npm test
```

### Test Database Connection

```bash
node test-db-connection.js
```

### Validate Environment

```bash
node scripts/validate-env.js
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running: `docker compose ps`
   - Verify connection parameters in `.env`
   - Check database logs: `docker compose logs n8n-postgres`

2. **Schema Initialization Failed**
   - Check database permissions
   - Verify schema file exists
   - Check for conflicting tables

3. **Memory Storage Failed**
   - Check required fields are provided
   - Verify role is valid (user, assistant, system)
   - Check content size limits

### Debug Mode

Enable debug logging:

```env
DEBUG=chat-memory:*
```

## Security Considerations

### Data Protection

- No sensitive data stored in plain text
- Metadata field for additional security context
- User ID separation for multi-tenant support

### Access Control

- API endpoints require proper authentication (to be implemented)
- User-specific conversation isolation
- Agent-type based access control

## Related Documentation

- [Environment Setup](environment-setup.md) - Configuration guide
- [Implementation Summary](../status/postgresql-chat-memory-implementation-summary.md) - Technical details
- [API Reference](../api/chat-memory-api.md) - Complete API documentation
