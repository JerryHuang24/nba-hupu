import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    f"sqlite+aiosqlite:///{os.path.join(BASE_DIR, 'nba_hupu.db')}",
)

# Scraper settings
SCRAPER_CONCURRENCY = 3
SCRAPER_REQUEST_INTERVAL = 2.0  # seconds between requests
SCRAPER_TIMEOUT = 30.0
SCRAPER_MAX_RETRIES = 5
SCRAPER_RETRY_BACKOFF = 1.0  # base seconds, exponential

# Hupu URLs
HUPU_PLAYERS_URL = "https://nba.hupu.com/players/"
HUPU_STATS_URL = "https://nba.hupu.com/stats/players"

# API
API_PREFIX = "/api"
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 100

# CORS
CORS_ORIGINS = ["*"]

# User agents for rotation
USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
]
