
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
        
        <div className="flex flex-col items-center my-2">
          {diceTotal !== null && cardWithValue ? (
            <>
              <div className="relative">
                <CardComponent card={cardWithValue} compact={false} hideLabel={true} />
                <div className="absolute top-2 right-2 bg-amber-900 border-2 border-amber-500 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-amber-400 font-bold text-xl">{diceTotal}</span>
                </div>
              </div>
              <p className="mt-2 text-center text-sm">
                Your Rogue card value has been set to <span className="font-bold">{diceTotal}</span>
              </p>
            </>
          ) : (
            <>
              <CardComponent card={card} compact={false} hideLabel={true} />
              <p className="mt-2 text-center text-sm text-muted-foreground">Roll dice to determine card value</p>
            </>
          )}
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
                  Your Rogue card will have a value of {diceTotal} when played to the field
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
