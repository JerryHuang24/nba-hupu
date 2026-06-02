import asyncio
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db, async_session
from models.player import ScrapeLog
from services.scrape_service import run_players_scrape, run_stats_scrape, run_historical_stats_scrape
from schemas.player import ApiResponse, ScrapeTriggerRequest, ScrapeLogOut

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")


async def _bg_historical_scrape():
    """Background task for long-running historical scrape (30 seasons)."""
    async with async_session() as db:
        try:
            result = await run_historical_stats_scrape(db)
            logger.info("Historical scrape completed: %s", result)
        except Exception as e:
            logger.error("Historical scrape failed: %s", e)


@router.post("/scrape/trigger")
async def trigger_scrape(
    body: ScrapeTriggerRequest,
    db: AsyncSession = Depends(get_db),
):
    if body.source not in ("players", "stats", "history"):
        raise HTTPException(status_code=400, detail="Source must be 'players', 'stats', or 'history'")
    try:
        if body.source == "history":
            asyncio.create_task(_bg_historical_scrape())
            return ApiResponse(data={"status": "started", "message": "Historical scrape running in background (30 seasons, ~10-20 min)"})
        elif body.source == "players":
            result = await run_players_scrape(db)
            return ApiResponse(data={"status": "success", **result})
        else:
            result = await run_stats_scrape(db)
            return ApiResponse(data={"status": "success", **result})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/scrape/status")
async def scrape_status(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ScrapeLog)
        .order_by(ScrapeLog.started_at.desc())
        .limit(10)
    )
    logs = result.scalars().all()
    return ApiResponse(data=[ScrapeLogOut.model_validate(log).model_dump() for log in logs])
