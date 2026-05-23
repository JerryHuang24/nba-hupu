import { useState } from "react"
import { useComparison } from "../hooks/useComparison"
import PlayerSearch from "../components/players/PlayerSearch"
import ComparisonRadarChart from "../components/stats/RadarChart"
import EmptyState from "../components/common/EmptyState"
import { formatStat, formatPct } from "../lib/utils"
import { COMPARE_STATS } from "../lib/constants"
import type { PlayerComparisonItem, PlayerSearchResult } from "../types/player"

const STAT_LABEL_MAP: Record<string, string> = {
  ppg: "得分", rpg: "篮板", apg: "助攻", spg: "抢断", bpg: "盖帽",
  fg_pct: "命中率", three_pct: "三分%", ft_pct: "罚球%",
  mpg: "分钟", topg: "失误",
}

export default function ComparePage() {
  const [selected, setSelected] = useState<PlayerSearchResult[]>([])
  const ids = selected.map((s) => s.id)
  const { data, isLoading } = useComparison(ids)

  function addPlayer(p: PlayerSearchResult) {
    if (selected.length >= 5) return
    if (selected.some((s) => s.id === p.id)) return
    setSelected([...selected, p])
  }

  function removePlayer(id: number) {
    setSelected(selected.filter((s) => s.id !== id))
  }

  const players: PlayerComparisonItem[] = data?.data?.players ?? []

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">球员对比</h1>

      {/* Player Selector */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
        <p className="text-sm text-gray-400 mb-3">选择 2-5 名球员进行对比</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {selected.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-600/20 text-orange-400 rounded-lg text-sm"
            >
              {p.name}
              <button onClick={() => removePlayer(p.id)} className="hover:text-white">×</button>
            </span>
          ))}
        </div>
        <div className="max-w-sm">
          <PlayerSearch
            placeholder={selected.length >= 5 ? "最多对比5人" : "搜索并添加球员..."}
            onSelect={addPlayer}
            compact
          />
        </div>
      </div>

      {ids.length < 2 && (
        <EmptyState title="请至少选择 2 名球员" description="在上方搜索框中搜索并添加球员" />
      )}

      {isLoading && <div className="text-center text-gray-400 py-10">加载中...</div>}

      {players.length >= 2 && (
        <>
          {/* Comparison Table */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-gray-400">数据</th>
                  {players.map((p) => (
                    <th key={p.id} className="px-4 py-3 text-center text-white">
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={p.image_url ?? undefined}
                          alt={p.name}
                          className="w-10 h-10 rounded-full bg-gray-800 object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                        />
                        <span>{p.name}</span>
                        {p.team && (
                          <span className="text-xs text-gray-500">{p.team.abbreviation}</span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_STATS.map((stat) => {
                  const values = players.map((p) => {
                    const val = p.stats ? (p.stats as any)[stat] : null
                    return val ?? 0
                  })
                  const isPct = stat.endsWith("_pct")
                  const best = Math.max(...values.filter((v) => v != null))

                  return (
                    <tr key={stat} className="border-t border-gray-800 hover:bg-gray-800/30">
                      <td className="px-4 py-2.5 text-gray-400 font-medium">
                        {STAT_LABEL_MAP[stat] || stat.toUpperCase()}
                      </td>
                      {players.map((p) => {
                        const raw = p.stats ? (p.stats as any)[stat] : null
                        const val = raw ?? null
                        const isBest = val != null && val === best
                        return (
                          <td
                            key={p.id}
                            className={`px-4 py-2.5 text-center font-medium ${
                              isBest ? "text-orange-400 bg-orange-600/10" : "text-white"
                            }`}
                          >
                            {isPct ? formatPct(val) : formatStat(val)}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Radar Chart */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">能力雷达图</h2>
            <ComparisonRadarChart players={players} />
          </div>
        </>
      )}
    </div>
  )
}
