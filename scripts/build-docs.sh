#!/bin/bash

# Build Documentation Script
# This script builds the MkDocs documentation locally for testing

set -e

echo "🔧 Building n8n LLM Document Workflow Documentation"

# Check if we're in the right directory
if [ ! -f "mkdocs.yml" ]; then
    echo "❌ Error: mkdocs.yml not found. Please run this script from the project root."
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed."
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ Error: pip3 is required but not installed."
    exit 1
fi

echo "📦 Installing dependencies..."
python3 -m pip install --upgrade pip
pip3 install -r scripts/requirements.txt

echo "🔍 Validating MkDocs configuration..."
python3 -c "import yaml; yaml.safe_load(open('mkdocs.yml'))"
echo "✅ MkDocs configuration is valid"

echo "🏗️  Building documentation site..."
mkdocs build --clean --strict

echo "🔗 Checking for broken links..."
if command -v linkchecker &> /dev/null; then
    linkchecker --check-extern --ignore-url="^https?://" site/ || true
else
    echo "⚠️  linkchecker not installed, skipping link check"
fi

echo "📊 Build summary:"
echo "   - Site built in: site/"
echo "   - Pages generated: $(find site -name "*.html" | wc -l)"
echo "   - Total size: $(du -sh site | cut -f1)"

echo "✅ Documentation build completed successfully!"
echo ""
echo "🚀 To serve locally, run: mkdocs serve"
echo "🌐 To deploy, push changes to the main branch"
