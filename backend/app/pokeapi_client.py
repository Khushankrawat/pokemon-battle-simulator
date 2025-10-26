import httpx
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from collections import defaultdict
import random


class CacheEntry:
    def __init__(self, data: Dict[Any, Any], ttl_hours: int = 24):
        self.data = data
        self.expires_at = datetime.now() + timedelta(hours=ttl_hours)
    
    def is_expired(self) -> bool:
        return datetime.now() > self.expires_at


class PokeApiClient:
    BASE_URL = "https://pokeapi.co/api/v2"
    
    def __init__(self):
        self.cache: Dict[str, CacheEntry] = {}
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def _fetch(self, endpoint: str) -> Dict[str, Any]:
        # Check cache
        if endpoint in self.cache:
            entry = self.cache[endpoint]
            if not entry.is_expired():
                return entry.data
            else:
                del self.cache[endpoint]
        
        # Fetch from API
        url = f"{self.BASE_URL}/{endpoint}"
        response = await self.client.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Cache it
        self.cache[endpoint] = CacheEntry(data)
        return data
    
    async def get_pokemon(self, name: str) -> Dict[str, Any]:
        name = name.lower().strip()
        return await self._fetch(f"pokemon/{name}")
    
    async def get_move(self, name: str) -> Dict[str, Any]:
        name = name.lower().strip()
        return await self._fetch(f"move/{name}")
    
    async def get_type(self, name: str) -> Dict[str, Any]:
        name = name.lower().strip()
        return await self._fetch(f"type/{name}")
    
    async def search_pokemon(self, query: str, limit: int = 10) -> List[str]:
        # Simple search - fetch list and filter
        try:
            data = await self._fetch("pokemon?limit=1000")
            all_pokemon = [p["name"] for p in data.get("results", [])]
            filtered = [p for p in all_pokemon if query.lower() in p.lower()]
            return filtered[:limit]
        except Exception as e:
            print(f"Search error: {e}")
            return []
    
    async def search_pokemon_with_sprites(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search pokemon and return names with sprites"""
        try:
            data = await self._fetch("pokemon?limit=1000")
            all_pokemon = [p["name"] for p in data.get("results", [])]
            filtered = [p for p in all_pokemon if query.lower() in p.lower()][:limit]
            
            results = []
            for name in filtered:
                try:
                    pokemon_data = await self.get_pokemon(name)
                    # Try animated sprites first
                    sprite = pokemon_data["sprites"].get("versions", {}).get("generation-v", {}).get("black-white", {}).get("animated", {}).get("front_default") or \
                            pokemon_data["sprites"]["other"]["official-artwork"]["front_default"] or \
                            pokemon_data["sprites"]["front_default"]
                    results.append({"name": name, "sprite": sprite})
                except Exception as e:
                    print(f"Error getting sprite for {name}: {e}")
                    results.append({"name": name, "sprite": ""})
            
            return results
        except Exception as e:
            print(f"Search error: {e}")
            return []
    
    async def get_random_pokemon(self) -> Dict[str, Any]:
        # Get total count
        data = await self._fetch("pokemon?limit=1")
        # For simplicity, pick a random known popular pokemon
        popular = [
            "pikachu", "charizard", "blastoise", "venusaur", "snorlax",
            "garchomp", "lucario", "dragonite", "gengar", "tyranitar",
            "machamp", "gyarados", "mewtwo", "rayquaza", "metagross"
        ]
        name = random.choice(popular)
        return await self.get_pokemon(name)
    
    async def close(self):
        await self.client.aclose()

