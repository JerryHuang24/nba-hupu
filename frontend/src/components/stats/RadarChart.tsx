import {
  Radar, RadarChart as ReRadar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend,
} from "recharts"
import type { PlayerComparisonItem } from "../../types/player"

interface Props {
  players: PlayerComparisonItem[]
}

const COLORS = ["#f97316", "#3b82f6", "#22c55e", "#eab308", "#a855f7"]

export default function ComparisonRadarChart({ players }: Props) {
  const axes = [
    { key: "ppg", label: "得分" },
    { key: "rpg", label: "篮板" },
    { key: "apg", label: "助攻" },
    { key: "spg", label: "抢断" },
    { key: "bpg", label: "盖帽" },
    { key: "fg_pct", label: "命中率" },
  ]

  // Normalize stats: each axis shows relative scale (percent of max)
  const maxValues: Record<string, number> = {}
  for (const axis of axes) {
    maxValues[axis.key] = Math.max(
      ...players.map((p) => {
        const val = p.stats ? (p.stats as any)[axis.key] ?? 0 : 0
        return axis.key === "fg_pct" ? val * 100 : val
      }),
      1
    )
  }

  const data = axes.map((axis) => {
    const entry: any = { stat: axis.label }
    players.forEach((p, i) => {
      const raw = p.stats ? (p.stats as any)[axis.key] ?? 0 : 0
      const val = axis.key === "fg_pct" ? raw * 100 : raw
      entry[`p${i}`] = Math.round((val / maxValues[axis.key]) * 100)
    })
    return entry
  })

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReRadar data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#333" />
          <PolarAngleAxis dataKey="stat" stroke="#666" fontSize={12} />
          {players.map((_, i) => (
            <Radar
              key={i}
              name={players[i].name}
              dataKey={`p${i}`}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          <Legend />
        </ReRadar>
      </ResponsiveContainer>
    </div>
  )
}
