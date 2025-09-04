# Troubleshooting Guide

## Overview

This guide provides comprehensive troubleshooting information for the n8n LLM Document Workflow, covering common issues, error messages, and resolution steps.

## Common Issues

### 1. Credential Errors

#### GitHub API Credential Issues
**Symptoms:**
- "GitHub API credential not found"
- "Repository access denied"
- "Rate limit exceeded"

**Solutions:**
```bash
# Test GitHub API access
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Check rate limits
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/rate_limit

# Verify repository permissions
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/repos/OWNER/REPO
```

**Prevention:**
- Use fine-grained personal access tokens
- Implement exponential backoff for rate limits
- Monitor API usage regularly

#### OpenAI API Credential Issues
**Symptoms:**
- "OpenAI API key invalid"
- "Insufficient credits"
- "Model not available"

**Solutions:**
```bash
# Test OpenAI API
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.openai.com/v1/models

# Check account balance
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.openai.com/v1/usage
```

**Prevention:**
- Monitor API usage and set spending limits
- Use appropriate models for your use case
- Implement retry logic with backoff

#### PostgreSQL Credential Issues
**Symptoms:**
- "Database connection failed"
- "Authentication failed"
- "Database does not exist"

**Solutions:**
```bash
# Test database connection
psql -h localhost -U n8n_user -d n8n_workflow -c "SELECT version();"

# Check pgvector extension
psql -h localhost -U n8n_user -d n8n_workflow -c "SELECT 1 FROM pg_extension WHERE extname = 'vector';"

# Verify table structure
psql -h localhost -U n8n_user -d n8n_workflow -c "\d documents"
```

**Prevention:**
- Use strong passwords and proper user permissions
- Enable SSL/TLS for encrypted connections
- Implement connection pooling

#### Telegram Bot Credential Issues
**Symptoms:**
- "Bot token invalid"
- "Webhook not set"
- "Bot not responding"

**Solutions:**
```bash
# Test bot token
curl https://api.telegram.org/botYOUR_BOT_TOKEN/getMe

# Check webhook status
curl https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo

# Set webhook
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook \
  -d url=https://your-n8n-instance.com/webhook/telegram
```

**Prevention:**
- Keep bot tokens secure
- Use webhook mode for production
- Implement rate limiting

### 2. Database Issues

#### Connection Problems
**Symptoms:**
- "Connection timeout"
- "Connection refused"
- "Database unavailable"

**Solutions:**
```bash
# Check PostgreSQL status
systemctl status postgresql

# Check port availability
netstat -tlnp | grep 5432

# Test connection
pg_isready -h localhost -p 5432
```

#### pgvector Issues
**Symptoms:**
- "Extension not found"
- "Vector operations failed"
- "Index creation failed"

**Solutions:**
```sql
-- Install pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Check extension status
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Recreate index
DROP INDEX IF EXISTS documents_embedding_idx;
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

#### Performance Issues
**Symptoms:**
- Slow similarity search
- High memory usage
- Query timeouts

**Solutions:**
```sql
-- Analyze table statistics
ANALYZE documents;

-- Check index usage
EXPLAIN ANALYZE SELECT * FROM documents ORDER BY embedding <-> '[0.1,0.2,...]' LIMIT 5;

-- Optimize index parameters
DROP INDEX documents_embedding_idx;
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 200);
```

### 3. AI Agent Issues

#### Model Availability
**Symptoms:**
- "Model not found"
- "Model overloaded"
- "Request timeout"

**Solutions:**
```bash
# Check available models
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.openai.com/v1/models

# Test model access
curl -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "test"}]}' \
  https://api.openai.com/v1/chat/completions
```

#### Prompt Issues
**Symptoms:**
- "Prompt too long"
- "Invalid prompt format"
- "Template not found"

**Solutions:**
```bash
# Test prompt server
curl http://localhost:3000/api/health

# Check prompt templates
curl http://localhost:3000/api/prompts

# Test specific prompt
curl http://localhost:3000/api/prompts/editor
```

#### Memory Issues
**Symptoms:**
- "Context too long"
- "Memory buffer full"
- "Conversation lost"

**Solutions:**
```bash
# Check memory buffer size
redis-cli info memory

# Clear old conversations
redis-cli FLUSHDB

# Check conversation storage
psql -h localhost -U n8n_user -d n8n_workflow -c "SELECT COUNT(*) FROM documents;"
```

### 4. Workflow Execution Issues

#### Node Failures
**Symptoms:**
- "Node execution failed"
- "Data validation error"
- "Timeout exceeded"

**Solutions:**
1. **Enable debug mode** in n8n settings
2. **Check execution logs** for specific error messages
3. **Test individual nodes** in isolation
4. **Verify input data** format and content
5. **Check node configuration** parameters

#### Data Flow Issues
**Symptoms:**
- "Data not passed between nodes"
- "Unexpected data format"
- "Missing required fields"

**Solutions:**
1. **Check node connections** and data flow
2. **Validate data structure** at each node
3. **Use data transformation** nodes for format conversion
4. **Implement error handling** for missing data
5. **Add validation checks** for required fields

#### Performance Issues
**Symptoms:**
- "Workflow execution slow"
- "High resource usage"
- "Memory leaks"

**Solutions:**
1. **Monitor resource usage** during execution
2. **Optimize node configuration** parameters
3. **Implement caching** for repeated operations
4. **Use parallel processing** where possible
5. **Clean up temporary data** after processing

### 5. Integration Issues

#### GitHub Integration
**Symptoms:**
- "File creation failed"
- "Repository not found"
- "Permission denied"

**Solutions:**
```bash
# Test repository access
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/repos/OWNER/REPO

# Check file permissions
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/repos/OWNER/REPO/contents/path/to/file

