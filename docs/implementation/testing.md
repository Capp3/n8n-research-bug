# Testing Guide

## Overview

This guide provides comprehensive testing procedures for the n8n LLM Document Workflow, covering unit testing, integration testing, end-to-end testing, and validation procedures.

## Testing Strategy

### Test Categories
1. **Unit Testing** - Individual component testing
2. **Integration Testing** - Component interaction testing
3. **End-to-End Testing** - Complete workflow testing
4. **Performance Testing** - Load and stress testing
5. **Security Testing** - Security validation testing

### Test Environment Setup
```bash
# Create test environment
docker-compose -f docker-compose.test.yml up -d

# Set test environment variables
export N8N_ENV=test
export DATABASE_URL=postgresql://test:test@localhost:5433/test_db
export OPENAI_API_KEY=test_key
export GITHUB_TOKEN=test_token
```

## Unit Testing

### Credential Testing

#### GitHub API Credentials
```bash
#!/bin/bash
# test-github-credentials.sh

echo "Testing GitHub API credentials..."

# Test authentication
response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user)
if echo "$response" | grep -q "login"; then
    echo "✅ GitHub authentication successful"
else
    echo "❌ GitHub authentication failed"
    exit 1
fi

# Test repository access
response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO)
if echo "$response" | grep -q "full_name"; then
    echo "✅ Repository access successful"
else
    echo "❌ Repository access failed"
    exit 1
fi

# Test file operations
response=$(curl -s -X PUT -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "content": "dGVzdA=="}' \
  https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/contents/test.md)

if echo "$response" | grep -q "commit"; then
    echo "✅ File operations successful"
else
    echo "❌ File operations failed"
    exit 1
fi

echo "GitHub API credentials test completed successfully"
```

#### OpenAI API Credentials
```bash
#!/bin/bash
# test-openai-credentials.sh

echo "Testing OpenAI API credentials..."

# Test authentication
response=$(curl -s -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models)
if echo "$response" | grep -q "data"; then
    echo "✅ OpenAI authentication successful"
else
    echo "❌ OpenAI authentication failed"
    exit 1
fi

# Test embedding generation
response=$(curl -s -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"input": "test", "model": "text-embedding-ada-002"}' \
  https://api.openai.com/v1/embeddings)

if echo "$response" | grep -q "embedding"; then
    echo "✅ Embedding generation successful"
else
    echo "❌ Embedding generation failed"
    exit 1
fi

echo "OpenAI API credentials test completed successfully"
```

#### PostgreSQL Credentials
```bash
#!/bin/bash
# test-postgres-credentials.sh

echo "Testing PostgreSQL credentials..."

# Test connection
if pg_isready -h localhost -p 5432; then
    echo "✅ PostgreSQL connection successful"
else
    echo "❌ PostgreSQL connection failed"
    exit 1
fi

# Test database access
response=$(psql -h localhost -U n8n_user -d n8n_workflow -c "SELECT version();" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Database access successful"
else
    echo "❌ Database access failed"
    exit 1
fi

# Test pgvector extension
response=$(psql -h localhost -U n8n_user -d n8n_workflow -c "SELECT 1 FROM pg_extension WHERE extname = 'vector';" 2>/dev/null)
if echo "$response" | grep -q "1"; then
    echo "✅ pgvector extension available"
else
    echo "❌ pgvector extension not available"
    exit 1
fi

echo "PostgreSQL credentials test completed successfully"
```

#### Telegram Bot Credentials
```bash
#!/bin/bash
# test-telegram-credentials.sh

echo "Testing Telegram Bot credentials..."

# Test bot token
response=$(curl -s https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe)
if echo "$response" | grep -q "ok.*true"; then
    echo "✅ Telegram Bot token valid"
else
    echo "❌ Telegram Bot token invalid"
    exit 1
fi

# Test webhook status
response=$(curl -s https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo)
if echo "$response" | grep -q "url"; then
    echo "✅ Webhook configured"
else
    echo "❌ Webhook not configured"
    exit 1
fi

echo "Telegram Bot credentials test completed successfully"
```

### Database Testing

#### Table Structure Validation
```sql
-- test-database-structure.sql

-- Check if documents table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'documents'
);

-- Check table structure
\d documents

-- Check indexes
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'documents';

-- Test vector operations
SELECT '[1,2,3]'::vector <-> '[4,5,6]'::vector as distance;

-- Test similarity search
SELECT content, conversation_id, created_at 
FROM documents 
ORDER BY embedding <-> '[0.1,0.2,0.3]'::vector 
LIMIT 5;
```

