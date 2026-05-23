import { Link } from "react-router-dom"
import type { PlayerSummary } from "../../types/player"
import { formatStat } from "../../lib/utils"
import FavoriteButton from "../common/FavoriteButton"

interface Props {
  player: PlayerSummary
}

export default function PlayerCard({ player }: Props) {
  const stats = player.latest_stats

  return (
    <Link
      to={`/players/${player.id}`}
      className="group bg-gray-900 hover:bg-gray-800/80 rounded-xl p-4 border border-gray-800 hover:border-orange-500/50 transition-all duration-200"
    >
      <div className="relative">
        <img
          src={player.image_url ?? undefined}
          alt={player.name}
          className="w-24 h-24 mx-auto rounded-full bg-gray-800 object-contain"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%23333' width='100' height='100'/><text x='50' y='50' text-anchor='middle' dy='.35em' fill='%23666' font-size='40' font-family='sans-serif'>🏀</text></svg>"
          }}
        />
        <div className="absolute top-0 right-0">
          <FavoriteButton playerId={player.id} size="sm" />
        </div>
      </div>

      <div className="mt-3 text-center">
        <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
          {player.name}
        </h3>
        <p className="text-xs text-gray-500 truncate">{player.name_en}</p>

        <div className="flex items-center justify-center gap-2 mt-1.5">
          {player.team && (
            <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
              {player.team.logo_url && (
                <img src={player.team.logo_url} alt="" className="w-3.5 h-3.5 object-contain" />
              )}
              {player.team.abbreviation}
            </span>
          )}
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
            {player.position || "-"}
          </span>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-1 mt-3 text-center border-t border-gray-800 pt-2">
            <div>
              <div className="text-sm font-bold text-white">{formatStat(stats.ppg)}</div>
              <div className="text-[10px] text-gray-500">PTS</div>
            </div>
            <div>
              <div className="text-sm font-bold text-white">{formatStat(stats.rpg)}</div>
              <div className="text-[10px] text-gray-500">REB</div>
            </div>
            <div>
              <div className="text-sm font-bold text-white">{formatStat(stats.apg)}</div>
              <div className="text-[10px] text-gray-500">AST</div>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
