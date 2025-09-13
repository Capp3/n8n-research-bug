# n8n LLM Document Workflow Makefile
# Streamlined development and deployment commands

.PHONY: help install setup clean dev test docker docs serve-docs build-docs deploy-docs lint validate status test-lint

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
	@echo "  test              - Run all tests (docs validation)"
	@echo "  test-docs         - Test documentation build only"
	@echo "  lint              - Run comprehensive linting (Python, n8n, JSON, YAML)"
	@echo "  lint-python       - Run Python linting (ruff, black, isort, mypy)"
	@echo "  lint-n8n          - Run n8n-specific linting (nodelinter)"
	@echo "  lint-json         - Validate JSON files"
	@echo "  lint-yaml         - Validate YAML files"
	@echo "  lint-fix          - Auto-fix linting issues"
	@echo "  lint-check        - Check linting without fixes"
	@echo "  test-lint         - Run linting test script"
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
	@echo "✅ Development environment setup complete!"

# Clean all build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf site/
	rm -rf .cache/
	rm -rf docs/__pycache__/
	rm -rf .venv/
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
	@test -d docs/implementation && echo "✅ docs/implementation/ directory exists"
	@test -d docs/contributing && echo "✅ docs/contributing/ directory exists"
	@test -d docs/status && echo "✅ docs/status/ directory exists"
	@test -d docs/archive && echo "✅ docs/archive/ directory exists"
	@test -d docs/prompts && echo "✅ docs/prompts/ directory exists"
	@test -d docs/test-data && echo "✅ docs/test-data/ directory exists"
	@test -f mkdocs.yml && echo "✅ mkdocs.yml exists"
	@test -f scripts/requirements.txt && echo "✅ requirements.txt exists"
	@echo "✅ Documentation validation complete!"

# Testing commands
test: test-docs
	@echo "✅ All tests completed!"

test-docs:
	@echo "🧪 Testing documentation build..."
	uvx mkdocs build --clean
	@echo "✅ Documentation build test passed!"

# Code quality commands
lint: lint-python lint-n8n lint-json lint-yaml
	@echo "✅ All linting checks complete!"

lint-python:
	@echo "🐍 Running Python linting..."
	@echo "Running ruff..."
	uvx ruff check . --fix
	@echo "Running black..."
	uvx black .
	@echo "Running isort..."
	uvx isort .
	@echo "Running mypy..."
	uvx mypy . || echo "⚠️  mypy found type issues (non-blocking)"
	@echo "✅ Python linting complete!"

lint-n8n:
	@echo "🔧 Running n8n-specific linting..."
	@echo "Installing Node.js dependencies..."
	npm install --silent
	@echo "Running nodelinter..."
	npm run lint
	@echo "✅ n8n linting complete!"

lint-json:
	@echo "📄 Running JSON validation..."
	npm run validate:json
	@echo "✅ JSON validation complete!"

lint-yaml:
	@echo "📋 Running YAML validation..."
	@for file in .github/workflows/*.yml mkdocs.yml compose.yml; do \
		if [ -f "$$file" ]; then \
			echo "Validating $$file"; \
			python3 -c "import yaml; yaml.safe_load(open('$$file'))" || echo "❌ $$file has YAML errors"; \
		fi; \
	done
	@echo "✅ YAML validation complete!"

lint-fix: lint-python lint-n8n
	@echo "🔧 Auto-fixable linting issues resolved!"

lint-check:
	@echo "🔍 Running linting checks (no fixes)..."
	@echo "Checking Python code..."
	uvx ruff check .
	@echo "Checking n8n workflow..."
	npm run lint
	@echo "Checking JSON files..."
	npm run validate:json
	@echo "Running linting test script..."
	python3 scripts/test-linting.py
	@echo "✅ Lint check complete!"

test-lint:
	@echo "🧪 Running linting test script..."
	python3 scripts/test-linting.py
	@echo "✅ Linting test complete!"

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
	@echo "🔧 Python Environment:"
	@test -d .venv && echo "✅ Virtual environment exists" || echo "❌ Virtual environment not created"

validate:
	@echo "🔍 Validating project structure..."
	@test -f compose.yml && echo "✅ Docker compose file exists"
	@test -f mkdocs.yml && echo "✅ MkDocs configuration exists"
	@test -f prompts/index.json && echo "✅ Prompts index exists"
	@test -f ResearchBug.json && echo "✅ n8n workflow exists"
	@test -d .github/workflows && echo "✅ GitHub Actions workflows exist"
	@echo "✅ Project structure validation complete!"

# Full development workflow
dev: setup docker-up serve-docs
