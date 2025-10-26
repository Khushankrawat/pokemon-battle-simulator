from typing import Dict, Set, Tuple
from app.pokeapi_client import PokeApiClient


class TypeChartCache:
    def __init__(self, client: PokeApiClient):
        self.client = client
        self.cache: Dict[str, Dict[str, Set[str]]] = {}
    
    async def get_type_damage_relations(self, type_name: str) -> Dict[str, Set[str]]:
        """Get damage relations for a type (2x, 0.5x, 0x)"""
        if type_name in self.cache:
            return self.cache[type_name]
        
        type_data = await self.client.get_type(type_name)
        damage_relations = type_data.get("damage_relations", {})
        
        relations = {
            "double_damage_to": {t["name"] for t in damage_relations.get("double_damage_to", [])},
            "half_damage_to": {t["name"] for t in damage_relations.get("half_damage_to", [])},
            "no_damage_to": {t["name"] for t in damage_relations.get("no_damage_to", [])},
        }
        
        self.cache[type_name] = relations
        return relations
    
    def calculate_type_effectiveness(self, move_type: str, defender_types: list[str]) -> float:
        """Calculate type effectiveness multiplier (1.0, 0.5, 2.0, 4.0, 0.0)"""
        effectiveness = 1.0
        
        if move_type not in self.cache:
            return effectiveness
        
        move_relations = self.cache[move_type]
        
        for defender_type in defender_types:
            if defender_type in move_relations["no_damage_to"]:
                return 0.0
            elif defender_type in move_relations["double_damage_to"]:
                effectiveness *= 2.0
            elif defender_type in move_relations["half_damage_to"]:
                effectiveness *= 0.5
        
        return effectiveness
    
    async def load_type(self, type_name: str):
        """Pre-load a type into cache"""
        await self.get_type_damage_relations(type_name)

