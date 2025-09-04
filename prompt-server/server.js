require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const cache = require('memory-cache');
const yaml = require('js-yaml');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Constants
const PROMPTS_INDEX_URL = process.env.PROMPTS_INDEX_URL || 'https://raw.githubusercontent.com/Capp3/n8n-research-bug/main/prompts/index.json';
const PROMPTS_BASE_RAW = process.env.PROMPTS_BASE_RAW || 'https://raw.githubusercontent.com/Capp3/n8n-research-bug/main/';
const SYSTEM_PROMPT_MODE = process.env.SYSTEM_PROMPT_MODE || 'inline';
const SYSTEM_PROMPT_URL = process.env.SYSTEM_PROMPT_URL || '';
const SYSTEM_PROMPTS_INDEX_URL = process.env.SYSTEM_PROMPTS_INDEX_URL || '';

const INDEX_TTL_MS = parseInt(process.env.INDEX_TTL_MS || '300000');
const TEMPLATE_TTL_MS = parseInt(process.env.TEMPLATE_TTL_MS || '300000');
const SYS_TTL_MS = parseInt(process.env.SYS_TTL_MS || '300000');
const HTTP_TIMEOUT_MS = parseInt(process.env.HTTP_TIMEOUT_MS || '10000');
const RETRY_COUNT = parseInt(process.env.RETRY_COUNT || '2');
const MAX_PROMPT_SIZE = parseInt(process.env.MAX_PROMPT_SIZE || '204800'); // 200KB
const MAX_DOC_SIZE = parseInt(process.env.MAX_DOC_SIZE || '512000'); // 500KB

// Base system prompt (shared core)
const BASE_SYSTEM_PROMPT = `You are a professional document collaborator operating in a multi-agent workflow. Read the entire document before writing. Maintain the author's tone, improve clarity and structure, and strictly follow markdown best practices (heading hierarchy, concise paragraphs, meaningful bullets, tables when helpful). Work iteratively with focused changes. Ask concise clarifying questions only when necessary.

Be deterministic and consistent. Prefer explicit, scannable outputs. Use mermaid diagrams only for brief plan visualizations when it significantly improves clarity.`;

// Agent-specific addenda
const AGENT_ADDENDA = {
  editor: `

- Emphasize small, targeted edits per turn
- Ask up to 3 clarifying questions only when blockers exist
- Include brief mermaid only for plan clarity`,

  research: `

- Cite official/primary sources; include inline links and a short References section
- Prefer concise, scannable outputs; use tables for comparisons
- Ask at most 2 clarifying questions if direction is ambiguous`,

  reviewer: `

- Be deterministic; no rewriting, only guidance
- Flag structure, tone consistency, citation sufficiency, completeness
- Provide specific, actionable bullets`,

  editor_merge: `

- Integrate all parts into coherent final markdown
- Ensure heading hierarchy, integrated citations, and consistent tone
- Keep outputs deterministic and stable`
};

/**
 * HTTP GET with retry and TTL cache
 * @param {string} url - URL to fetch
 * @param {string} cacheKey - Key for caching
 * @param {number} ttlMs - TTL in milliseconds
 * @returns {Promise<string>} - Response data
 */
async function fetchWithRetryAndCache(url, cacheKey, ttlMs) {
  // Check cache first
  const cachedValue = cache.get(cacheKey);
  if (cachedValue) {
    return cachedValue;
  }

  // Retry logic
  let lastError;
  for (let attempt = 0; attempt < RETRY_COUNT; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: HTTP_TIMEOUT_MS,
        validateStatus: status => status >= 200 && status < 300
      });

      // Cache successful response
      cache.put(cacheKey, response.data, ttlMs);
      return response.data;
    } catch (error) {
      lastError = error;

      // Check for rate limiting
      if (error.response && (error.response.status === 429 || error.response.status === 403)) {
        // Exponential backoff
        const backoffMs = Math.pow(2, attempt) * 300;
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        continue;
      }

      // For other errors, try again immediately
    }
  }

  // If we get here, all attempts failed
  throw lastError || new Error(`Failed to fetch ${url} after ${RETRY_COUNT} attempts`);
}

