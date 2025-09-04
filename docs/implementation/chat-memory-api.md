# Chat Memory API Reference

Complete API reference for the PostgreSQL chat memory system endpoints.

## Base URL

All API endpoints are relative to the prompt server base URL:

```
http://localhost:3000/api
```

## Authentication

Currently, no authentication is required. In production, implement proper authentication and authorization.

## Response Format

All responses follow a consistent format:

### Success Response
```json
{
  "data": { ... },
  "status": "success"
}
```

### Error Response
```json
{
  "error": "Error message",
  "message": "Detailed error description",
  "status": "error"
}
```

## Endpoints

### Chat Memory Management

#### POST /api/chat-memories

Store a new chat memory.

**Request Body:**
```json
{
  "conversationId": "string (required)",
  "userId": "string (optional)",
  "agentType": "string (required)",
  "role": "string (required, one of: user, assistant, system)",
  "content": "string (required)",
  "metadata": "object (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "conversation_id": "string",
  "user_id": "string",
  "agent_type": "string",
  "role": "string",
  "content": "string",
  "metadata": "object",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Bad request (validation error)
- `500` - Internal server error

**Example:**
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

#### GET /api/chat-memories/:conversationId

Get conversation history.

**Query Parameters:**
- `limit` (integer, optional): Maximum number of results (default: 100)
- `offset` (integer, optional): Number of results to skip (default: 0)
- `agent_type` (string, optional): Filter by agent type

**Response:**
```json
[
  {
    "id": "uuid",
    "conversation_id": "string",
    "user_id": "string",
    "agent_type": "string",
    "role": "string",
    "content": "string",
    "metadata": "object",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Internal server error

**Example:**
```bash
curl "http://localhost:3000/api/chat-memories/conv-123?limit=50&agent_type=editor"
```

#### GET /api/chat-memories/:conversationId/context/:agentType

Get recent conversation context for a specific agent.

**Path Parameters:**
- `conversationId` (string): Conversation identifier
- `agentType` (string): Agent type (editor, research, reviewer, editor_merge)

**Query Parameters:**
- `context_length` (integer, optional): Number of recent messages to include (default: 10)

**Response:**
```json
[
  {
    "id": "uuid",
    "conversation_id": "string",
    "agent_type": "string",
    "role": "string",
    "content": "string",
    "metadata": "object",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Internal server error

**Example:**
```bash
curl "http://localhost:3000/api/chat-memories/conv-123/context/editor?context_length=5"
```

#### PUT /api/chat-memories/:id

Update a chat memory.

**Path Parameters:**
- `id` (string): Memory identifier (UUID)

**Request Body:**
```json
{
  "content": "string (optional)",
  "metadata": "object (optional)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "conversation_id": "string",
  "user_id": "string",
  "agent_type": "string",
  "role": "string",
  "content": "string",
  "metadata": "object",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Status Codes:**
- `200` - Updated successfully
- `400` - Bad request (validation error)
- `404` - Memory not found
- `500` - Internal server error

**Example:**
```bash
curl -X PUT http://localhost:3000/api/chat-memories/memory-id \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated message content",
    "metadata": {"updated": true}
  }'
```

#### DELETE /api/chat-memories/:id

Delete a chat memory.

**Path Parameters:**
- `id` (string): Memory identifier (UUID)

**Response:**
- `204` - Deleted successfully (no content)
- `404` - Memory not found
- `500` - Internal server error

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/chat-memories/memory-id
```

### Conversation Management

#### GET /api/conversations

List user conversations.

**Query Parameters:**
- `user_id` (string, required): User identifier
- `limit` (integer, optional): Maximum number of results (default: 50)
- `offset` (integer, optional): Number of results to skip (default: 0)

**Response:**
```json
[
  {
    "conversation_id": "string",
    "summary": "string",
    "message_count": "integer",
    "last_activity": "timestamp",
    "last_message_at": "timestamp"
  }
]
```

**Status Codes:**
- `200` - Success
- `400` - Bad request (user_id required)
- `500` - Internal server error

**Example:**
```bash
curl "http://localhost:3000/api/conversations?user_id=user-456&limit=20"
```

#### POST /api/conversations/:conversationId/summarize

Create or update conversation summary.

**Path Parameters:**
- `conversationId` (string): Conversation identifier

**Request Body:**
```json
{
  "summary": "string (required)",
  "message_count": "integer (optional, default: 0)"
}
```

**Response:**
```json
{
  "id": "uuid",
  "conversation_id": "string",
  "summary": "string",
  "message_count": "integer",
  "last_activity": "timestamp",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Status Codes:**
- `200` - Created/updated successfully
- `400` - Bad request (summary required)
- `500` - Internal server error

**Example:**
```bash
curl -X POST http://localhost:3000/api/conversations/conv-123/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "User requested help with document editing",
    "message_count": 15
  }'
```

#### GET /api/conversations/:conversationId/stats

Get conversation statistics.

**Path Parameters:**
- `conversationId` (string): Conversation identifier

**Response:**
```json
{
  "total_messages": "integer",
  "unique_users": "integer",
  "unique_agents": "integer",
  "first_message": "timestamp",
  "last_message": "timestamp"
}
```

**Status Codes:**
- `200` - Success
- `500` - Internal server error

**Example:**
```bash
curl "http://localhost:3000/api/conversations/conv-123/stats"
```

### Maintenance

#### POST /api/cleanup

Clean up old chat memories.

**Request Body:**
```json
{
  "days_old": "integer (optional, default: 30)"
}
```

**Response:**
```json
{
  "message": "string",
  "deleted_count": "integer"
}
```

**Status Codes:**
- `200` - Cleanup completed
- `500` - Internal server error

**Example:**
```bash
curl -X POST http://localhost:3000/api/cleanup \
  -H "Content-Type: application/json" \
  -d '{
    "days_old": 30
  }'
```

## Error Handling

### Common Error Responses

#### Validation Error (400)
```json
{
  "error": "Failed to store chat memory",
  "message": "Missing required fields: conversationId, agentType, role, content"
}
```

#### Not Found (404)
```json
{
  "error": "Memory not found"
}
```

#### Server Error (500)
```json
{
  "error": "Failed to get conversation history",
  "message": "Database connection failed"
}
```

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limiting to prevent abuse.

## Pagination

List endpoints support pagination using `limit` and `offset` parameters:

- `limit`: Maximum number of results to return
- `offset`: Number of results to skip

**Example:**
```bash
# Get first 20 results
curl "http://localhost:3000/api/chat-memories/conv-123?limit=20&offset=0"

# Get next 20 results
curl "http://localhost:3000/api/chat-memories/conv-123?limit=20&offset=20"
```

## Data Types

### UUID
Universally unique identifier (e.g., `550e8400-e29b-41d4-a716-446655440000`)

### Timestamp
ISO 8601 formatted timestamp (e.g., `2025-01-27T20:30:00.000Z`)

### Agent Types
- `editor` - Document editing agent
- `research` - Research agent
- `reviewer` - Review agent
- `editor_merge` - Merge agent

### Roles
- `user` - User message
- `assistant` - AI assistant message
- `system` - System message

## Testing

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Test Database Connection
```bash
cd prompt-server
node test-db-connection.js
```

### Validate Environment
```bash
node scripts/validate-env.js
```
