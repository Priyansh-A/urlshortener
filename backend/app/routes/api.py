from fastapi import APIRouter, HTTPException, status, BackgroundTasks
from fastapi.responses import RedirectResponse
from sqlmodel import select, func, cast, Date
from typing import List
from ..database import SessionDep
from ..schemas import *
from ..models import Shortener, ClickEvent
from ..utils import base62encoding
from datetime import datetime, timedelta, timezone
import secrets
import string
import logging

router = APIRouter(
    prefix="/api",
    tags=["Api"])

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# url shortener 
@router.post("/shortener", status_code=status.HTTP_201_CREATED)
async def shorten_url(
    url_data: URLCreate,
    session: SessionDep
):
    url_str = str(url_data.url)
    
    alias = base62encoding(url_str)
    
    # check if url already exists
    query = select(Shortener).where(Shortener.url == url_str)
    ses = await session.exec(query)
    existing_url = ses.first()
    
    if existing_url:
        # Get click count for existing URL
        click_query = select(ClickEvent).where(ClickEvent.shortener_id == existing_url.id)
        click_ses = await session.exec(click_query)
        clicks = click_ses.all()
        
        logger.info(f"URL already exists with alias: {existing_url.alias}")
        return URLResponse(
            id=existing_url.id,
            alias=existing_url.alias,
            url=existing_url.url,
            created_at=existing_url.created_at.isoformat(),
            click_count=len(clicks)
        )
    
    db_url = Shortener(
        alias=alias,
        url=url_str
    )
    
    session.add(db_url)
    await session.commit()
    await session.refresh(db_url)
    
    logger.info(f"Created new short URL: {alias} -> {url_str}")
    
    return URLResponse(
        id=db_url.id, 
        alias=db_url.alias,
        url=db_url.url,
        created_at=db_url.created_at.isoformat(),
        click_count=0
    )
    
# list all urls
@router.get("/urls", response_model=List[URLResponse])
async def list_urls(
    session: SessionDep,
    skip: int = 0,
    limit: int = 20
):
    query = select(Shortener).order_by(Shortener.created_at.desc()).offset(skip).limit(limit)
    ses = await session.exec(query)
    urls = ses.all()
    
    result = []
    for url in urls:
        # Get click count for this URL
        click_query = select(ClickEvent).where(ClickEvent.shortener_id == url.id)
        click_ses = await session.exec(click_query)
        clicks = click_ses.all()
        
        result.append(
            URLResponse(
                id=url.id,
                alias=url.alias,
                url=url.url,
                created_at=url.created_at.isoformat(),
                click_count=len(clicks)
            )
        )
    
    return result

# redirect to the real url
@router.get("/{alias}")
async def redirect(
    alias: str,
    background_tasks: BackgroundTasks,
    session: SessionDep
):
    query = select(Shortener).where(Shortener.alias == alias)
    ses = await session.exec(query)
    shortener = ses.first()
    if not shortener:
        raise HTTPException(status_code=404, detail="URL not found")
    
    # Get the ID before the background task
    shortener_id = shortener.id
    shortener_url = shortener.url
    
    # tracking clicks - fixed background task
    async def track_click():
        try:
            from sqlmodel.ext.asyncio.session import AsyncSession
            from ..database import engine
            
            async with AsyncSession(engine) as new_session:
                click_event = ClickEvent(
                    shortener_id=shortener_id,  # Use the captured ID
                    alias_used=alias,
                    clicked_at=datetime.now(timezone.utc).replace(tzinfo=None)
                )
                new_session.add(click_event)
                await new_session.commit()
                logger.info(f"Background click tracked for URL ID {shortener_id} via alias {alias}")
        except Exception as e:
            logger.error(f"Background click tracking failed: {e}")
    
    background_tasks.add_task(track_click)
    
    return RedirectResponse(url=shortener_url, status_code=302)

# gives info about each url and how many times it has been redirected in a day for a week
@router.get("/analytics/{url_id}", response_model=URLAnalyticsResponse)
async def get_url_analytics(
    url_id: int,
    session: SessionDep
):
    # Get the shortener record
    shortener = await session.get(Shortener, url_id)
    
    if not shortener:
        raise HTTPException(status_code=404, detail="URL not found")
    
    # Get all click events for this URL
    query = select(ClickEvent).where(ClickEvent.shortener_id == url_id)
    ses = await session.exec(query)
    clicks = ses.all()
    
    total_clicks = len(clicks)
    
    # Group clicks by alias
    alias_counts = {}
    for click in clicks:
        alias_counts[click.alias_used] = alias_counts.get(click.alias_used, 0) + 1
    
    clicks_by_alias = [
        {"alias": alias, "count": count} 
        for alias, count in alias_counts.items()
    ]
    
    # Clicks over last 7 days
    end_date = datetime.now(timezone.utc).replace(tzinfo=None)
    start_date = end_date - timedelta(days=7)
    
    clicks_by_day = await session.exec(
        select(
            cast(ClickEvent.clicked_at, Date).label('date'),
            func.count(ClickEvent.id).label('count')
        )
        .where(
            ClickEvent.shortener_id == url_id,
            ClickEvent.clicked_at >= start_date
        )
        .group_by(cast(ClickEvent.clicked_at, Date))
        .order_by('date')
    )
    daily_clicks = clicks_by_day.all()
    
    clicks_dict = {}
    for row in daily_clicks:
        if row.date:
            date_str = row.date.isoformat() if hasattr(row.date, 'isoformat') else str(row.date)
            clicks_dict[date_str] = row.count
    
    # Generate last 7 days
    clicks_over_time = []
    for i in range(7):
        date = (start_date + timedelta(days=i)).date()
        date_str = date.isoformat()
        clicks_over_time.append({
            "date": date_str,
            "count": clicks_dict.get(date_str, 0)
        })
    
    # Recent clicks
    recent_clicks = [
        {
            "alias": click.alias_used,
            "clicked_at": click.clicked_at.isoformat()
        }
        for click in sorted(clicks, key=lambda x: x.clicked_at, reverse=True)[:10]
    ]
    
    return URLAnalyticsResponse(
        url=shortener.url,
        total_clicks=total_clicks,
        clicks_by_alias=clicks_by_alias,
        clicks_over_time=clicks_over_time,
        recent_clicks=recent_clicks
    )
    
    
@router.get("/test/count/{alias}")
async def test_count(alias: str, session: SessionDep):
    query = select(Shortener).where(Shortener.alias == alias)
    ses = await session.exec(query)
    shortener = ses.first()
    
    if not shortener:
        return {"error": "URL not found"}
    
    # Get click count
    click_query = select(ClickEvent).where(ClickEvent.shortener_id == shortener.id)
    click_ses = await session.exec(click_query)
    clicks = click_ses.all()
    
    return {
        "alias": alias,
        "url": shortener.url,
        "click_count": len(clicks),
        "clicks": [{"alias": c.alias_used, "time": c.clicked_at.isoformat()} for c in clicks[-5:]]
    }
