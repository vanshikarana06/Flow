from fastapi import HTTPException, status

class FlowException(HTTPException):
    def __init__(self, status_code: int, detail: str, error_code: str = "FLOW_ERROR"):
        super().__init__(status_code=status_code, detail={"message": detail, "code": error_code})

class ApprovalRequiredException(FlowException):
    def __init__(self, approval_id: str, message: str = "Action requires human approval"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=message,
            error_code="APPROVAL_REQUIRED",
        )
        self.approval_id = approval_id

class InvalidStateTransitionException(FlowException):
    def __init__(self, from_state: str, to_state: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from {from_state} to {to_state}",
            error_code="INVALID_STATE_TRANSITION",
        )

class VerificationFailedException(FlowException):
    def __init__(self, action_id: str, reason: str):
        super().__init__(
            status_code=getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422),
            detail=f"Verification failed for action {action_id}: {reason}",
            error_code="VERIFICATION_FAILED",
        )

class EntityNotFoundException(FlowException):
    def __init__(self, entity_name: str, entity_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity_name} with id {entity_id} not found",
            error_code="ENTITY_NOT_FOUND",
        )

