import React from 'react'
import { useBattleStore } from '../store/battleStore'
import HPBar from './HPBar'
import MovePad from './MovePad'
import BattleLog from './BattleLog'

export default function Arena() {
  const { player, opponent, sessionState } = useBattleStore()
  const [playerAttacking, setPlayerAttacking] = React.useState(false)
  const [opponentAttacking, setOpponentAttacking] = React.useState(false)
  const [displayedHP, setDisplayedHP] = React.useState<{player: number, opponent: number} | null>(null)
  const prevLogLength = React.useRef(sessionState?.log.length || 0)
  const animationQueue = React.useRef<Array<{isPlayer: boolean, updateHP: () => void}>>([])
  const isAnimating = React.useRef(false)
  
  // Initialize displayed HP
  React.useEffect(() => {
    if (sessionState && !displayedHP) {
      setDisplayedHP({ player: sessionState.player.hp, opponent: sessionState.opponent.hp })
    }
  }, [sessionState, displayedHP])
  
  
  if (!player || !opponent || !sessionState) {
    return null
  }
  
  // Use displayed HP if available, otherwise use sessionState HP
  const playerHP = displayedHP ? displayedHP.player : sessionState.player.hp
  const opponentHP = displayedHP ? displayedHP.opponent : sessionState.opponent.hp
  const playerState = { ...sessionState.player, hp: playerHP }
  const opponentState = { ...sessionState.opponent, hp: opponentHP }
  
  // Detect when an attack happens by checking log length
  React.useEffect(() => {
    if (sessionState.log.length > prevLogLength.current) {
      // Check all new log entries, not just the last one
      const newEntries = sessionState.log.slice(prevLogLength.current)
      
      for (const entry of newEntries) {
        // Check if player's Pokemon attacked
        if (entry.includes(player.name.toUpperCase()) && entry.includes('used') && !entry.includes('missed')) {
          animationQueue.current.push({
            isPlayer: true,
            updateHP: () => {
              // Update opponent HP (player dealt damage to opponent)
              setDisplayedHP(prev => {
                if (!prev) return prev
                return { ...prev, opponent: sessionState.opponent.hp }
              })
              setPlayerAttacking(true)
              setTimeout(() => setPlayerAttacking(false), 800)
            }
          })
        }
        
        // Check if opponent's Pokemon attacked
        if (entry.includes(opponent.name.toUpperCase()) && entry.includes('used') && !entry.includes('missed')) {
          animationQueue.current.push({
            isPlayer: false,
            updateHP: () => {
              // Update player HP (opponent dealt damage to player)
              setDisplayedHP(prev => {
                if (!prev) return prev
                return { ...prev, player: sessionState.player.hp }
              })
              setOpponentAttacking(true)
              setTimeout(() => setOpponentAttacking(false), 800)
            }
          })
        }
      }
      
      // Process animation queue sequentially
      if (!isAnimating.current && animationQueue.current.length > 0) {
        isAnimating.current = true
        
        const processQueue = () => {
          if (animationQueue.current.length > 0) {
            const animData = animationQueue.current.shift()!
            animData.updateHP() // This triggers the HP update and animation
            setTimeout(processQueue, 900) // Wait for animation to complete before next
          } else {
            isAnimating.current = false
          }
        }
        
        processQueue()
      }
    }
    prevLogLength.current = sessionState.log.length
  }, [sessionState.log, sessionState.player.hp, sessionState.opponent.hp, player.name, opponent.name])
  
  const isOpponentTurn = sessionState.turn === 'opponent'
  const isDisabled = isOpponentTurn || !!sessionState.winner
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-4">
      {/* Top bar */}
      <div className="flex justify-between items-center bg-gradient-to-r from-red-600 via-red-500 to-red-600 p-4 rounded-2xl shadow-2xl border-4 border-yellow-400 animate-pulse-slow mb-4">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-2xl">POKEMON BATTLE</h1>
          <div className="flex items-center gap-2">
            {sessionState.turn === 'player' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-400 text-black border-2 border-yellow-300 shadow-lg animate-pulse">
                GO!
              </span>
            )}
            {sessionState.turn === 'opponent' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-300 text-blue-900 border-2 border-blue-400 shadow-lg">
                Thinking...
              </span>
            )}
            {sessionState.winner && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-500 text-black border-2 border-yellow-300 shadow-lg">
                FINISHED!
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-xl font-bold hover:from-yellow-300 hover:to-orange-400 transition-all shadow-xl hover:shadow-2xl transform hover:scale-110 border-2 border-yellow-300"
        >
          NEW BATTLE
        </button>
      </div>
      
      {/* Top row - Pokemon side by side with battle log */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Player Pokémon - Left */}
        <div className="flex">
          <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-2xl p-4 border-4 border-green-400 w-full transform transition-all h-[500px] overflow-hidden ${playerAttacking ? 'animate-attack border-yellow-400 shadow-yellow-400 scale-105' : 'hover:scale-[1.01]'}`}>
            <HPBar
              state={playerState}
              name={player.name}
              sprite={player.sprite}
              isPlayer={true}
              isAttacking={playerAttacking}
            />
          </div>
        </div>
        
        {/* Battle Log - Center */}
        <div className="flex">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-4 border-4 border-gray-600 w-full flex flex-col h-[500px]">
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-yellow-300">
              BATTLE LOG
            </h3>
            <div className="flex-1 overflow-hidden">
              <BattleLog log={sessionState.log} />
            </div>
          </div>
        </div>
        
        {/* Opponent Pokémon - Right */}
        <div className="flex">
          <div className={`bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-2xl p-4 border-4 border-blue-400 w-full transform transition-all h-[500px] overflow-hidden ${opponentAttacking ? 'animate-attack border-yellow-400 shadow-yellow-400 scale-105' : 'hover:scale-[1.01]'}`}>
            <HPBar
              state={opponentState}
              name={opponent.name}
              sprite={opponent.sprite}
              isPlayer={false}
              isAttacking={opponentAttacking}
            />
          </div>
        </div>
      </div>
      
      {/* Bottom - Move Pad (full width) */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl p-6 border-4 border-purple-400">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-800">
          CHOOSE YOUR MOVE
          <span className="text-sm font-normal text-purple-600">(Press 1-4)</span>
        </h3>
        <MovePad moves={player.moves} disabled={isDisabled} />
      </div>
      
      {/* Winner message */}
      {sessionState.winner && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-400 rounded-2xl shadow-2xl p-8 text-center border-4 border-yellow-300 animate-bounce">
          <h2 className="text-5xl font-black text-black mb-3 uppercase drop-shadow-2xl tracking-wider">
            {sessionState.winner === 'player' ? 'VICTORY!' : 'DEFEAT!'}
          </h2>
          <p className="text-2xl text-black font-bold opacity-90">
            {sessionState.winner === 'player' 
              ? 'You defeated your opponent!' 
              : 'Try again, Trainer!'}
          </p>
        </div>
      )}
    </div>
  )
}