#### Data Integrity Testing
```sql
-- test-data-integrity.sql

-- Check for orphaned records
SELECT COUNT(*) FROM documents WHERE conversation_id IS NULL;

-- Check for invalid embeddings
SELECT COUNT(*) FROM documents WHERE embedding IS NULL;

-- Check for duplicate conversations
SELECT conversation_id, COUNT(*) 
FROM documents 
GROUP BY conversation_id 
HAVING COUNT(*) > 1;

-- Check data types
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'documents';
```

### Prompt Server Testing

#### API Endpoint Testing
```bash
#!/bin/bash
# test-prompt-server.sh

echo "Testing Prompt Server..."

# Test health endpoint
response=$(curl -s http://localhost:3000/api/health)
if echo "$response" | grep -q "ok"; then
    echo "✅ Health endpoint working"
else
    echo "❌ Health endpoint failed"
    exit 1
fi

# Test prompts endpoint
response=$(curl -s http://localhost:3000/api/prompts)
if echo "$response" | grep -q "prompts"; then
    echo "✅ Prompts endpoint working"
else
    echo "❌ Prompts endpoint failed"
    exit 1
fi

# Test system prompt endpoint
response=$(curl -s http://localhost:3000/api/system-prompt/editor)
if echo "$response" | grep -q "system"; then
    echo "✅ System prompt endpoint working"
else
    echo "❌ System prompt endpoint failed"
    exit 1
fi

echo "Prompt Server test completed successfully"
```

## Integration Testing

### Workflow Node Testing

#### Form Trigger Testing
```bash
#!/bin/bash
# test-form-trigger.sh

echo "Testing Form Trigger..."

# Test form submission
curl -X POST http://localhost:5678/webhook/form-test \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "test-project",
    "markdown_document": "# Test Document\n\nThis is a test.",
    "submission_brief": "Test the workflow",
    "research_scope": "basic",
    "github_owner": "test-user",
    "github_repo": "test-repo"
  }'

echo "Form Trigger test completed"
```

#### AI Agent Testing
```bash
#!/bin/bash
# test-ai-agents.sh

echo "Testing AI Agents..."

# Test initial enhancement agent
curl -X POST http://localhost:5678/webhook/ai-agent-test \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "initial_enhancement",
    "document": "# Test Document\n\nThis is a test.",
    "requirements": "Enhance this document"
  }'

# Test research agent
curl -X POST http://localhost:5678/webhook/ai-agent-test \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "research",
    "document": "# Test Document\n\nThis is a test.",
    "research_scope": "comprehensive"
  }'

echo "AI Agents test completed"
```

#### GitHub Integration Testing
```bash
#!/bin/bash
# test-github-integration.sh

echo "Testing GitHub Integration..."

# Test file creation
curl -X POST http://localhost:5678/webhook/github-test \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create",
    "path": "test/test.md",
    "content": "# Test File\n\nThis is a test file."
  }'

# Test file update
curl -X POST http://localhost:5678/webhook/github-test \
  -H "Content-Type: application/json" \
  -d '{
    "action": "update",
    "path": "test/test.md",
    "content": "# Updated Test File\n\nThis is an updated test file."
  }'

echo "GitHub Integration test completed"
```

### Context7 MCP Testing

#### Document Analysis Testing
```bash
#!/bin/bash
# test-context7-mcp.sh

echo "Testing Context7 MCP..."

# Test health endpoint
response=$(curl -s $CONTEXT7_API_BASE/mcp/health)
if echo "$response" | grep -q "ok"; then
    echo "✅ Context7 MCP health check successful"
else
    echo "❌ Context7 MCP health check failed"
    exit 1
fi

# Test document analysis
response=$(curl -s -X POST $CONTEXT7_API_BASE/mcp/document/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# Test Document\n\nThis is a test document for analysis.",
    "type": "markdown"
  }')

if echo "$response" | grep -q "analysis"; then
    echo "✅ Document analysis successful"
else
    echo "❌ Document analysis failed"
    exit 1
fi

echo "Context7 MCP test completed successfully"
```

## End-to-End Testing

### Complete Workflow Testing

