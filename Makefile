# Vibe Dev Template Makefile
# Example Makefile with uv and mkdocs commands

.PHONY: help install setup serve build clean

# Default target
help:
	@echo "Available commands:"
	@echo "  install    - Install uv package manager"
	@echo "  setup      - Create virtual environment with uv"
	@echo "  serve      - Start MkDocs development server"
	@echo "  build      - Build MkDocs static site"
	@echo "  clean      - Clean build artifacts"
	@echo "  help       - Show this help message"

# Install uv package manager
install:
	@echo "Installing uv..."
	curl -LsSf https://astral.sh/uv/install.sh | sh
	@echo "uv installed successfully!"

# Create virtual environment with uv
setup:
	@echo "Creating virtual environment with uv..."
	uv venv
	@echo "Virtual environment created!"

# Start MkDocs development server using uvx (no local install needed)
serve:
	@echo "Starting MkDocs development server..."
	uvx mkdocs serve

# Build MkDocs static site using uvx
build:
	@echo "Building MkDocs static site..."
	uvx mkdocs build

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf site/
	rm -rf .cache/
	@echo "Clean complete!"

# Development workflow - setup and serve
dev: setup serve

# Full build workflow
deploy: build
	@echo "Site built in 'site/' directory"
	@echo "Ready for deployment!"

# Sync prompts into docs for MkDocs navigation
sync-prompts:
	@echo "Syncing prompts into docs/prompts..."
	rsinc -a --delete prompts/ docs/prompts/
	@echo "Sync complete."
