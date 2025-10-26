from typing import Dict, List, Tuple
from app.models import (
    Pokemon, BattleState, SessionState, ActionRequest,
    StartSessionRequest, StartSessionResponse, Move
)
from app.damage_service import DamageService
from app.type_chart import TypeChartCache
from app.pokeapi_client import PokeApiClient
import random
import uuid


class BattleSession:
    def __init__(self, player: Pokemon, opponent: Pokemon):
        self.player_pokemon = player
        self.opponent_pokemon = opponent
        self.state = SessionState(
            player=BattleState(hp=player.stats.hp, max_hp=player.stats.hp),
            opponent=BattleState(hp=opponent.stats.hp, max_hp=opponent.stats.hp),
            turn="player",
            log=[f"Battle started! {player.name.upper()} vs {opponent.name.upper()}"],
            winner=None
        )
        self.difficulty = "normal"


class BattleEngine:
    def __init__(self, pokeapi_client: PokeApiClient, damage_service: DamageService):
        self.pokeapi_client = pokeapi_client
        self.damage_service = damage_service
        self.sessions: Dict[str, BattleSession] = {}
    
    async def start_session(self, request: StartSessionRequest) -> StartSessionResponse:
        """Start a new battle session"""
        import httpx
        
        # Get player pokemon
        if request.player_pokemon == "random":
            player_data = await self.pokeapi_client.get_random_pokemon()
        else:
            try:
                player_data = await self.pokeapi_client.get_pokemon(request.player_pokemon)
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    raise ValueError(f"Pokémon '{request.player_pokemon}' not found. Please check the spelling and try again.")
                raise
        player = await self._normalize_pokemon(player_data)
        
        # Get opponent pokemon
        if request.opponent == "random":
            opponent_data = await self.pokeapi_client.get_random_pokemon()
        else:
            try:
                opponent_data = await self.pokeapi_client.get_pokemon(request.opponent)
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    raise ValueError(f"Opponent Pokémon '{request.opponent}' not found.")
                raise
        opponent = await self._normalize_pokemon(opponent_data)
        
        # Create session
        session_id = str(uuid.uuid4())
        session = BattleSession(player, opponent)
        session.difficulty = request.difficulty or "normal"
        
        self.sessions[session_id] = session
        
        return StartSessionResponse(
            session_id=session_id,
            player=player,
            opponent=opponent,
            turn=session.state.turn,
            log=session.state.log
        )
    
    async def perform_action(self, session_id: str, request: ActionRequest) -> Dict:
        """Perform an action in a battle session"""
        if session_id not in self.sessions:
            raise ValueError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        
        if session.state.winner:
            raise ValueError("Battle has already ended")
        
        if session.state.turn != "player":
            raise ValueError("Not your turn")
        
        # Find the move
        move = None
        for m in session.player_pokemon.moves:
            if m.id == request.move_id:
                move = m
                break
        
        if not move:
            raise ValueError(f"Move {request.move_id} not found")
        
        # Process player's attack
        damage = await self.damage_service.calculate_damage(
            session.player_pokemon,
            session.opponent_pokemon,
            move
        )
        
        # Check accuracy
        hit = self.damage_service.check_accuracy(move)
        
        if hit:
            session.state.opponent.hp = max(0, session.state.opponent.hp - damage)
            session.state.log.append(
                f"{session.player_pokemon.name.upper()} used {move.name.upper()}! "
                f"It dealt {damage} damage!"
            )
        else:
            session.state.log.append(
                f"{session.player_pokemon.name.upper()} used {move.name.upper()}... "
                f"But it missed!"
            )
        
        # Check if opponent fainted
        if session.state.opponent.hp <= 0:
            session.state.winner = "player"
            session.state.log.append(f"{session.opponent_pokemon.name.upper()} fainted! {session.player_pokemon.name.upper()} wins!")
            return {"state": session.state}
        
        # Switch to opponent's turn
        session.state.turn = "opponent"
        
        # AI plays
        await self._ai_turn(session)
        
        # Check if player fainted
        if session.state.player.hp <= 0:
            session.state.winner = "opponent"
            session.state.log.append(f"{session.player_pokemon.name.upper()} fainted! {session.opponent_pokemon.name.upper()} wins!")
            return {"state": session.state}
        
        # Switch back to player
        session.state.turn = "player"
        
        return {"state": session.state}
    
    async def _ai_turn(self, session: BattleSession):
        """AI opponent's turn"""
        # Simple AI: pick random move for now
        if not session.opponent_pokemon.moves:
            return
        
        move = random.choice(session.opponent_pokemon.moves)
        damage = await self.damage_service.calculate_damage(
            session.opponent_pokemon,
            session.player_pokemon,
            move
        )
        
        hit = self.damage_service.check_accuracy(move)
        
        if hit:
            session.state.player.hp = max(0, session.state.player.hp - damage)
            session.state.log.append(
                f"{session.opponent_pokemon.name.upper()} used {move.name.upper()}! "
                f"It dealt {damage} damage!"
            )
        else:
            session.state.log.append(
                f"{session.opponent_pokemon.name.upper()} used {move.name.upper()}... "
                f"But it missed!"
            )
    
    async def _normalize_pokemon(self, data: Dict) -> Pokemon:
        """Normalize pokemon data from PokéAPI"""
        from app.models import Stats
        # Extract base stats
        stats_dict = {}
        for stat in data["stats"]:
            stat_name = stat["stat"]["name"].replace("-", "_")
            stats_dict[stat_name] = stat["base_stat"]
        
        # Calculate HP with formula
        hp = stats_dict["hp"] * 2 + 110
        
        stats = Stats(
            hp=hp,
            attack=stats_dict.get("attack", 50),
            defense=stats_dict.get("defense", 50),
            sp_attack=stats_dict.get("special_attack", 50),
            sp_defense=stats_dict.get("special_defense", 50),
            speed=stats_dict.get("speed", 50)
        )
        
        # Extract types
        types = [t["type"]["name"] for t in data["types"]]
        
        # Get sprite (prefer animated if available)
        sprite = data["sprites"].get("versions", {}).get("generation-v", {}).get("black-white", {}).get("animated", {}).get("front_default") or \
                 data["sprites"]["other"]["official-artwork"]["front_default"] or \
                 data["sprites"]["front_default"]
        
        # Get moves (first 4 damaging moves)
        moves = []
        for move_entry in data["moves"][:20]:  # Check up to 20 moves
            try:
                move_data = await self.pokeapi_client.get_move(move_entry["move"]["name"])
                power = move_data.get("power") or 0
                damage_class = move_data.get("damage_class", {}).get("name", "status")
                
                if power > 0 and len(moves) < 4:
                    move_type = move_data["type"]["name"]
                    accuracy = move_data.get("accuracy") or 100
                    
                    from app.models import Move as MoveModel
                    moves.append(MoveModel(
                        id=move_data["name"],
                        name=move_data["name"],
                        type=move_type,
                        power=power,
                        class_=damage_class,
                        accuracy=accuracy,
                        damage_class=damage_class
                    ))
            except Exception as e:
                print(f"Error loading move: {e}")
                continue
        
        # Fallback if no damaging moves found
        if not moves:
            from app.models import Move as MoveModel
            moves = [
                MoveModel(
                    id="tackle",
                    name="tackle",
                    type="normal",
                    power=40,
                    class_="physical",
                    accuracy=100
                )
            ] * 4
        
        return Pokemon(
            name=data["name"],
            sprite=sprite,
            types=types,
            stats=stats,
            moves=moves
        )

