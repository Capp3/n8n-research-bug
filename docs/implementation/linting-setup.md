# Linting Setup Guide

This document describes the comprehensive linting setup for the n8n Research Bug project.

## Overview

The project includes linting for:
- **Python code** (ruff, black, isort, mypy)
- **n8n workflows** (nodelinter)
- **JSON files** (custom validator)
- **YAML files** (yaml.safe_load)

## Quick Start

```bash
# Complete setup
make setup

# Run all linting
make lint

# Run specific linting
make lint-python
make lint-n8n
make lint-json
make lint-yaml

# Test linting setup
make test-lint
```

## Python Linting

### Tools Used
- **ruff**: Fast Python linter and formatter
- **black**: Code formatter
- **isort**: Import sorter
- **mypy**: Type checker

### Configuration
All Python linting tools are configured in `pyproject.toml`:

```toml
[tool.ruff]
target-version = "py312"
line-length = 88
select = ["E", "W", "F", "I", "B", "C4", "UP"]

[tool.black]
target-version = ['py312']
line-length = 88

[tool.isort]
profile = "black"
multi_line_output = 3

[tool.mypy]
python_version = "3.12"
warn_return_any = true
```

### Usage
```bash
# Run all Python linting
make lint-python

# Individual tools
uvx ruff check . --fix
uvx black .
uvx isort .
uvx mypy .
```

## n8n Workflow Linting

### Tools Used
- **nodelinter**: Static analyzer for n8n node files (70+ rules)
- **eslint-plugin-n8n-nodes-base**: ESLint plugin for n8n nodes

### Configuration
Node.js tools are configured in `package.json`:

```json
{
  "scripts": {
    "lint": "nodelinter --target=./ResearchBug.json",
    "lint:fix": "nodelinter --target=./ResearchBug.json --fix",
    "validate:json": "node scripts/validate-json.js"
  },
  "devDependencies": {
    "nodelinter": "^1.0.0",
    "eslint": "^8.0.0",
    "eslint-plugin-n8n-nodes-base": "^1.0.0"
  }
}
```

### Usage
```bash
# Run n8n linting
make lint-n8n

# Individual tools
npm run lint
npm run validate:json
```

## JSON Validation

### Custom Validator
The project includes a custom JSON validator (`scripts/validate-json.js`) that:
- Validates n8n workflow structure
- Checks JSON syntax
- Validates against n8n schema

### Files Validated
- `ResearchBug.json` - Main n8n workflow
- `bug_temp.json` - Temporary workflow data
- `prompts/index.json` - Prompts configuration

### Usage
```bash
# Validate all JSON files
make lint-json

# Run validator directly
node scripts/validate-json.js
```

## Test Script

### Linting Test Script
The project includes a test script (`scripts/test-linting.py`) that validates the linting setup:

- Tests JSON file validation
- Verifies project file structure
- Provides feedback on linting tool availability

### Usage
```bash
# Run linting test script
make test-lint

# Run test script directly
python3 scripts/test-linting.py
```

## YAML Validation

### Files Validated
- `.github/workflows/*.yml` - GitHub Actions workflows
- `mkdocs.yml` - MkDocs configuration
- `compose.yml` - Docker Compose configuration

### Usage
```bash
# Validate all YAML files
make lint-yaml
```

## Pre-commit Hooks

Pre-commit hooks are configured in `.pre-commit-config.yaml` and run automatically on git commit:

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.1.0
    hooks:
      - id: ruff
      - id: ruff-format
  - repo: https://github.com/psf/black
    rev: 23.9.1
    hooks:
      - id: black
  - repo: local
    hooks:
      - id: n8n-lint
        entry: npm run lint
        files: \.json$
```

### Setup
```bash
# Install pre-commit hooks
uvx pre-commit install

# Run hooks manually
uvx pre-commit run --all-files
```

## Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd n8n-research-bug

# Run setup script
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh
```

### 2. Daily Development
```bash
# Check linting before committing
make lint-check

# Auto-fix issues
make lint-fix

# Run specific checks
make lint-python
make lint-n8n

# Test linting setup
make test-lint
```

### 3. Pre-commit
Pre-commit hooks will automatically run when you commit:
```bash
git add .
git commit -m "Your commit message"
# Hooks run automatically
```

## Troubleshooting

### Common Issues

1. **Node.js not found**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **nodelinter not found**
   ```bash
   # Install nodelinter globally
   npm install -g nodelinter
   ```

3. **Python dependencies not found**
   ```bash
   # Reinstall Python dependencies
   uv pip install -e ".[dev]"
   ```

4. **Pre-commit hooks not working**
   ```bash
   # Reinstall hooks
   uvx pre-commit uninstall
   uvx pre-commit install
   ```

### Getting Help

- Run `make help` for all available commands
- Check individual tool documentation:
  - [ruff](https://docs.astral.sh/ruff/)
  - [black](https://black.readthedocs.io/)
  - [nodelinter](https://github.com/n8n-io/nodelinter)
  - [pre-commit](https://pre-commit.com/)

## Integration with UV

All Python tools are run through `uvx` to ensure consistency:

```bash
# Python tools
uvx ruff check .
uvx black .
uvx isort .
uvx mypy .

# Pre-commit
uvx pre-commit install
uvx pre-commit run --all-files
```

This ensures all tools run in the same environment and use the same Python version.
