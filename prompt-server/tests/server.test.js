const request = require('supertest');
const axios = require('axios');
const cache = require('memory-cache');

// Mock axios and memory-cache
jest.mock('axios');
jest.mock('memory-cache');

// Set environment variables for testing
process.env.PROMPTS_INDEX_URL = 'http://localhost:3000/test-prompts/index.json';
process.env.PROMPTS_BASE_RAW = 'http://localhost:3000/test-prompts/';

// Import server after mocking dependencies
const app = require('../server');

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
        { id: 'form-initial', name: 'Form: Initial', path: 'path/to/form.md', ui_visible: true },
        { id: 'telegram-ongoing', name: 'Telegram: Ongoing', path: 'path/to/telegram.md', ui_visible: true },
        { id: 'research-addendum', name: 'Research: Addendum', path: 'path/to/research.md', ui_visible: false }
      ];

      axios.get.mockResolvedValueOnce({ data: mockPrompts });

      const response = await request(app).get('/api/prompts');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPrompts);
      expect(axios.get).toHaveBeenCalledTimes(1);
    });

    it('should filter prompts by ui_visible when query param is set', async () => {
      const mockPrompts = [
        { id: 'form-initial', name: 'Form: Initial', path: 'path/to/form.md', ui_visible: true },
        { id: 'telegram-ongoing', name: 'Telegram: Ongoing', path: 'path/to/telegram.md', ui_visible: true },
        { id: 'research-addendum', name: 'Research: Addendum', path: 'path/to/research.md', ui_visible: false }
      ];

      axios.get.mockResolvedValueOnce({ data: mockPrompts });

      const response = await request(app).get('/api/prompts?ui_visible=true');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: 'form-initial', name: 'Form: Initial', path: 'path/to/form.md', ui_visible: true },
        { id: 'telegram-ongoing', name: 'Telegram: Ongoing', path: 'path/to/telegram.md', ui_visible: true }
      ]);
    });

    it('should handle errors when fetching prompts', async () => {
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      const response = await request(app).get('/api/prompts');
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch prompts index');
    });
  });

  describe('GET /api/prompts/:id', () => {
    it('should return a specific prompt with parsed frontmatter', async () => {
      const mockPrompts = [
        { id: 'form-initial', name: 'Form: Initial', path: 'form/initial.md', agent: 'editor' }
      ];

      const mockPromptContent = `---
title: Form: Initial
summary: Initial form template
agent: editor
---

This is the template content.`;

      // Mock the prompts index fetch
      axios.get.mockImplementation((url) => {
        if (url.includes('test-prompts/index.json')) {
          return Promise.resolve({ data: mockPrompts });
        } else if (url.includes('test-prompts/form/initial.md')) {
          return Promise.resolve({ data: mockPromptContent });
        }
        return Promise.reject(new Error('Unexpected URL: ' + url));
      });

      const response = await request(app).get('/api/prompts/form-initial');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 'form-initial');
      expect(response.body).toHaveProperty('name', 'Form: Initial');
      expect(response.body).toHaveProperty('template', 'This is the template content.');
      expect(response.body).toHaveProperty('frontmatter');
      expect(response.body.frontmatter).toHaveProperty('title', 'Form: Initial');
      expect(response.body.frontmatter).toHaveProperty('agent', 'editor');
    });

    it('should include system prompt when requested', async () => {
      const mockPrompts = [
        { id: 'form-initial', name: 'Form: Initial', path: 'path/to/form.md', agent: 'editor' }
      ];

      const mockPromptContent = `---
title: Form: Initial
summary: Initial form template
agent: editor
---

This is the template content.`;

      axios.get.mockResolvedValueOnce({ data: mockPrompts });
      axios.get.mockResolvedValueOnce({ data: mockPromptContent });

      const response = await request(app).get('/api/prompts/form-initial?include_system=true');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('system_prompt');
      expect(response.body.system_prompt).toContain('You are a professional document collaborator');
      expect(response.body.system_prompt).toContain('Ask up to 3 clarifying questions');
    });

    it('should return 404 for non-existent prompt', async () => {
      const mockPrompts = [
        { id: 'form-initial', name: 'Form: Initial', path: 'path/to/form.md' }
      ];

      axios.get.mockResolvedValueOnce({ data: mockPrompts });

      const response = await request(app).get('/api/prompts/non-existent');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Prompt not found');
    });
  });

  describe('GET /api/system-prompt/:agent', () => {
    it('should return system prompt for a valid agent type', async () => {
      const response = await request(app).get('/api/system-prompt/editor');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('agent', 'editor');
      expect(response.body).toHaveProperty('system_prompt');
      expect(response.body).toHaveProperty('mode', 'inline');
      expect(response.body.system_prompt).toContain('You are a professional document collaborator');
      expect(response.body.system_prompt).toContain('Ask up to 3 clarifying questions');
    });

    it('should return 400 for invalid agent type', async () => {
      const response = await request(app).get('/api/system-prompt/invalid');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid agent type');
    });
  });

  describe('GET /api/config', () => {
    it('should return server configuration', async () => {
      const response = await request(app).get('/api/config');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('prompts_index_url');
      expect(response.body).toHaveProperty('system_prompt_mode');
      expect(response.body).toHaveProperty('cache_ttl');
      expect(response.body).toHaveProperty('http');
      expect(response.body).toHaveProperty('limits');
    });
  });
});
