import { useQuery } from "@tanstack/react-query"
import { getTeams, getTeamPlayers } from "../api/teams"

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
    staleTime: 30 * 60 * 1000,
  })
}

export function useTeamPlayers(teamId: number | null) {
  return useQuery({
    queryKey: ["teamPlayers", teamId],
    queryFn: () => getTeamPlayers(teamId!),
    enabled: teamId != null,
  })
}
