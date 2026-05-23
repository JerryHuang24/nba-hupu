import { useQuery } from "@tanstack/react-query"
import { getComparison } from "../api/compare"

export function useComparison(ids: number[]) {
  return useQuery({
    queryKey: ["compare", ids],
    queryFn: () => getComparison(ids),
    enabled: ids.length >= 2,
  })
}