/**
 * Parse frontmatter from markdown content
 * @param {string} content - Markdown content with frontmatter
 * @returns {Object} - { frontmatter, content }
 */
function parseFrontmatter(content) {
  try {
    if (!content.startsWith('---')) {
      return { frontmatter: {}, content };
    }

    const endIndex = content.indexOf('---', 3);
    if (endIndex === -1) {
      return { frontmatter: {}, content };
    }

    const frontmatterStr = content.substring(3, endIndex).trim();
    const frontmatter = yaml.load(frontmatterStr);
    const cleanContent = content.substring(endIndex + 3).trim();

    return { frontmatter, content: cleanContent };
  } catch (error) {
    console.error('Error parsing frontmatter:', error);
    return { frontmatter: {}, content };
  }
}

/**
 * Generate system prompt based on agent type
 * @param {string} agentType - Type of agent
 * @returns {string} - System prompt
 */
function generateSystemPrompt(agentType) {
  const addendum = AGENT_ADDENDA[agentType] || '';
  return BASE_SYSTEM_PROMPT + addendum;
}

/**
 * Resolve system prompt based on mode and agent type
 * @param {string} agentType - Type of agent
 * @returns {Promise<string>} - System prompt
 */
async function resolveSystemPrompt(agentType) {
  switch (SYSTEM_PROMPT_MODE) {
    case 'inline':
      return generateSystemPrompt(agentType);

    case 'shared_url':
      if (!SYSTEM_PROMPT_URL) {
        return generateSystemPrompt(agentType);
      }
      try {
        const cacheKey = `system_prompt_shared`;
        const systemPromptBase = await fetchWithRetryAndCache(
          SYSTEM_PROMPT_URL,
          cacheKey,
          SYS_TTL_MS
        );
        return systemPromptBase;
      } catch (error) {
        console.error('Error fetching shared system prompt:', error);
        return generateSystemPrompt(agentType);
      }

    case 'per_agent_urls':
      if (!SYSTEM_PROMPTS_INDEX_URL) {
        return generateSystemPrompt(agentType);
      }
      try {
        // Fetch system prompts index
        const cacheKey = `system_prompts_index`;
        const systemPromptsIndex = await fetchWithRetryAndCache(
          SYSTEM_PROMPTS_INDEX_URL,
          cacheKey,
          SYS_TTL_MS
        );

        // Find agent-specific prompt URL
        const agentPrompt = systemPromptsIndex.find(p => p.agent === agentType);
        if (!agentPrompt || !agentPrompt.path) {
          return generateSystemPrompt(agentType);
        }

        // Fetch agent-specific system prompt
        const agentCacheKey = `system_prompt_${agentType}`;
        const agentSystemPrompt = await fetchWithRetryAndCache(
          agentPrompt.path,
          agentCacheKey,
          SYS_TTL_MS
        );
        return agentSystemPrompt;
      } catch (error) {
        console.error('Error fetching agent-specific system prompt:', error);
        return generateSystemPrompt(agentType);
      }

    default:
      return generateSystemPrompt(agentType);
  }
}

// Routes

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/prompts
 * Get list of available prompts
 */
app.get('/api/prompts', async (req, res) => {
  try {
    const promptsIndex = await fetchWithRetryAndCache(
      PROMPTS_INDEX_URL,
      'prompts_index',
      INDEX_TTL_MS
    );

    // Filter for UI visibility if requested
    const uiOnly = req.query.ui_visible === 'true';
    let prompts = promptsIndex;

    if (uiOnly) {
      prompts = promptsIndex.filter(p => p.ui_visible === true);
    }

    res.status(200).json(prompts);
  } catch (error) {
    console.error('Error fetching prompts index:', error);
    res.status(500).json({
      error: 'Failed to fetch prompts index',
      message: error.message
    });
  }
});

