import type { PlayerSummary } from "../../types/player"
import PlayerCard from "../players/PlayerCard"

interface Props {
  players: PlayerSummary[]
}

const POSITION_ORDER = ["PG", "SG", "SF", "PF", "C", "G", "F"]

export default function TeamRoster({ players }: Props) {
  const grouped: Record<string, PlayerSummary[]> = {}
  for (const p of players) {
    const pos = p.position || "其他"
    const key = POSITION_ORDER.find((po) => pos.includes(po)) || pos
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(p)
  }

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([pos, group]) => (
        <div key={pos}>
          <h3 className="text-lg font-semibold text-gray-300 mb-3">{pos}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {group.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
