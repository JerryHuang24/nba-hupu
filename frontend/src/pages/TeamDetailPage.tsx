import { useParams, Link } from "react-router-dom"
import { useTeamPlayers } from "../hooks/useTeams"
import { useTeams } from "../hooks/useTeams"
import TeamRoster from "../components/teams/TeamRoster"
import LoadingSkeleton from "../components/common/LoadingSkeleton"
import ErrorState from "../components/common/ErrorState"

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const teamId = id ? Number(id) : null
  const { data: teamsData } = useTeams()
  const { data: playersData, isLoading, isError, refetch } = useTeamPlayers(teamId)

  const team = teamsData?.data.find((t) => t.id === teamId)

  return (
    <div>
      <Link to="/teams" className="text-sm text-gray-400 hover:text-white mb-4 inline-block">
        ← 返回球队列表
      </Link>

      {team && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-5xl">{"\u{1F3C0}"}</span>
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

      <h2 className="text-xl font-bold text-white mb-4">球队阵容</h2>

      {isLoading && <LoadingSkeleton count={6} />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {playersData && <TeamRoster players={playersData.data} />}
    </div>
  )
}
