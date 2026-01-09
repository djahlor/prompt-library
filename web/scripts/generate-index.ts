#!/usr/bin/env bun
/**
 * Generates a JSON index of all prompts and fragments
 * Run with: bun run scripts/generate-index.ts
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { join, relative, basename, dirname } from 'path'
import matter from 'gray-matter'

const ROOT_DIR = join(import.meta.dir, '../..')
const PROMPTS_DIR = join(ROOT_DIR, 'prompts')
const FRAGMENTS_DIR = join(ROOT_DIR, 'fragments')
const OUTPUT_FILE = join(import.meta.dir, '../src/data/index.json')

interface Prompt {
  id: string
  path: string
  frontmatter: Record<string, unknown>
  content: string
  rawContent: string
}

interface Fragment {
  id: string
  path: string
  category: string
  name: string
  content: string
}

async function getFiles(dir: string, ext: string): Promise<string[]> {
  const files: string[] = []

  async function walk(currentDir: string) {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true })
      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name)
        if (entry.isDirectory()) {
          await walk(fullPath)
        } else if (entry.name.endsWith(ext)) {
          files.push(fullPath)
        }
      }
    } catch {
      // Directory doesn't exist, skip
    }
  }

  await walk(dir)
  return files
}

async function parsePrompt(filePath: string): Promise<Prompt> {
  const rawContent = await readFile(filePath, 'utf-8')
  const { data: frontmatter, content } = matter(rawContent)
  const relativePath = relative(ROOT_DIR, filePath)
  const id = frontmatter.name || basename(filePath, '.prompty')

  return {
    id,
    path: relativePath,
    frontmatter,
    content: content.trim(),
    rawContent,
  }
}

async function parseFragment(filePath: string): Promise<Fragment> {
  const content = await readFile(filePath, 'utf-8')
  const relativePath = relative(ROOT_DIR, filePath)
  const category = basename(dirname(filePath))
  const name = basename(filePath, '.md')
  const id = `${category}/${name}`

  return {
    id,
    path: relativePath,
    category,
    name,
    content: content.trim(),
  }
}

async function main() {
  console.log('Generating prompt index...')

  // Parse prompts
  const promptFiles = await getFiles(PROMPTS_DIR, '.prompty')
  const prompts = await Promise.all(promptFiles.map(parsePrompt))
  console.log(`  Found ${prompts.length} prompts`)

  // Parse fragments
  const fragmentFiles = await getFiles(FRAGMENTS_DIR, '.md')
  const fragments = await Promise.all(fragmentFiles.map(parseFragment))
  console.log(`  Found ${fragments.length} fragments`)

  // Extract unique tags and categories
  const tags = [...new Set(prompts.flatMap(p => p.frontmatter.tags as string[] || []))]
  const categories = [...new Set(prompts.map(p => p.frontmatter.category as string).filter(Boolean))]

  const index = {
    prompts,
    fragments,
    tags,
    categories,
    generatedAt: new Date().toISOString(),
  }

  // Ensure output directory exists
  await mkdir(dirname(OUTPUT_FILE), { recursive: true })

  // Write index
  await writeFile(OUTPUT_FILE, JSON.stringify(index, null, 2))
  console.log(`  Index written to ${relative(ROOT_DIR, OUTPUT_FILE)}`)
}

main().catch(console.error)
