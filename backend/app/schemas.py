from pydantic import BaseModel, HttpUrl
from typing import Optional, List

class URLCreate(BaseModel):
    url: HttpUrl
    
class URLResponse(BaseModel):
    id: int
    alias: str
    url: str
    created_at: str
    click_count: int = 0
    
class ClickDataPoint(BaseModel):
    date: str
    count: int

class ErrorResponse(BaseModel):
    error: str
    message: str
    retry_after: int

class URLAnalyticsResponse(BaseModel):
    url: str
    total_clicks: int
    clicks_by_alias: List[dict]
    clicks_over_time: List[ClickDataPoint]
    recent_clicks: List[dict]