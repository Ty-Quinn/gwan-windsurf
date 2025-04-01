"use client"

import { Button } from "@/components/ui/button"
import type { Player } from "@/lib/types"
import { useLocation } from "wouter"

interface GameEndModalProps {
  players: Player[]
  gameWinner?: number
  onPlayAgain: () => void
}

export default function GameEndModal({
  players,
  gameWinner,
  onPlayAgain,
}: GameEndModalProps) {
  const [_, setLocation] = useLocation()
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
          <div className="text-3xl font-bold text-yellow-400 mt-4">
            {gameWinner !== undefined
              ? `Player ${gameWinner + 1} Wins!`
              : "The Game is Tied!"}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold">Player 1</h4>
            <div className="text-2xl font-bold text-yellow-400 my-2">{players[0].roundsWon}</div>
            <div className="text-xs text-muted-foreground">Rounds Won</div>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold">Player 2</h4>
            <div className="text-2xl font-bold text-yellow-400 my-2">{players[1].roundsWon}</div>
            <div className="text-xs text-muted-foreground">Rounds Won</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={onPlayAgain}
            className="w-full"
          >
            Play Again
          </Button>
          <Button 
            onClick={() => setLocation("/")}
            variant="outline"
            className="w-full"
          >
            Return to Main Menu
          </Button>
        </div>
      </div>
    </div>
  )
}
