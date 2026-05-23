import client from "./client"
import type { ApiResponse, PlayerComparisonOut } from "../types/player"

export async function getComparison(ids: number[]): Promise<ApiResponse<PlayerComparisonOut>> {
  const { data } = await client.get("/compare", { params: { ids: ids.join(",") } })
  return data
}
