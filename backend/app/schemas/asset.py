"""资产相关Schema"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class AssetResponse(BaseModel):
    """资产响应"""
    id: str
    project_id: str
    type: str
    filename: str
    path: str
    created_at: datetime

    class Config:
        from_attributes = True
