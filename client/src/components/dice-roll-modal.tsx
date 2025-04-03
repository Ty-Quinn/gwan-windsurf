"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import DiceRoller from "./dice-roller"

interface DiceRollModalProps {
  open: boolean
  onDiceRollComplete: (firstPlayerIndex: number) => void
}

export default function DiceRollModal({ open, onDiceRollComplete }: DiceRollModalProps) {
  const [player1Roll, setPlayer1Roll] = useState<number | null>(null)
  const [player2Roll, setPlayer2Roll] = useState<number | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [winner, setWinner] = useState<number | null>(null)
  const [tie, setTie] = useState(false)
  
  // Reset state when modal is opened
  useEffect(() => {
    if (open) {
      setPlayer1Roll(null)
      setPlayer2Roll(null)
      setCurrentPlayer(0)
      setWinner(null)
      setTie(false)
    }
  }, [open])
  
  // Determine winner when both players have rolled
  useEffect(() => {
    if (player1Roll !== null && player2Roll !== null) {
      if (player1Roll > player2Roll) {
        setWinner(0)
        setTie(false)
      } else if (player2Roll > player1Roll) {
        setWinner(1)
        setTie(false)
      } else {
        // It's a tie, reset for another roll
        setTie(true)
        setPlayer1Roll(null)
        setPlayer2Roll(null)
        setCurrentPlayer(0)
      }
    }
  }, [player1Roll, player2Roll])
  
  const handleRollComplete = (results: number[], total: number) => {
    if (currentPlayer === 0) {
      setPlayer1Roll(total)
      setCurrentPlayer(1)
    } else {
      setPlayer2Roll(total)
    }
  }
  
  const handleContinue = () => {
    if (winner !== null) {
      onDiceRollComplete(winner)
    }
  }
  
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Roll for First Turn</DialogTitle>
          <DialogDescription>
            {tie 
              ? "It's a tie! Roll again to determine who goes first."
              : "Each player rolls a 20-sided die. Highest roll goes first."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="flex flex-col items-center space-y-2">
            <h3 className="font-semibold">Player 1</h3>
            <div className="text-xl font-bold">
              {player1Roll !== null ? player1Roll : "-"}
            </div>
            <DiceRoller 
              sides={20} 
              count={1} 
              onRollComplete={handleRollComplete}
              disabled={currentPlayer !== 0 || player1Roll !== null} 
            />
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <h3 className="font-semibold">Player 2</h3>
            <div className="text-xl font-bold">
              {player2Roll !== null ? player2Roll : "-"}
            </div>
            <DiceRoller 
              sides={20} 
              count={1} 
              onRollComplete={handleRollComplete}
              disabled={currentPlayer !== 1 || player2Roll !== null} 
            />
          </div>
        </div>
        
        {winner !== null && (
          <div className="pt-4 text-center">
            <p className="text-lg font-bold mb-4">
              Player {winner + 1} wins the roll and goes first!
            </p>
            <Button onClick={handleContinue}>Continue to Game</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}