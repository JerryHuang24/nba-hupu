import type { PlayerDetail } from "../../types/player"
import { formatStat, formatPct } from "../../lib/utils"
import FavoriteButton from "../common/FavoriteButton"

interface Props {
  player: PlayerDetail
}

export default function PlayerInfoCard({ player }: Props) {
  const stats = player.latest_stats

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <img
            src={player.image_url ?? undefined}
            alt={player.name}
            className="w-32 h-32 rounded-full bg-gray-800 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23333' width='100' height='100'/><text x='50' y='50' text-anchor='middle' dy='.35em' fill='%23666' font-size='40' font-family='sans-serif'>🏀</text></svg>"
            }}
          />
          <div className="absolute top-0 right-0">
            <FavoriteButton playerId={player.id} />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-2xl font-bold text-white">{player.name}</h1>
          <p className="text-gray-500">{player.name_en}</p>

          <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
            {player.team && (
              <span className="px-2 py-1 rounded bg-orange-600/20 text-orange-400 text-sm font-medium">
                {player.team.name_en || player.team.name}
              </span>
            )}
            <span className="px-2 py-1 rounded bg-gray-800 text-gray-300 text-sm">
              {player.position || "-"}
              {player.jersey_number && ` #${player.jersey_number}`}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-sm">
            <InfoItem label="身高" value={player.height || "-"} />
            <InfoItem label="体重" value={player.weight || "-"} />
            <InfoItem label="国籍" value={player.country || "-"} />
            <InfoItem label="球龄" value={player.years_exp != null ? `${player.years_exp}年` : "-"} />
            <InfoItem label="大学" value={player.college || "-"} />
            <InfoItem
              label="选秀"
              value={player.draft_year ? `${player.draft_year} 第${player.draft_round}轮${player.draft_pick}顺位` : "-"}
            />
          </div>
        </div>

        {stats && (
          <div className="flex gap-4 md:gap-6 shrink-0">
            <StatBlock label="PTS" value={formatStat(stats.ppg)} />
            <StatBlock label="REB" value={formatStat(stats.rpg)} />
            <StatBlock label="AST" value={formatStat(stats.apg)} />
            <StatBlock label="FG%" value={formatPct(stats.fg_pct)} />
          </div>
        )}
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-gray-500">{label}: </span>
      <span className="text-gray-200">{value}</span>
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}
