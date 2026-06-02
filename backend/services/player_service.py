import math
import logging

from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from models.player import Team, Player, PlayerStats
from schemas.player import PaginationMeta

logger = logging.getLogger(__name__)

ALLOWED_SORT_COLUMNS = {
    "name": Player.name,
    "name_en": Player.name_en,
    "position": Player.position,
    "years_exp": Player.years_exp,
    "ppg": PlayerStats.ppg,
    "rpg": PlayerStats.rpg,
    "apg": PlayerStats.apg,
    "spg": PlayerStats.spg,
    "bpg": PlayerStats.bpg,
    "fg_pct": PlayerStats.fg_pct,
    "three_pct": PlayerStats.three_pct,
    "ft_pct": PlayerStats.ft_pct,
    "mpg": PlayerStats.mpg,
}


async def get_players_paginated(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    search: str | None = None,
    team_id: int | None = None,
    position: str | None = None,
    sort_by: str = "name",
    sort_order: str = "asc",
    season: str = "2025-26",
) -> tuple[list[Player], PaginationMeta]:
    """Paginated player list with filters, search, and sort with current season stats."""

    # Base query — join with latest stats
    query = (
        select(Player)
        .options(
            selectinload(Player.team),
            selectinload(Player.stats.and_(PlayerStats.season == season)),
        )
    )

    # Filters
    conditions = []
    if search:
        like = f"%{search}%"
        conditions.append(
            or_(Player.name.ilike(like), Player.name_en.ilike(like))
        )
    if team_id:
        conditions.append(Player.team_id == team_id)
    if position:
        conditions.append(Player.position.ilike(f"%{position}%"))

    if conditions:
        query = query.where(and_(*conditions))

    # Count
    count_query = select(func.count(Player.id))
    if conditions:
        count_query = count_query.where(and_(*conditions))
    total = (await db.execute(count_query)).scalar() or 0

    # Sort
    sort_col = ALLOWED_SORT_COLUMNS.get(sort_by, Player.name)
    if sort_by in ("ppg", "rpg", "apg", "spg", "bpg", "fg_pct", "three_pct", "ft_pct", "mpg"):
        # Sort by stats column requires a different approach — join stats and order
        query = (
            select(Player)
            .options(
                selectinload(Player.team),
                selectinload(Player.stats.and_(PlayerStats.season == season)),
            )
            .outerjoin(PlayerStats, and_(
                Player.id == PlayerStats.player_id,
                PlayerStats.season == season,
            ))
        )
        if conditions:
            query = query.where(and_(*conditions))
        if sort_order == "desc":
            query = query.order_by(sort_col.desc().nullslast())
        else:
            query = query.order_by(sort_col.asc().nullslast())
    else:
        if sort_order == "desc":
            query = query.order_by(sort_col.desc())
        else:
            query = query.order_by(sort_col.asc())

    # Pagination
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    # Deduplicate due to join
    players = result.unique().scalars().all()

    meta = PaginationMeta(
        page=page,
        page_size=page_size,
        total=total,
        total_pages=max(1, math.ceil(total / page_size)),
    )
    return list(players), meta


async def get_player_detail(db: AsyncSession, player_id: int) -> Player | None:
    result = await db.execute(
        select(Player)
        .options(
            selectinload(Player.team),
            selectinload(Player.stats),
        )
        .where(Player.id == player_id)
    )
    return result.scalars().first()


async def get_player_stats(db: AsyncSession, player_id: int, season: str | None = None) -> list[PlayerStats]:
    query = select(PlayerStats).where(PlayerStats.player_id == player_id)
    if season:
        query = query.where(PlayerStats.season == season)
    query = query.order_by(PlayerStats.season.desc())
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_comparison(db: AsyncSession, player_ids: list[int]) -> list[Player]:
    result = await db.execute(
        select(Player)
        .options(
            selectinload(Player.team),
            selectinload(Player.stats),
        )
        .where(Player.id.in_(player_ids))
    )
    return list(result.scalars().all())


async def get_leaderboard(
    db: AsyncSession,
    stat: str = "ppg",
    season: str = "2025-26",
    limit: int = 20,
) -> list[dict]:
    stat_col = ALLOWED_SORT_COLUMNS.get(stat, PlayerStats.ppg)
    result = await db.execute(
        select(Player, PlayerStats)
        .join(PlayerStats, Player.id == PlayerStats.player_id)
        .options(selectinload(Player.team))
        .where(PlayerStats.season == season)
        .order_by(stat_col.desc().nullslast())
        .limit(limit)
    )
    rows = result.all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "name_en": p.name_en,
            "team": p.team,
            "stats": s,
        }
        for p, s in rows
    ]


async def get_teams(db: AsyncSession) -> list[Team]:
    result = await db.execute(select(Team).order_by(Team.name))
    return list(result.scalars().all())


async def get_team_players(db: AsyncSession, team_id: int) -> list[Player]:
    result = await db.execute(
        select(Player)
        .options(
            selectinload(Player.team),
            selectinload(Player.stats),
        )
        .where(Player.team_id == team_id, Player.is_active == True)
        .order_by(Player.name)
    )
    return list(result.scalars().all())


async def search_players(db: AsyncSession, query: str, limit: int = 10) -> list[Player]:
    like = f"%{query}%"
    result = await db.execute(
        select(Player)
        .options(
            selectinload(Player.team),
            selectinload(Player.stats),
        )
        .where(
            or_(Player.name.ilike(like), Player.name_en.ilike(like))
        )
        .order_by(Player.is_active.desc(), Player.name)
        .limit(limit)
    )
    return list(result.scalars().all())
