import { useContext } from 'react'
import { GameContext } from '../context/game-context'

export function useGame() {
  const context = useContext(GameContext)

  if (!context) {
    throw new Error('useGame must be used inside GameProvider')
  }

  return context
}

// Keep useChat as an alias for backward compatibility
export function useChat() {
  return useGame()
}
