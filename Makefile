# n8n LLM Document Workflow Makefile
# Complete development and deployment commands for the project

.PHONY: help install setup clean dev test docker docs serve-docs build-docs deploy-docs lint format prompt-server validate status

# Default target
help:
	@echo "🚀 n8n LLM Document Workflow - Available Commands:"
	@echo ""
	@echo "📋 Setup & Installation:"
	@echo "  install           - Install uv package manager"
	@echo "  setup             - Create virtual environment and install dependencies"
	@echo "  clean             - Clean all build artifacts and temporary files"
	@echo ""
	@echo "🐳 Docker Commands:"
	@echo "  docker-up         - Start the full Docker stack (PostgreSQL, Redis, Adminer)"
	@echo "  docker-down       - Stop and remove Docker containers"
	@echo "  docker-logs       - View Docker container logs"
	@echo "  docker-reset      - Reset Docker stack (remove volumes and restart)"
	@echo "  docker-health     - Check health status of all containers"
	@echo ""
	@echo "📚 Documentation:"
	@echo "  serve-docs        - Start MkDocs development server"
	@echo "  build-docs        - Build MkDocs static site"
	@echo "  deploy-docs       - Build and prepare docs for deployment"
	@echo "  validate-docs     - Validate documentation structure and links"
	@echo ""
	@echo "🔧 Development:"
	@echo "  prompt-server     - Start the prompt server in development mode"
	@echo "  test              - Run all tests (prompt-server + docs validation)"
	@echo "  test-server       - Run prompt server tests only"
	@echo "  test-docs         - Test documentation build only"
	@echo "  lint              - Run linting on all files"
	@echo "  format            - Format code and configuration files"
	@echo ""
	@echo "📊 Project Management:"
	@echo "  status            - Show current project status and task progress"
	@echo "  validate          - Validate project structure and configuration"
	@echo "  dev               - Full development setup (setup + docker + serve-docs)"
	@echo ""
	@echo "💡 Quick Start:"
	@echo "  make setup && make dev   - Complete development environment setup"

# Install uv package manager
install:
	@echo "📦 Installing uv package manager..."
	@command -v uv >/dev/null 2>&1 || curl -LsSf https://astral.sh/uv/install.sh | sh
	@echo "✅ uv installed successfully!"

# Create virtual environment and install dependencies
setup:
	@echo "🔧 Setting up development environment..."
	@echo "Creating virtual environment with uv..."
	uv venv
	@echo "Installing Python dependencies..."
	uv pip install -r scripts/requirements.txt
	@echo "Setting up prompt server dependencies..."
	cd prompt-server && npm install
	@echo "✅ Development environment setup complete!"

# Clean all build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf site/
	rm -rf .cache/
	rm -rf docs/__pycache__/
	rm -rf prompt-server/node_modules/.cache/
	rm -rf prompt-server/coverage/
	@echo "✅ Clean complete!"

# Docker stack management
docker-up:
	@echo "🐳 Starting Docker stack..."
	docker compose up -d
	@echo "✅ Docker stack started!"
	@echo "📊 Adminer available at: http://localhost:8080"
	@echo "🗄️  PostgreSQL available at: localhost:5432"
	@echo "🔴 Redis available at: localhost:6379"

docker-down:
	@echo "🐳 Stopping Docker stack..."
	docker compose down
	@echo "✅ Docker stack stopped!"

docker-logs:
	@echo "📋 Viewing Docker container logs..."
	docker compose logs -f

docker-reset:
	@echo "🔄 Resetting Docker stack..."
	docker compose down -v
	docker compose up -d
	@echo "✅ Docker stack reset complete!"

docker-health:
	@echo "🏥 Checking Docker container health..."
	docker compose ps
	@echo ""
	@echo "Detailed health checks:"
	@docker compose exec n8n-postgres pg_isready -U support-user -d support || echo "❌ PostgreSQL not ready"
	@docker compose exec n8n-redis redis-cli ping || echo "❌ Redis not ready"
	@echo "✅ Health check complete!"

