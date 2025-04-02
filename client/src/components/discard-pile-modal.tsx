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
  DialogClose
} from "@/components/ui/dialog"

interface DiscardPileModalProps {
  player: Player
  onClose: () => void
}

export default function DiscardPileModal({
  player,
  onClose
}: DiscardPileModalProps) {
  const [open, setOpen] = useState(true)
  
  const handleClose = () => {
    setOpen(false)
    onClose()
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Discard Pile ({player.discardPile.length} cards)</DialogTitle>
          <DialogDescription>
            Cards that have been played in previous rounds. Some of these may be revived by playing a Medic card (3).
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-[60vh] overflow-y-auto p-2">
          {player.discardPile.map((card, index) => (
            <div key={`discard-${index}`} className="relative">
              <CardComponent
                card={card}
                compact={true}
                disabled={true}
              />
            </div>
          ))}
          
          {player.discardPile.length === 0 && (
            <div className="col-span-4 text-center py-8 text-muted-foreground">
              No cards in discard pile yet
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}