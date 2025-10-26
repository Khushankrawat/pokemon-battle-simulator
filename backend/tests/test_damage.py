import pytest
from app.models import Pokemon, Stats, Move
from app.type_chart import TypeChartCache
from app.pokeapi_client import PokeApiClient
from app.damage_service import DamageService


@pytest.fixture
async def type_chart():
    client = PokeApiClient()
    chart = TypeChartCache(client)
    await chart.load_type("electric")
    await chart.load_type("water")
    await chart.load_type("ground")
    yield chart
    await client.close()


@pytest.fixture
def damage_service(type_chart):
    return DamageService(type_chart)


def create_test_pokemon(name: str, types: list[str], stats: Stats, moves: list[Move]):
    return Pokemon(name=name, sprite="test.png", types=types, stats=stats, moves=moves)


@pytest.mark.asyncio
async def test_damage_calculation(damage_service):
    """Test basic damage calculation"""
    # Create test pokemon
    attacker = create_test_pokemon(
        "pikachu",
        ["electric"],
        Stats(hp=100, attack=50, defense=40, sp_attack=60, sp_defense=50, speed=80),
        [Move(id="thunderbolt", name="thunderbolt", type="electric", power=90, class_="special", accuracy=100)]
    )
    
    defender = create_test_pokemon(
        "squirtle",
        ["water"],
        Stats(hp=100, attack=45, defense=60, sp_attack=50, sp_defense=64, speed=40),
        []
    )
    
    move = attacker.moves[0]
    damage = await damage_service.calculate_damage(attacker, defender, move, use_random=False)
    
    assert damage > 0
    assert damage < 1000  # Sanity check


@pytest.mark.asyncio
async def test_type_effectiveness(damage_service):
    """Test type effectiveness calculation"""
    # Electric vs Water (2x)
    damage_service.type_chart.cache["electric"] = {
        "double_damage_to": {"water"},
        "half_damage_to": set(),
        "no_damage_to": set()
    }
    
    attacker = create_test_pokemon(
        "raichu",
        ["electric"],
        Stats(hp=100, attack=60, defense=50, sp_attack=90, sp_defense=80, speed=110),
        [Move(id="thunderbolt", name="thunderbolt", type="electric", power=90, class_="special", accuracy=100)]
    )
    
    defender = create_test_pokemon(
        "gyarados",
        ["water", "flying"],
        Stats(hp=100, attack=80, defense=60, sp_attack=50, sp_defense=100, speed=70),
        []
    )
    
    move = attacker.moves[0]
    damage = await damage_service.calculate_damage(attacker, defender, move, use_random=False)
    
    assert damage > 0

