# Code Contributions Guide

## Overview

This guide provides detailed instructions for contributing code to the n8n LLM Document Workflow. Code contributions include bug fixes, feature development, performance improvements, and refactoring.

## Types of Code Contributions

### 1. Bug Fixes
- **Purpose**: Fix issues in the codebase
- **Scope**: Error handling, logic corrections, compatibility issues
- **Priority**: High - improves system stability

### 2. Feature Development
- **Purpose**: Implement new functionality
- **Scope**: New endpoints, enhanced capabilities, integrations
- **Priority**: Medium - expands system capabilities

### 3. Performance Improvements
- **Purpose**: Optimize existing code
- **Scope**: Caching, database queries, API responses
- **Priority**: Medium - improves system efficiency

### 4. Refactoring
- **Purpose**: Improve code structure and maintainability
- **Scope**: Code organization, design patterns, documentation
- **Priority**: Low - improves long-term maintainability

## Development Environment Setup

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git
- Code editor (VS Code recommended)
- Basic knowledge of JavaScript/TypeScript

### Local Development Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/your-username/n8n-research-bug.git
   cd n8n-research-bug
   ```

2. **Install Dependencies**:
   ```bash
   # Install prompt server dependencies
   cd prompt-server
   npm install
   
   # Install development dependencies
   npm install --save-dev jest supertest nodemon
   ```

3. **Start Support Services**:
   ```bash
   docker-compose up -d
   ```

4. **Verify Setup**:
   ```bash
   # Check services
   docker-compose ps
   
   # Test prompt server
   curl http://localhost:3000/api/health
   ```

### Development Tools

#### VS Code Extensions
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Jest**: Testing support
- **Docker**: Container management
- **Markdown**: Documentation support

#### Configuration Files
```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "jest.jestCommandLine": "npm test",
  "files.associations": {
    "*.md": "markdown"
  }
}
```

## Code Style Guidelines

### JavaScript/TypeScript

#### General Style
- Use ES6+ features
- Prefer `const` and `let` over `var`
- Use meaningful variable names
- Add JSDoc comments for functions
- Use consistent indentation (2 spaces)

#### Function Style
```javascript
/**
 * Fetches prompt template with caching
 * @param {string} promptId - The prompt ID to fetch
 * @param {boolean} includeSystem - Whether to include system prompt
 * @returns {Promise<Object>} Prompt template data
 */
