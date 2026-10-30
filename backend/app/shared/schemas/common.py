from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict

class BaseFlowModel(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        use_enum_values=True,
    )

class TimestampedModel(BaseFlowModel):
    created_at: datetime
    updated_at: datetime

