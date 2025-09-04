# Contributing to n8n LLM Document Workflow

## Overview

Thank you for your interest in contributing to the n8n LLM Document Workflow! This project welcomes contributions from the community in various forms, including code improvements, documentation updates, prompt enhancements, and feature suggestions.

## Types of Contributions

### 1. Code Contributions
- **Bug Fixes**: Fix issues in the codebase
- **Feature Development**: Implement new features
- **Performance Improvements**: Optimize existing code
- **Refactoring**: Improve code structure and maintainability

### 2. Documentation Contributions
- **Documentation Updates**: Improve existing documentation
- **New Documentation**: Add missing documentation
- **Examples**: Provide usage examples and tutorials
- **Translation**: Translate documentation to other languages

### 3. Prompt Contributions
- **Prompt Templates**: Create new agent prompt templates
- **System Prompts**: Improve system prompt definitions
- **Style Presets**: Add new writing style presets
- **Language Support**: Add prompts for other languages

### 4. Testing Contributions
- **Test Cases**: Add new test cases
- **Test Data**: Provide test data and scenarios
- **Integration Tests**: Test integration between components
- **Performance Tests**: Test system performance and scalability

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- Git
- Basic knowledge of n8n workflows
- Understanding of AI/LLM concepts

### Development Setup

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/your-username/n8n-research-bug.git
   cd n8n-research-bug
   ```

2. **Install Dependencies**:
   ```bash
   # Install prompt server dependencies
   cd prompt-server
   npm install
   
   # Install documentation dependencies
   cd ../docs
   pip install mkdocs mkdocs-material
   ```

3. **Start Support Services**:
   ```bash
   docker-compose up -d
   ```

4. **Verify Setup**:
   ```bash
   # Check services
   docker-compose ps
   
   # Test prompt server
   curl http://localhost:3000/api/health
   ```

## Contribution Guidelines

### Code Style

#### JavaScript/TypeScript
- Use ES6+ features
- Follow async/await patterns
- Use meaningful variable names
- Add JSDoc comments for functions
- Use consistent indentation (2 spaces)

#### Python
- Follow PEP 8 style guide
- Use type hints
- Add docstrings for functions and classes
- Use meaningful variable names

#### Markdown
- Use consistent heading hierarchy
- Include table of contents for long documents
- Use code blocks with language specification
- Include examples and use cases

### Commit Messages

Follow the conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or changes
- `chore`: Maintenance tasks

#### Examples
```
feat(prompt-server): add system prompt caching
fix(docs): correct API endpoint URLs
docs(contributing): add code style guidelines
test(prompt-server): add unit tests for caching
```

### Pull Request Process

1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**:
   - Write code following style guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Changes**:
   ```bash
   # Run tests
   npm test
   
   # Check documentation
   mkdocs serve
   
   # Test prompt server
   npm start
   ```

4. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat(prompt-server): add new feature"
   ```

5. **Push and Create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**:
   - Provide clear description
   - Reference related issues
   - Include screenshots if applicable
   - Request review from maintainers

## Prompt Contributions

### Creating New Prompt Templates

1. **Choose Agent Type**:
   - `editor`: Document editing and enhancement
   - `research`: Research and information gathering
   - `reviewer`: Quality review and validation
   - `editor_merge`: Final document merging

