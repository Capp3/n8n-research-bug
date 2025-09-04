#!/usr/bin/env node

/**
 * Test script to verify database connection and chat memory functionality
 */

const { testConnection, initializeSchema } = require('./database/connection');
const ChatMemoryService = require('./services/ChatMemoryService');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');

  try {
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Database connection failed');
      return false;
    }

    console.log('✅ Database connected successfully');

    // Initialize schema
    console.log('🔧 Initializing database schema...');
    const schemaInitialized = await initializeSchema();
    if (!schemaInitialized) {
      console.error('❌ Schema initialization failed');
      return false;
    }

    console.log('✅ Database schema initialized');

    // Test chat memory service
    console.log('🧠 Testing chat memory service...');
    const chatMemoryService = new ChatMemoryService();

    // Test storing a memory
    const testMemory = {
      conversationId: 'test-conv-' + Date.now(),
      userId: 'test-user',
      agentType: 'editor',
      role: 'user',
      content: 'Test message for database integration',
      metadata: { test: true }
    };

    console.log('📝 Storing test memory...');
    const storedMemory = await chatMemoryService.storeMemory(testMemory);
    console.log('✅ Memory stored:', storedMemory.id);

    // Test retrieving conversation history
    console.log('📖 Retrieving conversation history...');
    const history = await chatMemoryService.getConversationHistory(testMemory.conversationId);
    console.log('✅ Retrieved', history.length, 'messages');

    // Test getting recent context
    console.log('🔍 Getting recent context...');
    const context = await chatMemoryService.getRecentContext(testMemory.conversationId, 'editor', 5);
    console.log('✅ Retrieved', context.length, 'context messages');

    // Test conversation stats
    console.log('📊 Getting conversation stats...');
    const stats = await chatMemoryService.getConversationStats(testMemory.conversationId);
    console.log('✅ Stats:', stats);

    // Clean up test data
    console.log('🧹 Cleaning up test data...');
    await chatMemoryService.deleteMemory(storedMemory.id);
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All database tests passed! PostgreSQL chat memory is working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testDatabaseConnection()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = testDatabaseConnection;
