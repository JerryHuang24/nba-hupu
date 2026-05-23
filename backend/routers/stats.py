from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from services import player_service
from schemas.player import ApiResponse, TeamOut, PlayerStatsOut

router = APIRouter(prefix="/api")


@router.get("/stats/leaderboard")
async def leaderboard(
    stat: str = Query("ppg", description="Stat column: ppg, rpg, apg, spg, bpg, fg_pct, three_pct, ft_pct, mpg"),
    season: str = "2025-26",
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    rows = await player_service.get_leaderboard(db, stat=stat, season=season, limit=limit)
    data = []
    for row in rows:
        data.append({
            "id": row["id"],
            "name": row["name"],
            "name_en": row["name_en"],
            "team": TeamOut.model_validate(row["team"]).model_dump() if row["team"] else None,
            "stats": PlayerStatsOut.model_validate(row["stats"]).model_dump(),
        })
    return ApiResponse(data=data)
