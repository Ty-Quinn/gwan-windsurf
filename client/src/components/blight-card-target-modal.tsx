'use client'

import { useState, useEffect } from 'react'
import { BlightEffect, Card, Field, Player } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CardComponent from './card'
import DiceRoller from './dice-roller'

interface BlightCardTargetModalProps {
  open: boolean
  effect: BlightEffect
  playerView: number
  players: Player[]
  onSelectTarget: (
    effect: BlightEffect, 
    targetPlayerIndex: number, 
    targetRowName?: keyof Field, 
    targetCardIndex?: number,
    diceResults?: number[],
    success?: boolean
  ) => void
  onCancel: () => void
}

export default function BlightCardTargetModal({
  open,
  effect,
  playerView,
  players,
  onSelectTarget,
  onCancel
}: BlightCardTargetModalProps) {
  // For Lovers effect, initialize with playerView, otherwise opponent
  const initialPlayerIndex = effect === BlightEffect.LOVERS ? playerView : (1 - playerView);
  
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(initialPlayerIndex)
  const [selectedRowName, setSelectedRowName] = useState<keyof Field | null>(null)
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)
  const [showDiceRoll, setShowDiceRoll] = useState<boolean>(false)
  const [diceResults, setDiceResults] = useState<number[]>([])

  const opponentIndex = 1 - playerView

  // Reset selections when effect changes
  const resetSelections = () => {
    // For Lovers effect, default to current player
    // For other effects, default to opponent
    setSelectedPlayerIndex(effect === BlightEffect.LOVERS ? playerView : opponentIndex)
    setSelectedRowName(null)
    setSelectedCardIndex(null)
    setShowDiceRoll(false)
    setDiceResults([])
  }

  const handleConfirmSelection = () => {
    // Validation based on effect type
    if (effect === BlightEffect.FOOL) {
      // Find the highest commander in opponent's field
      const opponentField = players[opponentIndex].field
      let highestCommanderValue = -1
      let highestCommanderRow: keyof Field | null = null
      let highestCommanderIndex = -1

      Object.keys(opponentField).forEach((rowName) => {
        const row = opponentField[rowName as keyof Field]
        row.forEach((card, index) => {
          if (card.isCommander && card.baseValue > highestCommanderValue) {
            highestCommanderValue = card.baseValue
            highestCommanderRow = rowName as keyof Field
            highestCommanderIndex = index
          }
        })
      })

      if (highestCommanderRow && highestCommanderIndex >= 0) {
        onSelectTarget(effect, opponentIndex, highestCommanderRow, highestCommanderIndex)
      } else {
        // No commander found, cancel effect
        onCancel()
      }
    } 
    else if (effect === BlightEffect.MAGICIAN && selectedRowName) {
      // Instead of closing and using onSelectTarget, we'll show dice roll UI in the same modal
      setShowDiceRoll(true)
    }
    else if (effect === BlightEffect.LOVERS && selectedPlayerIndex !== null && 
             selectedRowName && selectedCardIndex !== null) {
      onSelectTarget(effect, selectedPlayerIndex, selectedRowName, selectedCardIndex)
    }
    else if (effect === BlightEffect.HANGED_MAN) {
      // Find a spy card in opponent's field
      const opponentField = players[opponentIndex].field
      let spyRow: keyof Field | null = null
      let spyIndex = -1

      Object.keys(opponentField).forEach((rowName) => {
        const row = opponentField[rowName as keyof Field]
        const spyCardIndex = row.findIndex(card => card.isSpy)
        if (spyCardIndex !== -1) {
          spyRow = rowName as keyof Field
          spyIndex = spyCardIndex
        }
      })

      if (spyRow && spyIndex >= 0) {
        onSelectTarget(effect, opponentIndex, spyRow, spyIndex)
      } else {
        // No spy card found, cancel effect
        onCancel()
      }
    }
    else if (effect === BlightEffect.EMPEROR) {
      // Find your spy card in opponent's field
      const opponentField = players[opponentIndex].field
      let spyRow: keyof Field | null = null
      let spyIndex = -1

      Object.keys(opponentField).forEach((rowName) => {
        const row = opponentField[rowName as keyof Field]
        const spyCardIndex = row.findIndex(card => card.isSpy)
        if (spyCardIndex !== -1) {
          spyRow = rowName as keyof Field
          spyIndex = spyCardIndex
        }
      })

      if (spyRow && spyIndex >= 0) {
        onSelectTarget(effect, opponentIndex, spyRow, spyIndex)
      } else {
        // No spy card found, cancel effect
        onCancel()
      }
    }
    else {
      // For effects that don't require targeting
      onSelectTarget(effect, playerView)
    }
  }

  // Determine title and description based on effect
  let title = "Select Target"
  let description = ""

  switch (effect) {
    case BlightEffect.FOOL:
      title = "The Fool - Convert Commander"
      description = "This effect will convert the opponent's highest value commander to your side."
      break
    case BlightEffect.MAGICIAN:
      title = "The Magician - Destroy Row"
      description = "Select an opponent's row. You'll roll a d20, and if your roll exceeds the current value of that row, all cards in it will be destroyed."
      break
    case BlightEffect.LOVERS:
      title = "The Lovers - Double Value"
      description = "Select one of your own cards (except Commanders) to double its value for this round."
      break
    case BlightEffect.DEATH:
      title = "Death - Refresh Hand"
      description = "Your entire hand will be discarded, and you'll draw an equal number of new cards."
      break
    case BlightEffect.WHEEL:
      title = "Wheel of Fortune - Bonus Points"
      description = "You'll roll a d10 and add the result to your total score."
      break
    case BlightEffect.HANGED_MAN:
      title = "The Hanged Man - Destroy Spy"
      description = "This effect will destroy a spy card on your opponent's field."
      break
    case BlightEffect.EMPEROR:
      title = "The Emperor - Return Spy"
      description = "This effect will return one of your spy cards from your opponent's field to your hand."
      break
    case BlightEffect.DEVIL:
      title = "The Devil - Revive Card"
      description = "Roll 3d6 up to 6 times. If you roll three 6's, you can revive a card from either discard pile."
      break
  }

  // Handle dice roll completion for the Magician effect
  const handleDiceRollComplete = (results: number[], total: number) => {
    if (!selectedRowName) return;
    
    // Store the dice results
    setDiceResults(results);
    
    // For the Magician effect, we switch to results display mode instead of closing
    if (effect === BlightEffect.MAGICIAN) {
      // Show results and confirm button instead of auto-completing
      setDiceResults(results);
    } else {
      // For other effects
      onSelectTarget(effect, opponentIndex, selectedRowName);
    }
  };
  
  // Handle confirmation after dice roll for Magician effect
  const handleConfirmDiceRoll = () => {
    if (!selectedRowName || diceResults.length === 0) return;
    
    const row = players[opponentIndex].field[selectedRowName];
    const rowTotal = row.reduce((sum, card) => sum + card.baseValue, 0);
    
    // Dice roll success if total > row value
    const diceTotal = diceResults.reduce((sum, val) => sum + val, 0);
    const success = diceTotal > rowTotal;
    
    // Direct call to avoid further issues
    onSelectTarget(effect, opponentIndex, selectedRowName, undefined, diceResults, success);
    
    // Close the modal
    onCancel();
  };

  // Render card selection UI based on effect
  const renderSelectionUI = () => {
    switch (effect) {
      case BlightEffect.MAGICIAN:
        // If we're showing the dice roller (after row selection), show that instead
        if (showDiceRoll && selectedRowName) {
          const row = players[opponentIndex].field[selectedRowName];
          const rowTotal = row.reduce((sum, card) => sum + card.baseValue, 0);
          
          // Check if we already have dice results to display
          const diceTotal = diceResults.length > 0 ? diceResults.reduce((sum, val) => sum + val, 0) : 0;
          const hasRolled = diceResults.length > 0;
          const success = diceTotal > rowTotal;
          
          return (
            <div className="space-y-6 text-center">
              <div className="p-4 border rounded-lg bg-card/50">
                <h3 className="text-lg font-medium mb-2">
                  Target: <span className="capitalize">{selectedRowName}</span> Row
                </h3>
                <p className="text-muted-foreground">Current Value: {rowTotal}</p>
                {hasRolled ? (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-center items-center gap-2">
                      <p className="text-lg font-bold">Your Roll: {diceTotal}</p>
                      <p className="text-lg font-bold">vs</p>
                      <p className="text-lg font-bold">Row Value: {rowTotal}</p>
                    </div>
                    <div className={`text-lg font-bold ${success ? "text-green-500" : "text-red-500"}`}>
                      {success 
                        ? "Success! You can discard this row!" 
                        : "Failed! The row remains intact."}
                    </div>
                    <Button 
                      onClick={handleConfirmDiceRoll}
                      className="mt-3"
                      variant="default"
                    >
                      Confirm {success ? "Destruction" : "Result"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm mt-2">
                    Roll a d20 - if your roll is higher than {rowTotal}, all cards in this row will be discarded.
                  </p>
                )}
              </div>
              
              {!hasRolled && (
                <DiceRoller 
                  sides={20} 
                  count={1} 
                  onRollComplete={handleDiceRollComplete} 
                  label="Roll to determine destruction"
                />
              )}
            </div>
          );
        }
        
        // Otherwise show the row selection UI
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Select opponent's row to target:</h3>
            <div className="flex gap-4 justify-center">
              {Object.keys(players[opponentIndex].field).map((rowName) => {
                const row = players[opponentIndex].field[rowName as keyof Field]
                const rowTotal = row.reduce((sum, card) => sum + card.baseValue, 0)
                
                return (
                  <Button
                    key={rowName}
                    variant={selectedRowName === rowName ? "default" : "outline"}
                    className="p-6 flex flex-col gap-1"
                    onClick={() => setSelectedRowName(rowName as keyof Field)}
                  >
                    <span className="capitalize">{rowName}</span>
                    <span className="text-sm">{row.length} cards</span>
                    <span className="text-xs">Value: {rowTotal}</span>
                  </Button>
                )
              })}
            </div>
          </div>
        )
      
      case BlightEffect.LOVERS:
        // No state update in render function to avoid infinite re-renders
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-card/50 mb-4">
              <h3 className="text-lg font-semibold text-primary mb-2">The Lovers - Amplify Your Cards</h3>
              <p className="text-muted-foreground">Select one of your own cards to double its value for this round.</p>
              <p className="text-sm mt-2 text-amber-500">Note: You can only select cards on your side of the field. Commander cards cannot be targeted.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {Object.keys(players[playerView].field).map((rowName) => {
                const row = players[playerView].field[rowName as keyof Field]
                if (row.length === 0) return null
                
                return (
                  <div key={rowName} className="space-y-2">
                    <h4 className="text-md font-medium capitalize">{rowName} Row</h4>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {row.map((card, cardIndex) => (
                        <div key={`${rowName}-${cardIndex}`} className="flex-shrink-0">
                          <div className="relative">
                            <CardComponent
                              card={card}
                              selected={selectedPlayerIndex === playerView && 
                                       selectedRowName === rowName && 
                                       selectedCardIndex === cardIndex}
                              disabled={card.isCommander} // Can't target commanders
                              onClick={card.isCommander ? undefined : () => {
                                console.log("Card clicked:", rowName, cardIndex);
                                setSelectedPlayerIndex(playerView);
                                setSelectedRowName(rowName as keyof Field);
                                setSelectedCardIndex(cardIndex);
                              }}
                              compact
                              hideLabel={true}
                            />
                            {/* Overlay for selection */}
                            {selectedPlayerIndex === playerView && 
                             selectedRowName === rowName && 
                             selectedCardIndex === cardIndex && (
                              <div className="absolute -top-2 -left-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            )}
                            {/* Value preview */}
                            {selectedPlayerIndex === playerView && 
                             selectedRowName === rowName && 
                             selectedCardIndex === cardIndex && (
                              <div className="mt-1 text-center text-xs text-green-500 font-bold">
                                Value: {card.baseValue} → {card.baseValue * 2}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              {Object.values(players[playerView].field).every(row => row.length === 0) && (
                <div className="text-center py-6 text-muted-foreground">
                  You don't have any cards on your field yet. Play some cards first!
                </div>
              )}
            </div>
          </div>
        )
      
      // For effects that don't require selection (Death, Wheel, etc.)
      default:
        return (
          <div className="text-center py-4">
            <p>Press confirm to activate this effect.</p>
          </div>
        )
    }
  }

  // Determine if the confirm button should be enabled
  const isConfirmEnabled = () => {
    switch (effect) {
      case BlightEffect.MAGICIAN:
        return selectedRowName !== null
      case BlightEffect.LOVERS:
        return selectedPlayerIndex !== null && selectedRowName !== null && selectedCardIndex !== null
      default:
        return true
    }
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {renderSelectionUI()}
        </ScrollArea>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          {/* Only show Confirm button when not in dice roll phase for Magician */}
          {!(effect === BlightEffect.MAGICIAN && showDiceRoll) && (
            <Button 
              onClick={handleConfirmSelection}
              disabled={!isConfirmEnabled()}
            >
              Confirm
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}