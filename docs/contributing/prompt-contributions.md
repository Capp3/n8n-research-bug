# Prompt Contributions Guide

## Overview

This guide provides detailed instructions for contributing prompt templates, system prompts, and writing style presets to the n8n LLM Document Workflow. Prompt contributions are essential for improving the system's capabilities and user experience.

## Types of Prompt Contributions

### 1. Agent User Prompt Templates
- **Purpose**: Define how each AI agent should behave and respond
- **Location**: `prompts/` directory
- **Format**: Markdown files with YAML frontmatter

### 2. System Prompts
- **Purpose**: Define core principles and guidelines for all agents
- **Location**: `docs/system-prompts.md`
- **Format**: Text with agent-specific addenda

### 3. Writing Style Presets
- **Purpose**: Standardized writing styles for consistent output
- **Location**: Future implementation
- **Format**: JSON configuration with style definitions

## Creating Agent User Prompt Templates

### Template Structure

#### File Organization
```
prompts/
├── form/
│   └── initial.md          # Initial form submission
├── telegram/
│   └── ongoing.md          # Ongoing chat interactions
├── research/
│   └── addendum.md         # Research and information gathering
├── reviewer/
│   └── qa.md              # Quality review and validation
├── editor-merge/
│   └── final.md           # Final document merging
└── index.json             # Template index
```

#### Template File Format
```markdown
---
title: "Template Name"
summary: "Brief description of template purpose"
agent: "editor"
ui_visible: true
requires: ["markdown_document", "submission_brief"]
optional: ["style_instructions"]
schema_version: "2.0"
---

## Template Content

Your prompt template content here...

### Variables Available
- `{{markdown_document}}`: The user's document
- `{{submission_brief}}`: User's requirements and goals
- `{{style_instructions}}`: Writing style preferences
- `{{conversation_id}}`: Unique conversation identifier
- `{{project_name}}`: Name of the project
```

### Template Guidelines

#### Content Structure
1. **Clear Instructions**: Provide specific, actionable instructions
2. **Variable Usage**: Use available variables appropriately
3. **Output Format**: Specify expected output format
4. **Examples**: Include examples when helpful
5. **Constraints**: Define any limitations or constraints

#### Writing Style
- Use clear, concise language
- Be specific about expected outputs
- Include formatting requirements
- Provide context for decision-making
- Use consistent terminology

#### Variable Guidelines
- Use variables consistently across templates
- Document variable purposes
- Provide fallback values when appropriate
- Validate variable usage

### Example Template

#### Form Initial Template
```markdown
---
title: "Form: Initial Enhancement"
summary: "Initial document enhancement for form submissions"
agent: "editor"
ui_visible: true
requires: ["markdown_document", "submission_brief"]
optional: ["style_instructions"]
schema_version: "2.0"
---

## Initial Document Enhancement

You are an expert document editor. Your task is to enhance the provided document based on the user's requirements.

### Input
- **Document**: {{markdown_document}}
- **Requirements**: {{submission_brief}}
- **Style**: {{style_instructions}}

### Task
1. **Analyze** the document structure and content
2. **Identify** areas for improvement based on requirements
3. **Enhance** the document while maintaining the author's voice
4. **Provide** a clear improvement plan

### Output Format
```markdown
## Editor Assessment
[Your assessment of the document]

## Improvement Plan
[Your plan for enhancements]

## Clarifying Questions
[Any questions you need answered]

## Updated Draft
[The enhanced document]
```

### Guidelines
- Maintain the author's tone and style
- Focus on clarity and structure
- Ask specific, actionable questions
- Provide concrete improvements
```

### Updating the Index

#### Index File Format
```json
{
  "id": "form-initial",
  "name": "Form: Initial Enhancement",
  "path": "prompts/form/initial.md",
  "description": "Initial document enhancement for form submissions",
  "agent": "editor",
  "ui_visible": true,
  "requires": ["markdown_document", "submission_brief"],
  "optional": ["style_instructions"],
  "schema_version": "2.0"
}
```

#### Adding New Templates
1. **Create Template File**: Add new `.md` file in appropriate directory
2. **Update Index**: Add entry to `prompts/index.json`
3. **Test Template**: Verify template works correctly
4. **Document Usage**: Add usage examples

