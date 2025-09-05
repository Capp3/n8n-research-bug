# MCP Implementation Plan

## Overview

This document outlines the detailed implementation plan for replacing the Context7 MCP analyzer with a more balanced set of research-focused MCP servers in the n8n Research Bug project. The plan follows the recommended Option 3 from the MCP Integration Options document, focusing on a balanced approach that leverages both MCP servers and n8n's native capabilities.

## 🎨🎨🎨 ENTERING CREATIVE PHASE: IMPLEMENTATION DESIGN

## Component Description

The MCP implementation component involves replacing the existing Context7 MCP integration with a set of specialized research-focused MCP servers that better support the project's document enhancement and research requirements while integrating seamlessly with n8n's workflow capabilities.

## Requirements & Constraints

1. **Minimal Disruption**: Minimize changes to existing workflow structure
2. **Docker Integration**: All MCP servers must be integrated into the Docker Compose setup
3. **Environment Configuration**: Maintain consistent environment variable naming and structure
4. **Documentation**: Comprehensive documentation updates for all changes
5. **Testing**: Thorough testing plan for validating the new implementation
6. **Backward Compatibility**: Ensure existing workflows continue to function

## Implementation Steps

### Phase 1: Remove Context7 MCP Integration

#### Step 1.1: Update n8n Workflow
1. Identify and remove Context7 MCP nodes from ResearchBug.json:
   ```json
   // Remove these nodes:
   {
     "parameters": {
       "url": "={{$env.CONTEXT7_API_BASE || 'https://context7.local' }}/mcp/document/analyze",
       // other parameters...
     },
     "name": "Context7 MCP - Document Analyzer",
     // other properties...
   }
   ```

2. Update Research Agent prompt to remove Context7 references:
   ```
   // Change from:
   "text": "=You are a Research Agent with access to MCP tools via Context7..."
   
   // To:
   "text": "=You are a Research Agent with access to specialized MCP tools..."
   ```

#### Step 1.2: Update Environment Configuration
1. Remove Context7-related environment variables from sample.env:
   ```
   # Remove these lines:
   CONTEXT7_API_BASE=https://context7.local
   CONTEXT7_API_KEY=your-context7-api-key
   ```

2. Remove Context7-related environment variables from .env (if present)

#### Step 1.3: Update Documentation
1. Update README.md to remove Context7 MCP references:
   ```markdown
   # Change from:
   - **Content Validation**: Context7 MCP analyzer for quality assurance
   
   # To:
   - **Research Enhancement**: Specialized MCP servers for research and data retrieval
   ```

2. Update Prerequisites section:
   ```markdown
   # Change from:
   - Context7 MCP endpoint (optional, for content validation)
   
   # To:
   - MCP servers for research and data retrieval (configured via Docker)
   ```

### Phase 2: Add New MCP Servers to Docker Compose

#### Step 2.1: Update compose.yml
1. Add Brave Search MCP server:
   ```yaml
   # Brave Search MCP Server - Web search capabilities
   mcp-brave-search:
     image: ghcr.io/yourusername/mcp-brave-search:latest
     restart: unless-stopped
     container_name: mcp-brave-search
     networks:
       - support_network
     ports:
       - ${BRAVE_SEARCH_PORT:-3002}:3000
     environment:
       BRAVE_API_KEY: ${BRAVE_API_KEY}
     deploy:
       resources:
         limits:
           cpus: "0.5"
           memory: 512M
         reservations:
           cpus: "0.25"
           memory: 256M
     healthcheck:
       test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
       interval: 30s
       timeout: 10s
       retries: 3
   ```

2. Add Wikipedia MCP server:
   ```yaml
   # Wikipedia MCP Server - Knowledge base access
   mcp-wikipedia:
     image: ghcr.io/yourusername/mcp-wikipedia:latest
     restart: unless-stopped
     container_name: mcp-wikipedia
     networks:
       - support_network
     ports:
       - ${WIKIPEDIA_PORT:-3003}:3000
     deploy:
       resources:
         limits:
           cpus: "0.5"
           memory: 512M
         reservations:
           cpus: "0.25"
           memory: 256M
     healthcheck:
       test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
       interval: 30s
       timeout: 10s
       retries: 3
   ```

3. Uncomment the existing n8n-mcp service (lines 145-187)

#### Step 2.2: Update Environment Configuration
1. Add new environment variables to sample.env:
   ```
   # MCP Server Configuration
   # Brave Search MCP
   BRAVE_API_KEY=your-brave-api-key
   BRAVE_SEARCH_PORT=3002
   
   # Wikipedia MCP
   WIKIPEDIA_PORT=3003
   
   # Uncomment the existing n8n-MCP configuration
   # N8N_MCP_PORT=3001
   # N8N_MCP_HOST=0.0.0.0
   # N8N_API_URL=http://n8n:5678
   # N8N_API_KEY=your-n8n-api-key-here
   # N8N_DOCS_PATH=./n8n-docs
   # N8N_MCP_LOG_LEVEL=info
   # N8N_MCP_DEBUG=false
   ```

2. Update the services list in compose.yml header:
   ```yaml
   # Services:
   #   - PostgreSQL: localhost:5432 (main database + chat memory)
   #   - Redis: localhost:6379 (cache + sessions)
   #   - Adminer: localhost:8080 (database management UI)
   #   - Brave Search MCP: localhost:3002 (web search capabilities)
   #   - Wikipedia MCP: localhost:3003 (knowledge base access)
   #   - n8n-MCP: localhost:3001 (AI-powered n8n workflow builder)
   ```

