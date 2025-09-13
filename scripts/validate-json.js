#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Initialize AJV with formats
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// n8n workflow JSON schema (simplified)
const n8nWorkflowSchema = {
  type: 'object',
  required: ['name', 'nodes'],
  properties: {
    name: { type: 'string' },
    nodes: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'type', 'typeVersion', 'position', 'parameters'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          type: { type: 'string' },
          typeVersion: { type: 'number' },
          position: {
            type: 'array',
            items: { type: 'number' },
            minItems: 2,
            maxItems: 2
          },
          parameters: { type: 'object' }
        }
      }
    }
  }
};

// Generic JSON schema for other files
const genericJsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    version: { type: 'string' },
    status: { type: 'string' }
  }
};

function validateJsonFile(filePath) {
  try {
    console.log(`🔍 Validating ${filePath}...`);

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Choose schema based on file type
    let schema;
    if (filePath.includes('ResearchBug.json')) {
      schema = n8nWorkflowSchema;
    } else {
      schema = genericJsonSchema;
    }

    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (valid) {
      console.log(`✅ ${filePath} is valid`);
      return true;
    } else {
      console.log(`❌ ${filePath} has validation errors:`);
      validate.errors.forEach(error => {
        console.log(`  - ${error.instancePath}: ${error.message}`);
      });
      return false;
    }
  } catch (error) {
    console.log(`❌ ${filePath} has syntax errors: ${error.message}`);
    return false;
  }
}

function main() {
  const filesToValidate = [
    './ResearchBug.json',
    './bug_temp.json',
    './prompts/index.json'
  ];

  let allValid = true;

  filesToValidate.forEach(file => {
    if (fs.existsSync(file)) {
      if (!validateJsonFile(file)) {
        allValid = false;
      }
    } else {
      console.log(`⚠️  ${file} not found, skipping...`);
    }
  });

  if (allValid) {
    console.log('🎉 All JSON files are valid!');
    process.exit(0);
  } else {
    console.log('💥 Some JSON files have errors!');
    process.exit(1);
  }
}

main();
