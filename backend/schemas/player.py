from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel


# ---- Team ----
class TeamOut(BaseModel):
    id: int
    name: str
    name_en: str | None = None
    abbreviation: str | None = None
    conference: str | None = None
    division: str | None = None
    logo_url: str | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


# ---- Player Stats ----
class PlayerStatsOut(BaseModel):
    id: int
    player_id: int
    season: str
    team_abbreviation: str | None = None
    gp: int = 0
    gs: int = 0
    mpg: float | None = None
    ppg: float | None = None
    rpg: float | None = None
    apg: float | None = None
    spg: float | None = None
    bpg: float | None = None
    topg: float | None = None
    pfpg: float | None = None
    fg_pct: float | None = None
    three_pct: float | None = None
    ft_pct: float | None = None

    model_config = {"from_attributes": True}


# ---- Player ----
class PlayerSummary(BaseModel):
    id: int
    nba_id: int
    name: str
    name_en: str | None = None
    team: TeamOut | None = None
    jersey_number: str | None = None
    position: str | None = None
    height: str | None = None
    weight: str | None = None
    country: str | None = None
    college: str | None = None
    draft_year: int | None = None
    draft_round: int | None = None
    draft_pick: int | None = None
    years_exp: int | None = None
    image_url: str | None = None
    latest_stats: PlayerStatsOut | None = None
    is_active: bool = True

    model_config = {"from_attributes": True}


class PlayerDetail(PlayerSummary):
    career_stats: list[PlayerStatsOut] = []


class PlayerComparisonItem(BaseModel):
    id: int
    name: str
    name_en: str | None = None
    team: TeamOut | None = None
    image_url: str | None = None
    stats: PlayerStatsOut | None = None

    model_config = {"from_attributes": True}


class PlayerComparisonOut(BaseModel):
    players: list[PlayerComparisonItem]


# ---- Pagination ----
class PaginationMeta(BaseModel):
    page: int
    page_size: int
    total: int
    total_pages: int


class PaginatedResponse(BaseModel):
    data: list
    meta: PaginationMeta


# ---- API Envelope ----
class ApiResponse(BaseModel):
    data: list | dict | None = None
    meta: dict | None = None


# ---- Scrape ----
class ScrapeTriggerRequest(BaseModel):
    source: str  # "players" or "stats"


class ScrapeLogOut(BaseModel):
    id: int
    source: str
    status: str
    records_added: int
    records_updated: int
    error_message: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}
