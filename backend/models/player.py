from datetime import datetime

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text,
    ForeignKey, UniqueConstraint, Index,
)
from sqlalchemy.orm import relationship

from database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nba_id = Column(Integer, unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    name_en = Column(String(100))
    abbreviation = Column(String(5))
    conference = Column(String(10))
    division = Column(String(50))
    logo_url = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    players = relationship("Player", back_populates="team")


class Player(Base):
    __tablename__ = "players"

    id = Column(Integer, primary_key=True, autoincrement=True)
    nba_id = Column(Integer, unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    name_en = Column(String(200))
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    jersey_number = Column(String(10))
    position = Column(String(50))
    height = Column(String(20))
    weight = Column(String(20))
    country = Column(String(50))
    college = Column(String(100))
    draft_year = Column(Integer)
    draft_round = Column(Integer)
    draft_pick = Column(Integer)
    years_exp = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    team = relationship("Team", back_populates="players")
    stats = relationship("PlayerStats", back_populates="player", order_by="PlayerStats.season")

    Index("idx_players_name", "name")
    Index("idx_players_team", "team_id")
    Index("idx_players_position", "position")


class PlayerStats(Base):
    __tablename__ = "player_stats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    player_id = Column(Integer, ForeignKey("players.id"), nullable=False)
    season = Column(String(10), nullable=False)
    team_abbreviation = Column(String(5))
    gp = Column(Integer, default=0)
    gs = Column(Integer, default=0)
    mpg = Column(Float)
    ppg = Column(Float)
    rpg = Column(Float)
    apg = Column(Float)
    spg = Column(Float)
    bpg = Column(Float)
    topg = Column(Float)
    pfpg = Column(Float)
    fgm = Column(Float)
    fga = Column(Float)
    fg_pct = Column(Float)
    threepm = Column(Float)
    threepa = Column(Float)
    three_pct = Column(Float)
    ftm = Column(Float)
    fta = Column(Float)
    ft_pct = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    player = relationship("Player", back_populates="stats")

    __table_args__ = (
        UniqueConstraint("player_id", "season", name="uq_player_season"),
        Index("idx_stats_player", "player_id"),
        Index("idx_stats_season", "season"),
    )


class ScrapeLog(Base):
    __tablename__ = "scrape_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    source = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False, default="running")
    records_added = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
