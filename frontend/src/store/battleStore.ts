import { create } from 'zustand'
import { Pokemon, SessionState, StartSessionResponse } from '../types'

interface BattleStore {
  sessionId: string | null
  player: Pokemon | null
  opponent: Pokemon | null
  sessionState: SessionState | null
  setSession: (data: StartSessionResponse) => void
  updateSessionState: (state: SessionState) => void
  reset: () => void
}

export const useBattleStore = create<BattleStore>((set) => ({
  sessionId: null,
  player: null,
  opponent: null,
  sessionState: null,
  
  setSession: (data) => set({
    sessionId: data.session_id,
    player: data.player,
    opponent: data.opponent,
    sessionState: {
      player: { hp: data.player.stats.hp, max_hp: data.player.stats.hp },
      opponent: { hp: data.opponent.stats.hp, max_hp: data.opponent.stats.hp },
      turn: data.turn,
      log: data.log,
    },
  }),
  
  updateSessionState: (state) => set({ sessionState: state }),
  
  reset: () => set({ sessionId: null, player: null, opponent: null, sessionState: null }),
}))

