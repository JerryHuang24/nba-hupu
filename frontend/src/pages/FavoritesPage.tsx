import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { useFavorites } from "../hooks/useFavorites"
import { getPlayersBatch } from "../api/players"
import type { PlayerSummary } from "../types/player"
import PlayerCard from "../components/players/PlayerCard"
import EmptyState from "../components/common/EmptyState"
import LoadingSkeleton from "../components/common/LoadingSkeleton"

export default function FavoritesPage() {
  const { favorites } = useFavorites()

  // Fetch only favorited players via batch endpoint
  const { data, isLoading } = useQuery({
    queryKey: ["favorites-players", favorites],
    queryFn: async () => {
      if (favorites.length === 0) return []
      const result = await getPlayersBatch(favorites)
      return result.data
    },
    enabled: favorites.length > 0,
    staleTime: 2 * 60 * 1000,
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">我的收藏</h1>

      {favorites.length === 0 && (
        <EmptyState
          title="还没有收藏球员"
          description="浏览球员列表，点击心形图标来收藏你喜欢的球员"
          action={
            <Link to="/players" className="inline-block mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-sm transition-colors">
              浏览球员
            </Link>
          }
        />
      )}

      {isLoading && <LoadingSkeleton count={favorites.length || 4} />}

      {data && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map((p: PlayerSummary) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      )}
    </div>
  )
}
