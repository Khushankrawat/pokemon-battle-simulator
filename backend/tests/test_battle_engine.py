import pytest
from app.battle_engine import BattleEngine
from app.models import StartSessionRequest, ActionRequest
from app.pokeapi_client import PokeApiClient
from app.type_chart import TypeChartCache
from app.damage_service import DamageService


@pytest.fixture
async def battle_engine():
    client = PokeApiClient()
    type_chart = TypeChartCache(client)
    damage_service = DamageService(type_chart)
    engine = BattleEngine(client, damage_service)
    yield engine
    await client.close()


@pytest.mark.asyncio
async def test_start_session(battle_engine):
    """Test starting a battle session"""
    request = StartSessionRequest(
        player_pokemon="pikachu",
        opponent="random",
        difficulty="normal"
    )
    
    response = await battle_engine.start_session(request)
    
    assert response.session_id
    assert response.player.name == "pikachu"
    assert response.opponent
    assert len(response.player.moves) > 0
    assert len(response.player.types) > 0


@pytest.mark.asyncio
async def test_session_state(battle_engine):
    """Test session state management"""
    request = StartSessionRequest(player_pokemon="pikachu")
    response = await battle_engine.start_session(request)
    session_id = response.session_id
    
    assert session_id in battle_engine.sessions
    assert battle_engine.sessions[session_id].turn == "player"

