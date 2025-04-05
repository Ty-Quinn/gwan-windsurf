'use client'

import { useState, useEffect } from 'react'
import { BlightCard, BlightEffect } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

// Custom die component that takes a value and renders the appropriate face
const DieFace = ({ value }: { value: number }) => {
  // For d20 dice, just show the number
  if (value > 6) {
    return (
      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center relative">
        <span className="text-black font-bold text-xl">{value}</span>
      </div>
    )
  }
  
  // For d6 dice, show the traditional pips
  return (
    <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center relative">
      {value === 1 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-black rounded-full"></div>
        </div>
      )}
      {value === 2 && (
        <>
          <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-black rounded-full"></div>
        </>
      )}
      {value === 3 && (
        <>
          <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-black rounded-full"></div>
        </>
      )}
      {value === 4 && (
        <>
          <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-black rounded-full"></div>
        </>
      )}
      {value === 5 && (
        <>
          <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-black rounded-full"></div>
          </div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-black rounded-full"></div>
        </>
      )}
      {value === 6 && (
        <>
          <div className="absolute top-2 left-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute top-1/2 transform -translate-y-1/2 left-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute top-1/2 transform -translate-y-1/2 right-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 bg-black rounded-full"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 bg-black rounded-full"></div>
        </>
      )}
    </div>
  )
}

interface BlightDiceModalProps {
  open: boolean
  effect: BlightEffect
  blightCard: BlightCard | null
  onComplete: (effect: BlightEffect, diceResults: number[], success: boolean) => void
  onCancel: () => void
}

