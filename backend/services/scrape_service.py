import logging
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import DATABASE_URL

if "postgresql" in DATABASE_URL:
    from sqlalchemy.dialects.postgresql import insert as db_insert
else:
    from sqlalchemy.dialects.sqlite import insert as db_insert

from models.player import Team, Player, PlayerStats, ScrapeLog
from scraper.player_list import fetch_all_players, fetch_all_teams
from scraper.player_stats import fetch_season_stats

logger = logging.getLogger(__name__)


async def _upsert_teams(db: AsyncSession, teams_data: list[dict]) -> dict:
    added, updated = 0, 0
    for t in teams_data:
        stmt = db_insert(Team).values(
            nba_id=t["id"],
            name=t.get("full_name", t.get("nickname", "")),
            name_en=t.get("full_name", ""),
            abbreviation=t.get("abbreviation", ""),
            conference=t.get("conference", ""),
            division=t.get("division", ""),
            logo_url=f"https://cdn.nba.com/logos/nba/{t['id']}/primary/L/logo.svg",
        ).on_conflict_do_update(
            index_elements=["nba_id"],
            set_=dict(
                name=t.get("full_name", t.get("nickname", "")),
                name_en=t.get("full_name", ""),
                abbreviation=t.get("abbreviation", ""),
                conference=t.get("conference", ""),
                division=t.get("division", ""),
                logo_url=f"https://cdn.nba.com/logos/nba/{t['id']}/primary/L/logo.svg",
                updated_at=datetime.utcnow(),
            ),
        )
        result = await db.execute(stmt)
        # Check if row was inserted vs updated
        if result.rowcount:
            added += 1
    await db.commit()
    return {"added": added, "updated": updated}


async def _upsert_players(db: AsyncSession, players_data: list[dict]) -> dict:
    added, updated = 0, 0

    # Build team lookup: nba_id -> local id
    team_result = await db.execute(select(Team.nba_id, Team.id))
    team_map = {row[0]: row[1] for row in team_result.fetchall()}

    for p in players_data:
        team_id = team_map.get(p.get("team_id"))
        stmt = db_insert(Player).values(
            nba_id=p["id"],
            name=p.get("full_name", ""),
            name_en=p.get("full_name", ""),
            team_id=team_id,
            jersey_number=p.get("jersey", ""),
            position=p.get("position", ""),
            height=p.get("height", ""),
            weight=p.get("weight", ""),
            country=p.get("country", ""),
            college=p.get("college", ""),
            draft_year=p.get("draft_year"),
            draft_round=p.get("draft_round"),
            draft_pick=p.get("draft_number"),
            years_exp=p.get("years_exp"),
            is_active=p.get("is_active", True),
        ).on_conflict_do_update(
            index_elements=["nba_id"],
            set_=dict(
                name=p.get("full_name", ""),
                name_en=p.get("full_name", ""),
                team_id=team_id,
                jersey_number=p.get("jersey", ""),
                position=p.get("position", ""),
                height=p.get("height", ""),
                weight=p.get("weight", ""),
                country=p.get("country", ""),
                college=p.get("college", ""),
                draft_year=p.get("draft_year"),
                draft_round=p.get("draft_round"),
                draft_pick=p.get("draft_number"),
                years_exp=p.get("years_exp"),
                is_active=p.get("is_active", True),
                updated_at=datetime.utcnow(),
            ),
        )
        result = await db.execute(stmt)
        if result.rowcount:
            added += 1
    await db.commit()
    logger.info("Players upsert: %d added/updated", added)
    return {"added": added, "updated": updated}


