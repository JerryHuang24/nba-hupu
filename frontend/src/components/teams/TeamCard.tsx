import { Link } from "react-router-dom"
import type { Team } from "../../types/player"

interface Props {
  team: Team
}

const CONFERENCE_COLORS: Record<string, string> = {
  East: "bg-blue-600/20 text-blue-400",
  West: "bg-red-600/20 text-red-400",
}

export default function TeamCard({ team }: Props) {
  const confColor = CONFERENCE_COLORS[team.conference ?? ""] ?? "bg-gray-800 text-gray-400"

  return (
    <Link
      to={`/teams/${team.id}`}
      className="bg-gray-900 hover:bg-gray-800/80 rounded-xl p-5 border border-gray-800 hover:border-orange-500/50 transition-all duration-200 text-center"
    >
      <img
        src={team.logo_url ?? undefined}
        alt={team.name_en || team.name}
        className="w-20 h-20 mx-auto object-contain"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none"
        }}
      />
      <h3 className="font-semibold text-white mt-2">{team.name_en || team.name}</h3>
      <p className="text-xs text-gray-500 mt-1">{team.name}</p>
      {team.conference && (
        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${confColor}`}>
          {team.conference}
        </span>
      )}
    </Link>
  )
}