# Documentation commands
serve-docs:
	@echo "📚 Starting MkDocs development server..."
	uvx mkdocs serve

build-docs:
	@echo "📚 Building MkDocs static site..."
	./scripts/build-docs.sh

deploy-docs: build-docs
	@echo "🚀 Documentation built and ready for deployment!"
	@echo "📁 Site files located in: site/"
	@echo "🌐 To deploy, push changes to main branch for GitHub Pages"

validate-docs:
	@echo "🔍 Validating documentation..."
	@echo "Checking documentation structure..."
	@test -f docs/index.md && echo "✅ docs/index.md exists"
	@test -f docs/projectbrief.md && echo "✅ docs/projectbrief.md exists"
	@test -f docs/technical.md && echo "✅ docs/technical.md exists"
	@test -d docs/creative && echo "✅ docs/creative/ directory exists"
	@test -d docs/implementation && echo "✅ docs/implementation/ directory exists"
	@test -d docs/support && echo "✅ docs/support/ directory exists"
	@test -f mkdocs.yml && echo "✅ mkdocs.yml exists"
	@test -f scripts/requirements.txt && echo "✅ requirements.txt exists"
	@echo "✅ Documentation validation complete!"

# Prompt server commands
prompt-server:
	@echo "🔧 Starting prompt server in development mode..."
	cd prompt-server && npm run dev

# Testing commands
test: test-server test-docs
	@echo "✅ All tests completed!"

test-server:
	@echo "🧪 Running prompt server tests..."
	cd prompt-server && npm test

test-docs:
	@echo "🧪 Testing documentation build..."
	uvx mkdocs build --clean --strict
	@echo "✅ Documentation build test passed!"

# Code quality commands
lint:
	@echo "🔍 Running linting checks..."
	@echo "Validating YAML files..."
	@for file in .github/workflows/*.yml; do \
		echo "Validating $$file"; \
		python3 -c "import yaml; yaml.safe_load(open('$$file'))"; \
	done
	@echo "Validating JSON files..."
	@python3 -c "import json; json.load(open('prompts/index.json'))"
	@echo "Checking file structure..."
	@test -f mkdocs.yml && echo "✅ mkdocs.yml exists"
	@test -f scripts/requirements.txt && echo "✅ requirements.txt exists"
	@echo "✅ Linting complete!"

format:
	@echo "🎨 Formatting code..."
	cd prompt-server && npm run format 2>/dev/null || echo "No format script available"
	@echo "✅ Formatting complete!"

# Project status and validation
status:
	@echo "📊 Project Status Dashboard"
	@echo "=========================="
	@echo ""
	@echo "📋 Current Tasks:"
	@grep -E "^- \[ \]" docs/status/tasks.md | head -5 || echo "No pending tasks found"
	@echo ""
	@echo "✅ Recent Completions:"
	@grep -E "^- \[x\]" docs/status/tasks.md | tail -3 || echo "No completed tasks found"
	@echo ""
	@echo "🐳 Docker Status:"
	@docker compose ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null || echo "Docker not running"
	@echo ""
	@echo "📚 Documentation:"
	@test -d site && echo "✅ Built documentation available" || echo "❌ Documentation not built"
	@echo ""
	@echo "🔧 Prompt Server:"
	@test -d prompt-server/node_modules && echo "✅ Dependencies installed" || echo "❌ Dependencies not installed"

validate:
	@echo "🔍 Validating project structure..."
	@test -f compose.yml && echo "✅ Docker compose file exists"
	@test -f mkdocs.yml && echo "✅ MkDocs configuration exists"
	@test -f prompts/index.json && echo "✅ Prompts index exists"
	@test -f prompt-server/package.json && echo "✅ Prompt server package.json exists"
	@test -d .github/workflows && echo "✅ GitHub Actions workflows exist"
	@echo "✅ Project structure validation complete!"

# Full development workflow
dev: setup docker-up serve-docs
