import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger
from app.jobs.deadline_monitor import run_deadline_monitor
from app.jobs.followup_monitor import run_followup_monitor
from app.jobs.conflict_checker import run_conflict_checker
from app.jobs.schedule_health import run_schedule_health
from app.jobs.birthday_reminder import run_birthday_reminder

logger = logging.getLogger("flow.jobs.scheduler")

class FlowScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()

    def start(self):
        logger.info("Initializing FLOW Background Proactive Jobs Scheduler...")

        # 1. Deadline Monitor: every 5 minutes
        self.scheduler.add_job(
            run_deadline_monitor,
            trigger=IntervalTrigger(minutes=5),
            id="job_deadline_monitor",
            replace_existing=True,
        )

        # 2. Conflict Checker: every 5 minutes
        self.scheduler.add_job(
            run_conflict_checker,
            trigger=IntervalTrigger(minutes=5),
            id="job_conflict_checker",
            replace_existing=True,
        )

        # 3. Followup Monitor: every 15 minutes
        self.scheduler.add_job(
            run_followup_monitor,
            trigger=IntervalTrigger(minutes=15),
            id="job_followup_monitor",
            replace_existing=True,
        )

        # 4. Schedule Health Evaluator: every 1 hour
        self.scheduler.add_job(
            run_schedule_health,
            trigger=IntervalTrigger(hours=1),
            id="job_schedule_health",
            replace_existing=True,
        )

        # 5. Birthday & Milestone Reminder: daily at 08:00 UTC
        self.scheduler.add_job(
            run_birthday_reminder,
            trigger=CronTrigger(hour=8, minute=0),
            id="job_birthday_reminder",
            replace_existing=True,
        )

        self.scheduler.start()
        logger.info("FLOW Scheduler started with 5 proactive jobs registered.")

    def shutdown(self):
        logger.info("Shutting down FLOW Scheduler...")
        self.scheduler.shutdown(wait=False)

flow_scheduler = FlowScheduler()

def get_scheduler() -> FlowScheduler:
    return flow_scheduler
