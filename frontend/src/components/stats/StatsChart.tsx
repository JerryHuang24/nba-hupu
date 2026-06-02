import { useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import type { PlayerStats } from "../../types/player"

interface Props {
  stats: PlayerStats[]
}

export default function StatsChart({ stats }: Props) {
  if (stats.length === 0) {
    return <p className="text-gray-500 text-center py-8">暂无数据</p>
  }

  const sorted = [...stats].sort((a, b) => a.season.localeCompare(b.season))
  const data = sorted.map((s) => ({
    season: s.season,
    PTS: s.ppg ?? 0,
    REB: s.rpg ?? 0,
    AST: s.apg ?? 0,
    STL: s.spg ?? 0,
    BLK: s.bpg ?? 0,
    FG: s.fg_pct ? +(s.fg_pct * 100).toFixed(1) : 0,
  }))

  const [hiddenKeys, setHiddenKeys] = useState<Set<string>>(new Set())

  const metrics = [
    { key: "PTS", color: "#f97316" },
    { key: "REB", color: "#22c55e" },
    { key: "AST", color: "#3b82f6" },
    { key: "STL", color: "#eab308" },
    { key: "BLK", color: "#a855f7" },
    { key: "FG", color: "#ec4899" },
  ]

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {metrics.map((m) => (
          <button
            key={m.key}
            onClick={() => {
              const next = new Set(hiddenKeys)
              next.has(m.key) ? next.delete(m.key) : next.add(m.key)
              setHiddenKeys(next)
            }}
            className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${
              hiddenKeys.has(m.key) ? "bg-gray-800 text-gray-500" : "text-white"
            }`}
            style={{ borderLeft: hiddenKeys.has(m.key) ? "2px solid #555" : `2px solid ${m.color}` }}
          >
            {m.key}
          </button>
        ))}
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="season" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "#1a1a2e", border: "1px solid #333", borderRadius: 8, color: "#fff" }}
            />
            <Legend />
            {metrics.map((m) => (
              <Line
                key={m.key}
                type="monotone"
                dataKey={m.key}
                stroke={m.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                hide={hiddenKeys.has(m.key)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
