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
import { Trophy, Home } from "lucide-react"

interface MultiplayerGameEndModalProps {
  winner: number | undefined
  onClose: () => void
  onReturnToMenu: () => Promise<void>
}

export default function MultiplayerGameEndModal({ 
  winner, 
  onClose,
  onReturnToMenu
}: MultiplayerGameEndModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#2a1a14] border-amber-800 text-amber-100">
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-2xl flex items-center justify-center">
            <Trophy className="mr-2 h-6 w-6 text-amber-400" />
            Game Over!
          </DialogTitle>
          <DialogDescription className="text-amber-200 text-center text-lg">
            {winner === 0 ? "You won" : "Opponent won"} the game!
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <div className="bg-black/30 p-6 rounded-lg text-center">
            <h3 className="text-amber-400 font-semibold mb-2">Winner</h3>
            <p className="text-3xl font-bold text-amber-200">
              {winner === 0 ? "You" : "Opponent"}
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100"
            onClick={onClose}
          >
            View Final Board
          </Button>
          
          <Button 
            className="w-full bg-amber-800 hover:bg-amber-700 text-amber-100 flex items-center justify-center"
            onClick={onReturnToMenu}
          >
            <Home className="mr-2 h-4 w-4" />
            Return to Menu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
