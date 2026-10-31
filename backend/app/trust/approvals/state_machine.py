from typing import Dict, List, Set
from app.shared.enums.approval import ApprovalState
from app.core.exceptions import InvalidStateTransitionException

class ApprovalStateMachine:
    _VALID_TRANSITIONS: Dict[ApprovalState, Set[ApprovalState]] = {
        ApprovalState.DRAFT: {ApprovalState.PENDING, ApprovalState.REJECTED},
        ApprovalState.PENDING: {ApprovalState.APPROVED, ApprovalState.MODIFIED, ApprovalState.REJECTED},
        ApprovalState.MODIFIED: {ApprovalState.PENDING, ApprovalState.APPROVED, ApprovalState.REJECTED},
        ApprovalState.APPROVED: {ApprovalState.APPROVED, ApprovalState.EXECUTED, ApprovalState.REJECTED},
        ApprovalState.REJECTED: set(),  # Terminal state
        ApprovalState.EXECUTED: {ApprovalState.VERIFIED},
        ApprovalState.VERIFIED: set(),  # Terminal state
    }

    @classmethod
    def can_transition(cls, from_state: ApprovalState, to_state: ApprovalState) -> bool:
        allowed = cls._VALID_TRANSITIONS.get(from_state, set())
        return to_state in allowed

    @classmethod
    def transition(cls, from_state: ApprovalState, to_state: ApprovalState) -> ApprovalState:
        if not cls.can_transition(from_state, to_state):
            raise InvalidStateTransitionException(from_state=from_state.value, to_state=to_state.value)
        return to_state

    @classmethod
    def get_allowed_transitions(cls, current_state: ApprovalState) -> List[ApprovalState]:
        return list(cls._VALID_TRANSITIONS.get(current_state, set()))
