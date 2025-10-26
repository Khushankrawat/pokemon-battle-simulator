import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const pokemonApi = {
  search: (query: string) => api.get<string[]>(`/api/pokemon/search?q=${query}`),
  
  searchWithSprites: (query: string) => 
    api.get(`/api/pokemon/search?q=${query}&with_sprites=true`),
  
  startSession: (data: { player_pokemon: string; opponent?: string; difficulty?: string }) =>
    api.post<{ session_id: string; player: any; opponent: any; turn: string; log: string[] }>('/api/session', data),
  
  performAction: (sessionId: string, moveId: string) =>
    api.post(`/api/session/${sessionId}/action`, { move_id: moveId }),
  
  getMove: (name: string) => api.get(`/api/moves/${name}`),
  
  getType: (name: string) => api.get(`/api/types/${name}`),
}

