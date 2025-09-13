#!/usr/bin/env python3
"""
Test script to verify linting setup works correctly.
This file will be used to test the Python linting tools.
"""

import json
import os
import sys

# Add parent directory to path to access project files
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def validate_json_file(file_path: str) -> bool:
    """Validate a JSON file for syntax errors."""
    try:
        with open(file_path, encoding="utf-8") as f:
            json.load(f)
        return True
    except (json.JSONDecodeError, FileNotFoundError) as e:
        print(f"Error validating {file_path}: {e}")
        return False


def get_project_files() -> list[str]:
    """Get list of files to validate."""
    # Get the project root directory (parent of scripts directory)
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    return [
        os.path.join(project_root, "ResearchBug.json"),
        os.path.join(project_root, "package.json"),
        os.path.join(project_root, "pyproject.toml"),
        os.path.join(project_root, "mkdocs.yml"),
        os.path.join(project_root, "compose.yml"),
    ]


def main() -> None:
    """Main function to test linting setup."""
    print("🧪 Testing linting setup...")

    # Test JSON validation
    json_files = [f for f in get_project_files() if f.endswith(".json")]
    for file_path in json_files:
        if os.path.exists(file_path):
            if validate_json_file(file_path):
                print(f"✅ {os.path.basename(file_path)} is valid JSON")
            else:
                print(f"❌ {os.path.basename(file_path)} has JSON errors")
        else:
            print(f"⚠️  {os.path.basename(file_path)} not found")

    print("🎉 Linting setup test complete!")


if __name__ == "__main__":
    main()
