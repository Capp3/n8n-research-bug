# Environment Setup Guide

This guide explains how to configure the environment variables for the n8n Research Bug project with PostgreSQL chat memory support.

## Quick Start

1. **Copy the sample environment file:**
   ```bash
   cp sample.env .env
   ```

2. **Start the services:**
   ```bash
   docker compose up -d
   ```

3. **Start the prompt server:**
   ```bash
   cd prompt-server
   npm install
   npm start
   ```

## Environment Files

### `sample.env`
Comprehensive environment configuration file with:
- All Docker Compose service variables
- Complete prompt-server configuration
- PostgreSQL chat memory settings
- Detailed comments and documentation
- Production configuration notes

### `.env` (create from sample.env)
Your actual environment file (not tracked in git) with your specific configuration.

## Configuration Sections

### Docker Compose Services
- **Redis**: Cache and session storage
- **PostgreSQL**: Main database with pgvector support
- **Adminer**: Database management interface

### Prompt Server Application
- **Server**: Port and basic configuration
- **Prompts**: GitHub integration and caching
- **HTTP**: Timeout and retry settings
- **Limits**: Size restrictions for content

### PostgreSQL Chat Memory
- **Database**: Connection parameters
- **Memory**: TTL and conversation limits

## Service URLs

After starting the services, you can access:

- **Prompt Server**: http://localhost:3000
- **Adminer (DB Admin)**: http://localhost:8080
- **Redis**: localhost:6379
- **PostgreSQL**: localhost:5432

## Testing the Setup

### Test Database Connection
```bash
cd prompt-server
node test-db-connection.js
```

### Test API Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Test chat memory
curl -X POST http://localhost:3000/api/chat-memories \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": "test-123",
    "userId": "user-456",
    "agentType": "editor",
    "role": "user",
    "content": "Test message"
  }'
```

## Common Configurations

### Development
Use the default values in `sample.env` - they're optimized for local development.

### Production
1. Change all default passwords
2. Enable SSL for database connections (`DB_SSL=true`)
3. Use environment-specific secrets management
4. Configure appropriate resource limits
5. Set up monitoring and backup

### Testing
Create a separate `.env.test` file with:
```env
DB_NAME=support_test
SUPPORT_POSTGRES_DB=support_test
```

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL container is running: `docker compose ps`
2. Check database logs: `docker compose logs n8n-postgres`
3. Verify connection parameters in `.env`

### Port Conflicts
If ports are already in use, modify the port numbers in your `.env` file:
```env
PORT=3001
SUPPORT_POSTGRES_PORT=5433
SUPPORT_ADMINER_PORT=8081
```

### Memory Issues
For large conversations, adjust the limits:
```env
MAX_CONVERSATION_LENGTH=5000
CHAT_MEMORY_TTL_DAYS=60
```

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique passwords in production
- Enable SSL for database connections in production
- Regularly rotate database credentials
- Monitor access logs and database activity

## Support

For issues or questions:
1. Check the logs: `docker compose logs`
2. Review the configuration in `sample.env`
3. Test individual components using the provided test scripts
4. Consult the detailed documentation in `prompt-server/README_CHAT_MEMORY.md`
