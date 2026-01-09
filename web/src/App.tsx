import { useState, useMemo } from 'react'
import { Search, Filter, Copy, Check, BookOpen, Puzzle, Tag } from 'lucide-react'
import promptIndex from './data/index.json'
import type { Prompt, Fragment } from './types'

const index = promptIndex as {
  prompts: Prompt[]
  fragments: Fragment[]
  tags: string[]
  categories: string[]
}

function App() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [selectedFragment, setSelectedFragment] = useState<Fragment | null>(null)
  const [copied, setCopied] = useState(false)
  const [view, setView] = useState<'prompts' | 'fragments'>('prompts')

  const filteredPrompts = useMemo(() => {
    return index.prompts.filter(prompt => {
      const matchesSearch = search === '' ||
        prompt.frontmatter.name.toLowerCase().includes(search.toLowerCase()) ||
        prompt.frontmatter.description.toLowerCase().includes(search.toLowerCase()) ||
        prompt.content.toLowerCase().includes(search.toLowerCase())

      const matchesCategory = !selectedCategory ||
        prompt.frontmatter.category === selectedCategory

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.every(tag => prompt.frontmatter.tags?.includes(tag))

      return matchesSearch && matchesCategory && matchesTags
    })
  }, [search, selectedCategory, selectedTags])

  const filteredFragments = useMemo(() => {
    return index.fragments.filter(fragment => {
      return search === '' ||
        fragment.name.toLowerCase().includes(search.toLowerCase()) ||
        fragment.content.toLowerCase().includes(search.toLowerCase())
    })
  }, [search])

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">Prompt Library</h1>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span>{index.prompts.length} prompts</span>
            <span>·</span>
            <span>{index.fragments.length} fragments</span>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-65px)]">
        {/* Sidebar */}
        <aside className="w-80 border-r border-zinc-800 flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-zinc-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => { setView('prompts'); setSelectedFragment(null) }}
              className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 ${view === 'prompts' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <BookOpen className="w-4 h-4" />
              Prompts
            </button>
            <button
              onClick={() => { setView('fragments'); setSelectedPrompt(null) }}
              className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 ${view === 'fragments' ? 'bg-zinc-900 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Puzzle className="w-4 h-4" />
              Fragments
            </button>
          </div>

          {/* Filters (prompts only) */}
          {view === 'prompts' && (
            <div className="p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2 mb-3 text-sm text-zinc-400">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-3">
                {index.categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={`px-2 py-1 text-xs rounded-md ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {index.tags.slice(0, 10).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-0.5 text-xs rounded ${selectedTags.includes(tag) ? 'bg-blue-600/20 text-blue-400 border border-blue-600/50' : 'bg-zinc-800/50 text-zinc-500 hover:text-zinc-300'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {view === 'prompts' ? (
              filteredPrompts.map(prompt => (
                <button
                  key={prompt.id}
                  onClick={() => { setSelectedPrompt(prompt); setSelectedFragment(null) }}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-900 ${selectedPrompt?.id === prompt.id ? 'bg-zinc-900 border-l-2 border-l-blue-500' : ''}`}
                >
                  <div className="font-medium text-sm">{prompt.frontmatter.name}</div>
                  <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{prompt.frontmatter.description}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">{prompt.frontmatter.category}</span>
                    <span className="text-xs text-zinc-600">v{prompt.frontmatter.version}</span>
                  </div>
                </button>
              ))
            ) : (
              filteredFragments.map(fragment => (
                <button
                  key={fragment.id}
                  onClick={() => { setSelectedFragment(fragment); setSelectedPrompt(null) }}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-900 ${selectedFragment?.id === fragment.id ? 'bg-zinc-900 border-l-2 border-l-purple-500' : ''}`}
                >
                  <div className="font-medium text-sm">{fragment.name}</div>
                  <div className="text-xs text-zinc-500 mt-1">{fragment.category}</div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {selectedPrompt ? (
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">{selectedPrompt.frontmatter.name}</h2>
                  <p className="text-zinc-400 mt-1">{selectedPrompt.frontmatter.description}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedPrompt.rawContent)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-zinc-900 rounded-lg">
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Category</div>
                  <div className="text-sm">{selectedPrompt.frontmatter.category}</div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 mb-1">Version</div>
                  <div className="text-sm">{selectedPrompt.frontmatter.version}</div>
                </div>
                {selectedPrompt.frontmatter.model && (
                  <>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Max Tokens</div>
                      <div className="text-sm">{selectedPrompt.frontmatter.model.parameters?.max_tokens}</div>
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Temperature</div>
                      <div className="text-sm">{selectedPrompt.frontmatter.model.parameters?.temperature}</div>
                    </div>
                  </>
                )}
              </div>

              {/* Tags */}
              {selectedPrompt.frontmatter.tags && (
                <div className="flex items-center gap-2 mb-6">
                  <Tag className="w-4 h-4 text-zinc-500" />
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.frontmatter.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-xs bg-zinc-800 rounded text-zinc-400">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fragments */}
              {selectedPrompt.frontmatter.fragments && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-zinc-400 mb-2">Uses Fragments</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.frontmatter.fragments.map(frag => (
                      <span key={frag} className="px-2 py-1 text-xs bg-purple-900/30 border border-purple-800/50 rounded text-purple-300">{frag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Variables */}
              {selectedPrompt.frontmatter.variables && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-zinc-400 mb-2">Variables</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPrompt.frontmatter.variables.map(v => (
                      <code key={v} className="px-2 py-1 text-xs bg-zinc-800 rounded text-amber-400">{`{{${v}}}`}</code>
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="mb-6">
                <div className="text-sm font-medium text-zinc-400 mb-2">Prompt Content</div>
                <pre className="p-4 bg-zinc-900 rounded-lg overflow-x-auto text-sm text-zinc-300 whitespace-pre-wrap">{selectedPrompt.content}</pre>
              </div>

              {/* Sample */}
              {selectedPrompt.frontmatter.sample && (
                <div>
                  <div className="text-sm font-medium text-zinc-400 mb-2">Sample Values</div>
                  <div className="p-4 bg-zinc-900 rounded-lg">
                    {Object.entries(selectedPrompt.frontmatter.sample).map(([key, value]) => (
                      <div key={key} className="flex gap-4 mb-2 last:mb-0">
                        <code className="text-amber-400 text-sm">{key}:</code>
                        <span className="text-zinc-400 text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : selectedFragment ? (
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold">{selectedFragment.name}</h2>
                  <p className="text-zinc-400 mt-1">Category: {selectedFragment.category}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedFragment.content)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div className="text-sm font-medium text-zinc-400 mb-2">Content</div>
              <pre className="p-4 bg-zinc-900 rounded-lg overflow-x-auto text-sm text-zinc-300 whitespace-pre-wrap">{selectedFragment.content}</pre>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600">
              <div className="text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a prompt or fragment to view details</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
