import random
import asyncio
import logging

logger = logging.getLogger(__name__)


class BaseScraper:
    """Shared helpers for nba_api calls — rate limiting and retry logic."""

    def __init__(self, concurrency: int = 3, interval: float = 0.75, max_retries: int = 5):
        self.semaphore = asyncio.Semaphore(concurrency)
        self.interval = interval
        self.max_retries = max_retries

    async def run_with_retry(self, func, *args, **kwargs):
        """Call a sync function with retries and exponential backoff."""
        async with self.semaphore:
            await asyncio.sleep(self.interval + random.uniform(0, 0.5))
            last_exc = None
            for attempt in range(self.max_retries):
                try:
                    return await asyncio.to_thread(func, *args, **kwargs)
                except Exception as e:
                    last_exc = e
                    wait = 2 ** attempt
                    logger.warning(
                        "Attempt %d/%d failed: %s. Retrying in %ds...",
                        attempt + 1, self.max_retries, e, wait,
                    )
                    await asyncio.sleep(wait)
            raise last_exc
