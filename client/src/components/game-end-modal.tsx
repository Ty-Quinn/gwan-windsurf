"use client"

import { Button } from "@/components/ui/button"
import type { Player } from "@/lib/types"
import { motion } from "framer-motion"
import { useLocation } from "wouter"

interface GameEndModalProps {
  players: Player[]
  gameWinner?: number
  onPlayAgain: () => void
  onNewMatch: () => void
}

export default function GameEndModal({
  players,
  gameWinner,
  onPlayAgain,
  onNewMatch,
}: GameEndModalProps) {
  const [_, setLocation] = useLocation()
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full"
      >
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Match Complete!</h3>
          <div className="text-3xl font-bold text-yellow-400 mt-4">
            {gameWinner !== undefined
              ? `Player ${gameWinner + 1} Wins!`
              : "The Match is Tied!"}
          </div>
          <p className="text-muted-foreground mt-2">
            {gameWinner !== undefined
              ? `Player ${gameWinner + 1} has won 2 out of 3 rounds`
              : "Neither player won 2 rounds"}
          </p>
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
            onClick={onNewMatch}
            className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500"
          >
            Start New Match
          </Button>
          <Button 
            onClick={() => setLocation("/")}
            variant="ghost"
            className="w-full"
          >
            Return to Main Menu
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
