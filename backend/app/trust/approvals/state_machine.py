from typing import Dict, List
from app.shared.enums.approval import ApprovalState
from app.core.exceptions import InvalidStateTransitionException

class ApprovalStateMachine:
    _VALID_TRANSITIONS: Dict[ApprovalState, List[ApprovalState]] = {
        ApprovalState.DRAFT: [ApprovalState.PENDING, ApprovalState.REJECTED],
        ApprovalState.PENDING: [ApprovalState.APPROVED, ApprovalState.MODIFIED, ApprovalState.REJECTED],
        ApprovalState.MODIFIED: [ApprovalState.APPROVED, ApprovalState.REJECTED],
        ApprovalState.APPROVED: [ApprovalState.EXECUTED, ApprovalState.REJECTED],
        ApprovalState.REJECTED: [], # Terminal state
        ApprovalState.EXECUTED: [ApprovalState.VERIFIED],
        ApprovalState.VERIFIED: [], # Terminal state
    }

    @classmethod
    def can_transition(cls, from_state: ApprovalState, to_state: ApprovalState) -> bool:
        allowed = cls._VALID_TRANSITIONS.get(from_state, [])
        return to_state in allowed

    @classmethod
    def transition(cls, from_state: ApprovalState, to_state: ApprovalState) -> ApprovalState:
        if not cls.can_transition(from_state, to_state):
            raise InvalidStateTransitionException(from_state=from_state.value, to_state=to_state.value)
        return to_state
