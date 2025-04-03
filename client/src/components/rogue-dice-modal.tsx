"use client"

import { useState, useEffect } from "react"
import { Card } from "@/lib/types"
import DiceRoller from "./dice-roller"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import CardComponent from "./card"

interface RogueDiceModalProps {
  open: boolean
  card: Card | null
  onComplete: (diceValue: number) => void
  onCancel: () => void
}

export default function RogueDiceModal({ open, card, onComplete, onCancel }: RogueDiceModalProps) {
  const [diceTotal, setDiceTotal] = useState<number | null>(null)
  const [diceResults, setDiceResults] = useState<number[]>([])
  const [cardWithValue, setCardWithValue] = useState<Card | null>(null)
  
  // When a new card is provided, reset the state
  useEffect(() => {
    setDiceTotal(null)
    setDiceResults([])
    
    if (card) {
      setCardWithValue({ ...card, diceValue: undefined })
    } else {
      setCardWithValue(null)
    }
  }, [card])
  
  // Handle dice roll completion
  const handleDiceRollComplete = (results: number[], total: number) => {
    setDiceTotal(total)
    setDiceResults(results)
    
    // Update the card preview with the dice value
    if (card) {
      setCardWithValue({ ...card, diceValue: total })
    }
  }
  
  // Handle confirmation of the roll
  const handleConfirm = () => {
    if (diceTotal !== null) {
      onComplete(diceTotal)
    }
  }
  
  if (!card) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md md:max-w-xl text-center">
        <DialogHeader>
          <DialogTitle className="text-xl">Rogue Card Dice Roll</DialogTitle>
          <DialogDescription>
            Roll 2d6 to determine the value of your Rogue card ({card.value} of {card.suit})
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
          <div className="flex flex-col items-center justify-center">
            <p className="mb-2 text-muted-foreground">Original Card</p>
            <CardComponent card={card} compact={false} />
          </div>
          
          <div className="flex flex-col items-center justify-center">
            <p className="mb-2 text-muted-foreground">With Dice Value</p>
            {diceTotal !== null && cardWithValue ? (
              <CardComponent card={cardWithValue} compact={false} />
            ) : (
              <div className="w-28 h-40 flex items-center justify-center rounded-lg border-2 border-dashed border-primary/50">
                <p className="text-muted-foreground text-sm">Roll dice to see value</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="py-4 flex flex-col items-center">
          <DiceRoller 
            sides={6} 
            count={2} 
            onRollComplete={handleDiceRollComplete} 
            label="Roll 2d6" 
          />
          
          {diceResults.length > 0 && (
            <div className="my-4 p-3 bg-background/10 rounded-lg">
              <p className="text-lg">You rolled: <span className="font-bold">{diceResults.join(" + ")}</span></p>
              <p className="text-2xl font-bold text-primary">Total: {diceTotal}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Your Rogue card will have a value of {diceTotal} when played to the field
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={diceTotal === null}
            className="ml-2"
          >
            Confirm Card Play
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}