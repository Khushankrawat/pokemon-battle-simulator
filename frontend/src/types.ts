export interface Move {
  id: string
  name: string
  type: string
  power: number
  class_: string
  accuracy: number
}

export interface Stats {
  hp: number
  attack: number
  defense: number
  sp_attack: number
  sp_defense: number
  speed: number
}

export interface Pokemon {
  name: string
  sprite: string
  types: string[]
  stats: Stats
  moves: Move[]
}

export interface BattleState {
  hp: number
  max_hp: number
  status?: string | null
}

export interface SessionState {
  player: BattleState
  opponent: BattleState
  turn: string
  log: string[]
  winner?: string | null
}

export interface StartSessionRequest {
  player_pokemon: string
  opponent?: string
  difficulty?: string
}

export interface StartSessionResponse {
  session_id: string
  player: Pokemon
  opponent: Pokemon
  turn: string
  log: string[]
}

export interface ActionRequest {
  move_id: string
}

export interface ActionResponse {
  state: SessionState
}

