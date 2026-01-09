# Prompt Library

Personal prompt library with elite-level architecture based on 2025-2026 best practices research.

## Architecture

```
prompt-library/
├── prompts/                    # Domain-organized prompts
│   ├── coding/                 # Code review, debugging, generation
│   ├── writing/                # Content creation, editing
│   ├── analysis/               # Data analysis, research
│   ├── agents/                 # AI agent system prompts
│   └── meta/                   # Prompt engineering prompts
├── fragments/                  # Reusable prompt components
│   ├── personas/               # Role definitions
│   ├── constraints/            # Behavioral rules
│   ├── formats/                # Output format templates
│   └── examples/               # Few-shot examples
├── templates/                  # Jinja2 parametric templates
├── system-prompts/             # Full system prompts
├── schemas/                    # JSON schemas for validation
├── scripts/                    # CLI utilities
└── .github/workflows/          # Automation
```

## File Format

Prompts use the [Prompty specification](https://prompty.ai) with YAML frontmatter:

```markdown
---
name: code-review
description: Expert code review with security focus
authors: [d.andrews]
version: 1.0.0
model:
  api: chat
  parameters:
    max_tokens: 4096
tags: [coding, review, security]
fragments:
  - personas/senior-engineer
  - constraints/no-hallucination
variables:
  - language
  - code
---

# Code Review

You are {{persona}}.

Review the following {{language}} code for:
- Security vulnerabilities
- Performance issues
- Code quality

```{{language}}
{{code}}
```
```

## Fragment Composition

Reference fragments using Jinja2 includes:

```jinja2
{% include 'fragments/personas/senior-engineer.md' %}
```

Or inline with variable syntax:

```
{{> personas/senior-engineer}}
```

## Version Control

- Semantic versioning: `MAJOR.MINOR.PATCH`
- Immutable versions: changes create new versions
- Commit format: `prompt(scope): description`

## Quick Start

```bash
# Search prompts
grep -r "tag: coding" prompts/

# Render a template
python scripts/render.py prompts/coding/code-review.prompty --language python --code "$(cat file.py)"
```

## Contributing

1. Use `.prompty` format for all prompts
2. Include required frontmatter fields
3. Add appropriate tags for discoverability
4. Reference fragments instead of duplicating content
