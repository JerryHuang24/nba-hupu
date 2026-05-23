import client from "./client"
import type { ApiResponse, Team, PlayerSummary } from "../types/player"

export async function getTeams(): Promise<ApiResponse<Team[]>> {
  const { data } = await client.get("/teams")
  return data
}

export async function getTeamPlayers(teamId: number): Promise<ApiResponse<PlayerSummary[]>> {
  const { data } = await client.get(`/teams/${teamId}/players`)
  return data
}