## System Prompt Contributions

### System Prompt Structure

#### Base System Prompt
```markdown
You are a professional document collaborator operating in a multi-agent workflow. Read the entire document before writing. Maintain the author's tone, improve clarity and structure, and strictly follow markdown best practices (heading hierarchy, concise paragraphs, meaningful bullets, tables when helpful). Work iteratively with focused changes. Ask concise clarifying questions only when necessary.

Be deterministic and consistent. Prefer explicit, scannable outputs. Use mermaid diagrams only for brief plan visualizations when it significantly improves clarity.
```

#### Agent-Specific Addenda
```markdown
### Editor Addendum
- Emphasize small, targeted edits per turn
- Ask up to 3 clarifying questions only when blockers exist
- Include brief mermaid only for plan clarity

### Research Addendum
- Cite official/primary sources; include inline links and a short References section
- Prefer concise, scannable outputs; use tables for comparisons
- Ask at most 2 clarifying questions if direction is ambiguous

### Reviewer Addendum
- Be deterministic; no rewriting, only guidance
- Flag structure, tone consistency, citation sufficiency, completeness
- Provide specific, actionable bullets

### Editor Merge Addendum
- Integrate all parts into coherent final markdown
- Ensure heading hierarchy, integrated citations, and consistent tone
- Keep outputs deterministic and stable
```

### Improving System Prompts

#### Areas for Improvement
1. **Clarity**: Make instructions clearer and more specific
2. **Consistency**: Ensure consistent behavior across agents
3. **Effectiveness**: Improve output quality and relevance
4. **Efficiency**: Reduce unnecessary verbosity
5. **Flexibility**: Allow for different use cases

#### Contribution Process
1. **Identify Issue**: Find areas for improvement
2. **Propose Changes**: Create issue with proposed changes
3. **Test Changes**: Test improvements with sample documents
4. **Submit PR**: Submit pull request with changes
5. **Review Process**: Collaborate on improvements

## Writing Style Presets

### Style Preset Structure

#### JSON Configuration
```json
{
  "presets": {
    "brainstorm": {
      "name": "Brainstorm",
      "description": "Creative, exploratory writing style",
      "tone": "informal",
      "structure": "loose",
      "formatting": "bullet-heavy",
      "characteristics": [
        "Encourages creative thinking",
        "Uses informal language",
        "Allows for exploration",
        "Includes brainstorming techniques"
      ],
      "template": "Use a creative, exploratory approach. Encourage brainstorming and creative thinking. Use informal language and allow for exploration of ideas."
    },
    "executive": {
      "name": "Executive",
      "description": "Professional, concise executive summary style",
      "tone": "formal",
      "structure": "hierarchical",
      "formatting": "structured",
      "characteristics": [
        "Professional tone",
        "Concise language",
        "Clear hierarchy",
        "Action-oriented"
      ],
      "template": "Use a professional, executive-level tone. Be concise and action-oriented. Maintain clear hierarchy and focus on key points."
    }
  }
}
```

### Creating Style Presets

#### Style Characteristics
1. **Tone**: Formal, informal, neutral, technical
2. **Structure**: Hierarchical, loose, systematic, balanced
3. **Formatting**: Structured, bullet-heavy, code-friendly, standard
4. **Language**: Simple, complex, technical, conversational

#### Contribution Guidelines
1. **Define Purpose**: Clearly define the style's purpose
2. **Provide Examples**: Include examples of the style
3. **Test Effectiveness**: Test with sample documents
4. **Document Usage**: Provide usage guidelines

## Testing Prompt Contributions

### Testing Framework

#### Unit Tests
```javascript
// tests/prompt-templates.test.js
describe('Prompt Templates', () => {
  it('should parse frontmatter correctly', () => {
    const template = loadTemplate('form/initial.md');
    expect(template.frontmatter.title).toBe('Form: Initial Enhancement');
    expect(template.frontmatter.agent).toBe('editor');
  });
  
  it('should validate required variables', () => {
    const template = loadTemplate('form/initial.md');
    const required = template.frontmatter.requires;
    expect(required).toContain('markdown_document');
    expect(required).toContain('submission_brief');
  });
});
```

