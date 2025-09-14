# 🎨 CREATIVE PHASE: ARCHITECTURE DESIGN

## Problem Statement

The n8n workflow plan requires architectural decisions for memory management, MCP integration, session handling, prompt management, and document evolution tracking to ensure robust, scalable implementation.

## Architecture Options Analysis

### 1. Memory Architecture (DECISION: Dual Memory System)

#### Selected Option: Dual Memory Architecture
**Description**: Two independent memory systems serving different purposes
- **pgvector Database**: Document and research information storage with semantic search
- **Chat Memory**: Direct connection to LLM agent node memory tool for conversation context

**Architecture Design**:
```mermaid
graph TD
    subgraph "Document Memory (pgvector)"
        DM1[Document Content]
        DM2[Research Findings]
        DM3[Semantic Search]
        DM4[Citation Tracking]
    end
    
    subgraph "Chat Memory (PostgreSQL)"
        CM1[Conversation History]
        CM2[Session Context]
        CM3[Agent Interactions]
        CM4[User Preferences]
    end
    
    subgraph "LLM Agents"
        LA1[Editor Agent]
        LA2[Research Agent]
        LA3[Reviewer Agent]
        LA4[Merge Agent]
        LA5[Ongoing Chat Agent]
    end
    
    DM1 --> LA1
    DM2 --> LA2
    DM3 --> LA5
    DM4 --> LA3
    
    CM1 --> LA1
    CM2 --> LA2
    CM3 --> LA3
    CM4 --> LA4
    CM1 --> LA5
    
    LA1 --> CM1
    LA2 --> CM1
    LA3 --> CM1
    LA4 --> CM1
    LA5 --> CM1
```

**Implementation Considerations**:
- pgvector stores document evolution, research data, embeddings for semantic search
- PostgreSQL chat memory wires directly to n8n LLM Agent memory connections
- Clear separation of concerns: documents vs conversations
- Agents can access both memories as needed

### 2. MCP Integration Pattern (DECISION: Independent Direct Access)

#### Selected Option: Intelligent Routing with Direct Access
**Description**: Each LLM agent has direct access to relevant MCP servers with intelligent routing based on query type

**Architecture Design**:
```mermaid
graph TD
    subgraph "Research Agent"
        RA[Research Agent Core]
        RT[Query Type Router]
    end
    
    subgraph "MCP Servers"
        MCP1[Firecrawl MCP<br/>Content Extraction]
        MCP2[Searxng MCP<br/>Web Search]
        MCP3[Future MCP<br/>Knowledge Bases]
    end
    
    RA --> RT
    RT -->|"URL to crawl"| MCP1
    RT -->|"Search query"| MCP2
    RT -->|"Knowledge lookup"| MCP3
    
    MCP1 --> RA
    MCP2 --> RA
    MCP3 --> RA
```

**Query Routing Logic**:
- **URL pattern detected** → Firecrawl MCP
- **Search intent keywords** → Searxng MCP  
- **Knowledge base queries** → Future knowledge MCP
- **Parallel queries** → Multiple MCPs simultaneously

**Implementation Considerations**:
- Research Agent system prompt includes MCP selection logic
- Each MCP connection is independent HTTP Request node
- Agent decides which tools to use based on research needs
- No complex orchestration layer needed

### 3. Session Management Architecture (DECISION: Simple Session Lookup)

#### Selected Option: Single Document Session with Lifecycle Management
**Description**: Simple session tracking by Telegram user ID with document lifecycle controls

**Session Lifecycle Design**:
```mermaid
stateDiagram-v2
    [*] --> Active : Document Submitted
    Active --> Processing : AI Enhancement
    Processing --> Ready : Enhancement Complete
    Ready --> Conversing : User Continues Chat
    Conversing --> Ready : Agent Response
    Conversing --> Finished : /finish command
    Ready --> Finished : /finish command
    Finished --> [*] : Session Archived
    
    note right of Active : PostgreSQL: status='active'
    note right of Processing : PostgreSQL: status='processing'
    note right of Ready : PostgreSQL: status='ready'
    note right of Conversing : PostgreSQL: status='conversing'
    note right of Finished : PostgreSQL: status='finished'
```

**Session Management Schema**:
```sql
CREATE TABLE sessions (
    session_id VARCHAR(16) PRIMARY KEY,
    telegram_user_id BIGINT NOT NULL,
    document_id VARCHAR(32) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    finished_at TIMESTAMP NULL,
    github_path TEXT,
    INDEX idx_telegram_user (telegram_user_id),
    INDEX idx_status (status)
);
```

**Lifecycle Commands**:
- **Auto**: Form submission → Active
- **Auto**: Processing complete → Ready  
- **User**: `/finish` → Finished
- **System**: 30 days inactive → Auto-finish

### 4. Prompt Management Strategy (DECISION: Hybrid Approach)

#### Selected Option: System Embedded + User Templates via HTTP
**Description**: System prompts embedded in agents, user/task templates fetched dynamically

