# n8n Patterns Refactoring Plan

**Date**: 2025-01-28  
**Mode**: CREATIVE  
**Task**: Refactor workflow to use proper n8n service blocks and patterns  
**Status**: PLANNING

## 🎨🎨🎨 ENTERING CREATIVE PHASE: n8n PATTERNS REFACTORING

## Component Description

The n8n patterns refactoring component involves replacing custom code blocks with proper n8n service nodes and implementing RAG using n8n's built-in data storage and retrieval capabilities. This will create a more maintainable, scalable, and n8n-native workflow.

## Requirements & Constraints

1. **Replace Code Blocks**: Convert custom JavaScript functions to n8n service nodes
2. **Use n8n Data Storage**: Implement RAG using n8n's built-in data storage nodes
3. **Leverage AI Agent Tools**: Use proper AI Agent tool patterns for MCPs
4. **Follow n8n Best Practices**: Use established patterns from templates and documentation
5. **Maintain Functionality**: Preserve all existing capabilities while improving architecture

## Current System Analysis

### Current Code Block Issues
- **8 Custom Function Nodes**: Complex JavaScript code scattered throughout workflow
- **Manual Data Processing**: Custom parsing and formatting logic
- **Hardcoded Database Queries**: Direct PostgreSQL queries instead of n8n patterns
- **Custom RAG Implementation**: Manual vector similarity search
- **Complex State Management**: Custom conversation tracking and storage

### Current RAG Implementation Problems
- **Direct PostgreSQL Queries**: Using raw SQL instead of n8n data nodes
- **Manual Vector Operations**: Custom embedding and similarity calculations
- **No Data Validation**: Missing n8n's built-in data validation
- **Complex Error Handling**: Custom error handling instead of n8n patterns

## n8n Best Practices from Research

### 1. **Data Storage Patterns**
- **n8n Data Storage Node**: Use for storing and retrieving workflow data
- **n8n Memory Nodes**: Use for conversation state and context
- **n8n Database Nodes**: Use for structured data operations
- **n8n Vector Storage**: Use for embeddings and similarity search

### 2. **AI Agent Patterns**
- **AI Agent Tools**: Use for MCP server integrations
- **AI Agent Memory**: Use for conversation context
- **AI Agent Chains**: Use for multi-step AI operations
- **AI Agent Evaluations**: Use for quality assessment

### 3. **RAG Implementation Patterns**
- **Document Processing**: Use n8n document processing nodes
- **Embedding Generation**: Use n8n embedding nodes
- **Vector Storage**: Use n8n vector storage nodes
- **Similarity Search**: Use n8n similarity search nodes

## Refactoring Strategy

### Phase 1: Replace Code Blocks with Service Nodes

#### 1.1 Conversation Management
**Current**: Custom function for conversation ID generation
**Replace With**: n8n Memory Node + n8n Data Storage Node

#### 1.2 Data Processing
**Current**: Custom functions for data parsing and formatting
**Replace With**: n8n Data Processing Nodes + n8n Transform Nodes

#### 1.3 Quality Assessment
**Current**: Custom scoring functions
**Replace With**: n8n AI Agent Evaluation Nodes

### Phase 2: Implement Proper RAG

#### 2.1 Document Processing
**Current**: Manual document handling
**Replace With**: n8n Document Processing Node

#### 2.2 Embedding Generation
**Current**: Custom embedding API calls
**Replace With**: n8n Embedding Node

#### 2.3 Vector Storage
**Current**: Direct PostgreSQL vector operations
**Replace With**: n8n Vector Storage Node

#### 2.4 Similarity Search
**Current**: Custom vector similarity queries
**Replace With**: n8n Similarity Search Node

### Phase 3: AI Agent Tool Integration

#### 3.1 MCP Server Tools
**Current**: HTTP Request nodes for MCPs
**Replace With**: AI Agent Tool nodes

#### 3.2 Research Tools
**Current**: Custom research logic
**Replace With**: AI Agent Research Tools

#### 3.3 Quality Assessment Tools
**Current**: Custom quality scoring
**Replace With**: AI Agent Evaluation Tools

## Detailed Implementation Plan

### 1. **Conversation Management Refactoring**

#### Current Implementation
```javascript
// Generate conversation ID and initialize workflow state
const timestamp = new Date().toISOString();
const conversationId = `${$json.project_name}-${Date.now()}`;
return [{
  json: {
    ...items[0].json,
    conversation_id: conversationId,
    created_at: timestamp,
    research_scope: $json.research_scope || 'comprehensive',
    workflow_state: 'initialized'
  }
}];
```

#### New Implementation
- **n8n Memory Node**: Store conversation state
- **n8n Data Storage Node**: Store conversation metadata
- **n8n Transform Node**: Format conversation data

### 2. **RAG Implementation Refactoring**

#### Current Implementation
```sql
SELECT content AS chunk, chunk_index FROM chunks 
WHERE project_name = '{{$json.project_name}}' 
ORDER BY embedding <-> CAST('[{{join($json.data[0].embedding, ',')}}]' AS vector) 
LIMIT 6;
```

