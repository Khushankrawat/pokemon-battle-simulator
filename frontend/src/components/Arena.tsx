import { useBattleStore } from '../store/battleStore'
import HPBar from './HPBar'
import MovePad from './MovePad'
import BattleLog from './BattleLog'

export default function Arena() {
  const { player, opponent, sessionState } = useBattleStore()
  
  if (!player || !opponent || !sessionState) {
    return null
  }
  
  const isOpponentTurn = sessionState.turn === 'opponent'
  const isDisabled = isOpponentTurn || !!sessionState.winner
  
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Top bar */}
      <div className="flex justify-between items-center bg-gradient-to-r from-red-600 via-red-500 to-red-600 p-4 rounded-2xl shadow-2xl border-4 border-yellow-400 animate-pulse-slow">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-2xl">⚡ POKÉMON BATTLE ⚡</h1>
          <div className="flex items-center gap-2">
            {sessionState.turn === 'player' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-400 text-black border-2 border-yellow-300 shadow-lg animate-pulse">
                ⚡ GO!
              </span>
            )}
            {sessionState.turn === 'opponent' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-blue-300 text-blue-900 border-2 border-blue-400 shadow-lg">
                ⏱️ Thinking...
              </span>
            )}
            {sessionState.winner && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-yellow-500 text-black border-2 border-yellow-300 shadow-lg">
                🏆 FINISHED!
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-br from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-xl font-bold hover:from-yellow-300 hover:to-orange-400 transition-all shadow-xl hover:shadow-2xl transform hover:scale-110 border-2 border-yellow-300"
        >
          🆕 NEW BATTLE
        </button>
      </div>
      
      {/* Opponent */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-2xl p-6 border-4 border-blue-400 transform hover:scale-[1.01] transition-transform">
        <HPBar
          state={sessionState.opponent}
          name={opponent.name}
          sprite={opponent.sprite}
          isPlayer={false}
        />
      </div>
      
      {/* Battle Log */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border-4 border-gray-600">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-300">
          📜 BATTLE LOG
        </h3>
        <BattleLog log={sessionState.log} />
      </div>
      
      {/* Player Pokémon */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-2xl p-6 border-4 border-green-400 transform hover:scale-[1.01] transition-transform">
        <HPBar
          state={sessionState.player}
          name={player.name}
          sprite={player.sprite}
          isPlayer={true}
        />
      </div>
      
      {/* Move Pad */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-2xl p-6 border-4 border-purple-400">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-800">
          ⚡ CHOOSE YOUR MOVE
          <span className="text-sm font-normal text-purple-600">(Press 1-4)</span>
        </h3>
        <MovePad moves={player.moves} disabled={isDisabled} />
      </div>
      
      {/* Winner message */}
      {sessionState.winner && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-400 rounded-2xl shadow-2xl p-8 text-center border-4 border-yellow-300 animate-bounce">
          <div className="text-8xl mb-4 animate-bounce">
            {sessionState.winner === 'player' ? '🏆' : '❌'}
          </div>
          <h2 className="text-5xl font-black text-black mb-3 uppercase drop-shadow-2xl tracking-wider">
            {sessionState.winner === 'player' ? 'VICTORY!' : 'DEFEAT!'}
          </h2>
          <p className="text-2xl text-black font-bold opacity-90">
            {sessionState.winner === 'player' 
              ? '🌟 You defeated your opponent! 🌟' 
              : '💪 Try again, Trainer! 💪'}
          </p>
        </div>
      )}
    </div>
  )
}

