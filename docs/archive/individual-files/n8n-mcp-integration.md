# n8n-MCP Server Integration

This document describes the integration of the n8n-MCP server with the n8n Research Bug project.

## Overview

The [n8n-MCP server](https://github.com/czlonkowski/n8n-mcp) is an AI-powered tool that uses the Model Context Protocol (MCP) to assist with building n8n workflows. It provides intelligent workflow creation, node discovery, and validation capabilities.

## Features

- **AI-Assisted Workflow Creation**: Build n8n workflows using natural language
- **Node Discovery**: Find and configure appropriate nodes for your use case
- **Workflow Validation**: Validate workflows before deployment
- **MCP Integration**: Works with Claude Desktop, Cursor, and other MCP-compatible tools
- **Comprehensive Node Database**: Access to 535+ n8n nodes with documentation

## Current Status

**Status**: Configured but commented out for future implementation

The n8n-MCP server is fully configured in the Docker Compose setup but is currently commented out. This allows for easy activation when an n8n instance is available.

## Configuration

### Docker Compose Service

The service is defined in `compose.yml` with the following configuration:

```yaml
# n8n-MCP Server - AI-powered n8n workflow builder (commented out for future implementation)
# n8n-mcp:
#   image: ghcr.io/czlonkowski/n8n-mcp:latest
#   restart: unless-stopped
#   container_name: n8n-mcp
#   depends_on:
#     n8n-postgres:
#       condition: service_healthy
#   networks:
#     - support_network
#   ports:
#     - ${N8N_MCP_PORT:-3001}:3001
#   environment:
#     DATABASE_URL: postgresql://${SUPPORT_POSTGRES_USER}:${SUPPORT_POSTGRES_PASSWORD}@n8n-postgres:5432/${SUPPORT_POSTGRES_DB}
#     MCP_SERVER_PORT: ${N8N_MCP_PORT:-3001}
#     MCP_SERVER_HOST: ${N8N_MCP_HOST:-0.0.0.0}
#     N8N_API_URL: ${N8N_API_URL:-http://n8n:5678}
#     N8N_API_KEY: ${N8N_API_KEY}
#     N8N_DOCS_PATH: ${N8N_DOCS_PATH:-/app/n8n-docs}
#     LOG_LEVEL: ${N8N_MCP_LOG_LEVEL:-info}
#     DEBUG: ${N8N_MCP_DEBUG:-false}
```

### Environment Variables

All necessary environment variables are defined in `sample.env`:

```env
# n8n-MCP Server Configuration (commented out for future implementation)
# N8N_MCP_PORT=3001
# N8N_MCP_HOST=0.0.0.0
# N8N_API_URL=http://n8n:5678
# N8N_API_KEY=your-n8n-api-key-here
# N8N_DOCS_PATH=./n8n-docs
# N8N_MCP_LOG_LEVEL=info
# N8N_MCP_DEBUG=false
```

## Activation Steps

To activate the n8n-MCP server:

1. **Uncomment the service** in `compose.yml`
2. **Uncomment the environment variables** in your `.env` file
3. **Set up your n8n instance** and obtain an API key
4. **Configure the n8n API URL** to point to your n8n instance
5. **Start the services**: `docker compose up -d`

## Prerequisites

- **n8n Instance**: A running n8n instance with API access
- **n8n API Key**: Authentication key for n8n API access
- **PostgreSQL Database**: Already configured in the compose setup

## Integration Benefits

### For the n8n Research Bug Project

- **Enhanced Workflow Development**: AI assistance for creating complex workflows
- **Node Discovery**: Find the right nodes for document processing tasks
- **Workflow Validation**: Ensure workflows are properly configured before deployment
- **Documentation Integration**: Access to comprehensive n8n node documentation

### For AI-Assisted Development

- **Natural Language Interface**: Describe what you want to accomplish
- **Intelligent Suggestions**: Get recommendations for node configurations
- **Error Prevention**: Validate workflows before they cause issues
- **Learning Tool**: Understand n8n capabilities through AI guidance

## Technical Details

### Database Integration

The n8n-MCP server uses the same PostgreSQL database as the chat memory system, providing:

- **Shared Data Storage**: Consistent data across services
- **Performance Optimization**: Efficient database connections
- **Data Persistence**: Workflow metadata and configurations

### Resource Allocation

- **CPU Limit**: 1.0 cores
- **Memory Limit**: 1GB
- **CPU Reservation**: 0.5 cores
- **Memory Reservation**: 512MB

### Health Checks

- **Endpoint**: `http://localhost:3001/health`
- **Interval**: 30 seconds
- **Retries**: 5 attempts
- **Start Period**: 30 seconds
- **Timeout**: 10 seconds

## Future Implementation

When ready to implement:

1. **Set up n8n instance** with proper API access
2. **Obtain n8n API key** from your n8n instance
3. **Uncomment the service** in compose.yml
4. **Configure environment variables** in .env
5. **Test the integration** with sample workflows

