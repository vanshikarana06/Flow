import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_

from app.database.models.calendar import CalendarEvent
from app.database.models.task import Task
from app.shared.enums.tasks import TaskStatus
from app.calendar.schemas import ConflictReport, ConflictItem

class ConflictEngine:
    """
    Intelligent Conflict Detection Engine.
    Detects:
    1. Meeting Overlaps: Multiple calendar meetings sharing the same time slot.
    2. Task Overlaps: Scheduled task slots conflicting with events or other scheduled tasks.
    3. Focus Block Violations: Meetings scheduled during designated focus/deep work blocks.
    """

    def __init__(self, db: AsyncSession):
        self.db = db

    async def evaluate_conflicts(
        self,
        user_id: uuid.UUID,
        start_time: datetime,
        end_time: datetime,
        exclude_event_id: Optional[uuid.UUID] = None,
        is_target_focus_block: bool = False,
    ) -> ConflictReport:
        meeting_overlaps: List[ConflictItem] = []
        task_overlaps: List[ConflictItem] = []
        focus_block_violations: List[ConflictItem] = []

        # 1. Fetch all overlapping calendar events in the window
        event_conditions = [
            CalendarEvent.user_id == user_id,
            CalendarEvent.start_time < end_time,
            CalendarEvent.end_time > start_time,
        ]
        if exclude_event_id:
            event_conditions.append(CalendarEvent.id != exclude_event_id)

        event_stmt = (
            select(CalendarEvent)
            .where(and_(*event_conditions))
            .order_by(CalendarEvent.start_time.asc())
        )
        res = await self.db.execute(event_stmt)
        overlapping_events = list(res.scalars().all())

        # Process event overlaps
        for event in overlapping_events:
            window_str = f"{event.start_time.isoformat()} - {event.end_time.isoformat()}"
            
            # Check for Focus Block Violations
            if event.is_focus_block and not is_target_focus_block:
                focus_block_violations.append(
                    ConflictItem(
                        type="FOCUS_BLOCK_VIOLATION",
                        severity="HIGH",
                        description=f"Meeting scheduled during protected deep work block '{event.title}'.",
                        primary_event_id=str(exclude_event_id) if exclude_event_id else None,
                        conflicting_entity_id=str(event.id),
                        time_window=window_str,
                    )
                )
            elif not event.is_focus_block and is_target_focus_block:
                focus_block_violations.append(
                    ConflictItem(
                        type="FOCUS_BLOCK_VIOLATION",
                        severity="HIGH",
                        description=f"New focus block collides with existing meeting '{event.title}'.",
                        primary_event_id=str(exclude_event_id) if exclude_event_id else None,
                        conflicting_entity_id=str(event.id),
                        time_window=window_str,
                    )
                )
            else:
                # Regular meeting overlap
                meeting_overlaps.append(
                    ConflictItem(
                        type="MEETING_OVERLAP",
                        severity="MEDIUM" if not event.is_focus_block else "HIGH",
                        description=f"Direct overlap with calendar event '{event.title}'.",
                        primary_event_id=str(exclude_event_id) if exclude_event_id else None,
                        conflicting_entity_id=str(event.id),
                        time_window=window_str,
                    )
                )

        # 2. Fetch scheduled tasks overlapping with the window
        task_stmt = (
            select(Task)
            .where(
                Task.user_id == user_id,
                Task.status != TaskStatus.COMPLETED,
                Task.status != TaskStatus.ARCHIVED,
                Task.scheduled_slot_start.is_not(None),
                Task.scheduled_slot_end.is_not(None),
                Task.scheduled_slot_start < end_time,
                Task.scheduled_slot_end > start_time,
            )
            .order_by(Task.scheduled_slot_start.asc())
        )
        task_res = await self.db.execute(task_stmt)
        overlapping_tasks = list(task_res.scalars().all())

        for task in overlapping_tasks:
            task_window = f"{task.scheduled_slot_start.isoformat()} - {task.scheduled_slot_end.isoformat()}"
            task_overlaps.append(
                ConflictItem(
                    type="TASK_OVERLAP",
                    severity="LOW",
                    description=f"Scheduled slot collides with active task work block '{task.title}'.",
                    primary_event_id=str(exclude_event_id) if exclude_event_id else None,
                    conflicting_entity_id=str(task.id),
                    time_window=task_window,
                )
            )

        total_conflicts = len(meeting_overlaps) + len(task_overlaps) + len(focus_block_violations)
        has_conflict = total_conflicts > 0

        summary = (
            f"Detected {total_conflicts} conflict(s): {len(meeting_overlaps)} meeting overlap(s), "
            f"{len(task_overlaps)} task overlap(s), {len(focus_block_violations)} focus block violation(s)."
            if has_conflict
            else "No scheduling conflicts detected. The slot is completely clear."
        )

        return ConflictReport(
            has_conflict=has_conflict,
            conflict_count=total_conflicts,
            meeting_overlaps=meeting_overlaps,
            task_overlaps=task_overlaps,
            focus_block_violations=focus_block_violations,
            summary=summary,
        )

