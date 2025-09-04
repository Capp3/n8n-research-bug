const { v4: uuidv4 } = require('uuid');
const { pool } = require('../database/connection');

class ChatMemoryService {
  constructor() {
    this.maxConversationLength = parseInt(process.env.MAX_CONVERSATION_LENGTH || '1000');
    this.chatMemoryTTLDays = parseInt(process.env.CHAT_MEMORY_TTL_DAYS || '30');
  }

  /**
   * Store a new chat memory
   * @param {Object} memoryData - Chat memory data
   * @param {string} memoryData.conversationId - Conversation ID
   * @param {string} memoryData.userId - User ID (optional)
   * @param {string} memoryData.agentType - Agent type
   * @param {string} memoryData.role - Role (user, assistant, system)
   * @param {string} memoryData.content - Message content
   * @param {Object} memoryData.metadata - Additional metadata (optional)
   * @returns {Promise<Object>} - Created memory object
   */
  async storeMemory(memoryData) {
    const { conversationId, userId, agentType, role, content, metadata = {} } = memoryData;

    if (!conversationId || !agentType || !role || !content) {
      throw new Error('Missing required fields: conversationId, agentType, role, content');
    }

    if (!['user', 'assistant', 'system'].includes(role)) {
      throw new Error('Invalid role. Must be user, assistant, or system');
    }

    const query = `
      INSERT INTO chat_memories (conversation_id, user_id, agent_type, role, content, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [conversationId, userId, agentType, role, content, JSON.stringify(metadata)];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error storing chat memory:', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   * @param {string} conversationId - Conversation ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of messages to return
   * @param {number} options.offset - Number of messages to skip
   * @param {string} options.agentType - Filter by agent type
   * @returns {Promise<Array>} - Array of chat memories
   */
  async getConversationHistory(conversationId, options = {}) {
    const { limit = 100, offset = 0, agentType } = options;

    let query = `
      SELECT * FROM chat_memories
      WHERE conversation_id = $1
    `;
    const values = [conversationId];
    let paramCount = 1;

    if (agentType) {
      paramCount++;
      query += ` AND agent_type = $${paramCount}`;
      values.push(agentType);
    }

    query += ` ORDER BY created_at ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      throw error;
    }
  }

  /**
   * Get recent conversation context for an agent
   * @param {string} conversationId - Conversation ID
   * @param {string} agentType - Agent type
   * @param {number} contextLength - Number of recent messages to include
   * @returns {Promise<Array>} - Array of recent chat memories
   */
  async getRecentContext(conversationId, agentType, contextLength = 10) {
    const query = `
      SELECT * FROM chat_memories
      WHERE conversation_id = $1 AND agent_type = $2
      ORDER BY created_at DESC
      LIMIT $3
    `;

    try {
      const result = await pool.query(query, [conversationId, agentType, contextLength]);
      return result.rows.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting recent context:', error);
      throw error;
    }
  }

  /**
   * Update a chat memory
   * @param {string} memoryId - Memory ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated memory object
   */
  async updateMemory(memoryId, updateData) {
    const allowedFields = ['content', 'metadata'];
    const updates = [];
    const values = [];
    let paramCount = 0;

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key)) {
        paramCount++;
        updates.push(`${key} = $${paramCount}`);
        values.push(key === 'metadata' ? JSON.stringify(value) : value);
      }
    }

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    paramCount++;
    values.push(memoryId);

    const query = `
      UPDATE chat_memories
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        throw new Error('Memory not found');
      }
      return result.rows[0];
    } catch (error) {
      console.error('Error updating chat memory:', error);
      throw error;
    }
  }

  /**
   * Delete a chat memory
   * @param {string} memoryId - Memory ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteMemory(memoryId) {
    const query = 'DELETE FROM chat_memories WHERE id = $1';

    try {
      const result = await pool.query(query, [memoryId]);
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting chat memory:', error);
      throw error;
    }
  }

  /**
   * Get user conversations
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @param {number} options.limit - Maximum number of conversations
   * @param {number} options.offset - Number of conversations to skip
   * @returns {Promise<Array>} - Array of conversation summaries
   */
  async getUserConversations(userId, options = {}) {
    const { limit = 50, offset = 0 } = options;

    const query = `
      SELECT DISTINCT
        cm.conversation_id,
        cs.summary,
        cs.message_count,
        cs.last_activity,
        MAX(cm.created_at) as last_message_at
      FROM chat_memories cm
      LEFT JOIN conversation_summaries cs ON cm.conversation_id = cs.conversation_id
      WHERE cm.user_id = $1
      GROUP BY cm.conversation_id, cs.summary, cs.message_count, cs.last_activity
      ORDER BY last_message_at DESC
      LIMIT $2 OFFSET $3
    `;

    try {
      const result = await pool.query(query, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      console.error('Error getting user conversations:', error);
      throw error;
    }
  }

  /**
   * Create or update conversation summary
   * @param {string} conversationId - Conversation ID
   * @param {string} summary - Summary text
   * @param {number} messageCount - Number of messages in conversation
   * @returns {Promise<Object>} - Summary object
   */
  async createOrUpdateSummary(conversationId, summary, messageCount) {
    const query = `
      INSERT INTO conversation_summaries (conversation_id, summary, message_count, last_activity)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (conversation_id)
      DO UPDATE SET
        summary = EXCLUDED.summary,
        message_count = EXCLUDED.message_count,
        last_activity = EXCLUDED.last_activity,
        updated_at = NOW()
      RETURNING *
    `;

    try {
      const result = await pool.query(query, [conversationId, summary, messageCount]);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating/updating conversation summary:', error);
      throw error;
    }
  }

  /**
   * Clean up old chat memories
   * @param {number} daysOld - Number of days old to clean up
   * @returns {Promise<number>} - Number of deleted records
   */
  async cleanupOldMemories(daysOld = null) {
    const days = daysOld || this.chatMemoryTTLDays;
    const query = `
      DELETE FROM chat_memories
      WHERE created_at < NOW() - INTERVAL '${days} days'
    `;

    try {
      const result = await pool.query(query);
      console.log(`Cleaned up ${result.rowCount} old chat memories`);
      return result.rowCount;
    } catch (error) {
      console.error('Error cleaning up old memories:', error);
      throw error;
    }
  }

  /**
   * Get conversation statistics
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} - Conversation statistics
   */
  async getConversationStats(conversationId) {
    const query = `
      SELECT
        COUNT(*) as total_messages,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT agent_type) as unique_agents,
        MIN(created_at) as first_message,
        MAX(created_at) as last_message
      FROM chat_memories
      WHERE conversation_id = $1
    `;

    try {
      const result = await pool.query(query, [conversationId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      throw error;
    }
  }
}

module.exports = ChatMemoryService;
