#!/usr/bin/env python3
"""Check for duplicate prompts in the library."""

import hashlib
import sys
from pathlib import Path

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"

def get_content_hash(path: Path) -> str:
    """Get hash of prompt content (excluding frontmatter)."""
    content = path.read_text()
    # Remove frontmatter for comparison
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            content = parts[2]
    return hashlib.md5(content.strip().encode()).hexdigest()

def main():
    hashes: dict[str, list[Path]] = {}

    for prompt_file in PROMPTS_DIR.rglob("*.prompty"):
        content_hash = get_content_hash(prompt_file)
        if content_hash not in hashes:
            hashes[content_hash] = []
        hashes[content_hash].append(prompt_file)

    duplicates = {h: paths for h, paths in hashes.items() if len(paths) > 1}

    if duplicates:
        print("Duplicate prompts found:")
        for paths in duplicates.values():
            print(f"  - {', '.join(str(p) for p in paths)}")
        sys.exit(1)
    else:
        print("No duplicate prompts found")
        sys.exit(0)

if __name__ == "__main__":
    main()