async function fetchPromptTemplate(promptId, includeSystem = false) {
  try {
    const cacheKey = `prompt_${promptId}`;
    const cachedValue = cache.get(cacheKey);
    
    if (cachedValue) {
      return cachedValue;
    }
    
    const response = await axios.get(`${PROMPTS_BASE_URL}/${promptId}`);
    cache.put(cacheKey, response.data, TEMPLATE_TTL_MS);
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching prompt ${promptId}:`, error);
    throw error;
  }
}
```

#### Error Handling
```javascript
// Good error handling
try {
  const result = await riskyOperation();
  return { success: true, data: result };
} catch (error) {
  console.error('Operation failed:', error);
  return { 
    success: false, 
    error: error.message,
    code: error.code 
  };
}

// Avoid silent failures
// Bad
const result = await riskyOperation().catch(() => null);

// Good
const result = await riskyOperation().catch(error => {
  console.error('Operation failed:', error);
  throw error;
});
```

#### Async/Await Patterns
```javascript
// Good - use async/await
async function processDocument(document) {
  const enhanced = await enhanceDocument(document);
  const validated = await validateDocument(enhanced);
  return validated;
}

// Avoid promise chains
// Bad
function processDocument(document) {
  return enhanceDocument(document)
    .then(enhanced => validateDocument(enhanced))
    .then(validated => validated);
}
```

### API Design

#### RESTful Endpoints
```javascript
// Good RESTful design
app.get('/api/prompts', getAllPrompts);
app.get('/api/prompts/:id', getPromptById);
app.post('/api/prompts', createPrompt);
app.put('/api/prompts/:id', updatePrompt);
app.delete('/api/prompts/:id', deletePrompt);

// Avoid non-RESTful patterns
// Bad
app.get('/api/getPrompt', getPrompt);
app.post('/api/updatePrompt', updatePrompt);
```

#### Response Format
```javascript
// Consistent response format
const successResponse = {
  success: true,
  data: result,
  timestamp: new Date().toISOString()
};

const errorResponse = {
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input parameters',
    details: validationErrors
  },
  timestamp: new Date().toISOString()
};
```

#### Input Validation
```javascript
// Validate input parameters
function validatePromptId(promptId) {
  if (!promptId || typeof promptId !== 'string') {
    throw new Error('Prompt ID is required and must be a string');
  }
  
  if (!/^[a-z0-9-]+$/.test(promptId)) {
    throw new Error('Prompt ID must contain only lowercase letters, numbers, and hyphens');
  }
  
  return true;
}
```

### Database Code

#### Query Patterns
```javascript
// Good - parameterized queries
async function getConversationState(conversationId) {
  const query = 'SELECT * FROM conversation_state WHERE conversation_id = $1';
  const result = await db.query(query, [conversationId]);
  return result.rows[0];
}

// Avoid string concatenation
// Bad
async function getConversationState(conversationId) {
  const query = `SELECT * FROM conversation_state WHERE conversation_id = '${conversationId}'`;
  const result = await db.query(query);
  return result.rows[0];
}
```

#### Error Handling
```javascript
// Good database error handling
async function saveConversationState(state) {
  try {
    const query = `
      INSERT INTO conversation_state 
      (conversation_id, chat_id, project_name, github_owner, github_repo, github_path)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (conversation_id) 
      DO UPDATE SET 
        chat_id = EXCLUDED.chat_id,
        project_name = EXCLUDED.project_name,
        updated_at = CURRENT_TIMESTAMP
    `;
    
    const values = [
      state.conversation_id,
      state.chat_id,
      state.project_name,
      state.github_owner,
      state.github_repo,
      state.github_path
    ];
    
    await db.query(query, values);
    return { success: true };
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to save conversation state');
  }
}
```

## Testing Guidelines

### Unit Tests

#### Test Structure
```javascript
// tests/prompt-server.test.js
describe('Prompt Server API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    cache.get.mockImplementation(() => null);
    cache.put.mockImplementation(() => true);
  });

  describe('GET /api/health', () => {
    it('should return 200 OK with status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/prompts', () => {
    it('should return all prompts', async () => {
      const mockPrompts = [
        { id: 'form-initial', name: 'Form: Initial', path: 'path/to/form.md' }
      ];

      axios.get.mockResolvedValueOnce({ data: mockPrompts });

      const response = await request(app).get('/api/prompts');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPrompts);
    });
  });
});
```

#### Test Data
```javascript
// tests/test-data.js
export const mockPrompts = [
  {
    id: 'form-initial',
    name: 'Form: Initial Enhancement',
    path: 'prompts/form/initial.md',
    agent: 'editor',
    ui_visible: true
  }
];

export const mockPromptContent = `---
title: Form: Initial Enhancement
summary: Initial document enhancement
agent: editor
---

This is the template content.`;

export const mockSystemPrompt = `You are a professional document collaborator...`;
```

### Integration Tests

#### API Integration
```javascript
// tests/integration.test.js
describe('API Integration', () => {
  it('should fetch prompt with system prompt', async () => {
    const response = await request(app)
      .get('/api/prompts/form-initial?include_system=true');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('template');
    expect(response.body).toHaveProperty('system_prompt');
    expect(response.body.system_prompt).toContain('You are a professional');
  });
});
```

#### Database Integration
```javascript
// tests/database.test.js
describe('Database Integration', () => {
  beforeEach(async () => {
    await db.query('DELETE FROM conversation_state');
  });

  it('should save and retrieve conversation state', async () => {
    const state = {
      conversation_id: 'test-123',
      chat_id: 'chat-456',
      project_name: 'Test Project'
    };

    await saveConversationState(state);
    const retrieved = await getConversationState('test-123');
    
    expect(retrieved.conversation_id).toBe('test-123');
    expect(retrieved.chat_id).toBe('chat-456');
  });
});
```

### Performance Tests

#### Load Testing
```javascript
// tests/performance.test.js
describe('Performance Tests', () => {
  it('should handle concurrent requests', async () => {
    const requests = Array(10).fill().map(() => 
      request(app).get('/api/prompts')
    );

    const start = Date.now();
    const responses = await Promise.all(requests);
    const duration = Date.now() - start;

    expect(responses.every(r => r.status === 200)).toBe(true);
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});
```

## Code Review Process

### Self-Review Checklist

#### Code Quality
- [ ] Code follows style guidelines
- [ ] Functions are well-documented
- [ ] Error handling is appropriate
- [ ] No hardcoded values
- [ ] Input validation is present

#### Testing
- [ ] Unit tests cover new functionality
- [ ] Integration tests verify API behavior
- [ ] Edge cases are tested
- [ ] Error conditions are tested
- [ ] Performance is acceptable

#### Security
- [ ] No sensitive data in logs
- [ ] Input validation prevents injection
- [ ] Authentication is properly implemented
- [ ] Authorization is enforced
- [ ] No security vulnerabilities

### Peer Review Guidelines

#### Review Focus Areas
1. **Functionality**: Does the code work as intended?
2. **Quality**: Is the code well-written and maintainable?
3. **Testing**: Are tests comprehensive and effective?
4. **Security**: Are there any security concerns?
5. **Performance**: Is the code efficient?

#### Review Process
1. **Initial Review**: Check for obvious issues
2. **Detailed Review**: Examine code logic and structure
3. **Testing Review**: Verify test coverage and quality
4. **Security Review**: Check for security issues
5. **Final Approval**: Approve or request changes

## Documentation Requirements

### Code Documentation

#### Function Documentation
```javascript
/**
 * Fetches a prompt template with optional system prompt
 * @param {string} promptId - The unique identifier for the prompt
 * @param {Object} options - Configuration options
 * @param {boolean} options.includeSystem - Whether to include system prompt
 * @param {boolean} options.useCache - Whether to use cached version
 * @returns {Promise<Object>} Promise resolving to prompt data
 * @throws {Error} When prompt is not found or fetch fails
 * @example
 * const prompt = await fetchPrompt('form-initial', { includeSystem: true });
 */
async function fetchPrompt(promptId, options = {}) {
  // Implementation
}
```

#### API Documentation
```javascript
/**
 * @api {get} /api/prompts/:id Get Prompt Template
 * @apiName GetPrompt
 * @apiGroup Prompts
 * @apiParam {String} id Prompt unique ID
 * @apiQuery {Boolean} [include_system=false] Include system prompt
 * @apiSuccess {String} id Prompt ID
 * @apiSuccess {String} name Prompt name
 * @apiSuccess {String} template Prompt template content
 * @apiSuccess {String} [system_prompt] System prompt if requested
 * @apiError {404} NotFound Prompt not found
 * @apiError {500} ServerError Internal server error
 */
```

### README Updates

#### Feature Documentation
```markdown
## New Feature: Prompt Caching

### Overview
Added caching support for prompt templates to improve performance.

### Usage
```javascript
const prompt = await fetchPrompt('form-initial', { useCache: true });
```

### Configuration
Set cache TTL in environment variables:
```bash
TEMPLATE_TTL_MS=300000  # 5 minutes
```
```

## Performance Guidelines

### Optimization Strategies

#### Caching
```javascript
// Good - implement caching
const cacheKey = `prompt_${promptId}`;
const cached = cache.get(cacheKey);
if (cached) {
  return cached;
}

const result = await fetchFromSource();
cache.put(cacheKey, result, TTL);
return result;
```

#### Database Optimization
```javascript
// Good - use indexes and efficient queries
const query = `
  SELECT * FROM document_embeddings 
  WHERE embedding <=> $1 < 0.5 
  ORDER BY embedding <=> $1 
  LIMIT 10
`;
```

#### Memory Management
```javascript
// Good - clean up resources
async function processLargeDataset(data) {
  const results = [];
  
  for (const item of data) {
    const processed = await processItem(item);
    results.push(processed);
    
    // Clean up if needed
    if (results.length % 100 === 0) {
      await new Promise(resolve => setImmediate(resolve));
    }
  }
  
  return results;
}
```

## Security Guidelines

### Input Validation
```javascript
// Validate all inputs
function validateInput(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  if (input.length > MAX_LENGTH) {
    throw new Error('Input too long');
  }
  
  // Sanitize input
  return input.replace(/[<>]/g, '');
}
```

### Error Handling
```javascript
// Don't expose sensitive information
try {
  const result = await sensitiveOperation();
  return result;
} catch (error) {
  console.error('Operation failed:', error);
  throw new Error('Operation failed'); // Generic error message
}
```

### Authentication
```javascript
// Implement proper authentication
function authenticateRequest(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

## Deployment Considerations

### Environment Configuration
```javascript
// Use environment variables
const config = {
  port: process.env.PORT || 3000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'n8n_llm_workflow'
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300000
  }
};
```

### Health Checks
```javascript
// Implement health checks
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await db.query('SELECT 1');
    
    // Check cache connection
    await cache.ping();
    
    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        cache: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## Getting Help

### Resources
- **Documentation**: Comprehensive docs in `docs/` directory
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Code Examples**: Existing code in repository

### Community
- **Slack**: Community Slack channel
- **Discord**: Community Discord server
- **Forum**: Community forum
- **Email**: maintainer@example.com

## Thank You

Thank you for contributing to the n8n LLM Document Workflow! Your code contributions help improve the system for all users.
