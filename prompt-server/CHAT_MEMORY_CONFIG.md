# Chat Memory Configuration

## Environment Variables

Add these environment variables to your `.env` file or environment:

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

## Database Setup

The chat memory system uses the existing PostgreSQL database from the Docker Compose setup. The database connection will automatically:

1. Connect to the PostgreSQL instance running in Docker
2. Initialize the required schema (tables, indexes, triggers)
3. Set up connection pooling for optimal performance

## API Endpoints

### Chat Memory Management
- `POST /api/chat-memories` - Store new chat memory
- `GET /api/chat-memories/:conversationId` - Get conversation history
- `GET /api/chat-memories/:conversationId/context/:agentType` - Get recent context for agent
- `PUT /api/chat-memories/:id` - Update chat memory
- `DELETE /api/chat-memories/:id` - Delete chat memory

### Conversation Management
- `GET /api/conversations?user_id=:userId` - List user conversations
- `POST /api/conversations/:conversationId/summarize` - Create conversation summary
- `GET /api/conversations/:conversationId/stats` - Get conversation statistics

### Maintenance
- `POST /api/cleanup` - Clean up old chat memories

## Usage Examples

### Store a Chat Memory
```bash
curl -X POST http://localhost:3000/api/chat-memories \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "conv-123",
    "userId": "user-456",
    "agentType": "editor",
    "role": "user",
    "content": "Please help me edit this document",
    "metadata": {"source": "web", "priority": "high"}
  }'
```

### Get Conversation History
```bash
curl "http://localhost:3000/api/chat-memories/conv-123?limit=50&agent_type=editor"
```

### Get Recent Context for Agent
```bash
curl "http://localhost:3000/api/chat-memories/conv-123/context/editor?context_length=10"
```

## Database Schema

The system creates two main tables:

1. **chat_memories** - Stores individual chat messages
2. **conversation_summaries** - Stores conversation summaries and metadata

See `database/schema.sql` for the complete schema definition.

## Performance Considerations

- Connection pooling is configured for optimal performance
- Indexes are created on frequently queried columns
- Automatic cleanup of old memories based on TTL
- Pagination support for large conversation histories

## Fallback Behavior

If the database connection fails, the server will:
1. Log an error message
2. Continue running with limited functionality
3. Fall back to the existing memory-cache system for basic operations
