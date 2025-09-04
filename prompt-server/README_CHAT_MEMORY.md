# PostgreSQL Chat Memory System

This document describes the PostgreSQL-based chat memory system that replaces the basic in-memory cache for handling long conversations in the prompt-server.

## Overview

The chat memory system provides persistent storage for conversation data, allowing the prompt-server to maintain context across long conversations and server restarts. It uses PostgreSQL as the backend database and integrates seamlessly with the existing Docker Compose setup.

## Features

- **Persistent Storage**: Chat memories survive server restarts
- **Conversation Threading**: Support for multiple concurrent conversations
- **Agent Context**: Maintain separate context for different agent types
- **Pagination**: Efficient handling of long conversation histories
- **Automatic Cleanup**: Configurable TTL for old memories
- **Conversation Summaries**: Optional conversation summarization
- **Statistics**: Conversation analytics and metrics
- **Connection Pooling**: Optimized database performance

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Express API   │───▶│ ChatMemoryService│───▶│   PostgreSQL    │
│   Endpoints     │    │                  │    │   Database      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Components

1. **Database Schema** (`database/schema.sql`)
   - `chat_memories` table for individual messages
   - `conversation_summaries` table for conversation metadata
   - Indexes for optimal query performance
   - Triggers for automatic timestamp updates

2. **Connection Management** (`database/connection.js`)
   - PostgreSQL connection pooling
   - Database health checks
   - Schema initialization
   - Graceful shutdown handling

3. **Chat Memory Service** (`services/ChatMemoryService.js`)
   - CRUD operations for chat memories
   - Conversation management
   - Context retrieval for agents
   - Statistics and analytics

4. **API Endpoints** (integrated in `server.js`)
   - RESTful API for chat memory operations
   - Error handling and validation
   - Request/response formatting

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

## API Endpoints

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

The system uses the existing PostgreSQL instance from the Docker Compose setup:

```yaml
services:
  n8n-postgres:
    image: postgres:17-bookworm
    environment:
      POSTGRES_PASSWORD: ${SUPPORT_POSTGRES_PASSWORD:-support-password}
      POSTGRES_USER: ${SUPPORT_POSTGRES_USER:-support-user}
      POSTGRES_DB: ${SUPPORT_POSTGRES_DB:-support}
    ports:
      - ${SUPPORT_POSTGRES_PORT:-5432}:5432
```

## Usage Examples

### Basic Usage

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

### API Usage with curl

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

## Testing

### Run Tests

```bash
npm test
```

### Test Database Connection

```bash
node test-db-connection.js
```

### Test Coverage

The test suite includes:
- Unit tests for ChatMemoryService
- Integration tests for API endpoints
- Error handling tests
- Database connection tests

## Performance Considerations

### Connection Pooling

The system uses PostgreSQL connection pooling with the following configuration:
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

### Cleanup

Automatic cleanup of old memories based on TTL:
- Configurable retention period (default: 30 days)
- Manual cleanup via API endpoint
- Logging of cleanup operations

## Error Handling

### Database Errors

- Connection failures are logged and handled gracefully
- Server continues running with limited functionality if database is unavailable
- Fallback to memory-cache system for basic operations

### Validation Errors

- Input validation for all API endpoints
- Clear error messages for invalid data
- Proper HTTP status codes

### Logging

- Comprehensive logging of all operations
- Error tracking and debugging information
- Performance metrics

## Migration from Memory Cache

The system maintains backward compatibility:
- Existing memory-cache functionality preserved
- Gradual migration possible
- Configuration-based switching between storage types

## Security Considerations

### Data Protection

- No sensitive data stored in plain text
- Metadata field for additional security context
- User ID separation for multi-tenant support

### Access Control

- API endpoints require proper authentication (to be implemented)
- User-specific conversation isolation
- Agent-type based access control

## Monitoring and Maintenance

### Health Checks

- Database connection health monitoring
- API endpoint health checks
- Performance metrics collection

### Maintenance Tasks

- Regular cleanup of old memories
- Database optimization
- Performance monitoring

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify connection parameters
   - Check network connectivity

2. **Schema Initialization Failed**
   - Check database permissions
   - Verify schema file exists
   - Check for conflicting tables

3. **Memory Storage Failed**
   - Check required fields are provided
   - Verify role is valid (user, assistant, system)
   - Check content size limits

### Debug Mode

Enable debug logging by setting environment variable:
```env
DEBUG=chat-memory:*
```

## Future Enhancements

- [ ] Full-text search capabilities
- [ ] Conversation clustering
- [ ] Advanced analytics
- [ ] Real-time notifications
- [ ] Multi-database support
- [ ] Caching layer optimization
