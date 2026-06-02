import { useQuery } from "@tanstack/react-query"
import { getComparison } from "../api/compare"

export function useComparison(ids: number[], season?: string) {
  return useQuery({
    queryKey: ["compare", ids, season],
    queryFn: () => getComparison(ids, season),
    enabled: ids.length >= 2,
  })
}
