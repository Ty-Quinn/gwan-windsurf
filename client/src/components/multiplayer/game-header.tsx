"use client"

import { Button } from "@/components/ui/button"
import type { GameState } from "@/lib/types"
import ScoreDisplay from "./score-display"
import { ArrowLeft } from "lucide-react"

interface MultiplayerGameHeaderProps {
  gameState: GameState
  playerView: number
  opponent: string
  onShowRules: () => void
  onLeaveGame: () => Promise<void>
}

export default function MultiplayerGameHeader({
  gameState,
  playerView,
  opponent,
  onShowRules,
  onLeaveGame,
}: MultiplayerGameHeaderProps) {
  return (
    <header className="p-4 relative z-50">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-amber-400 mr-4">GWAN</h1>
          <Button
            variant="outline"
            className="border-amber-500/50 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100"
            onClick={onLeaveGame}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Leave Game
          </Button>
        </div>
        
        <div className="flex space-x-4 items-center">
          <div className="bg-black/30 px-4 py-2 rounded-lg">
            <span className="font-semibold text-amber-200">Round: </span>
            <span className="text-amber-400 font-bold">{gameState.currentRound}</span>
            <span className="mx-2 text-amber-600">/</span>
            <span className="text-amber-200">3</span>
          </div>
          
          <div className="bg-black/30 px-4 py-2 rounded-lg">
            <span className="font-semibold text-amber-200">Turn: </span>
            <span className="text-amber-400 font-bold">
              {gameState.currentPlayer === playerView ? "You" : opponent}
            </span>
          </div>
          
          <Button
            variant="outline"
            className="border-amber-500/50 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100"
            onClick={onShowRules}
          >
            Rules
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        <ScoreDisplay
          label="Your Score"
          score={gameState.players[playerView].score}
          roundsWon={gameState.players[playerView].roundsWon}
          highlight={gameState.currentPlayer === playerView}
        />
        
        <ScoreDisplay
          label={`${opponent}'s Score`}
          score={gameState.players[1 - playerView].score}
          roundsWon={gameState.players[1 - playerView].roundsWon}
          highlight={gameState.currentPlayer === 1 - playerView}
        />
      </div>
    </header>
  )
}