#### Integration Tests
```javascript
// tests/prompt-integration.test.js
describe('Prompt Integration', () => {
  it('should work with n8n workflow', async () => {
    const response = await fetchPrompt('form-initial', {
      markdown_document: 'Test document',
      submission_brief: 'Test requirements'
    });
    expect(response.template).toBeDefined();
    expect(response.system_prompt).toBeDefined();
  });
});
```

### Test Data

#### Sample Documents
```markdown
# Test Document

This is a sample document for testing prompt templates.

## Section 1
Content for testing...

## Section 2
More content for testing...
```

#### Test Scenarios
```javascript
const testScenarios = [
  {
    name: 'Basic enhancement',
    template: 'form-initial',
    input: {
      markdown_document: 'sample-document.md',
      submission_brief: 'Improve clarity and structure'
    },
    expected: 'enhanced-document.md'
  }
];
```

## Quality Guidelines

### Template Quality

#### Content Quality
- **Clarity**: Instructions are clear and unambiguous
- **Completeness**: All necessary information is included
- **Consistency**: Consistent with other templates
- **Effectiveness**: Produces desired outputs

#### Technical Quality
- **Valid YAML**: Frontmatter is valid YAML
- **Valid Markdown**: Content is valid Markdown
- **Variable Usage**: Variables are used correctly
- **Schema Compliance**: Follows schema requirements

### Review Process

#### Self-Review Checklist
- [ ] Template follows structure guidelines
- [ ] Variables are used correctly
- [ ] Instructions are clear and specific
- [ ] Output format is defined
- [ ] Examples are provided when helpful
- [ ] Template is tested with sample data

#### Peer Review
- [ ] Content is appropriate for agent type
- [ ] Instructions are clear and actionable
- [ ] Variables are used consistently
- [ ] Output format is well-defined
- [ ] Template integrates well with system

## Submission Process

### Creating a Pull Request

1. **Fork Repository**: Fork the repository
2. **Create Branch**: Create feature branch
3. **Add Template**: Add new template file
4. **Update Index**: Update `prompts/index.json`
5. **Add Tests**: Add tests for new template
6. **Update Documentation**: Update relevant documentation
7. **Submit PR**: Submit pull request

### PR Description Template
```markdown
## Prompt Template Contribution

### Template Details
- **Name**: [Template Name]
- **Agent**: [Agent Type]
- **Purpose**: [Brief description]

### Changes
- [ ] Added new template file
- [ ] Updated index.json
- [ ] Added tests
- [ ] Updated documentation

### Testing
- [ ] Tested with sample data
- [ ] Verified variable usage
- [ ] Checked output format
- [ ] Validated integration

### Examples
[Include examples of template usage]
```

## Community Guidelines

### Collaboration

#### Discussion
- Use GitHub Issues for questions
- Participate in community discussions
- Share ideas and feedback
- Help other contributors

#### Feedback
- Provide constructive feedback
- Be respectful and helpful
- Focus on improvement
- Acknowledge good work

### Recognition

#### Contributor Recognition
- Listed in contributor documentation
- Mentioned in release notes
- Credited in template documentation
- Recognized in community discussions

## Resources

### Documentation
- [Template Schema](../prompts/schema.md)
- [System Prompts](../system-prompts.md)
- [Implementation Guide](../implementation/index.md)

### Tools
- [YAML Validator](https://www.yamllint.com/)
- [Markdown Validator](https://dlaa.me/markdownlint/)
- [JSON Validator](https://jsonlint.com/)

### Examples
- [Existing Templates](../prompts/)
- [Test Data](../test-data/)
- [Sample Documents](../test-data/sample-document.md)

## Getting Help

### Community Support
- **GitHub Issues**: For questions and bug reports
- **GitHub Discussions**: For community discussions
- **Documentation**: Comprehensive documentation

### Maintainer Contact
- **Primary Maintainer**: [Maintainer Name]
- **Email**: [maintainer@example.com]
- **GitHub**: [@maintainer-username]

## Thank You

Thank you for contributing to the prompt system! Your contributions help improve the quality and effectiveness of the n8n LLM Document Workflow for all users.
