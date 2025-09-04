# PostgreSQL Chat Memory Implementation Plan

## Overview
Replace the basic `memory-cache` with PostgreSQL for persistent chat memory storage to handle long conversations.

## Complexity Level
**Level 2: Simple Enhancement**

## Current State Analysis
- ✅ PostgreSQL already running in Docker Compose with pgvector support
- ✅ Express.js server with basic memory-cache implementation
- ✅ Existing database connection infrastructure
- ❌ No chat memory persistence
- ❌ No conversation history storage

## Implementation Strategy

### Phase 1: Database Schema Design
1. Create `chat_memories` table for conversation storage
2. Add indexes for efficient querying
3. Design conversation threading structure

### Phase 2: Database Integration
1. Add PostgreSQL client to prompt-server
2. Create database connection module
3. Implement connection pooling

### Phase 3: Memory Service Implementation
1. Create ChatMemoryService class
2. Implement CRUD operations for chat memories
3. Add conversation threading logic

### Phase 4: API Integration
1. Add chat memory endpoints to Express server
2. Integrate with existing prompt system
3. Add conversation context retrieval

### Phase 5: Testing & Validation
1. Unit tests for memory service
2. Integration tests for API endpoints
3. Performance testing with long conversations

## Database Schema

```sql
-- Chat memories table
CREATE TABLE chat_memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255),
    agent_type VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_chat_memories_conversation_id ON chat_memories(conversation_id);
CREATE INDEX idx_chat_memories_user_id ON chat_memories(user_id);
CREATE INDEX idx_chat_memories_created_at ON chat_memories(created_at);
CREATE INDEX idx_chat_memories_agent_type ON chat_memories(agent_type);

-- Conversation summaries table (optional)
CREATE TABLE conversation_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id VARCHAR(255) UNIQUE NOT NULL,
    summary TEXT,
    message_count INTEGER DEFAULT 0,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Dependencies to Add
- `pg`: PostgreSQL client for Node.js
- `uuid`: UUID generation
- `dotenv`: Environment variable management (already present)

## Environment Variables
```env
# Database connection
DB_HOST=localhost
DB_PORT=5432
DB_NAME=support
DB_USER=support-user
DB_PASSWORD=support-password
DB_SSL=false

# Chat memory settings
CHAT_MEMORY_TTL_DAYS=30
MAX_CONVERSATION_LENGTH=1000
```

## API Endpoints to Add
- `POST /api/chat-memories` - Store new chat memory
- `GET /api/chat-memories/:conversationId` - Get conversation history
- `PUT /api/chat-memories/:id` - Update chat memory
- `DELETE /api/chat-memories/:id` - Delete chat memory
- `GET /api/conversations` - List user conversations
- `POST /api/conversations/:id/summarize` - Create conversation summary

## Migration Strategy
1. Keep existing memory-cache as fallback
2. Implement PostgreSQL as primary storage
3. Add configuration to switch between storage types
4. Gradual migration with feature flags

## Success Criteria
- [ ] PostgreSQL integration working
- [ ] Chat memories persist across server restarts
- [ ] API endpoints functional
- [ ] Performance acceptable for long conversations
- [ ] Backward compatibility maintained
- [ ] Tests passing
