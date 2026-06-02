import client from "./client"
import type { ApiResponse, PlayerComparisonOut } from "../types/player"

export async function getComparison(ids: number[], season?: string): Promise<ApiResponse<PlayerComparisonOut>> {
  const { data } = await client.get("/compare", { params: { ids: ids.join(","), season } })
  return data
}
