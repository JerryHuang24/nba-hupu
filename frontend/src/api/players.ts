import client from "./client"
import type { ApiResponse, PlayerSummary, PlayerDetail, PlayerStats, PlayerSearchResult } from "../types/player"

export interface PlayersParams {
  page?: number
  page_size?: number
  search?: string
  team_id?: number
  position?: string
  sort_by?: string
  sort_order?: string
  season?: string
}

export async function getPlayers(params: PlayersParams = {}): Promise<ApiResponse<PlayerSummary[]>> {
  const { data } = await client.get("/players", { params })
  return data
}

export async function getPlayer(id: number): Promise<ApiResponse<PlayerDetail>> {
  const { data } = await client.get(`/players/${id}`)
  return data
}

export async function getPlayerStats(id: number, season?: string): Promise<ApiResponse<PlayerStats[]>> {
  const { data } = await client.get(`/players/${id}/stats`, { params: season ? { season } : {} })
  return data
}

export async function searchPlayers(q: string, limit = 10): Promise<ApiResponse<PlayerSearchResult[]>> {
  const { data } = await client.get("/players/search", { params: { q, limit } })
  return data
}

export async function getPlayersBatch(ids: number[]): Promise<ApiResponse<PlayerSummary[]>> {
  if (ids.length === 0) return { data: [] }
  const { data } = await client.get("/players/batch", { params: { ids: ids.join(",") } })
  return data
}
