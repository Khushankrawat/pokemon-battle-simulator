import React from 'react'

interface BattleLogProps {
  log: string[]
}

export default function BattleLog({ log }: BattleLogProps) {
  const logEndRef = React.useRef<HTMLDivElement>(null)
  
  React.useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])
  
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-6 h-80 overflow-y-auto shadow-2xl border-4 border-yellow-500">
      <div className="space-y-3">
        {log.map((entry, index) => (
          <div 
            key={index} 
            className="text-white text-base font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-opacity-90 rounded-xl px-5 py-3 border-l-4 border-yellow-400 shadow-lg hover:bg-opacity-100 transition-all hover:scale-[1.02] transform"
          >
            <span className="inline-block mr-2 text-yellow-300">⚡</span>
            {entry}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}
