import { useBattleStore } from './store/battleStore'
import StartSessionForm from './components/StartSessionForm'
import Arena from './components/Arena'

export default function App() {
  const { sessionId } = useBattleStore()
  
  return (
    <div className="min-h-screen py-8">
      {!sessionId ? <StartSessionForm /> : <Arena />}
    </div>
  )
}

