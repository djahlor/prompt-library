export interface PromptFrontmatter {
  name: string
  description: string
  authors?: string[]
  version: string
  category?: string
  model?: {
    api?: string
    parameters?: {
      max_tokens?: number
      temperature?: number
    }
  }
  tags?: string[]
  fragments?: string[]
  variables?: string[]
  sample?: Record<string, string>
}

export interface Prompt {
  id: string
  path: string
  frontmatter: PromptFrontmatter
  content: string
  rawContent: string
}

export interface Fragment {
  id: string
  path: string
  category: string
  name: string
  content: string
}

export interface PromptIndex {
  prompts: Prompt[]
  fragments: Fragment[]
  tags: string[]
  categories: string[]
  generatedAt: string
}
