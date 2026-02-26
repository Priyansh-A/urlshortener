from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import  engine
from contextlib import asynccontextmanager
from app.middlewares.limiter import rate_limit_middleware
from .routes import api
from app import models

@asynccontextmanager
async def lifespan(app: FastAPI):
    # start connectiom
    async with engine.begin() as conn:
        await conn.run_sync(models.SQLModel.metadata.create_all)
    print("Database tables created")
    yield
    # shutdown
    await engine.dispose()
    print("Database connections closed")


app = FastAPI(lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],      
)

# referencing middleware
app.middleware("http")(rate_limit_middleware)

# referencing routes
app.include_router(api.router)

# Base URL
@app.get("/")
def root():
    return {"message": "Welcome"}
