import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { usePlayers } from "../hooks/usePlayers"
import PlayerCard from "../components/players/PlayerCard"
import PlayerTable from "../components/players/PlayerTable"
import PlayerSearch from "../components/players/PlayerSearch"
import FilterPanel from "../components/players/FilterPanel"
import LoadingSkeleton from "../components/common/LoadingSkeleton"
import EmptyState from "../components/common/EmptyState"
import ErrorState from "../components/common/ErrorState"

export default function PlayersPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = Number(searchParams.get("page") || 1)
  const search = searchParams.get("search") || undefined
  const teamId = searchParams.get("team_id") ? Number(searchParams.get("team_id")) : undefined
  const position = searchParams.get("position") || undefined
  const sortBy = searchParams.get("sort_by") || "name"
  const sortOrder = searchParams.get("sort_order") || "asc"
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")

  const { data, isLoading, isError, refetch } = usePlayers({
    page, page_size: 20,
    search, team_id: teamId, position,
    sort_by: sortBy, sort_order: sortOrder,
  })

  function updateParams(updates: Record<string, string | undefined>) {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(updates)) {
      if (v != null) next.set(k, v)
      else next.delete(k)
    }
    if (!updates.page) next.set("page", "1") // reset page on filter change
    setSearchParams(next)
  }

  const totalPages = data?.meta?.total_pages ?? 1

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <h1 className="text-2xl font-bold text-white">球员列表</h1>
        <div className="flex-1 max-w-sm">
          <PlayerSearch
            placeholder="搜索球员姓名..."
            onSelect={() => {}}
          />
        </div>
      </div>

      {/* Update search params when search changes — handled via the search component */}
      <FilterPanel
        teamId={teamId}
        position={position}
        sortBy={sortBy}
        sortOrder={sortOrder}
        viewMode={viewMode}
        onTeamChange={(id) => updateParams({ team_id: id ? String(id) : undefined })}
        onPositionChange={(pos) => updateParams({ position: pos })}
        onSortChange={(by, order) => updateParams({ sort_by: by, sort_order: order })}
        onViewModeChange={setViewMode}
      />

      {/* Search bar that updates URL */}
      <div className="mb-4 max-w-sm">
        <input
          type="text"
          placeholder="搜索球员姓名（回车确认）..."
          defaultValue={search}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 outline-none focus:border-orange-500 transition-colors"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = (e.target as HTMLInputElement).value.trim()
              updateParams({ search: val || undefined })
            }
          }}
        />
      </div>

      {isLoading && <LoadingSkeleton count={12} variant={viewMode === "table" ? "row" : "card"} />}
      {isError && <ErrorState onRetry={() => refetch()} />}
      {data && data.data.length === 0 && (
        <EmptyState title="没有找到球员" description="试试修改筛选条件" />
      )}
      {data && data.data.length > 0 && (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.data.map((p) => (
                <PlayerCard key={p.id} player={p} />
              ))}
            </div>
          ) : (
            <PlayerTable players={data.data} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) })}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                上一页
              </button>
              <span className="text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => updateParams({ page: String(page + 1) })}
                className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
