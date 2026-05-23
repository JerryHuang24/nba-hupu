import { Link } from "react-router-dom"
import type { PlayerSummary } from "../../types/player"
import { formatStat, formatPct } from "../../lib/utils"

interface Props {
  players: PlayerSummary[]
}

const COLUMNS = [
  { key: "name", label: "球员", render: (p: PlayerSummary) => (
    <Link to={`/players/${p.id}`} className="flex items-center gap-2 hover:text-orange-400">
      <img src={p.image_url ?? undefined} alt="" className="w-8 h-8 rounded-full bg-gray-800"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
      <span className="font-medium text-white">{p.name}</span>
    </Link>
  )},
  { key: "team", label: "球队", render: (p: PlayerSummary) => p.team?.abbreviation ?? "-" },
  { key: "position", label: "位置", render: (p: PlayerSummary) => p.position ?? "-" },
  { key: "ppg", label: "PTS", render: (p: PlayerSummary) => formatStat(p.latest_stats?.ppg) },
  { key: "rpg", label: "REB", render: (p: PlayerSummary) => formatStat(p.latest_stats?.rpg) },
  { key: "apg", label: "AST", render: (p: PlayerSummary) => formatStat(p.latest_stats?.apg) },
  { key: "spg", label: "STL", render: (p: PlayerSummary) => formatStat(p.latest_stats?.spg) },
  { key: "bpg", label: "BLK", render: (p: PlayerSummary) => formatStat(p.latest_stats?.bpg) },
  { key: "fg_pct", label: "FG%", render: (p: PlayerSummary) => formatPct(p.latest_stats?.fg_pct) },
  { key: "three_pct", label: "3P%", render: (p: PlayerSummary) => formatPct(p.latest_stats?.three_pct) },
]

export default function PlayerTable({ players }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-900 text-gray-400 text-left">
            {COLUMNS.map((col) => (
              <th key={col.key} className="px-3 py-3 font-medium whitespace-nowrap">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <tr key={p.id} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
              {COLUMNS.map((col) => (
                <td key={col.key} className="px-3 py-2.5 whitespace-nowrap">{col.render(p)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
