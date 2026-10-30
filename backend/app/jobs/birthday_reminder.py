import logging

logger = logging.getLogger("flow.jobs.milestones")

async def run_birthday_reminder():
    logger.debug("Scanning for today's birthdays, anniversaries, and milestones...")
