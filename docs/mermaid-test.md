# Mermaid Test Documentation

This document demonstrates the Mermaid chart functionality in our updated MkDocs configuration.

## Flowchart Example

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> E[Fix Issues]
    E --> B
    C --> F[End]
```

## Sequence Diagram Example

```mermaid
sequenceDiagram
    participant User
    participant System
    participant Database
    
    User->>System: Request Data
    System->>Database: Query Data
    Database-->>System: Return Results
    System-->>User: Display Data
```

## Gantt Chart Example

```mermaid
gantt
    title Project Timeline
    dateFormat  YYYY-MM-DD
    section Phase 1
    Planning           :done,    plan1, 2025-01-01, 2025-01-15
    Design            :active,  design1, 2025-01-16, 2025-01-30
    section Phase 2
    Implementation    :         impl1, 2025-02-01, 2025-02-28
    Testing          :         test1, 2025-03-01, 2025-03-15
```

## Class Diagram Example

```mermaid
classDiagram
    class DocumentRefactoring {
        +String status
        +Date completionDate
        +executeRefactoring()
        +validateStructure()
    }
    
    class MkDocsConfig {
        +String theme
        +Array plugins
        +configureMermaid()
    }
    
    class MermaidPlugin {
        +String version
        +Object themeVariables
        +renderCharts()
    }
    
    DocumentRefactoring --> MkDocsConfig
    MkDocsConfig --> MermaidPlugin
```

## State Diagram Example

```mermaid
stateDiagram-v2
    [*] --> Planning
    Planning --> Creative
    Creative --> Implementation
    Implementation --> Testing
    Testing --> Reflection
    Reflection --> Archive
    Archive --> [*]
    
    Testing --> Implementation : Issues Found
    Reflection --> Creative : New Ideas
```

## Pie Chart Example

```mermaid
pie title Document Types Distribution
    "Implementation" : 35
    "Archive" : 25
    "Reflection" : 20
    "Creative" : 15
    "Status" : 5
```

## Git Graph Example

```mermaid
gitgraph
    commit id: "Initial"
    commit id: "Add Mermaid"
    branch feature
    checkout feature
    commit id: "Update Config"
    checkout main
    merge feature
    commit id: "Release"
```

## Journey Diagram Example

```mermaid
journey
    title User Documentation Journey
    section Discovery
      Visit Homepage: 5: User
      Browse Archive: 4: User
      Read Reflection: 5: User
    section Implementation
      Follow Guide: 5: User
      Test Setup: 4: User
      Deploy: 5: User
    section Maintenance
      Update Docs: 3: User
      Report Issues: 4: User
```

## Mindmap Example

```mermaid
mindmap
  root((Documentation))
    Structure
      Archive
        Consolidated
        Individual
      Reflection
        By Date
        Insights
      Creative
        Design Decisions
        Process
    Features
      Mermaid Charts
        Flowcharts
        Sequence Diagrams
        Gantt Charts
      Navigation
        Digest Views
        Simplified Structure
    Tools
      MkDocs
      Mermaid2 Plugin
      PyMdown Extensions
```

## C4 Context Diagram Example

```mermaid
C4Context
    title System Context Diagram for Documentation
    Person(user, "Documentation User", "Developers, contributors, and stakeholders")
    System(docs, "Documentation System", "MkDocs-based documentation with Mermaid support")
    System(mkdocs, "MkDocs", "Static site generator")
    System(mermaid, "Mermaid", "Diagram generation library")
    
    Rel(user, docs, "Uses", "HTTPS")
    Rel(docs, mkdocs, "Built with", "Python")
    Rel(docs, mermaid, "Renders charts", "JavaScript")
```

This demonstrates the full range of Mermaid diagram types supported by our updated MkDocs configuration.
