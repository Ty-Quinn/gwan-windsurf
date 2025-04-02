"use client"

import { Button } from "@/components/ui/button"
import type { GameState } from "@/lib/types"
import ScoreDisplay from "./score-display"

interface GameHeaderProps {
  gameState: GameState
  playerView: number
  switchPlayerView: () => void
  message: string
  showRules: () => void
}

export default function GameHeader({
  gameState,
  playerView,
  switchPlayerView,
  message,
  showRules,
}: GameHeaderProps) {
  return (
    <header className="mb-8 relative z-50">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-3xl font-bold text-primary mb-2 md:mb-0">GWAN</h1>
        <div className="flex space-x-4">
          <div className="bg-card px-4 py-2 rounded-lg">
            <span className="font-semibold">Round: </span>
            <span className="text-primary font-bold">{gameState.currentRound}</span>
            <span className="mx-2 text-muted-foreground">/</span>
            <span>3</span>
          </div>
          <div className="bg-card px-4 py-2 rounded-lg">
            <span className="font-semibold">Deck: </span>
            <span>{gameState.deckCount}</span>
            <span className="text-muted-foreground"> cards</span>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={showRules}
              variant="outline"
            >
              Rules
            </Button>
          </div>
        </div>
      </div>
      
      {/* Score displays with animation */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {gameState.players.map((player, index) => (
          <ScoreDisplay 
            key={index}
            player={player}
            isActive={gameState.currentPlayer === index}
            playerNumber={index + 1}
          />
        ))}
      </div>
      
      <div className="mt-4 p-3 bg-card rounded-lg text-center">
        <p className="text-lg">{message}</p>
      </div>
    </header>
  )
}
