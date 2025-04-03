'use client'

import { useState } from 'react'
import { BlightCard, BlightEffect } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import DiceRoller from './dice-roller'

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
  const [diceResults, setDiceResults] = useState<number[]>([])
  const [totalValue, setTotalValue] = useState(0)
  const [rollCount, setRollCount] = useState(0)
  const [sixCount, setSixCount] = useState(0)
  const [success, setSuccess] = useState(false)
  const [rolling, setRolling] = useState(false)

  // For effects that need multiple dice rolls (like DEVIL)
  const [isMultiRoll, setIsMultiRoll] = useState(effect === BlightEffect.DEVIL)
  const [devilRolls, setDevilRolls] = useState<number[][]>([])

  // Configure dice based on effect
  const getDiceConfig = () => {
    switch (effect) {
      case BlightEffect.MAGICIAN:
        return { sides: 20, count: 1 }
      case BlightEffect.WHEEL:
        return { sides: 10, count: 1 }
      case BlightEffect.DEVIL:
        return { sides: 6, count: 3 }
      default:
        return { sides: 6, count: 1 }
    }
  }

  const handleDiceRollComplete = (results: number[], total: number) => {
    setDiceResults(results)
    setTotalValue(total)
    setRolling(false)

    if (effect === BlightEffect.DEVIL) {
      // Count sixes for the Devil effect
      const newSixCount = results.filter(r => r === 6).length
      setSixCount(sixCount + newSixCount)
      setDevilRolls([...devilRolls, results])
      setRollCount(rollCount + 1)
      
      // Check if we got three 6s or if we've reached max rolls
      if (sixCount + newSixCount >= 3) {
        setSuccess(true)
      } else if (rollCount + 1 >= 6) {
        setSuccess(false)
        // Auto-complete after max rolls
        setTimeout(() => {
          onComplete(effect, [...devilRolls, results].flat(), false)
        }, 1500)
      }
    } else {
      // For other effects, determine success based on the effect
      if (effect === BlightEffect.MAGICIAN) {
        // Success will be determined by the game logic comparing to row value
        setSuccess(true)
      } else if (effect === BlightEffect.WHEEL) {
        // Wheel is always successful, adds points
        setSuccess(true)
      }
    }
  }

  const handleConfirm = () => {
    if (effect === BlightEffect.DEVIL) {
      onComplete(effect, devilRolls.flat(), sixCount >= 3)
    } else {
      onComplete(effect, diceResults, success)
    }
  }

  const handleRollAgain = () => {
    if (rollCount < 6 && sixCount < 3) {
      setRolling(true)
    }
  }

  // Determine title and description based on effect
  let title = "Roll Dice"
  let description = ""

  switch (effect) {
    case BlightEffect.MAGICIAN:
      title = "The Magician - Roll d20"
      description = "Roll a d20. If your roll exceeds the targeted row's value, all cards in that row will be destroyed."
      break
    case BlightEffect.WHEEL:
      title = "Wheel of Fortune - Roll d10"
      description = "Roll a d10 to determine bonus points."
      break
    case BlightEffect.DEVIL:
      title = "The Devil - Roll 3d6"
      description = "Roll 3d6 up to 6 times. If you roll three 6's, you can revive a card from either discard pile."
      break
  }

  // Render result message
  const renderResultMessage = () => {
    if (rolling) return <p className="text-center py-2">Rolling...</p>
    
    if (diceResults.length === 0) return null

    if (effect === BlightEffect.DEVIL) {
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 justify-center">
            {devilRolls.map((roll, index) => (
              <div key={index} className="bg-card p-2 rounded">
                <span className="text-xs text-muted-foreground">Roll {index + 1}:</span>
                <div className="flex gap-1 font-mono">
                  {roll.map((die, dieIndex) => (
                    <span 
                      key={dieIndex}
                      className={`px-2 py-1 rounded ${die === 6 ? 'bg-red-600/20 text-red-400 font-bold' : ''}`}
                    >
                      {die}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <p className="text-center">
            {sixCount >= 3 ? 
              <span className="text-green-500 font-medium">Success! You rolled three 6's and can revive a card!</span> : 
              <span className="text-muted-foreground">
                {rollCount >= 6 ? 
                  "Failed to roll three 6's in six attempts." : 
                  `You need ${3 - sixCount} more 6's in ${6 - rollCount} attempts.`
                }
              </span>
            }
          </p>
        </div>
      )
    } 
    else if (effect === BlightEffect.WHEEL) {
      return <p className="text-center py-2 text-lg font-medium">You rolled a {totalValue}! {totalValue} points will be added to your score.</p>
    }
    else {
      return <p className="text-center py-2 text-lg font-medium">You rolled a {totalValue}!</p>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {blightCard?.icon && <span className="text-3xl">{blightCard.icon}</span>}
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          {devilRolls.length === 0 && (
            <DiceRoller
              {...getDiceConfig()}
              onRollComplete={handleDiceRollComplete}
              autoRoll={false}
              disabled={rolling || 
                (effect === BlightEffect.DEVIL && (rollCount >= 6 || sixCount >= 3))}
            />
          )}

          {renderResultMessage()}

          {effect === BlightEffect.DEVIL && rollCount > 0 && rollCount < 6 && sixCount < 3 && (
            <Button 
              onClick={handleRollAgain}
              variant="secondary"
              disabled={rolling}
            >
              Roll Again ({rollCount}/6)
            </Button>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={diceResults.length === 0 || 
              (effect === BlightEffect.DEVIL && rollCount === 0)}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}