#!/bin/bash

# n8n Research Bug - Development Environment Setup
# This script sets up the complete development environment with linting tools

set -e

echo "🚀 Setting up n8n Research Bug development environment..."

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "📦 Installing uv package manager..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Node.js not found. Please install Node.js 18+ first:"
    echo "   https://nodejs.org/en/download/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "📦 npm not found. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check complete!"

# Create Python virtual environment
echo "🐍 Setting up Python environment..."
uv venv
source .venv/bin/activate

# Install Python dependencies
echo "📦 Installing Python dependencies..."
uv pip install -e ".[dev]"

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install pre-commit hooks
echo "🔧 Setting up pre-commit hooks..."
uvx pre-commit install

# Test the setup
echo "🧪 Testing the setup..."

# Test Python linting
echo "Testing Python linting..."
uvx ruff --version
uvx black --version
uvx isort --version
uvx mypy --version

# Test n8n linting
echo "Testing n8n linting..."
npm run lint --version || echo "nodelinter will be installed on first run"

# Test JSON validation
echo "Testing JSON validation..."
node scripts/validate-json.js

# Test linting script
echo "Testing linting script..."
python3 scripts/test-linting.py

echo ""
echo "🎉 Development environment setup complete!"
echo ""
echo "📋 Available commands:"
echo "  make lint          - Run all linting checks"
echo "  make lint-python   - Run Python linting only"
echo "  make lint-n8n      - Run n8n workflow linting only"
echo "  make lint-json     - Validate JSON files only"
echo "  make lint-yaml     - Validate YAML files only"
echo "  make lint-fix      - Auto-fix linting issues"
echo "  make lint-check    - Check linting without fixes"
echo "  make test-lint     - Run linting test script"
echo ""
echo "🔧 Pre-commit hooks are installed and will run automatically on git commit."
echo "💡 Run 'make help' to see all available commands."
