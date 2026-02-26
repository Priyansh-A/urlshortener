import json
import asyncio
from pathlib import Path
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime

from .models import Shortener, ClickEvent
from .database import engine, AsyncSessionLocal

async def load_json_data(json_path: str = "data.json", force: bool = False):
    print(f"Loading data from {json_path}...")
    
    # Check if file exists
    if not Path(json_path).exists():
        print(f"File {json_path} not found. Skipping data load.")
        return
    
    # Load JSON data
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    async with AsyncSessionLocal() as session:
        # Check if data already exists
        existing = await session.exec(select(Shortener))
        if existing.first() and not force:
            print("Database already has data. Use force=True to reload.")
            return
        
        if force:
            print("Clearing existing data...")
            await session.exec(ClickEvent.__table__.delete())
            await session.exec(Shortener.__table__.delete())
            await session.commit()
        
        # Load shorteners
        shortener_map = {}  # Map alias to ID
        print(f"Loading {len(data['shorteners'])} shorteners...")
        
        for item in data['shorteners']:
            # Parse datetime
            if isinstance(item['created_at'], str):
                item['created_at'] = datetime.fromisoformat(item['created_at'])
            
            shortener = Shortener(**item)
            session.add(shortener)
            await session.flush()  # Get the ID
            shortener_map[item['alias']] = shortener.id
            print(f"Added /{item['alias']} -> {item['url']}")
        
        await session.commit()
        
        # Load click events
        if 'click_events' in data and data['click_events']:
            print(f"Loading {len(data['click_events'])} click events...")
            
            for item in data['click_events']:
                # Find the shortener_id from alias
                alias = item['alias_used']
                if alias not in shortener_map:
                    print(f"Alias '{alias}' not found, skipping click")
                    continue
                
                # Parse datetime
                if isinstance(item['clicked_at'], str):
                    item['clicked_at'] = datetime.fromisoformat(item['clicked_at'])
                
                click_event = ClickEvent(
                    shortener_id=shortener_map[alias],
                    alias_used=alias,
                    clicked_at=item['clicked_at']
                )
                session.add(click_event)
            
            await session.commit()
            print(f" Added {len(data['click_events'])} click events")
        
        print("Data loading complete!")

async def main():
    import sys
    force = '--force' in sys.argv or '-f' in sys.argv
    json_path = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('-') else "data.json"
    
    await load_json_data(json_path, force)

if __name__ == "__main__":
    asyncio.run(main())