from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timezone

class Shortener(SQLModel, table=True):
    __tablename__ = 'shortener'
    
    id: Optional[int] = Field(default=None, primary_key=True)
    url: str = Field(index=True, nullable=False) 
    alias: str = Field(index=True, nullable=False, unique=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    
    # Relationship to click events
    clicks: List["ClickEvent"] = Relationship(back_populates="shortener")


class ClickEvent(SQLModel, table=True):
    __tablename__ = 'click_events'
    
    id: Optional[int] = Field(default=None, primary_key=True)
    shortener_id: int = Field(foreign_key="shortener.id", index=True, nullable=False)
    alias_used: str = Field(index=True, nullable=False)
    clicked_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    
    # Relationship back to Shortener
    shortener: Optional[Shortener] = Relationship(back_populates="clicks")