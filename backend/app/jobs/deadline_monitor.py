import logging

logger = logging.getLogger("flow.jobs.deadline")

async def run_deadline_monitor():
    logger.debug("Checking for approaching deadlines (< 24h)...")
