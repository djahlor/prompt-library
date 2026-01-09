#!/usr/bin/env python3
"""Render a prompty file with variables."""

import argparse
import re
import sys
from pathlib import Path

import yaml

def extract_frontmatter(content: str) -> tuple[dict, str]:
    """Extract YAML frontmatter and template from prompty file."""
    match = re.match(r"^---\n(.*?)\n---\n?(.*)", content, re.DOTALL)
    if match:
        frontmatter = yaml.safe_load(match.group(1))
        template = match.group(2)
        return frontmatter, template
    return {}, content

def render_template(template: str, variables: dict, fragments_dir: Path) -> str:
    """Render Jinja2-style template with variables and includes."""
    result = template

    # Process includes
    include_pattern = r"\{%\s*include\s*'([^']+)'\s*%\}"
    for match in re.finditer(include_pattern, result):
        include_path = fragments_dir.parent / match.group(1)
        if include_path.exists():
            include_content = include_path.read_text()
            result = result.replace(match.group(0), include_content)
        else:
            print(f"Warning: Include not found: {include_path}", file=sys.stderr)

    # Process variables
    for key, value in variables.items():
        result = result.replace(f"{{{{{key}}}}}", str(value))

    return result

def main():
    parser = argparse.ArgumentParser(description="Render a prompty file")
    parser.add_argument("file", type=Path, help="Path to .prompty file")
    parser.add_argument("--var", "-v", action="append", nargs=2, metavar=("KEY", "VALUE"),
                        help="Variable to substitute")
    parser.add_argument("--use-sample", "-s", action="store_true",
                        help="Use sample values from frontmatter")
    args = parser.parse_args()

    if not args.file.exists():
        print(f"Error: File not found: {args.file}", file=sys.stderr)
        sys.exit(1)

    content = args.file.read_text()
    frontmatter, template = extract_frontmatter(content)

    # Build variables dict
    variables = {}
    if args.use_sample and "sample" in frontmatter:
        variables.update(frontmatter["sample"])
    if args.var:
        for key, value in args.var:
            variables[key] = value

    # Render
    fragments_dir = args.file.parent.parent / "fragments"
    rendered = render_template(template, variables, fragments_dir)

    print(rendered)

if __name__ == "__main__":
    main()
