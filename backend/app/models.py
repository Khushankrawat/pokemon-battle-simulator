from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum


class Move(BaseModel):
    id: str
    name: str
    type: str
    power: int
    class_: str
    accuracy: int
    damage_class: Optional[str] = None


class Stats(BaseModel):
    hp: int
    attack: int
    defense: int
    sp_attack: int
    sp_defense: int
    speed: int


class Pokemon(BaseModel):
    name: str
    sprite: str
    types: List[str]
    stats: Stats
    moves: List[Move]


class BattleState(BaseModel):
    hp: int
    max_hp: int
    status: Optional[str] = None


class SessionState(BaseModel):
    player: BattleState
    opponent: BattleState
    turn: str
    log: List[str]
    winner: Optional[str] = None


class ActionRequest(BaseModel):
    move_id: str


class ActionResponse(BaseModel):
    state: SessionState


class StartSessionRequest(BaseModel):
    player_pokemon: str
    opponent: str = "random"
    difficulty: str = "normal"


class StartSessionResponse(BaseModel):
    session_id: str
    player: Pokemon
    opponent: Pokemon
    turn: str
    log: List[str]