# Test file creation
curl -X PUT -H "Authorization: token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "content": "dGVzdA=="}' \
  https://api.github.com/repos/OWNER/REPO/contents/test.md
```

#### Telegram Integration
**Symptoms:**
- "Webhook not receiving messages"
- "Bot not responding"
- "Message format errors"

**Solutions:**
```bash
# Check webhook status
curl https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo

# Test webhook manually
curl -X POST https://your-n8n-instance.com/webhook/telegram \
  -H "Content-Type: application/json" \
  -d '{"message": {"text": "test", "chat": {"id": 123}}}'

# Reset webhook
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/deleteWebhook
curl -X POST https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook \
  -d url=https://your-n8n-instance.com/webhook/telegram
```

#### Context7 MCP Integration
**Symptoms:**
- "MCP server not responding"
- "Validation failed"
- "Authentication error"

**Solutions:**
```bash
# Test MCP server health
curl $CONTEXT7_API_BASE/mcp/health

# Test document analysis
curl -X POST $CONTEXT7_API_BASE/mcp/document/analyze \
  -H "Content-Type: application/json" \
  -d '{"content": "test document"}'

# Check authentication
curl -H "Authorization: Bearer $CONTEXT7_TOKEN" $CONTEXT7_API_BASE/mcp/health
```

## Error Messages and Solutions

### Common Error Messages

#### "Credential not found"
**Cause:** Credential not configured or ID mismatch
**Solution:** Verify credential configuration and IDs

#### "Rate limit exceeded"
**Cause:** API rate limits reached
**Solution:** Implement exponential backoff and retry logic

#### "Database connection failed"
**Cause:** Database unavailable or credentials incorrect
**Solution:** Check database status and credentials

#### "Model not available"
**Cause:** AI model not accessible or overloaded
**Solution:** Check model availability and try alternative models

#### "Webhook timeout"
**Cause:** Webhook not responding within timeout period
**Solution:** Check webhook configuration and network connectivity

### Debug Mode

#### Enable Debug Mode
1. Go to n8n Settings → Debug
2. Enable "Save Execution Progress"
3. Enable "Save Data on Error"
4. Set log level to "debug"

#### Debug Information
- **Execution Logs**: Detailed node execution information
- **Data Flow**: Data passed between nodes
- **Error Details**: Specific error messages and stack traces
- **Performance Metrics**: Execution times and resource usage

## Performance Troubleshooting

### Slow Execution
**Symptoms:**
- Workflow takes too long to complete
- Individual nodes timeout
- High resource usage

**Solutions:**
1. **Optimize node configuration**
2. **Implement caching** for repeated operations
3. **Use parallel processing** where possible
4. **Monitor resource usage** and set appropriate limits
5. **Optimize database queries** and indexes

### Memory Issues
**Symptoms:**
- High memory usage
- Memory leaks
- Out of memory errors

**Solutions:**
1. **Monitor memory usage** during execution
2. **Implement memory cleanup** after processing
3. **Use streaming** for large data processing
4. **Optimize data structures** and algorithms
5. **Set appropriate memory limits**

### Database Performance
**Symptoms:**
- Slow database queries
- High database CPU usage
- Connection timeouts

**Solutions:**
1. **Optimize database indexes**
2. **Use connection pooling**
3. **Monitor query performance**
4. **Implement query caching**
5. **Scale database resources**

## Monitoring and Alerting

### Health Checks
```bash
#!/bin/bash
# health-check.sh

# Check n8n status
curl -f http://localhost:5678/health || exit 1

# Check database
pg_isready -h localhost -p 5432 || exit 1

# Check prompt server
curl -f http://localhost:3000/api/health || exit 1

# Check external APIs
curl -f https://api.openai.com/v1/models || exit 1
curl -f https://api.github.com/zen || exit 1

echo "All health checks passed"
```

### Monitoring Scripts
```bash
#!/bin/bash
# monitor-workflow.sh

# Check workflow execution status
n8n workflow:list | grep "LLM Document Workflow"

# Check recent executions
n8n execution:list --limit 10

# Check error rates
n8n execution:list --status error --limit 5
```

### Alerting Configuration
```yaml
alerts:
  workflow_failures:
    threshold: 5
    time_window: "1h"
    action: "email"
  
  api_errors:
    threshold: 10
    time_window: "15m"
    action: "slack"
  
  performance_degradation:
    threshold: 30  # seconds
    time_window: "5m"
    action: "pagerduty"
```

## Recovery Procedures

### Workflow Recovery
1. **Stop failed workflow** execution
2. **Check error logs** for root cause
3. **Fix configuration** issues
4. **Restart workflow** execution
5. **Monitor** for recurring issues

### Data Recovery
1. **Check database** for data integrity
2. **Restore from backup** if necessary
3. **Validate data** consistency
4. **Re-run failed** operations
5. **Update monitoring** and alerting

### System Recovery
1. **Check system** health and resources
2. **Restart services** if necessary
3. **Verify configuration** settings
4. **Test functionality** end-to-end
5. **Update documentation** with lessons learned

## Prevention Strategies

### Proactive Monitoring
1. **Implement health checks** for all components
2. **Monitor resource usage** and performance metrics
3. **Set up alerting** for critical issues
4. **Regular testing** of all integrations
5. **Documentation updates** for configuration changes

### Best Practices
1. **Use version control** for all configurations
2. **Implement proper error handling** and retry logic
3. **Regular backups** of data and configurations
4. **Security updates** and patches
5. **Performance optimization** and tuning

### Maintenance Procedures
1. **Regular health checks** and monitoring
2. **Log analysis** and cleanup
3. **Database maintenance** and optimization
4. **Security audits** and updates
5. **Documentation reviews** and updates
