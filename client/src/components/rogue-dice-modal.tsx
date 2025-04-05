
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Rogue Card Dice Roll</DialogTitle>
          <DialogDescription>
            Roll 2d6 to determine the value of your Rogue card ({card.value} of {card.suit})
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 my-2">
          <div className="flex flex-col items-center">
            <p className="mb-1 text-xs text-muted-foreground">Original Card</p>
            <CardComponent card={card} compact={true} />
          </div>
          
          <div className="flex flex-col items-center">
            <p className="mb-1 text-xs text-muted-foreground">With Dice Value</p>
            {diceTotal !== null && cardWithValue ? (
              <CardComponent card={cardWithValue} compact={true} />
            ) : (
              <div className="w-20 h-28 flex items-center justify-center rounded-lg border-2 border-dashed border-primary/50">
                <p className="text-muted-foreground text-xs text-center">Roll dice<br/>to see</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="py-2">
          <DiceRoller 
            sides={6} 
            count={2} 
            onRollComplete={handleDiceRollComplete} 
            disabled={diceTotal !== null}
          />
          
          {diceResults.length > 0 && (
            <div className="mt-2 p-2 bg-background/10 rounded-lg text-center">
              <p className="text-sm">You rolled: <span className="font-bold">{diceResults.join(" + ")} = {diceTotal}</span></p>
              {diceTotal !== null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Your Rogue card will have a value of {diceTotal} when played
                </p>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onCancel} size="sm">Cancel</Button>
          <Button 
            onClick={handleConfirm} 
            disabled={diceTotal === null}
            size="sm"
          >
            Confirm Card Play
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
