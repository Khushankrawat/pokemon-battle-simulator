from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.models import ActionRequest, ActionResponse, StartSessionRequest, StartSessionResponse
from app.pokeapi_client import PokeApiClient
from app.type_chart import TypeChartCache
from app.damage_service import DamageService
from app.battle_engine import BattleEngine
from typing import List


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    client = PokeApiClient()
    type_chart = TypeChartCache(client)
    damage_service = DamageService(type_chart)
    battle_engine = BattleEngine(client, damage_service)
    
    # Store in app state
    app.state.pokeapi_client = client
    app.state.type_chart = type_chart
    app.state.damage_service = damage_service
    app.state.battle_engine = battle_engine
    
    yield
    
    # Shutdown
    await client.close()


app = FastAPI(lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development (iOS simulators and devices)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/session", response_model=StartSessionResponse)
async def create_session(request: StartSessionRequest):
    """Start a new battle session"""
    try:
        battle_engine: BattleEngine = app.state.battle_engine
        return await battle_engine.start_session(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/session/{session_id}/action", response_model=ActionResponse)
async def perform_action(session_id: str, request: ActionRequest):
    """Perform an action in a battle"""
    try:
        battle_engine: BattleEngine = app.state.battle_engine
        return await battle_engine.perform_action(session_id, request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/pokemon/search")
async def search_pokemon(q: str = "", with_sprites: bool = False):
    """Search for pokemon by name"""
    if not q:
        return []
    
    try:
        client: PokeApiClient = app.state.pokeapi_client
        if with_sprites:
            results = await client.search_pokemon_with_sprites(q, limit=10)
            return results
        else:
            results = await client.search_pokemon(q, limit=20)
            return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/moves/{name}")
async def get_move(name: str):
    """Get move details"""
    try:
        client: PokeApiClient = app.state.pokeapi_client
        return await client.get_move(name)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/types/{name}")
async def get_type(name: str):
    """Get type details"""
    try:
        client: PokeApiClient = app.state.pokeapi_client
        return await client.get_type(name)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/")
async def root():
    return {"message": "Pokémon Battle Simulator API"}