#### New Implementation
- **n8n Document Processing Node**: Process and chunk documents
- **n8n Embedding Node**: Generate embeddings
- **n8n Vector Storage Node**: Store and retrieve vectors
- **n8n Similarity Search Node**: Find similar content

### 3. **Data Processing Refactoring**

#### Current Implementation
```javascript
// Consolidate retrieved chunks into a single context string
const rows = items.map(i => i.json);
const ctx = rows.map(r => `- ${r.chunk}`).join('\n');
return [{ json: { ...base, retrieved_context: ctx } }];
```

#### New Implementation
- **n8n Data Processing Node**: Consolidate data
- **n8n Transform Node**: Format context
- **n8n Merge Node**: Combine data sources

### 4. **Quality Assessment Refactoring**

#### Current Implementation
```javascript
// Enhanced output parser with quality scoring
function calculateStructureScore(content) {
  let score = 0;
  if (hasHeadings) score += 0.3;
  // ... complex scoring logic
}
```

#### New Implementation
- **n8n AI Agent Evaluation Node**: Quality assessment
- **n8n Data Validation Node**: Content validation
- **n8n Scoring Node**: Quality scoring

## n8n Node Replacements

### 1. **Memory and State Management**
- **Current**: Custom function nodes
- **Replace With**: 
  - n8n Memory Buffer Window Node
  - n8n Data Storage Node
  - n8n State Management Node

### 2. **Data Processing**
- **Current**: Custom JavaScript functions
- **Replace With**:
  - n8n Data Processing Node
  - n8n Transform Node
  - n8n Merge Node
  - n8n Split Node

### 3. **RAG Implementation**
- **Current**: Direct PostgreSQL queries
- **Replace With**:
  - n8n Document Processing Node
  - n8n Embedding Node
  - n8n Vector Storage Node
  - n8n Similarity Search Node

### 4. **AI Agent Tools**
- **Current**: HTTP Request nodes
- **Replace With**:
  - n8n AI Agent Tool Node
  - n8n AI Agent Memory Node
  - n8n AI Agent Chain Node

### 5. **Quality Assessment**
- **Current**: Custom scoring functions
- **Replace With**:
  - n8n AI Agent Evaluation Node
  - n8n Data Validation Node
  - n8n Scoring Node

## Benefits of Refactoring

### 1. **Maintainability**
- **Before**: Complex JavaScript code scattered throughout
- **After**: Standard n8n nodes with clear purposes
- **Benefit**: Easier to understand, modify, and debug

### 2. **Scalability**
- **Before**: Custom code with hardcoded logic
- **After**: Configurable n8n nodes
- **Benefit**: Easy to scale and extend

### 3. **Reliability**
- **Before**: Custom error handling and validation
- **After**: n8n's built-in error handling
- **Benefit**: More robust and reliable

### 4. **Performance**
- **Before**: Custom data processing
- **After**: Optimized n8n nodes
- **Benefit**: Better performance and efficiency

### 5. **n8n Native**
- **Before**: Custom implementation
- **After**: Native n8n patterns
- **Benefit**: Better integration and support

## Implementation Phases

### Phase 1: Memory and State Management
1. Replace conversation ID generation with n8n Memory Node
2. Replace conversation storage with n8n Data Storage Node
3. Replace conversation lookup with n8n Data Retrieval Node

### Phase 2: RAG Implementation
1. Replace document processing with n8n Document Processing Node
2. Replace embedding generation with n8n Embedding Node
3. Replace vector storage with n8n Vector Storage Node
4. Replace similarity search with n8n Similarity Search Node

### Phase 3: Data Processing
1. Replace data consolidation with n8n Data Processing Node
2. Replace data formatting with n8n Transform Node
3. Replace data merging with n8n Merge Node

### Phase 4: AI Agent Tools
1. Replace MCP HTTP requests with n8n AI Agent Tool Node
2. Replace research logic with n8n AI Agent Research Tool
3. Replace quality assessment with n8n AI Agent Evaluation Node

### Phase 5: Quality Assessment
1. Replace custom scoring with n8n Scoring Node
2. Replace content validation with n8n Data Validation Node
3. Replace quality evaluation with n8n AI Agent Evaluation Node

## Verification Checkpoint

This refactoring plan will:
- ✅ **Replace Code Blocks**: Convert all custom functions to n8n service nodes
- ✅ **Implement Proper RAG**: Use n8n's built-in data storage and retrieval
- ✅ **Use AI Agent Tools**: Leverage n8n's AI Agent tool patterns
- ✅ **Follow Best Practices**: Implement established n8n patterns
- ✅ **Maintain Functionality**: Preserve all existing capabilities

🎨🎨🎨 EXITING CREATIVE PHASE

## Conclusion

This refactoring plan transforms the workflow from a custom implementation to a proper n8n-native solution. By replacing code blocks with service nodes and implementing RAG using n8n's built-in capabilities, we create a more maintainable, scalable, and reliable workflow that follows n8n best practices.

The implementation will be done in phases to ensure functionality is preserved while gradually improving the architecture. Each phase focuses on a specific aspect of the workflow, making the refactoring manageable and testable.