### Phase 3: Update n8n Workflow for New MCP Servers

#### Step 3.1: Update Research Agent Node
1. Update the Research Agent prompt in ResearchBug.json:
   ```json
   {
     "parameters": {
       "text": "=You are a Research Agent with access to specialized MCP tools.\n\nAVAILABLE TOOLS:\n- Brave Search: Web search and current information\n- Wikipedia: Factual knowledge and references\n- n8n HTTP Request: For additional API access\n\nCONTEXT (retrieved):\n{{$json.retrieved_context || ''}}\n\nGOAL:\n- Produce a research_addendum (markdown) with citations and comparative tables relevant to the user's requirements and current draft.\n- Keep to facts; add links and references.\n\nINPUTS:\n- Project: {{$json.project_name}}\n- Research scope: {{$json.research_scope}}\n- Current draft (from Editor): {{$json.output || $json.parsed_content || ''}}\n\nOUTPUT:\n- Return ONLY markdown addendum suitable for direct insertion, with inline links and a References section at the end."
     },
     "name": "AI Agent - Research (MCP Tools)",
     // other properties...
   }
   ```

#### Step 3.2: Add New MCP Server Nodes
1. Add Brave Search MCP node:
   ```json
   {
     "parameters": {
       "url": "=http://mcp-brave-search:3000/search",
       "method": "POST",
       "sendHeaders": true,
       "headerParameters": {
         "parameters": [
           {
             "name": "Content-Type",
             "value": "application/json"
           }
         ]
       },
       "sendBody": true,
       "bodyParameters": {
         "parameters": [
           {
             "name": "query",
             "value": "={{$json.research_query}}"
           },
           {
             "name": "count",
             "value": 10
           }
         ]
       }
     },
     "name": "Brave Search MCP",
     // other properties...
   }
   ```

2. Add Wikipedia MCP node:
   ```json
   {
     "parameters": {
       "url": "=http://mcp-wikipedia:3000/search",
       "method": "POST",
       "sendHeaders": true,
       "headerParameters": {
         "parameters": [
           {
             "name": "Content-Type",
             "value": "application/json"
           }
         ]
       },
       "sendBody": true,
       "bodyParameters": {
         "parameters": [
           {
             "name": "query",
             "value": "={{$json.research_query}}"
           },
           {
             "name": "limit",
             "value": 5
           }
         ]
       }
     },
     "name": "Wikipedia MCP",
     // other properties...
   }
   ```

#### Step 3.3: Update Workflow Connections
1. Connect the Research Agent to the appropriate MCP nodes
2. Update the data flow to ensure proper integration
3. Add error handling for MCP server failures

### Phase 4: Documentation Updates

#### Step 4.1: Update README.md
1. Update Key Features section:
   ```markdown
   - **Research Enhancement**: Specialized MCP servers for research and data retrieval
   ```

2. Update Prerequisites section:
   ```markdown
   - MCP servers for research and data retrieval (configured via Docker)
   ```

#### Step 4.2: Update Environment Setup Documentation
1. Update ENVIRONMENT_SETUP.md with new MCP server configuration details
2. Add instructions for obtaining API keys for Brave Search

#### Step 4.3: Update System Prompts Documentation
1. Update docs/system-prompts.md with new Research Agent prompt
2. Document the available MCP tools and their capabilities

#### Step 4.4: Create MCP Server Documentation
1. Create docs/implementation/mcp-servers.md with details about each MCP server
2. Include configuration, usage, and API reference information

## Verification Checkpoint

This implementation plan meets all requirements:
- ✅ **Minimal Disruption**: Maintains existing workflow structure while replacing Context7
- ✅ **Docker Integration**: All MCP servers integrated into Docker Compose
- ✅ **Environment Configuration**: Consistent environment variable structure
- ✅ **Documentation**: Comprehensive updates across all documentation
- ✅ **Testing**: Clear testing steps for validation
- ✅ **Backward Compatibility**: Existing workflows continue to function

🎨🎨🎨 EXITING CREATIVE PHASE

## Testing Plan

### Unit Testing
1. Test each MCP server individually:
   - Verify Brave Search MCP returns expected results
   - Verify Wikipedia MCP returns expected results
   - Verify n8n-mcp functions correctly

### Integration Testing
1. Test the complete workflow with sample documents
2. Verify research results include content from multiple sources
3. Test error handling when MCP servers are unavailable

### End-to-End Testing
1. Submit a complete document through the form trigger
2. Verify the entire process completes successfully
3. Validate the final document contains properly researched content

## Rollback Plan

If issues are encountered during implementation:
1. Restore Context7 MCP nodes in the workflow
2. Revert environment configuration changes
3. Remove new MCP servers from Docker Compose
4. Restore original documentation

## Timeline

1. **Phase 1**: Remove Context7 MCP Integration - 1 day
2. **Phase 2**: Add New MCP Servers to Docker Compose - 1 day
3. **Phase 3**: Update n8n Workflow for New MCP Servers - 2 days
4. **Phase 4**: Documentation Updates - 1 day
5. **Testing**: 2 days

Total estimated time: 7 days

## Conclusion

This implementation plan provides a structured approach to replacing the Context7 MCP analyzer with a more balanced set of research-focused MCP servers. By following this plan, the n8n Research Bug project will gain enhanced research capabilities while maintaining simplicity and leveraging n8n's native strengths.

The integration of Brave Search and Wikipedia MCP servers, combined with the optional n8n-mcp for workflow assistance, creates a comprehensive research toolkit that meets the project's requirements while avoiding unnecessary complexity.
