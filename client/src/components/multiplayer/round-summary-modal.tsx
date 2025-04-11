"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Trophy, Scale } from "lucide-react"

interface MultiplayerRoundSummaryModalProps {
  winner: number | undefined
  tied: boolean
  onClose: () => void
  playerScores: number[]
}

export default function MultiplayerRoundSummaryModal({ 
  winner, 
  tied, 
  onClose,
  playerScores
}: MultiplayerRoundSummaryModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#2a1a14] border-amber-800 text-amber-100">
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-2xl flex items-center justify-center">
            {tied ? (
              <>
                <Scale className="mr-2 h-6 w-6 text-amber-400" />
                Round Tied!
              </>
            ) : (
              <>
                <Trophy className="mr-2 h-6 w-6 text-amber-400" />
                {winner === 0 ? "You" : "Opponent"} Won the Round!
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-amber-200 text-center text-lg">
            {tied ? (
              "The round ended in a tie. No player receives a point."
            ) : (
              `${winner === 0 ? "You" : "Opponent"} won this round and earned a point.`
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="text-amber-400 font-semibold mb-2">Your Score</h3>
              <p className="text-3xl font-bold text-amber-200">{playerScores[0]}</p>
            </div>
            
            <div className="bg-black/30 p-4 rounded-lg">
              <h3 className="text-amber-400 font-semibold mb-2">Opponent's Score</h3>
              <p className="text-3xl font-bold text-amber-200">{playerScores[1]}</p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100"
            onClick={onClose}
          >
            Continue to Next Round
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
