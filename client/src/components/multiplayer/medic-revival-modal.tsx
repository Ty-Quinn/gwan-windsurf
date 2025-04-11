"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card } from "@/lib/types"
import CardComponent from "./card"

interface MedicRevivalModalProps {
  discardPile: Card[]
  onSelectCard: (cardIndex: number) => void
  onCancel: () => void
}

export default function MedicRevivalModal({ 
  discardPile, 
  onSelectCard, 
  onCancel 
}: MedicRevivalModalProps) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  
  const handleSelectCard = () => {
    if (selectedCardIndex !== null) {
      onSelectCard(selectedCardIndex)
    } else {
      onCancel()
    }
  }
  
  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-md bg-[#2a1a14] border-amber-800 text-amber-100">
        <DialogHeader>
          <DialogTitle className="text-amber-400 text-xl">
            Medic Ability
          </DialogTitle>
          <DialogDescription className="text-amber-200">
            Select a card from the discard pile to revive.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {discardPile.length === 0 ? (
            <div className="text-center text-amber-200 py-4">
              No cards in discard pile.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2">
              {discardPile.map((card, index) => (
                <div 
                  key={`${card.suit}-${card.value}-${index}`}
                  className="cursor-pointer"
                  onClick={() => setSelectedCardIndex(index)}
                >
                  <CardComponent 
                    card={card} 
                    isSelected={selectedCardIndex === index}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex space-x-2">
          <Button
            variant="outline"
            className="border-amber-500/50 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100"
            onClick={onCancel}
          >
            Cancel
          </Button>
          
          <Button
            className="bg-amber-700 hover:bg-amber-600 text-amber-100"
            onClick={handleSelectCard}
            disabled={selectedCardIndex === null && discardPile.length > 0}
          >
            Revive Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
