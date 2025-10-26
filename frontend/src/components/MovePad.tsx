import React from 'react'
import { Move } from '../types'
import { useMutation } from '@tanstack/react-query'
import { pokemonApi } from '../api/client'
import { useBattleStore } from '../store/battleStore'

const typeColors: Record<string, string> = {
  normal: 'bg-gray-500',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-500',
  grass: 'bg-green-500',
  ice: 'bg-cyan-400',
  fighting: 'bg-red-600',
  poison: 'bg-purple-600',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-600',
  bug: 'bg-green-600',
  rock: 'bg-yellow-800',
  ghost: 'bg-purple-900',
  dragon: 'bg-indigo-600',
  dark: 'bg-gray-800',
  steel: 'bg-gray-400',
  fairy: 'bg-pink-400',
}

interface MovePadProps {
  moves: Move[]
  disabled?: boolean
}

export default function MovePad({ moves, disabled }: MovePadProps) {
  const { sessionId, sessionState, updateSessionState } = useBattleStore()
  
  const mutation = useMutation({
    mutationFn: async (moveId: string) => {
      if (!sessionId) throw new Error('No session')
      return await pokemonApi.performAction(sessionId, moveId)
    },
    onSuccess: (response) => {
      updateSessionState(response.data.state)
    },
  })
  
  const handleMoveClick = React.useCallback((moveId: string) => {
    if (disabled || mutation.isPending) return
    mutation.mutate(moveId)
  }, [disabled, mutation])
  
  // Add keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isDisabledNow = disabled || mutation.isPending
      if (isDisabledNow) return
      if (e.key >= '1' && e.key <= '4') {
        const index = parseInt(e.key) - 1
        if (moves[index]) {
          handleMoveClick(moves[index].id)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [moves, disabled, mutation.isPending, handleMoveClick])
  
  const isOpponentTurn = sessionState?.turn === 'opponent'
  const isDisabled = disabled || mutation.isPending || isOpponentTurn || sessionState?.winner
  
  return (
    <div className="grid grid-cols-2 gap-5">
      {moves.map((move, index) => (
        <button
          key={move.id}
          onClick={() => handleMoveClick(move.id)}
          disabled={isDisabled}
          className={`
            relative bg-gradient-to-br from-white via-white to-blue-50 rounded-2xl p-6 text-left border-4 transition-all transform
            ${isDisabled 
              ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-100' 
              : 'hover:border-yellow-400 hover:shadow-2xl active:scale-95 border-gray-400 hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 hover:scale-105 hover:rotate-1'
            }
            ${mutation.isPending ? 'cursor-wait' : 'cursor-pointer'}
          `}
          title={`Press ${index + 1} to use ${move.name}`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-black text-xl capitalize text-gray-900 tracking-wide">{move.name}</span>
            <span className={`px-4 py-2 rounded-full text-sm font-black text-white uppercase ${typeColors[move.type] || 'bg-gray-500'} shadow-lg border-2 border-white`}>
              {move.type}
            </span>
          </div>
          <div className="text-base font-bold text-gray-700 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚡ POWER: {move.power}</span>
            </div>
            {move.accuracy < 100 && (
              <div className="flex items-center gap-2 text-orange-600">
                <span>🎯 ACCURACY: {move.accuracy}%</span>
              </div>
            )}
          </div>
          {!isDisabled && (
            <div className="absolute top-4 right-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-black rounded-full w-10 h-10 flex items-center justify-center text-lg font-black shadow-xl border-4 border-white">
              {index + 1}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

