"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface MultiplayerTargetRowModalProps {
  onSelectRow: (row: string) => void
  onCancel: () => void
}

export default function MultiplayerTargetRowModal({ 
  onSelectRow, 
  onCancel 
}: MultiplayerTargetRowModalProps) {
  return (
    <Dialog open={true} onOpenChange={() => onCancel()}>
      <DialogContent className="sm:max-w-md bg-[#2a1a14] border-amber-800 text-amber-100">
        <DialogHeader>
          <DialogTitle className="text-amber-400">Select Target Row</DialogTitle>
          <DialogDescription className="text-amber-200">
            Choose a row to place this card on.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 py-4">
          <Button
            className="bg-amber-800 hover:bg-amber-700 text-amber-100"
            onClick={() => onSelectRow("clubs")}
          >
            Infantry (Clubs)
          </Button>
          
          <Button
            className="bg-amber-800 hover:bg-amber-700 text-amber-100"
            onClick={() => onSelectRow("spades")}
          >
            Archer (Spades)
          </Button>
          
          <Button
            className="bg-amber-800 hover:bg-amber-700 text-amber-100"
            onClick={() => onSelectRow("diamonds")}
          >
            Ballista (Diamonds)
          </Button>
        </div>
        
        <Button
          variant="outline"
          className="border-amber-500/50 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  )
}
