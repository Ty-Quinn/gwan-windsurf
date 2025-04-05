"use client"

import { useState } from 'react'
import { Player, Card } from "@/lib/types"
import CardComponent from "./card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface MedicRevivalModalProps {
  player: Player
  onSelectCard: (card: Card, index: number) => void
  onCancel: () => void
}

export default function MedicRevivalModal({
  player,
  onSelectCard,
  onCancel
}: MedicRevivalModalProps) {
  const [open, setOpen] = useState(true)
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  
  const handleClose = () => {
    setOpen(false)
    onCancel()
  }
  
  const handleRevive = () => {
    if (selectedCardIndex !== null) {
      const card = player.discardPile[selectedCardIndex]
      onSelectCard(card, selectedCardIndex)
      setOpen(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Revive a Card</DialogTitle>
          <DialogDescription>
            Your medic card allows you to revive one card from your discard pile. Select a card to add it to your hand.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto p-2">
          {player.discardPile.map((card, index) => (
            <div 
              key={`discard-${index}`} 
              className={`relative cursor-pointer transition-all duration-200 ${selectedCardIndex === index ? 'scale-105 ring-2 ring-primary rounded-lg' : ''}`}
              onClick={() => setSelectedCardIndex(index)}
            >
              <CardComponent
                card={card}
                compact={true}
                disabled={false}
                hideLabel={true}
              />
            </div>
          ))}
          
          {player.discardPile.length === 0 && (
            <div className="col-span-4 text-center py-8 text-muted-foreground">
              No cards in discard pile to revive
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleRevive}
            disabled={selectedCardIndex === null || player.discardPile.length === 0}
          >
            Revive Card
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}