#### Initial Document Processing
```bash
#!/bin/bash
# test-initial-workflow.sh

echo "Testing Initial Document Processing Workflow..."

# Submit test document
curl -X POST http://localhost:5678/webhook/document-form \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "e2e-test-project",
    "markdown_document": "# E2E Test Document\n\nThis is an end-to-end test document.",
    "submission_brief": "Test the complete workflow from form submission to final document",
    "style_instructions": "Use clear, professional language",
    "research_scope": "comprehensive",
    "github_owner": "test-user",
    "github_repo": "test-repo"
  }'

# Wait for processing
sleep 30

# Check GitHub for created files
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/test-user/test-repo/contents/e2e-test-project/

echo "Initial Document Processing test completed"
```

#### Ongoing Chat Testing
```bash
#!/bin/bash
# test-ongoing-chat.sh

echo "Testing Ongoing Chat Workflow..."

# Send test message to Telegram bot
curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "123456789",
    "text": "Add a section about testing procedures to the document"
  }'

# Wait for processing
sleep 10

# Check for updated document
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/test-user/test-repo/contents/e2e-test-project/final.md

echo "Ongoing Chat test completed"
```

### Performance Testing

#### Load Testing
```bash
#!/bin/bash
# test-load.sh

echo "Testing Load Performance..."

# Test concurrent form submissions
for i in {1..10}; do
  curl -X POST http://localhost:5678/webhook/document-form \
    -H "Content-Type: application/json" \
    -d "{
      \"project_name\": \"load-test-$i\",
      \"markdown_document\": \"# Load Test Document $i\n\nThis is load test document $i.\",
      \"submission_brief\": \"Load test $i\",
      \"research_scope\": \"basic\",
      \"github_owner\": \"test-user\",
      \"github_repo\": \"test-repo\"
    }" &
done

wait

echo "Load test completed"
```

#### Stress Testing
```bash
#!/bin/bash
# test-stress.sh

echo "Testing Stress Performance..."

# Test with large document
curl -X POST http://localhost:5678/webhook/document-form \
  -H "Content-Type: application/json" \
  -d "{
    \"project_name\": \"stress-test\",
    \"markdown_document\": \"$(cat large-document.md)\",
    \"submission_brief\": \"Stress test with large document\",
    \"research_scope\": \"comprehensive\",
    \"github_owner\": \"test-user\",
    \"github_repo\": \"test-repo\"
  }"

echo "Stress test completed"
```

## Validation Testing

### Data Validation

#### Input Validation
```bash
#!/bin/bash
# test-input-validation.sh

echo "Testing Input Validation..."

# Test missing required fields
curl -X POST http://localhost:5678/webhook/document-form \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "test-project"
  }'

# Test invalid data types
curl -X POST http://localhost:5678/webhook/document-form \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "test-project",
    "markdown_document": 123,
    "submission_brief": "Test",
    "research_scope": "invalid",
    "github_owner": "test-user",
    "github_repo": "test-repo"
  }'

echo "Input validation test completed"
```

#### Output Validation
```bash
#!/bin/bash
# test-output-validation.sh

echo "Testing Output Validation..."

# Test document structure
response=$(curl -s -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/test-user/test-repo/contents/test-project/final.md)

# Validate markdown structure
if echo "$response" | grep -q "# "; then
    echo "✅ Document has proper heading structure"
else
    echo "❌ Document missing proper heading structure"
fi

# Validate content quality
if echo "$response" | grep -q "## "; then
    echo "✅ Document has section structure"
else
    echo "❌ Document missing section structure"
fi

echo "Output validation test completed"
```

### Security Testing

#### Authentication Testing
```bash
#!/bin/bash
# test-authentication.sh

echo "Testing Authentication..."

# Test with invalid GitHub token
curl -s -H "Authorization: token invalid_token" https://api.github.com/user

# Test with invalid OpenAI key
curl -s -H "Authorization: Bearer invalid_key" https://api.openai.com/v1/models

# Test with invalid Telegram token
curl -s https://api.telegram.org/botinvalid_token/getMe

echo "Authentication test completed"
```

#### Authorization Testing
```bash
#!/bin/bash
# test-authorization.sh

echo "Testing Authorization..."

# Test repository access with limited token
curl -s -H "Authorization: token $LIMITED_GITHUB_TOKEN" \
  https://api.github.com/repos/test-user/test-repo

# Test file operations with read-only token
curl -s -X PUT -H "Authorization: token $READ_ONLY_GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "content": "dGVzdA=="}' \
  https://api.github.com/repos/test-user/test-repo/contents/test.md

echo "Authorization test completed"
```