export default function BlightDiceModal({
  open,
  effect,
  blightCard,
  onComplete,
  onCancel
}: BlightDiceModalProps) {
  // Store all dice rolls
  const [rolls, setRolls] = useState<number[][]>([])
  
  // Current dice values to display
  const [currentDice, setCurrentDice] = useState<number[]>([])
  
  // Tracks animation state
  const [isRolling, setIsRolling] = useState(false)
  
  // Track Devil-specific state
  const [rollCount, setRollCount] = useState(0)
  const [sixCount, setSixCount] = useState(0)
  
  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setRolls([])
      setCurrentDice([])
      setIsRolling(false)
      setRollCount(0)
      setSixCount(0)
    }
  }, [open])

  // Roll the dice
  const handleRoll = () => {
    setIsRolling(true)
    
    // Generate the final dice values
    let finalValues: number[]
    
    if (effect === BlightEffect.DEVIL) {
      finalValues = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]
    } else if (effect === BlightEffect.MAGICIAN) {
      finalValues = [Math.floor(Math.random() * 20) + 1]
    } else if (effect === BlightEffect.WHEEL) {
      finalValues = [Math.floor(Math.random() * 20) + 1]
    } else {
      finalValues = [Math.floor(Math.random() * 6) + 1]
    }
    
    // Animate dice rolling
    let animationStep = 0
    const animationSteps = 10
    
    const animateRoll = () => {
      if (animationStep < animationSteps - 1) {
        // Show random values during animation with appropriate ranges
        const animationValues = finalValues.map((_, index) => {
          if (effect === BlightEffect.MAGICIAN || effect === BlightEffect.WHEEL) {
            // For d20 dice (Magician, Wheel)
            return Math.floor(Math.random() * 20) + 1
          } else {
            // For d6 dice (Devil, regular dice)
            return Math.floor(Math.random() * 6) + 1
          }
        })
        setCurrentDice(animationValues)
        animationStep++
        setTimeout(animateRoll, 70)
      } else {
        // Show final values at the end
        setCurrentDice(finalValues)
        setIsRolling(false)
        
        // Update roll history
        const newRolls = [...rolls, finalValues]
        setRolls(newRolls)
        
        // Handle Devil effect specifics
        if (effect === BlightEffect.DEVIL) {
          const newSixCount = finalValues.filter(v => v === 6).length
          setSixCount(prevCount => prevCount + newSixCount)
          setRollCount(prevCount => prevCount + 1)
        }
      }
    }
    
    // Start animation
    animateRoll()
  }

  // Get the total value of dice
  const getTotalValue = (dice: number[]) => dice.reduce((sum, val) => sum + val, 0)

  // Handle confirm button click
  const handleConfirm = () => {
    if (effect === BlightEffect.DEVIL) {
      onComplete(effect, rolls.flat(), sixCount >= 3)
    } else if (currentDice.length > 0) {
      onComplete(effect, currentDice, true)
    }
  }

  // Determine title and description based on effect
  let title = "Roll Dice"
  let description = ""

  switch (effect) {
    case BlightEffect.MAGICIAN:
      title = "The Magician - Roll d20"
      description = "Roll a d20. If your roll exceeds the combined value of all cards in the targeted row (without row bonus), all cards in that row will be discarded."
      break
    case BlightEffect.WHEEL:
      title = "Wheel of Fortune - Roll d20"
      description = "Roll a d20 to determine bonus points."
      break
    case BlightEffect.DEVIL:
      title = "The Devil - Roll 3d6"
      description = "Roll 3d6 up to 6 times. If you roll three 6's, you can revive a card from either discard pile."
      break
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {blightCard?.icon && <span className="text-3xl">{blightCard.icon}</span>}
            {title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {/* Display previous rolls - only for Devil effect, not for Wheel of Fortune */}
          {rolls.length > 0 && effect !== BlightEffect.WHEEL && (
            <div className="flex flex-wrap gap-2 justify-center">
              {rolls.map((roll, index) => (
                <div key={index} className="bg-amber-950/80 p-2 rounded-md">
                  {effect === BlightEffect.DEVIL && (
                    <div className="text-center mb-2">Roll {index + 1}:</div>
                  )}
                  <div className="flex justify-center space-x-2">
                    {roll.map((value, diceIndex) => (
                      <span 
                        key={diceIndex}
                        className={`px-2 py-1 rounded ${value === 6 ? 'text-red-500 font-bold' : ''}`}
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Devil-specific status */}
          {effect === BlightEffect.DEVIL && (
            <p className="text-center">
              {sixCount >= 3 ? 
                <span className="text-green-500 font-medium">Success! You rolled three 6's and can revive a card!</span> : 
                <span className="text-muted-foreground">
                  You need {3 - sixCount} more 6's in {6 - rollCount} attempts.
                </span>
              }
            </p>
          )}
          
          {/* Orange status text */}
          {effect === BlightEffect.DEVIL && rollCount < 6 && sixCount < 3 && (
            <p className="text-amber-500 text-center">
              ROLL ADDITIONAL DICE - YOU NEED {3 - sixCount} MORE 6'S IN {6 - rollCount} ATTEMPTS
            </p>
          )}
          
          {/* Current dice display */}
          {currentDice.length > 0 && (
            <div className="flex justify-center gap-4 my-2">
              {currentDice.map((value, index) => (
                <DieFace key={index} value={value} />
              ))}
            </div>
          )}
          
          {/* Total value */}
          {currentDice.length > 0 && (
            <div className="text-center">
              Total: {getTotalValue(currentDice)}
            </div>
          )}
          
          {/* Roll button */}
          {(
            // For WHEEL effect, only show if no dice have been rolled yet
            (effect === BlightEffect.WHEEL && currentDice.length === 0) ||
            // For DEVIL effect, show while under the roll limit and not enough 6's
            (effect === BlightEffect.DEVIL && rollCount < 6 && sixCount < 3) ||
            // For other effects, only show if no dice have been rolled yet
            (effect !== BlightEffect.WHEEL && effect !== BlightEffect.DEVIL && currentDice.length === 0)
          ) && (
            <Button 
              onClick={handleRoll} 
              disabled={isRolling}
              className="bg-amber-700 hover:bg-amber-600"
            >
              {isRolling ? 
                "Rolling..." : 
                rollCount === 0 ? 
                  (effect === BlightEffect.WHEEL ? "Roll 1D20" : "Roll 3d6") : 
                  `Roll Again (${rollCount}/6)`
              }
            </Button>
          )}
        </div>

        <DialogFooter className="flex justify-center gap-4">
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={currentDice.length > 0 || isRolling} // Disable cancel after rolling or during roll
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={currentDice.length === 0 || isRolling}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}