'use client'

import { useState } from 'react'
import { BlightEffect, Card, Field, Player } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CardComponent from './card'

interface BlightCardTargetModalProps {
  open: boolean
  effect: BlightEffect
  playerView: number
  players: Player[]
  onSelectTarget: (
    effect: BlightEffect, 
    targetPlayerIndex: number, 
    targetRowName?: keyof Field, 
    targetCardIndex?: number
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
  const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<number>(1 - playerView) // Default to opponent
  const [selectedRowName, setSelectedRowName] = useState<keyof Field | null>(null)
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null)

  const opponentIndex = 1 - playerView

  // Reset selections when effect changes
  const resetSelections = () => {
    setSelectedPlayerIndex(opponentIndex)
    setSelectedRowName(null)
    setSelectedCardIndex(null)
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
      onSelectTarget(effect, opponentIndex, selectedRowName)
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
      description = "Select a card (except Commanders) whose value will be doubled."
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

  // Render card selection UI based on effect
  const renderSelectionUI = () => {
    switch (effect) {
      case BlightEffect.MAGICIAN:
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
        return (
          <div className="space-y-4">
            <Tabs defaultValue={String(1-playerView)} onValueChange={(val) => setSelectedPlayerIndex(Number(val))}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value={String(playerView)}>Your Field</TabsTrigger>
                <TabsTrigger value={String(opponentIndex)}>Opponent's Field</TabsTrigger>
              </TabsList>
              
              {[playerView, opponentIndex].map((pIndex) => (
                <TabsContent key={pIndex} value={String(pIndex)}>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.keys(players[pIndex].field).map((rowName) => {
                      const row = players[pIndex].field[rowName as keyof Field]
                      if (row.length === 0) return null
                      
                      return (
                        <div key={rowName} className="space-y-2">
                          <h4 className="text-md font-medium capitalize">{rowName} Row</h4>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {row.map((card, cardIndex) => (
                              <div key={`${rowName}-${cardIndex}`} className="flex-shrink-0">
                                <CardComponent
                                  card={card}
                                  selected={selectedPlayerIndex === pIndex && 
                                           selectedRowName === rowName && 
                                           selectedCardIndex === cardIndex}
                                  disabled={card.isCommander} // Can't target commanders
                                  onClick={card.isCommander ? undefined : () => {
                                    setSelectedPlayerIndex(pIndex)
                                    setSelectedRowName(rowName as keyof Field)
                                    setSelectedCardIndex(cardIndex)
                                  }}
                                  compact
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
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
          <Button 
            onClick={handleConfirmSelection}
            disabled={!isConfirmEnabled()}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}