2. **Create Template File**:
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
   ```

3. **Update Index**:
   ```json
   {
     "id": "template-id",
     "name": "Template Name",
     "path": "prompts/agent/template.md",
     "description": "Template description",
     "agent": "editor",
     "ui_visible": true,
     "requires": ["markdown_document", "submission_brief"],
     "optional": ["style_instructions"],
     "schema_version": "2.0"
   }
   ```

### System Prompt Improvements

1. **Identify Improvement Area**:
   - Clarity and specificity
   - Agent-specific instructions
   - Output format consistency
   - Error handling

2. **Propose Changes**:
   - Create issue describing improvement
   - Provide before/after examples
   - Explain reasoning behind changes

3. **Submit Changes**:
   - Update system prompt in `docs/system-prompts.md`
   - Update prompt server implementation
   - Add tests for new behavior

## Testing Contributions

### Unit Tests

#### Prompt Server Tests
```javascript
// tests/prompt-server.test.js
describe('Prompt Server API', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
  
  it('should fetch prompt templates', async () => {
    const response = await request(app).get('/api/prompts');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
```

#### Integration Tests
```javascript
// tests/integration.test.js
describe('n8n Integration', () => {
  it('should integrate with n8n workflow', async () => {
    // Test n8n workflow integration
    const workflow = await loadWorkflow('llm-document-workflow.json');
    expect(workflow).toBeDefined();
  });
});
```

### Test Data

#### Sample Documents
```markdown
# Test Document

This is a sample document for testing purposes.

## Section 1
Content for testing...

## Section 2
More content for testing...
```

#### Test Scenarios
```javascript
// tests/scenarios.test.js
const testScenarios = [
  {
    name: 'Basic document enhancement',
    input: 'sample-document.md',
    expected: 'enhanced-document.md'
  },
  {
    name: 'Research addendum',
    input: 'research-request.md',
    expected: 'research-addendum.md'
  }
];
```

## Documentation Contributions

### Documentation Structure

#### Adding New Documentation
1. **Choose Appropriate Section**:
   - `docs/implementation/`: Implementation guides
   - `docs/contributing/`: Contribution guidelines and processes
   - `docs/creative/`: Design decisions and architecture
   - `docs/status/`: Project status and progress
   - `docs/archive/`: Archived documentation and historical records
   - `docs/test-data/`: Test data and sample content

2. **Follow Documentation Standards**:
   - Use clear, concise language
   - Include examples and code snippets
   - Add table of contents for long documents
   - Include cross-references to related documents

3. **Update Navigation**:
   - Add new document to `mkdocs.yml`
   - Update index files as needed
   - Ensure proper linking

### Documentation Types

#### API Documentation
```markdown
## API Endpoint

### GET /api/endpoint

**Description**: Brief description of endpoint purpose.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `param1` | string | Yes | Parameter description |

**Response**:
```json
{
  "status": "success",
  "data": {}
}
```

**Example**:
```bash
curl -X GET http://localhost:3000/api/endpoint
```
```

#### Tutorial Documentation
```markdown
## Tutorial: Setting Up the Workflow

### Prerequisites
- n8n instance
- GitHub repository
- OpenAI API key

### Step 1: Import Workflow
1. Open n8n
2. Go to Workflows
3. Click "Import from JSON"
4. Paste workflow JSON

### Step 2: Configure Credentials
1. Set up GitHub credentials
2. Configure OpenAI API key
3. Test connections

### Step 3: Test Workflow
1. Submit test document
2. Verify processing
3. Check output
```

## Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Environment Information**:
   - Operating system
   - Node.js version
   - Docker version
   - n8n version

2. **Steps to Reproduce**:
   - Clear, numbered steps
   - Expected behavior
   - Actual behavior

3. **Error Messages**:
   - Full error messages
   - Stack traces
   - Log files

4. **Additional Context**:
   - Screenshots
   - Configuration files
   - Sample data

### Feature Requests

When requesting features, please include:

1. **Problem Description**:
   - What problem does this solve?
   - Why is this needed?

2. **Proposed Solution**:
   - How should this work?
   - What would the interface look like?

3. **Alternatives Considered**:
   - What other solutions were considered?
   - Why is this approach preferred?

4. **Additional Context**:
   - Use cases
   - Examples
   - Related issues

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Age, body size, disability, ethnicity
- Gender identity and expression
- Level of experience, education
- Nationality, personal appearance
- Race, religion, sexual orientation

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or inflammatory comments
- Personal attacks or political discussions
- Public or private harassment
- Publishing private information without permission
- Other unprofessional conduct

## Recognition

### Contributors

We recognize contributors in several ways:

1. **Contributor List**: Listed in README.md
2. **Release Notes**: Mentioned in release notes
3. **Documentation**: Credited in documentation
4. **Community**: Recognized in community discussions

### Types of Recognition

- **Code Contributors**: Code improvements and features
- **Documentation Contributors**: Documentation improvements
- **Prompt Contributors**: Prompt template contributions
- **Test Contributors**: Test improvements and additions
- **Community Contributors**: Community support and engagement

## Getting Help

### Community Support

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and community discussions
- **Documentation**: Comprehensive documentation in `docs/` directory

### Maintainer Contact

- **Primary Maintainer**: [Maintainer Name]
- **Email**: [maintainer@example.com]
- **GitHub**: [@maintainer-username]

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

## Thank You

Thank you for contributing to the n8n LLM Document Workflow! Your contributions help make this project better for everyone in the community.
