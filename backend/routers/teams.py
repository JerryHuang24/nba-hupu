from fastapi import APIRouter, Depends
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from services import player_service
from schemas.player import ApiResponse, TeamOut
from models.player import Team, Player, PlayerStats

router = APIRouter(prefix="/api")


@router.get("/teams")
async def list_teams(db: AsyncSession = Depends(get_db)):
    teams = await player_service.get_teams(db)
    return ApiResponse(data=[TeamOut.model_validate(t).model_dump() for t in teams])


@router.get("/teams/{team_id}/players")
async def get_team_players(team_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Team).where(Team.id == team_id))
    team = result.scalar()
    if not team:
        return ApiResponse(data=[])

    teams_map = await player_service.get_teams_map(db)

    all_players = await player_service.get_team_players(db, team_id)

    if not all_players:
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

    return ApiResponse(data=[
        player_service.player_to_summary(p, teams_map).model_dump() for p in all_players
    ])
