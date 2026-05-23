import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getPlayers } from "../api/players"
import PlayerCard from "../components/players/PlayerCard"
import LoadingSkeleton from "../components/common/LoadingSkeleton"
import ErrorState from "../components/common/ErrorState"

export default function HomePage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["home-players"],
    queryFn: () => getPlayers({ page_size: 5, sort_by: "ppg", sort_order: "desc" }),
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-orange-950/30 to-gray-900 border border-gray-800 p-8 md:p-12 mb-8 text-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            <span className="text-orange-500">NBA</span> 球员数据中心
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto mb-6">
            浏览完整的 NBA 球员数据、对比球员表现、追踪赛季统计
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/players"
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-medium transition-colors"
            >
              浏览球员
            </Link>
            <Link
              to="/compare"
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              对比球员
            </Link>
          </div>
        </div>
      </section>

      {/* Top Players */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">得分榜 TOP 5</h2>
          <Link to="/players?sort_by=ppg&sort_order=desc" className="text-sm text-orange-500 hover:text-orange-400">
            查看全部 →
          </Link>
        </div>

        {isLoading && <LoadingSkeleton count={5} />}
        {isError && <ErrorState onRetry={() => refetch()} />}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {data.data.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
