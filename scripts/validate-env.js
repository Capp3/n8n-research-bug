#!/usr/bin/env node

/**
 * Environment Validation Script
 * Validates that all required environment variables are properly configured
 */

const fs = require('fs');
const path = require('path');

// Required environment variables
const REQUIRED_VARS = {
  // Docker Compose Services
  'SUPPORT_REDIS_PORT': 'Redis port',
  'SUPPORT_POSTGRES_PASSWORD': 'PostgreSQL password',
  'SUPPORT_POSTGRES_USER': 'PostgreSQL user',
  'SUPPORT_POSTGRES_DB': 'PostgreSQL database name',
  'SUPPORT_POSTGRES_PORT': 'PostgreSQL port',
  'SUPPORT_ADMINER_PORT': 'Adminer port',

  // Prompt Server
  'PORT': 'Server port',
  'PROMPTS_INDEX_URL': 'Prompts index URL',
  'PROMPTS_BASE_RAW': 'Prompts base URL',
  'SYSTEM_PROMPT_MODE': 'System prompt mode',

  // Database Connection
  'DB_HOST': 'Database host',
  'DB_PORT': 'Database port',
  'DB_NAME': 'Database name',
  'DB_USER': 'Database user',
  'DB_PASSWORD': 'Database password',
  'DB_SSL': 'Database SSL setting',

  // Chat Memory
  'CHAT_MEMORY_TTL_DAYS': 'Chat memory TTL days',
  'MAX_CONVERSATION_LENGTH': 'Max conversation length'
};

// Optional environment variables with defaults
const OPTIONAL_VARS = {
  'SYSTEM_PROMPT_URL': 'System prompt URL',
  'SYSTEM_PROMPTS_INDEX_URL': 'System prompts index URL',
  'INDEX_TTL_MS': 'Index TTL milliseconds',
  'TEMPLATE_TTL_MS': 'Template TTL milliseconds',
  'SYS_TTL_MS': 'System TTL milliseconds',
  'HTTP_TIMEOUT_MS': 'HTTP timeout milliseconds',
  'RETRY_COUNT': 'Retry count',
  'MAX_PROMPT_SIZE': 'Max prompt size',
  'MAX_DOC_SIZE': 'Max document size',
  'DEBUG': 'Debug setting'
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return env;
}

function validateEnvironment() {
  console.log('🔍 Validating environment configuration...\n');

  // Check for .env file
  const envPath = path.join(process.cwd(), '.env');
  const sampleEnvPath = path.join(process.cwd(), 'sample.env');

  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found');
    if (fs.existsSync(sampleEnvPath)) {
      console.log('💡 Copy sample.env to .env: cp sample.env .env');
    }
    return false;
  }

  // Load environment variables
  const env = loadEnvFile(envPath);
  if (!env) {
    console.log('❌ Failed to load .env file');
    return false;
  }

  let isValid = true;
  let missingVars = [];
  let warnings = [];

  // Check required variables
  console.log('📋 Checking required environment variables:');
  Object.entries(REQUIRED_VARS).forEach(([varName, description]) => {
    if (env[varName]) {
      console.log(`  ✅ ${varName}: ${env[varName]}`);
    } else {
      console.log(`  ❌ ${varName}: Missing (${description})`);
      missingVars.push(varName);
      isValid = false;
    }
  });

  // Check optional variables
  console.log('\n📋 Checking optional environment variables:');
  Object.entries(OPTIONAL_VARS).forEach(([varName, description]) => {
    if (env[varName]) {
      console.log(`  ✅ ${varName}: ${env[varName]}`);
    } else {
      console.log(`  ⚠️  ${varName}: Not set (${description}) - will use default`);
      warnings.push(varName);
    }
  });

  // Validate specific values
  console.log('\n🔍 Validating configuration values:');

  // Check port numbers
  const ports = ['PORT', 'SUPPORT_REDIS_PORT', 'SUPPORT_POSTGRES_PORT', 'SUPPORT_ADMINER_PORT', 'DB_PORT'];
  ports.forEach(portVar => {
    if (env[portVar]) {
      const port = parseInt(env[portVar]);
      if (isNaN(port) || port < 1 || port > 65535) {
        console.log(`  ❌ ${portVar}: Invalid port number (${env[portVar]})`);
        isValid = false;
      } else {
        console.log(`  ✅ ${portVar}: Valid port (${port})`);
      }
    }
  });

  // Check numeric values
  const numericVars = ['INDEX_TTL_MS', 'TEMPLATE_TTL_MS', 'SYS_TTL_MS', 'HTTP_TIMEOUT_MS', 'RETRY_COUNT', 'MAX_PROMPT_SIZE', 'MAX_DOC_SIZE', 'CHAT_MEMORY_TTL_DAYS', 'MAX_CONVERSATION_LENGTH'];
  numericVars.forEach(varName => {
    if (env[varName]) {
      const value = parseInt(env[varName]);
      if (isNaN(value) || value < 0) {
        console.log(`  ❌ ${varName}: Invalid numeric value (${env[varName]})`);
        isValid = false;
      } else {
        console.log(`  ✅ ${varName}: Valid number (${value})`);
      }
    }
  });

  // Check boolean values
  if (env['DB_SSL']) {
    const sslValue = env['DB_SSL'].toLowerCase();
    if (sslValue !== 'true' && sslValue !== 'false') {
      console.log(`  ❌ DB_SSL: Invalid boolean value (${env['DB_SSL']}) - should be 'true' or 'false'`);
      isValid = false;
    } else {
      console.log(`  ✅ DB_SSL: Valid boolean (${sslValue})`);
    }
  }

  // Check system prompt mode
  if (env['SYSTEM_PROMPT_MODE']) {
    const validModes = ['inline', 'shared_url', 'per_agent_urls'];
    if (!validModes.includes(env['SYSTEM_PROMPT_MODE'])) {
      console.log(`  ❌ SYSTEM_PROMPT_MODE: Invalid mode (${env['SYSTEM_PROMPT_MODE']}) - should be one of: ${validModes.join(', ')}`);
      isValid = false;
    } else {
      console.log(`  ✅ SYSTEM_PROMPT_MODE: Valid mode (${env['SYSTEM_PROMPT_MODE']})`);
    }
  }

  // Summary
  console.log('\n📊 Validation Summary:');
  if (isValid) {
    console.log('✅ Environment configuration is valid');
    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} optional variables not set (using defaults)`);
    }
  } else {
    console.log('❌ Environment configuration has errors');
    console.log(`❌ ${missingVars.length} required variables missing`);
  }

  // Recommendations
  if (missingVars.length > 0) {
    console.log('\n💡 Recommendations:');
    console.log('1. Copy sample.env to .env: cp sample.env .env');
    console.log('2. Review the configuration in your .env file');
    console.log('3. See ENVIRONMENT_SETUP.md for detailed instructions');
  }

  return isValid;
}

// Run validation
if (require.main === module) {
  const isValid = validateEnvironment();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateEnvironment, loadEnvFile };
