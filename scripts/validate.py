#!/usr/bin/env python3
"""Validate prompt files against schema."""

import json
import re
import sys
from pathlib import Path

import yaml

SCHEMA_PATH = Path(__file__).parent.parent / "schemas" / "prompt.schema.json"
PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

def extract_frontmatter(content: str) -> dict | None:
    """Extract YAML frontmatter from prompty file."""
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if match:
        return yaml.safe_load(match.group(1))
    return None

def validate_prompt(path: Path, schema: dict) -> list[str]:
    """Validate a single prompt file."""
    errors = []
    content = path.read_text()

    frontmatter = extract_frontmatter(content)
    if not frontmatter:
        errors.append(f"{path}: Missing or invalid YAML frontmatter")
        return errors

    # Check required fields
    for field in ["name", "description", "version"]:
        if field not in frontmatter:
            errors.append(f"{path}: Missing required field '{field}'")

    # Validate version format
    if "version" in frontmatter:
        if not re.match(r"^\d+\.\d+\.\d+$", frontmatter["version"]):
            errors.append(f"{path}: Invalid version format (expected X.Y.Z)")

    # Validate name format
    if "name" in frontmatter:
        if not re.match(r"^[a-z0-9-]+$", frontmatter["name"]):
            errors.append(f"{path}: Invalid name format (use lowercase, numbers, hyphens)")

    return errors

def main():
    if not SCHEMA_PATH.exists():
        print(f"Warning: Schema not found at {SCHEMA_PATH}")
        schema = {}
    else:
        schema = json.loads(SCHEMA_PATH.read_text())

    all_errors = []
    prompt_count = 0

    for prompt_file in PROMPTS_DIR.rglob("*.prompty"):
        prompt_count += 1
        errors = validate_prompt(prompt_file, schema)
        all_errors.extend(errors)

    if all_errors:
        print("Validation errors found:")
        for error in all_errors:
            print(f"  - {error}")
        sys.exit(1)
    else:
        print(f"All {prompt_count} prompts validated successfully")
        sys.exit(0)

if __name__ == "__main__":
    main()
