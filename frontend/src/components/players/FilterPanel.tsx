import { useTeams } from "../../hooks/useTeams"
import { POSITIONS } from "../../lib/constants"

interface Props {
  teamId: number | undefined
  position: string | undefined
  sortBy: string
  sortOrder: string
  viewMode: "grid" | "table"
  onTeamChange: (id: number | undefined) => void
  onPositionChange: (pos: string | undefined) => void
  onSortChange: (by: string, order: string) => void
  onViewModeChange: (mode: "grid" | "table") => void
}

const SORT_OPTIONS = [
  { value: "name", label: "姓名" },
  { value: "ppg", label: "得分" },
  { value: "rpg", label: "篮板" },
  { value: "apg", label: "助攻" },
  { value: "spg", label: "抢断" },
  { value: "bpg", label: "盖帽" },
  { value: "fg_pct", label: "命中率" },
  { value: "three_pct", label: "三分%" },
  { value: "years_exp", label: "球龄" },
]

export default function FilterPanel({
  teamId, position, sortBy, sortOrder, viewMode,
  onTeamChange, onPositionChange, onSortChange, onViewModeChange,
}: Props) {
  const { data: teamsData } = useTeams()
  const teams = teamsData?.data ?? []

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Team filter */}
      <select
        value={teamId ?? ""}
        onChange={(e) => onTeamChange(e.target.value ? Number(e.target.value) : undefined)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
      >
        <option value="">全部球队</option>
        {teams.map((t) => (
          <option key={t.id} value={t.id}>{t.abbreviation || t.name}</option>
        ))}
      </select>

      {/* Position filter */}
      <select
        value={position ?? ""}
        onChange={(e) => onPositionChange(e.target.value || undefined)}
        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
      >
        <option value="">全部位置</option>
        {POSITIONS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* Sort */}
      <div className="flex items-center gap-1">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value, sortOrder)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button
          onClick={() => onSortChange(sortBy, sortOrder === "asc" ? "desc" : "asc")}
          className="px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
          title={sortOrder === "asc" ? "升序" : "降序"}
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>
      </div>

      {/* View toggle */}
      <div className="flex items-center ml-auto">
        <button
          onClick={() => onViewModeChange("grid")}
          className={`px-3 py-2 rounded-l-lg border text-sm transition-colors ${viewMode === "grid" ? "bg-orange-600 border-orange-600 text-white" : "bg-gray-800 border-gray-700 text-gray-400"}`}
        >
          ▦
        </button>
        <button
          onClick={() => onViewModeChange("table")}
          className={`px-3 py-2 rounded-r-lg border text-sm transition-colors ${viewMode === "table" ? "bg-orange-600 border-orange-600 text-white" : "bg-gray-800 border-gray-700 text-gray-400"}`}
        >
          ☰
        </button>
      </div>
    </div>
  )
}
