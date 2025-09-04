const request = require('supertest');
const app = require('../server');
const ChatMemoryService = require('../services/ChatMemoryService');

// Mock the database connection for testing
jest.mock('../database/connection', () => ({
  testConnection: jest.fn().mockResolvedValue(true),
  initializeSchema: jest.fn().mockResolvedValue(true),
  pool: {
    query: jest.fn()
  }
}));

describe('Chat Memory API', () => {
  let chatMemoryService;

  beforeEach(() => {
    chatMemoryService = new ChatMemoryService();
    jest.clearAllMocks();
  });

  describe('POST /api/chat-memories', () => {
    it('should store a new chat memory', async () => {
      const mockMemory = {
        id: 'test-id',
        conversation_id: 'conv-123',
        user_id: 'user-456',
        agent_type: 'editor',
        role: 'user',
        content: 'Test message',
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Mock the database query
      const { pool } = require('../database/connection');
      pool.query.mockResolvedValueOnce({ rows: [mockMemory] });

      const response = await request(app)
        .post('/api/chat-memories')
        .send({
          conversationId: 'conv-123',
          userId: 'user-456',
          agentType: 'editor',
          role: 'user',
          content: 'Test message',
          metadata: {}
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockMemory);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/chat-memories')
        .send({
          conversationId: 'conv-123',
          // Missing other required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Failed to store chat memory');
    });

    it('should return 400 for invalid role', async () => {
      const response = await request(app)
        .post('/api/chat-memories')
        .send({
          conversationId: 'conv-123',
          userId: 'user-456',
          agentType: 'editor',
          role: 'invalid-role',
          content: 'Test message'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Failed to store chat memory');
    });
  });

  describe('GET /api/chat-memories/:conversationId', () => {
    it('should get conversation history', async () => {
      const mockMemories = [
        {
          id: 'test-id-1',
          conversation_id: 'conv-123',
          role: 'user',
          content: 'First message',
          created_at: new Date().toISOString()
        },
        {
          id: 'test-id-2',
          conversation_id: 'conv-123',
          role: 'assistant',
          content: 'Second message',
          created_at: new Date().toISOString()
        }
      ];

      const { pool } = require('../database/connection');
      pool.query.mockResolvedValueOnce({ rows: mockMemories });

      const response = await request(app)
        .get('/api/chat-memories/conv-123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMemories);
    });

    it('should handle query parameters', async () => {
      const { pool } = require('../database/connection');
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/chat-memories/conv-123?limit=10&offset=5&agent_type=editor');

      expect(response.status).toBe(200);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT $3 OFFSET $4'),
        ['conv-123', 'editor', 10, 5]
      );
    });
  });

  describe('GET /api/chat-memories/:conversationId/context/:agentType', () => {
    it('should get recent context for agent', async () => {
      const mockContext = [
        {
          id: 'test-id-1',
          conversation_id: 'conv-123',
          agent_type: 'editor',
          role: 'user',
          content: 'Recent message',
          created_at: new Date().toISOString()
        }
      ];

      const { pool } = require('../database/connection');
      pool.query.mockResolvedValueOnce({ rows: mockContext });

      const response = await request(app)
        .get('/api/chat-memories/conv-123/context/editor?context_length=5');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockContext);
    });
  });

  describe('PUT /api/chat-memories/:id', () => {
    it('should update a chat memory', async () => {
      const mockUpdatedMemory = {
        id: 'test-id',
        conversation_id: 'conv-123',
        content: 'Updated message',
        updated_at: new Date().toISOString()
      };

      const { pool } = require('../database/connection');
      pool.query.mockResolvedValueOnce({ rows: [mockUpdatedMemory] });

      const response = await request(app)
        .put('/api/chat-memories/test-id')
        .send({
          content: 'Updated message'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUpdatedMemory);
    });

    it('should return 400 for invalid update data', async () => {
      const response = await request(app)
        .put('/api/chat-memories/test-id')
        .send({
          invalidField: 'value'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Failed to update chat memory');
    });
  });

  describe('DELETE /api/chat-memories/:id', () => {
    it('should delete a chat memory', async () => {
      const { pool } = require('../database/connection');
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      const response = await request(app)
        .delete('/api/chat-memories/test-id');

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent memory', async () => {
      const { pool } = require('../database/connection');
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const response = await request(app)
        .delete('/api/chat-memories/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Memory not found');
    });
  });

  describe('GET /api/conversations', () => {
    it('should get user conversations', async () => {
      const mockConversations = [
        {
          conversation_id: 'conv-123',
          summary: 'Test conversation',
          message_count: 5,
          last_activity: new Date().toISOString()
        }
      ];

      const { pool } = require('../database/connection');
      pool.query.mockResolvedValueOnce({ rows: mockConversations });

      const response = await request(app)
        .get('/api/conversations?user_id=user-456');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockConversations);
    });

    it('should return 400 for missing user_id', async () => {
      const response = await request(app)
        .get('/api/conversations');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('user_id query parameter is required');
    });
  });

  describe('POST /api/conversations/:conversationId/summarize', () => {
    it('should create conversation summary', async () => {
      const mockSummary = {
        id: 'summary-id',
        conversation_id: 'conv-123',
        summary: 'Test summary',
        message_count: 5,
        created_at: new Date().toISOString()
      };

      const { pool } = require('../database/connection');
      pool.query.mockResolvedValueOnce({ rows: [mockSummary] });

      const response = await request(app)
        .post('/api/conversations/conv-123/summarize')
        .send({
          summary: 'Test summary',
          message_count: 5
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSummary);
    });

    it('should return 400 for missing summary', async () => {
      const response = await request(app)
        .post('/api/conversations/conv-123/summarize')
        .send({
          message_count: 5
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('summary is required');
    });
  });

  describe('GET /api/conversations/:conversationId/stats', () => {
    it('should get conversation statistics', async () => {
      const mockStats = {
        total_messages: 10,
        unique_users: 2,
        unique_agents: 3,
        first_message: new Date().toISOString(),
        last_message: new Date().toISOString()
      };

      const { pool } = require('../database/connection');
      pool.query.mockResolvedValueOnce({ rows: [mockStats] });

      const response = await request(app)
        .get('/api/conversations/conv-123/stats');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStats);
    });
  });

  describe('POST /api/cleanup', () => {
    it('should clean up old memories', async () => {
      const { pool } = require('../database/connection');
      pool.query.mockResolvedValueOnce({ rowCount: 5 });

      const response = await request(app)
        .post('/api/cleanup')
        .send({
          days_old: 30
        });

      expect(response.status).toBe(200);
      expect(response.body.deleted_count).toBe(5);
    });
  });
});
