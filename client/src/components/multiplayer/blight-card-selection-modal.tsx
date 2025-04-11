"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BlightCard } from "@/lib/types"

interface BlightCardSelectionModalProps {
  availableCards: BlightCard[]
  onSelectCard: (cardId: string) => void
}

export default function BlightCardSelectionModal({ 
  availableCards, 
  onSelectCard 
}: BlightCardSelectionModalProps) {
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  
  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md bg-[#2a1a14] border-amber-800 text-amber-100">
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-xl">
            Select a Blight Card
          </DialogTitle>
          <DialogDescription className="text-amber-200">
            Choose a blight card to activate its effect.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 py-4">
          {availableCards.map((card) => (
            <div 
              key={card.id}
              className={`p-3 rounded-lg cursor-pointer transition-all ${
                selectedCard === card.id 
                  ? "bg-amber-800 border-2 border-amber-400" 
                  : "bg-black/30 border border-amber-900/30 hover:bg-amber-900/30"
              }`}
              onClick={() => setSelectedCard(card.id)}
            >
              <div className="font-semibold text-amber-300">{card.name}</div>
              <div className="text-sm text-amber-200 mt-1">{card.description}</div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            className="border-amber-500/50 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100"
            onClick={() => onSelectCard(selectedCard || availableCards[0]?.id || "")}
            disabled={!selectedCard && availableCards.length === 0}
          >
            Select
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
