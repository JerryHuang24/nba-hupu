import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { searchPlayers } from "../../api/players"
import type { PlayerSearchResult } from "../../types/player"

interface Props {
  placeholder?: string
  onSelect?: (player: PlayerSearchResult) => void
  compact?: boolean
}

export default function PlayerSearch({ placeholder = "搜索球员...", onSelect, compact = false }: Props) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<PlayerSearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data } = await searchPlayers(query, 8)
        setResults(data)
        setOpen(true)
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function handleSelect(p: PlayerSearchResult) {
    setOpen(false)
    setQuery("")
    if (onSelect) {
      onSelect(p)
    } else {
      navigate(`/players/${p.id}`)
    }
  }

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={`bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 outline-none focus:border-orange-500 transition-colors ${compact ? "px-3 py-1.5 text-sm" : "px-4 py-2 w-full"}`}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">...</span>
      )}
      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => handleSelect(p)}
              className="w-full text-left px-3 py-2 hover:bg-gray-800 transition-colors flex items-center gap-3"
            >
              <span className="font-medium text-white text-sm truncate">{p.name}</span>
              <span className="text-xs text-gray-500 truncate">{p.name_en}</span>
              {p.team && (
                <span className="text-xs px-1 py-0.5 rounded bg-gray-800 text-gray-400 ml-auto shrink-0">
                  {p.team.abbreviation}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
