import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { usePlayer } from "../hooks/usePlayer"
import PlayerInfoCard from "../components/players/PlayerInfoCard"
import StatsChart from "../components/stats/StatsChart"
import LoadingSkeleton from "../components/common/LoadingSkeleton"
import ErrorState from "../components/common/ErrorState"
import { formatStat, formatPct } from "../lib/utils"
import type { PlayerStats } from "../types/player"

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const playerId = id ? Number(id) : null
  const { data, isLoading, isError, refetch } = usePlayer(playerId)
  const [tab, setTab] = useState<"stats" | "chart">("stats")
  const [seasonFilter, setSeasonFilter] = useState<string>("all")

  if (isLoading) return <LoadingSkeleton count={1} variant="row" />
  if (isError) return <ErrorState onRetry={() => refetch()} />
  if (!data) return null

  const player = data.data
  const allSeasons = [...new Set((player.career_stats ?? []).map((s) => s.season))].sort().reverse()
  const filteredStats = seasonFilter === "all"
    ? (player.career_stats ?? [])
    : (player.career_stats ?? []).filter((s) => s.season === seasonFilter)

  return (
    <div>
      <Link to="/players" className="text-sm text-gray-400 hover:text-white mb-4 inline-block">
        ← 返回球员列表
      </Link>

      <PlayerInfoCard player={player} />

      {/* Tabs + Season Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6 mb-4">
        <div className="flex gap-1">
          {(["stats", "chart"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t ? "bg-orange-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              {t === "stats" ? "生涯数据" : "趋势图表"}
            </button>
          ))}
        </div>
        <select
          value={seasonFilter}
          onChange={(e) => setSeasonFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
        >
          <option value="all">全部赛季 ({allSeasons.length})</option>
          {allSeasons.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {tab === "stats" && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/50 text-gray-400 text-left">
                <th className="px-4 py-3">赛季</th>
                <th className="px-4 py-3">球队</th>
                <th className="px-4 py-3">GP</th>
                <th className="px-4 py-3">MIN</th>
                <th className="px-4 py-3">PTS</th>
                <th className="px-4 py-3">REB</th>
                <th className="px-4 py-3">AST</th>
                <th className="px-4 py-3">STL</th>
                <th className="px-4 py-3">BLK</th>
                <th className="px-4 py-3">FG%</th>
                <th className="px-4 py-3">3P%</th>
                <th className="px-4 py-3">FT%</th>
              </tr>
            </thead>
            <tbody>
              {filteredStats.map((s: PlayerStats) => (
                <tr key={s.id} className="border-t border-gray-800 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-white">{s.season}</td>
                  <td className="px-4 py-2.5 text-gray-400">{s.team_abbreviation || "-"}</td>
                  <td className="px-4 py-2.5">{s.gp}</td>
                  <td className="px-4 py-2.5">{formatStat(s.mpg)}</td>
                  <td className="px-4 py-2.5 text-orange-400 font-medium">{formatStat(s.ppg)}</td>
                  <td className="px-4 py-2.5">{formatStat(s.rpg)}</td>
                  <td className="px-4 py-2.5">{formatStat(s.apg)}</td>
                  <td className="px-4 py-2.5">{formatStat(s.spg)}</td>
                  <td className="px-4 py-2.5">{formatStat(s.bpg)}</td>
                  <td className="px-4 py-2.5">{formatPct(s.fg_pct)}</td>
                  <td className="px-4 py-2.5">{formatPct(s.three_pct)}</td>
                  <td className="px-4 py-2.5">{formatPct(s.ft_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(filteredStats.length === 0) && (
            <p className="text-center text-gray-500 py-8">暂无生涯数据</p>
          )}
        </div>
      )}

      {tab === "chart" && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <StatsChart stats={filteredStats} />
        </div>
      )}
    </div>
  )
}
