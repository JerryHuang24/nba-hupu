export interface Team {
  id: number
  name: string
  name_en: string | null
  abbreviation: string | null
  conference: string | null
  division: string | null
  logo_url: string | null
}

export interface PlayerStats {
  id: number
  player_id: number
  season: string
  team_abbreviation: string | null
  gp: number
  gs: number
  mpg: number | null
  ppg: number | null
  rpg: number | null
  apg: number | null
  spg: number | null
  bpg: number | null
  topg: number | null
  pfpg: number | null
  fg_pct: number | null
  three_pct: number | null
  ft_pct: number | null
}

export interface PlayerSummary {
  id: number
  nba_id: number
  name: string
  name_en: string | null
  team: Team | null
  jersey_number: string | null
  position: string | null
  height: string | null
  weight: string | null
  country: string | null
  college: string | null
  draft_year: number | null
  draft_round: number | null
  draft_pick: number | null
  years_exp: number | null
  image_url: string | null
  latest_stats: PlayerStats | null
  is_active: boolean
}

export interface PlayerDetail extends PlayerSummary {
  career_stats: PlayerStats[]
}

export interface PlayerComparisonItem {
  id: number
  name: string
  name_en: string | null
  team: Team | null
  image_url: string | null
  stats: PlayerStats | null
}

export interface PlayerComparisonOut {
  players: PlayerComparisonItem[]
}

export interface PlayerSearchResult {
  id: number
  name: string
  name_en: string | null
  team: Team | null
  position: string | null
}

export interface PaginationMeta {
  page: number
  page_size: number
  total: number
  total_pages: number
}

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
}
