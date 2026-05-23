import { useQuery } from "@tanstack/react-query"
import { getPlayer, getPlayerStats } from "../api/players"

export function usePlayer(id: number | null) {
  return useQuery({
    queryKey: ["player", id],
    queryFn: () => getPlayer(id!),
    enabled: id != null,
    staleTime: 10 * 60 * 1000,
  })
}

export function usePlayerStats(id: number | null, season?: string) {
  return useQuery({
    queryKey: ["playerStats", id, season],
    queryFn: () => getPlayerStats(id!, season),
    enabled: id != null,
  })
}