async def _upsert_stats(db: AsyncSession, stats_data: list[dict], season: str) -> dict:
    # Build player lookup: nba_id -> local id
    player_result = await db.execute(select(Player.nba_id, Player.id))
    player_map = {row[0]: row[1] for row in player_result.fetchall()}

    added = 0
    for s in stats_data:
        player_id = player_map.get(s.get("PLAYER_ID"))
        if not player_id:
            continue

        stmt = db_insert(PlayerStats).values(
            player_id=player_id,
            season=season,
            team_abbreviation=s.get("TEAM_ABBREVIATION", ""),
            gp=int(s.get("GP", 0)),
            gs=int(s.get("GS", 0)),
            mpg=float(s.get("MIN", 0)) if s.get("MIN") else None,
            ppg=float(s.get("PTS", 0)) if s.get("PTS") else None,
            rpg=float(s.get("REB", 0)) if s.get("REB") else None,
            apg=float(s.get("AST", 0)) if s.get("AST") else None,
            spg=float(s.get("STL", 0)) if s.get("STL") else None,
            bpg=float(s.get("BLK", 0)) if s.get("BLK") else None,
            topg=float(s.get("TOV", 0)) if s.get("TOV") else None,
            pfpg=float(s.get("PF", 0)) if s.get("PF") else None,
            fgm=float(s.get("FGM", 0)) if s.get("FGM") else None,
            fga=float(s.get("FGA", 0)) if s.get("FGA") else None,
            fg_pct=float(s.get("FG_PCT", 0)) if s.get("FG_PCT") else None,
            threepm=float(s.get("FG3M", 0)) if s.get("FG3M") else None,
            threepa=float(s.get("FG3A", 0)) if s.get("FG3A") else None,
            three_pct=float(s.get("FG3_PCT", 0)) if s.get("FG3_PCT") else None,
            ftm=float(s.get("FTM", 0)) if s.get("FTM") else None,
            fta=float(s.get("FTA", 0)) if s.get("FTA") else None,
            ft_pct=float(s.get("FT_PCT", 0)) if s.get("FT_PCT") else None,
        ).on_conflict_do_update(
            index_elements=["player_id", "season"],
            set_=dict(
                team_abbreviation=s.get("TEAM_ABBREVIATION", ""),
                gp=int(s.get("GP", 0)),
                gs=int(s.get("GS", 0)),
                mpg=float(s.get("MIN", 0)) if s.get("MIN") else None,
                ppg=float(s.get("PTS", 0)) if s.get("PTS") else None,
                rpg=float(s.get("REB", 0)) if s.get("REB") else None,
                apg=float(s.get("AST", 0)) if s.get("AST") else None,
                spg=float(s.get("STL", 0)) if s.get("STL") else None,
                bpg=float(s.get("BLK", 0)) if s.get("BLK") else None,
                topg=float(s.get("TOV", 0)) if s.get("TOV") else None,
                pfpg=float(s.get("PF", 0)) if s.get("PF") else None,
                fgm=float(s.get("FGM", 0)) if s.get("FGM") else None,
                fga=float(s.get("FGA", 0)) if s.get("FGA") else None,
                fg_pct=float(s.get("FG_PCT", 0)) if s.get("FG_PCT") else None,
                threepm=float(s.get("FG3M", 0)) if s.get("FG3M") else None,
                threepa=float(s.get("FG3A", 0)) if s.get("FG3A") else None,
                three_pct=float(s.get("FG3_PCT", 0)) if s.get("FG3_PCT") else None,
                ftm=float(s.get("FTM", 0)) if s.get("FTM") else None,
                fta=float(s.get("FTA", 0)) if s.get("FTA") else None,
                ft_pct=float(s.get("FT_PCT", 0)) if s.get("FT_PCT") else None,
            ),
        )
        result = await db.execute(stmt)
        if result.rowcount:
            added += 1
    await db.commit()
    logger.info("Stats upsert: %d rows", added)
    return {"added": added, "updated": 0}


async def _update_player_teams(db: AsyncSession, season: str = "2025-26"):
    """Update player.team_id from their stats' team_abbreviation for the given season."""
    from sqlalchemy import update

    # Build team abbreviation -> team local id lookup
    team_result = await db.execute(select(Team.abbreviation, Team.id))
    team_map = {row[0]: row[1] for row in team_result.fetchall() if row[0]}

    # Get all stats for the season
    stats_result = await db.execute(
        select(PlayerStats.player_id, PlayerStats.team_abbreviation)
        .where(PlayerStats.season == season)
    )
    updated = 0
    for player_id, abbr in stats_result.fetchall():
        team_id = team_map.get(abbr)
        if team_id and player_id:
            await db.execute(
                update(Player).where(Player.id == player_id).values(team_id=team_id)
            )
            updated += 1

    if updated:
        await db.commit()
        logger.info("Updated team_id for %d players from stats", updated)
    return updated


async def run_players_scrape(db: AsyncSession) -> dict:
    """Full player list scrape: teams + players."""
    log = ScrapeLog(source="players", status="running", started_at=datetime.utcnow())
    db.add(log)
    await db.commit()

    try:
        teams_data = await fetch_all_teams()
        await _upsert_teams(db, teams_data)

        players_data = await fetch_all_players()
        result = await _upsert_players(db, players_data)

        log.status = "success"
        log.records_added = result["added"]
        log.records_updated = result["updated"]
        log.completed_at = datetime.utcnow()
        await db.commit()
        return result
    except Exception as e:
        logger.error("Players scrape failed: %s", e)
        log.status = "failed"
        log.error_message = str(e)
        log.completed_at = datetime.utcnow()
        await db.commit()
        raise


async def run_stats_scrape(db: AsyncSession, season: str = "2025-26") -> dict:
    """Season stats scrape."""
    log = ScrapeLog(source="stats", status="running", started_at=datetime.utcnow())
    db.add(log)
    await db.commit()

    try:
        stats_data = await fetch_season_stats(season)
        result = await _upsert_stats(db, stats_data, season)
        team_updates = await _update_player_teams(db, season)

        log.status = "success"
        log.records_added = result["added"] + team_updates
        log.records_updated = result["updated"]
        log.completed_at = datetime.utcnow()
        await db.commit()
        return result
    except Exception as e:
        logger.error("Stats scrape failed: %s", e)
        log.status = "failed"
        log.error_message = str(e)
        log.completed_at = datetime.utcnow()
        await db.commit()
        raise
