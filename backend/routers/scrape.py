import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models.player import ScrapeLog
from services.scrape_service import run_players_scrape, run_stats_scrape, run_historical_stats_scrape
from schemas.player import ApiResponse, ScrapeTriggerRequest, ScrapeLogOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


@router.post("/scrape/trigger")
async def trigger_scrape(
    body: ScrapeTriggerRequest,
    db: AsyncSession = Depends(get_db),
):
    if body.source not in ("players", "stats", "history"):
        raise HTTPException(status_code=400, detail="Source must be 'players', 'stats', or 'history'")
    try:
        if body.source == "players":
            result = await run_players_scrape(db)
        elif body.source == "history":
            result = await run_historical_stats_scrape(db)
        else:
            result = await run_stats_scrape(db)
        return ApiResponse(data={"status": "success", **result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scrape/status")
async def scrape_status(db: AsyncSession = Depends(get_db)):
    # Get latest log per source
    result = await db.execute(
        select(ScrapeLog)
        .order_by(ScrapeLog.started_at.desc())
        .limit(10)
    )
    logs = result.scalars().all()
    return ApiResponse(data=[ScrapeLogOut.model_validate(log).model_dump() for log in logs])
