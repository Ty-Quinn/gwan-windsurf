"use client"

import { useState } from "react"
import { Field, Player } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DiceRoller from "./dice-roller"

interface MagicianEffectModalProps {
  open: boolean
  playerView: number
  players: Player[]
  onComplete: (targetPlayerIndex: number, targetRowName: keyof Field, diceResults: number[], success: boolean) => void
  onCancel: () => void
}

export default function MagicianEffectModal({
  open,
  playerView,
  players,
  onComplete,
  onCancel
}: MagicianEffectModalProps) {
  const opponentIndex = 1 - playerView
  const [selectedRow, setSelectedRow] = useState<keyof Field | null>(null)
  const [diceRolled, setDiceRolled] = useState(false)
  const [diceResults, setDiceResults] = useState<number[]>([])
  const [rollTotal, setRollTotal] = useState(0)
  const [success, setSuccess] = useState(false)
  
  // Calculate the total value of cards in the selected row
  const calculateRowValue = (row: keyof Field): number => {
    if (!selectedRow) return 0
    
    return players[opponentIndex].field[row].reduce((total, card) => {
      return total + card.baseValue
    }, 0)
  }
  
  // Get row display name
  const getRowDisplayName = (row: keyof Field): string => {
    switch (row) {
      case "clubs": return "Clubs (Close Combat)"
      case "spades": return "Spades (Ranged Combat)"
      case "diamonds": return "Diamonds (Siege)"
      default: return row
    }
  }
  
  // Handle row selection
  const handleSelectRow = (row: keyof Field) => {
    setSelectedRow(row)
    // Reset dice results when a new row is selected
    setDiceRolled(false)
    setDiceResults([])
    setRollTotal(0)
    setSuccess(false)
  }
  
  // Handle dice roll completion
  const handleDiceRollComplete = (results: number[], total: number) => {
    setDiceResults(results)
    setRollTotal(total)
    setDiceRolled(true)
    
    // Calculate success - if dice roll > total row value
    const rowValue = calculateRowValue(selectedRow as keyof Field)
    const rollSucceeded = total > rowValue
    setSuccess(rollSucceeded)
    
    console.log("Dice roll completed:", {
      results,
      total,
      rowValue,
      success: rollSucceeded,
      selectedRow
    });
  }
  
  // Handle completion of the effect
  const handleComplete = () => {
    if (!selectedRow || !diceRolled) return
    
    // Log for debugging
    console.log("MagicianEffectModal completing with row:", selectedRow, 
                "cards:", players[opponentIndex].field[selectedRow].length);
    
    onComplete(
      opponentIndex,
      selectedRow,
      diceResults,
      success
    )
  }
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Magician Blight Card</DialogTitle>
          <DialogDescription className="text-lg">
            Target a row in your opponent's field. Roll 1D20, and if the roll exceeds the total value of cards in that row, destroy all cards in it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center text-lg font-medium mb-4">
            Step 1: Select an opponent's row to target
          </div>
          
          <Tabs defaultValue="clubs" onValueChange={(value) => handleSelectRow(value as keyof Field)}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="clubs">Clubs</TabsTrigger>
              <TabsTrigger value="spades">Spades</TabsTrigger>
              <TabsTrigger value="diamonds">Diamonds</TabsTrigger>
            </TabsList>
            
            {(["clubs", "spades", "diamonds"] as const).map((row) => (
              <TabsContent key={row} value={row} className="space-y-4">
                <div className="bg-muted rounded-md p-3">
                  <h3 className="font-medium">{getRowDisplayName(row)}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span>Cards in row: {players[opponentIndex].field[row].length}</span>
                    <span>Total value: {calculateRowValue(row)}</span>
                  </div>
                  
                  <div className="flex flex-wrap mt-3 gap-2">
                    {players[opponentIndex].field[row].map((card, idx) => (
                      <div 
                        key={idx} 
                        className="bg-card border border-border rounded-md p-2 text-xs"
                      >
                        {card.suit} {card.value} ({card.baseValue})
                      </div>
                    ))}
                    {players[opponentIndex].field[row].length === 0 && (
                      <div className="text-muted-foreground italic">No cards in this row</div>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
          
          {selectedRow && (
            <>
              <div className="text-center text-lg font-medium mt-6 mb-2">
                Step 2: Roll the dice to determine effect
              </div>
              
              <Card className="p-4">
                <div className="text-center mb-2">
                  Target Row: <span className="font-bold">{getRowDisplayName(selectedRow)}</span>
                </div>
                <div className="text-center mb-4">
                  Row Value: <span className="font-bold">{calculateRowValue(selectedRow)}</span>
                </div>
                
                <DiceRoller 
                  sides={20} 
                  count={1} 
                  onRollComplete={handleDiceRollComplete}
                  label="D20"
                />
                
                {diceRolled && (
                  <div className="mt-4 p-3 rounded-md text-center font-medium" 
                       style={{ 
                         backgroundColor: success ? "rgba(0, 255, 0, 0.1)" : "rgba(255, 0, 0, 0.1)",
                         color: success ? "rgb(0, 180, 0)" : "rgb(180, 0, 0)"
                       }}>
                    {success 
                      ? `Success! Roll (${rollTotal}) > Row Value (${calculateRowValue(selectedRow)}). All cards in this row will be destroyed.`
                      : `Failed! Roll (${rollTotal}) ≤ Row Value (${calculateRowValue(selectedRow)}). No effect.`
                    }
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={!selectedRow || !diceRolled}
          >
            Complete Effect
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}