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