/**
 * GET /api/prompts/:id
 * Get a specific prompt by ID
 */
app.get('/api/prompts/:id', async (req, res) => {
  try {
    // Fetch and cache the prompts index
    const promptsIndex = await fetchWithRetryAndCache(
      PROMPTS_INDEX_URL,
      'prompts_index',
      INDEX_TTL_MS
    );

    // Find the requested prompt
    const prompt = promptsIndex.find(p => p.id === req.params.id);
    if (!prompt) {
      return res.status(404).json({
        error: 'Prompt not found',
        message: `No prompt with ID '${req.params.id}' exists`
      });
    }

    // Fetch the prompt template
    const promptPath = prompt.path.startsWith('http')
      ? prompt.path
      : `${PROMPTS_BASE_RAW}${prompt.path}`;

    const cacheKey = `prompt_${req.params.id}`;
    const promptContent = await fetchWithRetryAndCache(
      promptPath,
      cacheKey,
      TEMPLATE_TTL_MS
    );

    // Parse frontmatter
    const { frontmatter, content } = parseFrontmatter(promptContent);

    // Verify size limits
    if (content.length > MAX_PROMPT_SIZE) {
      return res.status(413).json({
        error: 'Prompt too large',
        message: `Prompt exceeds maximum size of ${MAX_PROMPT_SIZE} bytes`
      });
    }

    // Get system prompt if requested
    let systemPrompt = null;
    if (req.query.include_system === 'true') {
      const agentType = frontmatter.agent || prompt.agent || 'editor';
      systemPrompt = await resolveSystemPrompt(agentType);
    }

    res.status(200).json({
      id: prompt.id,
      name: prompt.name,
      template: content,
      frontmatter,
      system_prompt: systemPrompt,
      metadata: {
        path: prompt.path,
        agent: frontmatter.agent || prompt.agent || 'editor',
        requires: frontmatter.requires || prompt.requires || [],
        optional: frontmatter.optional || prompt.optional || []
      }
    });
  } catch (error) {
    console.error(`Error fetching prompt ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to fetch prompt',
      message: error.message
    });
  }
});

/**
 * GET /api/system-prompt/:agent
 * Get system prompt for a specific agent type
 */
app.get('/api/system-prompt/:agent', async (req, res) => {
  try {
    const agentType = req.params.agent;
    if (!['editor', 'research', 'reviewer', 'editor_merge'].includes(agentType)) {
      return res.status(400).json({
        error: 'Invalid agent type',
        message: `Agent type '${agentType}' is not supported`
      });
    }

    const systemPrompt = await resolveSystemPrompt(agentType);

    res.status(200).json({
      agent: agentType,
      system_prompt: systemPrompt,
      mode: SYSTEM_PROMPT_MODE
    });
  } catch (error) {
    console.error(`Error fetching system prompt for ${req.params.agent}:`, error);
    res.status(500).json({
      error: 'Failed to fetch system prompt',
      message: error.message
    });
  }
});

/**
 * GET /api/config
 * Get server configuration
 */
app.get('/api/config', (req, res) => {
  res.status(200).json({
    prompts_index_url: PROMPTS_INDEX_URL,
    prompts_base_raw: PROMPTS_BASE_RAW,
    system_prompt_mode: SYSTEM_PROMPT_MODE,
    cache_ttl: {
      index: INDEX_TTL_MS,
      template: TEMPLATE_TTL_MS,
      system: SYS_TTL_MS
    },
    http: {
      timeout: HTTP_TIMEOUT_MS,
      retry_count: RETRY_COUNT
    },
    limits: {
      max_prompt_size: MAX_PROMPT_SIZE,
      max_doc_size: MAX_DOC_SIZE
    }
  });
});

// Export app for testing
module.exports = app;

// Start the server only if this file is run directly
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Prompt server running on port ${port}`);
    console.log(`Using prompts index: ${PROMPTS_INDEX_URL}`);
    console.log(`System prompt mode: ${SYSTEM_PROMPT_MODE}`);
  });
}
