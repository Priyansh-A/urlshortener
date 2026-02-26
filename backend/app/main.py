from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path

from .database import engine
from .middlewares.limiter import rate_limit_middleware
from .routes import api
from . import models
from .loader import load_json_data

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(models.SQLModel.metadata.create_all)
    print("Database tables created")
    
    # Load initial data if JSON file exists
    data_file = Path("data.json")
    if data_file.exists():
        await load_json_data(str(data_file), force=False)
    else:
        print("data.json not found, skipping data load")
    yield
    
    # Cleanup on shutdown
    await engine.dispose()
    print("Database connections closed")

app = FastAPI(
    title="URLShortener",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Custom middleware
app.middleware("http")(rate_limit_middleware)

# Routes
app.include_router(api.router)

@app.get("/")
def root():
    return {"message": "Welcome to URL Shortener API"}