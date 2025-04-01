"use client"

import { Button } from "@/components/ui/button"
import type { Player } from "@/lib/types"

interface RoundSummaryModalProps {
  players: Player[]
  roundWinner?: number
  roundTied: boolean
  onContinue: () => void
}

export default function RoundSummaryModal({
  players,
  roundWinner,
  roundTied,
  onContinue,
}: RoundSummaryModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl font-bold mb-4 text-center">Round Complete!</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center">
            <h4 className="font-semibold">Player 1</h4>
            <div className="text-3xl font-bold text-primary my-2">{players[0].score}</div>
            {roundWinner === 0 && (
              <div className="inline-block px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full">
                Winner
              </div>
            )}
          </div>
          <div className="text-center">
            <h4 className="font-semibold">Player 2</h4>
            <div className="text-3xl font-bold text-primary my-2">{players[1].score}</div>
            {roundWinner === 1 && (
              <div className="inline-block px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full">
                Winner
              </div>
            )}
          </div>
        </div>
        
        {roundTied && (
          <div className="text-center mb-4 p-2 bg-secondary/30 rounded-lg">
            <p className="text-lg font-semibold">Round Tied!</p>
          </div>
        )}
        
        <div className="mb-6">
          <h4 className="font-semibold mb-2">Rounds Won</h4>
          <div className="flex justify-center space-x-8">
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Player 1</span>
              <div className="text-2xl font-bold text-yellow-400">{players[0].roundsWon}</div>
            </div>
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Player 2</span>
              <div className="text-2xl font-bold text-yellow-400">{players[1].roundsWon}</div>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={onContinue}
          className="w-full"
        >
          Continue to Next Round
        </Button>
      </div>
    </div>
  )
}
