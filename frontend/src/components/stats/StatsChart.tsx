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
  }))

  return (
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
          <Line type="monotone" dataKey="PTS" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="REB" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="AST" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
