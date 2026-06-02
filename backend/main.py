import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from config import CORS_ORIGINS, BASE_DIR
from database import init_db, async_session
from routers import players, teams, compare, stats, scrape
from services.scrape_service import run_players_scrape, run_stats_scrape

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)


async def scheduled_players_scrape():
    logger.info("Scheduled: running players scrape...")
    async with async_session() as db:
        try:
            await run_players_scrape(db)
        except Exception as e:
            logger.error("Scheduled players scrape failed: %s", e)


async def scheduled_stats_scrape():
    logger.info("Scheduled: running stats scrape...")
    async with async_session() as db:
        try:
            await run_stats_scrape(db)
        except Exception as e:
            logger.error("Scheduled stats scrape failed: %s", e)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    logger.info("Database initialized")

    # Auto-scrape on cold start if database is empty
    from sqlalchemy import select, func
    from models.player import Team
    async with async_session() as db:
        team_count = (await db.execute(select(func.count(Team.id)))).scalar() or 0
    if team_count == 0:
        logger.info("Empty database detected, running initial scrape...")
        async with async_session() as db:
            try:
                await run_players_scrape(db)
            except Exception as e:
                logger.error("Initial players scrape failed: %s", e)
        async with async_session() as db:
            try:
                await run_stats_scrape(db)
            except Exception as e:
                logger.error("Initial stats scrape failed: %s", e)
        logger.info("Initial scrape completed")

    scheduler = AsyncIOScheduler()
    scheduler.add_job(scheduled_players_scrape, "cron", hour=3, minute=0)
    scheduler.add_job(scheduled_stats_scrape, "cron", hour=4, minute=15)
    scheduler.add_job(scheduled_players_scrape, "cron", hour=15, minute=30)
    scheduler.start()
    logger.info("Scheduler started")

    yield

    scheduler.shutdown()
    logger.info("Scheduler shut down")


app = FastAPI(
    title="NBA Hupu Player Hub",
    description="NBA player data API powered by stats.nba.com",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(players.router)
app.include_router(teams.router)
app.include_router(compare.router)
app.include_router(stats.router)
app.include_router(scrape.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


# Serve frontend static files in production
STATIC_DIR = os.path.join(BASE_DIR, "static")
if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve React SPA — return index.html for all non-API routes."""
        file_path = os.path.join(STATIC_DIR, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
