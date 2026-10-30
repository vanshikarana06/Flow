import logging

logger = logging.getLogger("flow.jobs.followup")

async def run_followup_monitor():
    logger.debug("Scanning outbound emails for missing responses (> 4 days)...")
