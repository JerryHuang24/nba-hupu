import logging
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from services import player_service
from schemas.player import (
    PlayerSummary, PlayerDetail, PlayerStatsOut,
    ApiResponse, TeamOut,
)
from models.player import PlayerStats, Team

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

async def _get_teams_map(db: AsyncSession) -> dict[str, Team]:
    result = await db.execute(select(Team))
    return {t.abbreviation: t for t in result.scalars().all() if t.abbreviation}


def _player_to_summary(p, teams_map: dict | None = None, season: str = "2025-26") -> PlayerSummary:
    latest_stats = None
    latest_stats_team = None
    for s in (p.stats or []):
        if s.season == season:
            latest_stats = PlayerStatsOut.model_validate(s)
            if s.team_abbreviation and teams_map:
                latest_stats_team = teams_map.get(s.team_abbreviation)
            break

    team = None
    if p.team:
        team = TeamOut.model_validate(p.team)
    elif latest_stats_team:
        team = TeamOut.model_validate(latest_stats_team)

    return PlayerSummary(
        id=p.id,
        nba_id=p.nba_id,
        name=p.name,
        name_en=p.name_en,
        team=team,
        jersey_number=p.jersey_number,
        position=p.position,
        height=p.height,
        weight=p.weight,
        country=p.country,
        college=p.college,
        draft_year=p.draft_year,
        draft_round=p.draft_round,
        draft_pick=p.draft_pick,
        years_exp=p.years_exp,
        is_active=p.is_active,
        latest_stats=latest_stats,
        image_url=f"https://cdn.nba.com/headshots/nba/latest/1040x760/{p.nba_id}.png" if p.nba_id else None,
    )


@router.get("/players")
async def list_players(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
    team_id: int | None = None,
    position: str | None = None,
    sort_by: str = Query("name"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$"),
    season: str = "2025-26",
    db: AsyncSession = Depends(get_db),
):
    players, meta = await player_service.get_players_paginated(
        db, page=page, page_size=page_size, search=search,
        team_id=team_id, position=position,
        sort_by=sort_by, sort_order=sort_order, season=season,
    )
    teams_map = await _get_teams_map(db)
    return ApiResponse(
        data=[_player_to_summary(p, teams_map, season).model_dump() for p in players],
        meta=meta.model_dump(),
    )


@router.get("/players/search")
async def search_players(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    players = await player_service.search_players(db, q, limit)
    teams_map = await _get_teams_map(db)
    data = []
    for p in players:
        # Try stats team first, then model team
        team = None
        if p.team:
            team = TeamOut.model_validate(p.team).model_dump()
        else:
            for s in (p.stats or []):
                if s.team_abbreviation and teams_map:
                    t = teams_map.get(s.team_abbreviation)
                    if t:
                        team = TeamOut.model_validate(t).model_dump()
                        break
        data.append({
            "id": p.id, "name": p.name, "name_en": p.name_en,
            "team": team, "position": p.position,
        })
    return ApiResponse(data=data)


@router.get("/players/{player_id}")
async def get_player(
    player_id: int,
    db: AsyncSession = Depends(get_db),
):
    player = await player_service.get_player_detail(db, player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    teams_map = await _get_teams_map(db)
    summary = _player_to_summary(player, teams_map)
    career_stats = [PlayerStatsOut.model_validate(s) for s in (player.stats or [])]

    return ApiResponse(data=PlayerDetail(
        **summary.model_dump(),
        career_stats=[s.model_dump() for s in career_stats],
    ).model_dump())


@router.get("/players/batch")
async def get_players_batch(
    ids: str = Query(..., description="Comma-separated player IDs"),
    db: AsyncSession = Depends(get_db),
):
    player_ids = [int(i) for i in ids.split(",") if i.strip().isdigit()]
    if not player_ids:
        return ApiResponse(data=[])
    players = await player_service.get_players_by_ids(db, player_ids)
    teams_map = await _get_teams_map(db)
    return ApiResponse(data=[_player_to_summary(p, teams_map).model_dump() for p in players])


@router.get("/players/{player_id}/stats")
async def get_player_stats(
    player_id: int,
    season: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    stats = await player_service.get_player_stats(db, player_id, season)
    return ApiResponse(data=[PlayerStatsOut.model_validate(s).model_dump() for s in stats])
