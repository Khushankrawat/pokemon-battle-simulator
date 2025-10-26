import { BattleState } from '../types'

interface HPBarProps {
  state: BattleState
  name: string
  sprite: string
  isPlayer: boolean
}

export default function HPBar({ state, name, sprite, isPlayer }: HPBarProps) {
  const percentage = (state.hp / state.max_hp) * 100
  
  let barColor = 'bg-gradient-to-r from-green-500 to-green-400'
  let bgColor = 'from-green-50 to-emerald-50'
  if (percentage < 25) {
    barColor = 'bg-gradient-to-r from-red-600 to-red-500'
    bgColor = 'from-red-50 to-rose-50'
  } else if (percentage < 50) {
    barColor = 'bg-gradient-to-r from-yellow-500 to-yellow-400'
    bgColor = 'from-yellow-50 to-amber-50'
  }
  
  return (
    <div className={`flex items-center gap-6 ${isPlayer ? 'flex-row' : 'flex-row-reverse'}`}>
      <div className="flex-shrink-0 relative">
        <div className={`bg-gradient-to-br ${bgColor} p-4 rounded-3xl border-4 border-white shadow-2xl transform hover:scale-105 transition-transform`}>
          <img 
            src={sprite} 
            alt={name} 
            className="w-40 h-40 object-contain drop-shadow-2xl"
          />
        </div>
        {/* Status indicator */}
        {percentage < 25 && (
          <div className="absolute -top-3 -right-3 bg-gradient-to-br from-red-600 to-red-700 rounded-full p-3 animate-bounce border-4 border-white shadow-xl">
            <span className="text-3xl">⚡</span>
          </div>
        )}
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-3xl font-black text-gray-900 capitalize tracking-wide">{name}</div>
          <div className="text-xl font-bold text-gray-800 bg-yellow-100 px-4 py-2 rounded-xl border-2 border-yellow-400">
            HP: {state.hp} / {state.max_hp}
          </div>
        </div>
        <div className="w-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-full h-12 shadow-inner border-4 border-white overflow-hidden">
          <div 
            className={`${barColor} h-full rounded-full transition-all duration-700 flex items-center justify-end pr-4 shadow-inner border-r-4 border-white`}
            style={{ width: `${percentage}%` }}
          >
            <span className="text-sm font-black text-white drop-shadow-lg">{Math.round(percentage)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

