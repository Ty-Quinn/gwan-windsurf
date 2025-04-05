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
        <h1 className="text-4xl font-bold text-primary mb-2 md:mb-0 flex items-center drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]" style={{ textShadow: '0 0 10px rgba(255,215,0,0.4)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="rgba(255,215,0,0.1)" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 drop-shadow-[0_0_3px_rgba(255,215,0,0.6)]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
          GWAN
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="rgba(255,215,0,0.1)" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 drop-shadow-[0_0_3px_rgba(255,215,0,0.6)]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
        </h1>
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
