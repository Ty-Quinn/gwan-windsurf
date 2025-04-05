"use client"

import { useState, useEffect } from "react"
import { Card } from "@/lib/types"
import DiceRoller from "./dice-roller"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import CardComponent from "./card"
import { BadgeCheck, BadgeX } from "lucide-react"

interface SniperDiceModalProps {
  open: boolean
  card: Card | null
  onComplete: (diceValues: number[], isDoubles: boolean) => void
  onCancel: () => void
}

export default function SniperDiceModal({ open, card, onComplete, onCancel }: SniperDiceModalProps) {
  const [diceResults, setDiceResults] = useState<number[]>([])
  const [isDoubles, setIsDoubles] = useState<boolean>(false)
  
  // When a new card is provided, reset the state
  useEffect(() => {
    setDiceResults([])
    setIsDoubles(false)
  }, [card])
  
  // Handle dice roll completion
  const handleDiceRollComplete = (results: number[], total: number) => {
    setDiceResults(results)
    
    // Check if the roll is doubles (same value on both dice)
    const isDiceDoubles = results.length === 2 && results[0] === results[1]
    setIsDoubles(isDiceDoubles)
  }
  
  // Handle confirmation of the roll
  const handleConfirm = () => {
    if (diceResults.length > 0) {
      onComplete(diceResults, isDoubles)
    }
  }
  
  if (!card) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-md md:max-w-xl text-center">
        <DialogHeader>
          <DialogTitle className="text-xl">Sniper Card Dice Roll</DialogTitle>
          <DialogDescription>
            Roll 2d6 with your Sniper card ({card.value} of {card.suit}). If you roll doubles, you'll eliminate your opponent's highest card!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center my-4">
          <CardComponent card={card} compact={false} hideLabel={true} />
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
              
              <div className="flex justify-center items-center mt-3">
                {isDoubles ? (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center text-green-500">
                      <BadgeCheck className="mr-1" />
                      <span className="text-xl font-bold">Doubles!</span>
                    </div>
                    <p className="mt-2 text-sm">Your sniper will eliminate your opponent's highest card!</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center text-red-500">
                      <BadgeX className="mr-1" />
                      <span className="text-xl font-bold">Not Doubles</span>
                    </div>
                    <p className="mt-2 text-sm">Your sniper will be played as a regular card (value 2)</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={diceResults.length > 0} // Disable cancel after rolling
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={diceResults.length === 0}
            className="ml-2"
          >
            Confirm Card Play
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}