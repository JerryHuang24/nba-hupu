from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from services import player_service
from schemas.player import ApiResponse, TeamOut, PlayerSummary, PlayerStatsOut
from models.player import Team

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
        id=p.id, nba_id=p.nba_id, name=p.name, name_en=p.name_en,
        team=team,
        jersey_number=p.jersey_number, position=p.position,
        height=p.height, weight=p.weight,
        country=p.country, college=p.college,
        draft_year=p.draft_year, draft_round=p.draft_round, draft_pick=p.draft_pick,
        years_exp=p.years_exp, is_active=p.is_active,
        latest_stats=latest_stats,
        image_url=f"https://cdn.nba.com/headshots/nba/latest/1040x760/{p.nba_id}.png" if p.nba_id else None,
    )


@router.get("/teams")
async def list_teams(db: AsyncSession = Depends(get_db)):
    teams = await player_service.get_teams(db)
    return ApiResponse(data=[TeamOut.model_validate(t).model_dump() for t in teams])


@router.get("/teams/{team_id}/players")
async def get_team_players(team_id: int, db: AsyncSession = Depends(get_db)):
    # Get team abbreviation first
    result = await db.execute(select(Team).where(Team.id == team_id))
    team = result.scalar()
    if not team:
        return ApiResponse(data=[])

    teams_map = await _get_teams_map(db)

    # Get all players with stats for this team's abbreviation
    all_players = await player_service.get_team_players(db, team_id)

    # Also get players whose latest stats match this team (fallback for null team_id)
    if not all_players:
        from sqlalchemy import and_
        from sqlalchemy.orm import selectinload
        from models.player import Player, PlayerStats
        result = await db.execute(
            select(Player)
            .options(
                selectinload(Player.team),
                selectinload(Player.stats),
            )
            .join(PlayerStats, Player.id == PlayerStats.player_id)
            .where(and_(
                PlayerStats.season == "2025-26",
                PlayerStats.team_abbreviation == team.abbreviation,
            ))
            .order_by(Player.name)
        )
        all_players = list(result.unique().scalars().all())

    return ApiResponse(data=[_player_to_summary(p, teams_map).model_dump() for p in all_players])
