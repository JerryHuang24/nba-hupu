import { useQuery } from "@tanstack/react-query"
import { getPlayers, type PlayersParams } from "../api/players"

export function usePlayers(params: PlayersParams = {}) {
  return useQuery({
    queryKey: ["players", params],
    queryFn: () => getPlayers(params),
    staleTime: 5 * 60 * 1000,
  })
}