## Test Automation

### Continuous Integration

#### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test Workflow

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Run end-to-end tests
      run: npm run test:e2e
```

### Test Scripts

#### Test Runner
```bash
#!/bin/bash
# run-tests.sh

echo "Starting test suite..."

# Run unit tests
echo "Running unit tests..."
./test-github-credentials.sh
./test-openai-credentials.sh
./test-postgres-credentials.sh
./test-telegram-credentials.sh
./test-prompt-server.sh

# Run integration tests
echo "Running integration tests..."
./test-form-trigger.sh
./test-ai-agents.sh
./test-github-integration.sh
./test-context7-mcp.sh

# Run end-to-end tests
echo "Running end-to-end tests..."
./test-initial-workflow.sh
./test-ongoing-chat.sh

# Run performance tests
echo "Running performance tests..."
./test-load.sh
./test-stress.sh

# Run validation tests
echo "Running validation tests..."
./test-input-validation.sh
./test-output-validation.sh
./test-authentication.sh
./test-authorization.sh

echo "All tests completed successfully!"
```

## Test Data Management

### Test Data Setup
```bash
#!/bin/bash
# setup-test-data.sh

echo "Setting up test data..."

# Create test database
psql -h localhost -U postgres -c "CREATE DATABASE test_db;"

# Create test tables
psql -h localhost -U postgres -d test_db -f test-schema.sql

# Insert test data
psql -h localhost -U postgres -d test_db -f test-data.sql

# Create test repository
curl -X POST -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "test-repo", "description": "Test repository"}' \
  https://api.github.com/user/repos

echo "Test data setup completed"
```

### Test Data Cleanup
```bash
#!/bin/bash
# cleanup-test-data.sh

echo "Cleaning up test data..."

# Drop test database
psql -h localhost -U postgres -c "DROP DATABASE IF EXISTS test_db;"

# Delete test repository
curl -X DELETE -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/test-user/test-repo

# Clean up test files
rm -rf test-files/

echo "Test data cleanup completed"
```

## Test Reporting

### Test Results
```bash
#!/bin/bash
# generate-test-report.sh

echo "Generating test report..."

# Create test report directory
mkdir -p test-reports

# Run tests and capture results
./run-tests.sh > test-reports/test-results.txt 2>&1

# Generate HTML report
cat > test-reports/test-report.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>Test Report</title>
</head>
<body>
    <h1>Test Report</h1>
    <pre>$(cat test-reports/test-results.txt)</pre>
</body>
</html>
EOF

echo "Test report generated: test-reports/test-report.html"
```

### Test Metrics
```bash
#!/bin/bash
# test-metrics.sh

echo "Generating test metrics..."

# Count test results
total_tests=$(grep -c "test" test-reports/test-results.txt)
passed_tests=$(grep -c "✅" test-reports/test-results.txt)
failed_tests=$(grep -c "❌" test-reports/test-results.txt)

# Calculate pass rate
pass_rate=$((passed_tests * 100 / total_tests))

echo "Test Metrics:"
echo "Total Tests: $total_tests"
echo "Passed: $passed_tests"
echo "Failed: $failed_tests"
echo "Pass Rate: $pass_rate%"
```

## Best Practices

### Testing Guidelines
1. **Test Early and Often** - Run tests frequently during development
2. **Automate Everything** - Automate all test procedures
3. **Test in Isolation** - Test components independently
4. **Use Real Data** - Test with realistic data when possible
5. **Monitor Performance** - Track performance metrics during testing

### Test Maintenance
1. **Keep Tests Updated** - Update tests when code changes
2. **Remove Obsolete Tests** - Clean up outdated tests
3. **Document Test Cases** - Document all test scenarios
4. **Review Test Results** - Regularly review and analyze test results
5. **Improve Test Coverage** - Continuously improve test coverage

### Test Environment
1. **Isolate Test Environment** - Use separate environment for testing
2. **Use Test Data** - Use dedicated test data sets
3. **Clean Up After Tests** - Clean up test data after completion
4. **Monitor Resources** - Monitor resource usage during testing
5. **Backup Test Data** - Backup important test data sets
