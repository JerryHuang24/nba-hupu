export const POSITIONS = ["PG", "SG", "SF", "PF", "C", "G", "F", "F-G", "G-F", "F-C", "C-F"] as const

export const STAT_LABELS: Record<string, string> = {
  ppg: "PTS", rpg: "REB", apg: "AST", spg: "STL", bpg: "BLK",
  mpg: "MIN", topg: "TOV", pfpg: "PF",
  fg_pct: "FG%", three_pct: "3P%", ft_pct: "FT%",
}

export const STAT_SHORT: Record<string, string> = {
  ppg: "得分", rpg: "篮板", apg: "助攻", spg: "抢断", bpg: "盖帽",
  mpg: "分钟", topg: "失误", pfpg: "犯规",
  fg_pct: "命中率", three_pct: "三分%", ft_pct: "罚球%",
}

export const COMPARE_STATS = ["ppg", "rpg", "apg", "spg", "bpg", "fg_pct"] as const

export const SEASONS = ["2025-26", "2024-25", "2023-24", "2022-23", "2021-22", "2020-21"]
