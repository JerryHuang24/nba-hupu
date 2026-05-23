import logging
from nba_api.stats.static import players, teams

from scraper.base import BaseScraper

logger = logging.getLogger(__name__)

scraper = BaseScraper()


async def fetch_all_players() -> list[dict]:
    """Fetch all active NBA players from nba_api static data (offline, no HTTP)."""
    logger.info("Fetching all NBA players via nba_api...")
    try:
        nba_players = await scraper.run_with_retry(players.get_players)
        logger.info("Fetched %d players from nba_api", len(nba_players))
        return nba_players
    except Exception as e:
        logger.error("Failed to fetch players: %s", e)
        raise


async def fetch_all_teams() -> list[dict]:
    """Fetch all NBA teams from nba_api static data."""
    logger.info("Fetching all NBA teams via nba_api...")
    try:
        nba_teams = await scraper.run_with_retry(teams.get_teams)
        logger.info("Fetched %d teams from nba_api", len(nba_teams))
        return nba_teams
    except Exception as e:
        logger.error("Failed to fetch teams: %s", e)
        raise
