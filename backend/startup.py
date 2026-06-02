import asyncio
import logging
from database import init_db, async_session
from services.scrape_service import run_players_scrape, run_stats_scrape

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("startup")

async def startup():
    await init_db()
    logger.info("Database initialized")

    # Check if we need to scrape
    async with async_session() as db:
        from sqlalchemy import select, func
        from models.player import Team
        count = (await db.execute(select(func.count(Team.id)))).scalar() or 0
    
    if count == 0:
        logger.info("No data found, running initial scrape...")
        async with async_session() as db:
            await run_players_scrape(db)
            await run_stats_scrape(db)
        logger.info("Initial scrape complete")
    else:
        logger.info(f"Data exists ({count} teams), skipping scrape")

if __name__ == "__main__":
    asyncio.run(startup())
