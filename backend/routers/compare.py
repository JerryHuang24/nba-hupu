from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from services import player_service
from schemas.player import (
    ApiResponse, TeamOut, PlayerComparisonItem, PlayerComparisonOut, PlayerStatsOut,
)

router = APIRouter(prefix="/api")


@router.get("/compare")
async def compare_players(
    ids: str = Query(..., description="Comma-separated player IDs, 2-5"),
    season: str = Query("2025-26", description="Season to compare, e.g. 2025-26"),
    db: AsyncSession = Depends(get_db),
):
    try:
        player_ids = [int(x.strip()) for x in ids.split(",") if x.strip()]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid player IDs")

    if len(player_ids) < 2 or len(player_ids) > 5:
        raise HTTPException(status_code=400, detail="Compare 2-5 players")

    players = await player_service.get_comparison(db, player_ids)

    items = []
    for p in players:
        latest_stats = None
        for s in (p.stats or []):
            if s.season == season:
                latest_stats = PlayerStatsOut.model_validate(s)
                break
        items.append(PlayerComparisonItem(
            id=p.id, name=p.name, name_en=p.name_en,
            team=TeamOut.model_validate(p.team) if p.team else None,
            image_url=f"https://cdn.nba.com/headshots/nba/latest/1040x760/{p.nba_id}.png" if p.nba_id else None,
            stats=latest_stats,
        ))

    return ApiResponse(data=PlayerComparisonOut(players=items).model_dump())
