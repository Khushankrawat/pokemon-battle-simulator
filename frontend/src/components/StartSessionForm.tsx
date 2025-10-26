import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { pokemonApi } from '../api/client'
import { useBattleStore } from '../store/battleStore'

interface PokemonSuggestion {
  name: string
  sprite: string
}

export default function StartSessionForm() {
  const [pokemonName, setPokemonName] = useState('')
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const { setSession, reset } = useBattleStore()
  
  const { data: suggestions = [] } = useQuery({
    queryKey: ['pokemon-search', query],
    queryFn: () => pokemonApi.searchWithSprites(query).then(res => res.data),
    enabled: query.length > 0,
  })
  
  const mutation = useMutation({
    mutationFn: (data: { player_pokemon: string; opponent?: string }) =>
      pokemonApi.startSession({ ...data, difficulty: 'normal' }),
    onSuccess: (response) => {
      setSession(response.data)
    },
  })
  
  const handleStart = () => {
    if (pokemonName.trim()) {
      mutation.mutate({ player_pokemon: pokemonName.trim() })
    }
  }
  
  const handleRandom = () => {
    mutation.mutate({ player_pokemon: 'random', opponent: 'random' })
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-white via-blue-50 to-yellow-50 rounded-2xl shadow-2xl p-8 space-y-6 border-4 border-red-500">
        <div className="text-center">
          <h1 className="text-6xl font-black bg-gradient-to-r from-yellow-400 via-red-500 to-blue-600 bg-clip-text text-transparent mb-2 drop-shadow-2xl tracking-wide">
            POKÉMON BATTLE
          </h1>
          <p className="text-2xl font-bold text-gray-800 mt-4">⚡ Choose Your Trainer Pokémon ⚡</p>
        </div>
        
        <div className="space-y-3">
          <label className="block text-lg font-bold text-gray-900 mb-3">
            🔍 Search for Your Pokémon
          </label>
          <div className="relative">
            <input
              type="text"
              value={pokemonName}
              onChange={(e) => {
                setPokemonName(e.target.value)
                setQuery(e.target.value)
                setShowSuggestions(true)
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Enter Pokémon name (e.g., pikachu, charizard, lucario)..."
              className="w-full px-6 py-4 border-4 border-blue-400 rounded-xl focus:ring-4 focus:ring-yellow-400 focus:border-yellow-500 transition-all text-lg font-semibold shadow-lg"
            />
            
            {query && showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-gradient-to-br from-white to-blue-50 border-4 border-yellow-400 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                {(suggestions as PokemonSuggestion[]).map((pokemon) => (
                  <button
                    key={pokemon.name}
                    onClick={() => {
                      setPokemonName(pokemon.name)
                      setQuery('')
                      setShowSuggestions(false)
                    }}
                    className="w-full px-6 py-4 text-left hover:bg-gradient-to-r hover:from-yellow-100 hover:to-red-100 transition-all flex items-center gap-4 border-b-2 border-gray-200 last:border-b-0 font-bold hover:scale-[1.02] transform"
                  >
                    {pokemon.sprite && (
                      <img 
                        src={pokemon.sprite} 
                        alt={pokemon.name}
                        className="w-16 h-16 object-contain"
                      />
                    )}
                    <span className="capitalize text-lg font-bold">{pokemon.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleStart}
            disabled={!pokemonName.trim() || mutation.isPending}
            className="flex-1 bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white py-4 rounded-xl hover:from-red-400 hover:via-red-500 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-black text-xl shadow-2xl transition-all transform hover:scale-105 disabled:hover:scale-100 border-4 border-red-800"
          >
            {mutation.isPending ? '⚡ STARTING...' : '⚡ START BATTLE ⚡'}
          </button>
          <button
            onClick={handleRandom}
            disabled={mutation.isPending}
            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white py-4 rounded-xl hover:from-blue-400 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-black text-xl shadow-2xl transition-all transform hover:scale-105 disabled:hover:scale-100 border-4 border-blue-800"
          >
            🎲 RANDOM
          </button>
        </div>
        
        {mutation.isError && (
          <div className="bg-gradient-to-br from-red-100 to-orange-100 border-4 border-red-500 text-red-900 px-6 py-5 rounded-xl shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">❌</span>
              <span className="font-black text-xl">BATTLE ERROR!</span>
            </div>
            <p className="text-base font-semibold pl-12">
              {mutation.error?.response?.data?.detail || mutation.error?.message || 'Failed to start battle. Please try again.'}
            </p>
            <p className="text-sm pl-12 mt-3 text-gray-700 font-bold">
              💡 Try: "pikachu", "charizard", "blaziken", "lucario"
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

