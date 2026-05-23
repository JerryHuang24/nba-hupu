import logging
from nba_api.stats.endpoints import playercareerstats, leaguedashplayerstats

from scraper.base import BaseScraper

logger = logging.getLogger(__name__)

scraper = BaseScraper(interval=0.75)


async def fetch_career_stats(nba_id: int) -> list[dict]:
    """Fetch career stats for a single player."""
    logger.debug("Fetching career stats for NBA ID %d", nba_id)
    try:
        result = await scraper.run_with_retry(
            playercareerstats.PlayerCareerStats,
            player_id=nba_id,
            per_mode36="PerGame",
        )
        df = result.get_data_frames()[0]
        return df.to_dict(orient="records") if not df.empty else []
    except Exception as e:
        logger.warning("Failed to fetch career stats for nba_id=%d: %s", nba_id, e)
        return []


async def fetch_season_stats(season: str = "2025-26") -> list[dict]:
    """Fetch league-wide season stats for the given season."""
    logger.info("Fetching league stats for season %s...", season)
    try:
        result = await scraper.run_with_retry(
            leaguedashplayerstats.LeagueDashPlayerStats,
            season=season,
            per_mode_detailed="PerGame",
        )
        df = result.get_data_frames()[0]
        logger.info("Fetched stats for %d players", len(df))
        return df.to_dict(orient="records") if not df.empty else []
    except Exception as e:
        logger.error("Failed to fetch season stats: %s", e)
        raise