**Prompt Architecture**:
```mermaid
graph TD
    subgraph "Agent Nodes"
        A1[Editor Agent<br/>Embedded System Prompt]
        A2[Research Agent<br/>Embedded System Prompt]
        A3[Reviewer Agent<br/>Embedded System Prompt]
        A4[Merge Agent<br/>Embedded System Prompt]
        A5[Chat Agent<br/>Embedded System Prompt]
    end
    
    subgraph "HTTP Prompt Templates"
        H1[Editor Task Template]
        H2[Research Task Template]
        H3[Review Task Template]
        H4[Merge Task Template]
        H5[Chat Task Template]
    end
    
    subgraph "GitHub Repository"
        G1[prompts/user/editor-task.md]
        G2[prompts/user/research-task.md]
        G3[prompts/user/review-task.md]
        G4[prompts/user/merge-task.md]
        G5[prompts/user/chat-task.md]
    end
    
    A1 --> H1 --> G1
    A2 --> H2 --> G2
    A3 --> H3 --> G3
    A4 --> H4 --> G4
    A5 --> H5 --> G5
```

**Implementation Pattern**:
- **System Prompts**: Embedded directly in n8n agent nodes (role definition, behavior)
- **User Prompts**: HTTP fetched from GitHub (task-specific instructions, variable templates)
- **Prompt Assembly**: System + User + Context variables in agent execution

### 5. Document Evolution Tracking (DECISION: GitHub Commit History)

#### Selected Option: Simple GitHub-based Evolution Tracking
**Description**: Leverage GitHub's native version control for document evolution with meaningful commit messages

**Evolution Tracking Pattern**:
```mermaid
gitGraph
    commit id: "Initial: User Submission"
    commit id: "Editor: Structure Enhanced"
    commit id: "Research: Sources Added"
    commit id: "Review: Quality Improved"
    commit id: "Merge: Final Integration"
    branch conversation
    commit id: "Chat: User Refinement 1"
    commit id: "Chat: User Refinement 2"
    checkout main
    merge conversation
    commit id: "Session: Marked Complete"
```

**Commit Message Convention**:
- `Initial: [document_title]` - Form submission
- `Editor: [enhancement_summary]` - Editor agent changes
- `Research: [research_summary]` - Research agent additions
- `Review: [review_summary]` - Reviewer agent improvements
- `Merge: [integration_summary]` - Merge agent final version
- `Chat: [user_change_summary]` - Ongoing conversation updates
- `Session: Marked Complete` - /finish command executed

## Implementation Architecture Updates

Based on these decisions, here are the key architecture updates needed:

### Updated Memory Flow
```mermaid
graph TD
    subgraph "Dual Memory Architecture"
        subgraph "Document Memory (pgvector)"
            DV[Document Vectors]
            RV[Research Vectors]
            CV[Citation Vectors]
        end
        
        subgraph "Chat Memory (PostgreSQL)"
            CH[Chat History]
            SC[Session Context]
            UP[User Preferences]
        end
    end
    
    subgraph "LLM Agent Nodes"
        EA[Editor Agent]
        RA[Research Agent]
        RVA[Reviewer Agent]
        MA[Merge Agent]
        CA[Chat Agent]
    end
    
    DV --> EA
    RV --> RA
    CV --> RVA
    
    CH --> EA
    CH --> RA
    CH --> RVA
    CH --> MA
    CH --> CA
    
    EA --> CH
    RA --> CH
    RVA --> CH
    MA --> CH
    CA --> CH
```

### Updated MCP Integration
```mermaid
graph TD
    RA[Research Agent] --> MCP_Router{Query Type Router}
    
    MCP_Router -->|URL detected| Firecrawl[Firecrawl MCP<br/>HTTP Request]
    MCP_Router -->|Search intent| Searxng[Searxng MCP<br/>HTTP Request]
    MCP_Router -->|Knowledge query| Future_MCP[Future Knowledge MCP<br/>HTTP Request]
    
    Firecrawl --> RA
    Searxng --> RA
    Future_MCP --> RA
```

### Session Lifecycle Implementation
```mermaid
graph TD
    Form[Form Trigger] --> Create[Create Session<br/>status='active']
    Create --> Process[Multi-Agent Processing<br/>status='processing']
    Process --> Ready[Workflow Complete<br/>status='ready']
    Ready --> Telegram[Telegram Notification]
    Telegram --> Chat[Ongoing Chat Trigger]
    Chat --> Check{Check Status}
    Check -->|ready/conversing| Continue[Continue Conversation]
    Check -->|/finish command| Finish[Set status='finished']
    Continue --> Update[Update Document if Needed]
    Update --> Response[Send Response]
    Finish --> Archive[Archive Session]
```

## Validation Against Requirements

✅ **Memory Architecture**: Dual system supports both document intelligence and conversation context
✅ **MCP Integration**: Direct access with intelligent routing for research quality
✅ **Session Management**: Simple lifecycle with clear completion mechanism
✅ **Prompt Management**: Hybrid approach balances flexibility and maintainability  
✅ **Document Evolution**: GitHub commits provide clear evolution tracking

## Implementation Checklist

- [ ] Update workflow plan with dual memory architecture
- [ ] Design MCP routing logic for Research Agent
- [ ] Create session lifecycle state management
- [ ] Design prompt template directory structure
- [ ] Define commit message conventions
- [ ] Update database schema for session management
- [ ] Create `/finish` command handling logic

🎨🎨🎨 EXITING CREATIVE PHASE - ARCHITECTURE DECISIONS COMPLETE 🎨🎨🎨
