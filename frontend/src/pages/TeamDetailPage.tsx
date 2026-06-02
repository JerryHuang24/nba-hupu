import { useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import { useTeamPlayers } from "../hooks/useTeams"
import { useTeams } from "../hooks/useTeams"
import TeamRoster from "../components/teams/TeamRoster"
import LoadingSkeleton from "../components/common/LoadingSkeleton"
import ErrorState from "../components/common/ErrorState"
import { formatStat } from "../lib/utils"

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const teamId = id ? Number(id) : null
  const { data: teamsData } = useTeams()
  const { data: playersData, isLoading, isError, refetch } = useTeamPlayers(teamId)

  const team = teamsData?.data.find((t) => t.id === teamId)

  const teamStats = useMemo(() => {
    const players = playersData?.data ?? []
    const withStats = players.filter((p) => p.latest_stats)
    const positions: Record<string, number> = {}
    players.forEach((p) => {
      const pos = p.position || "N/A"
      positions[pos] = (positions[pos] || 0) + 1
    })
    const topScorer = withStats.length > 0
      ? withStats.reduce((best, p) => (p.latest_stats!.ppg ?? 0) > (best.latest_stats!.ppg ?? 0) ? p : best)
      : null
    const avgPpg = withStats.length > 0
      ? withStats.reduce((sum, p) => sum + (p.latest_stats?.ppg ?? 0), 0) / withStats.length
      : null

    return { total: players.length, positions, topScorer, avgPpg, withStats: withStats.length }
  }, [playersData])

  return (
    <div>
      <Link to="/teams" className="text-sm text-gray-400 hover:text-white mb-4 inline-block">
        ← 返回球队列表
      </Link>

      {team && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex items-center gap-4">
            {team.logo_url ? (
              <img src={team.logo_url} alt={team.abbreviation || ""} className="w-16 h-16 object-contain" />
            ) : (
              <span className="text-5xl">{"\u{1F3C0}"}</span>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{team.name_en || team.name}</h1>
              <p className="text-gray-400">{team.name}</p>
              {team.conference && (
                <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300 mt-1 inline-block">
                  {team.conference} {team.division}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Stats Summary */}
      {playersData && playersData.data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center">
            <p className="text-2xl font-bold text-white">{teamStats.total}</p>
            <p className="text-xs text-gray-400 mt-1">阵容人数</p>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center">
            <p className="text-2xl font-bold text-white">{teamStats.withStats}</p>
            <p className="text-xs text-gray-400 mt-1">有数据球员</p>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center">
            <p className="text-lg font-bold text-orange-400 truncate">
              {teamStats.topScorer ? `${teamStats.topScorer.name} ${formatStat(teamStats.topScorer.latest_stats?.ppg)}分` : "-"}
            </p>
            <p className="text-xs text-gray-400 mt-1">队内得分王</p>
          </div>
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 text-center">
            <p className="text-2xl font-bold text-white">{teamStats.avgPpg != null ? teamStats.avgPpg.toFixed(1) : "-"}</p>
            <p className="text-xs text-gray-400 mt-1">场均得分</p>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-white mb-4">球队阵容</h2>

      {isLoading && <LoadingSkeleton count={6} />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {playersData && <TeamRoster players={playersData.data} />}
    </div>
  )
}
