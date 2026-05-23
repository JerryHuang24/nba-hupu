import { useTeams } from "../hooks/useTeams"
import TeamCard from "../components/teams/TeamCard"
import LoadingSkeleton from "../components/common/LoadingSkeleton"
import ErrorState from "../components/common/ErrorState"

export default function TeamsPage() {
  const { data, isLoading, isError, refetch } = useTeams()

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">球队列表</h1>

      {isLoading && <LoadingSkeleton count={8} />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {data.data.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  )
}
