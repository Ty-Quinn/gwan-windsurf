
"use client"

import { useState, useEffect } from "react"
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
  const [selectedRow, setSelectedRow] = useState<keyof Field>("clubs") // Initialize with clubs
  const [diceRolled, setDiceRolled] = useState(false)
  const [diceResults, setDiceResults] = useState<number[]>([])
  const [rollTotal, setRollTotal] = useState(0)
  const [success, setSuccess] = useState(false)
  
  // Initialize the selection properly on mount
  useEffect(() => {
    if (open) {
      // Reset state when modal opens
      // Find first non-empty row if possible
      const rows: (keyof Field)[] = ["clubs", "spades", "diamonds"];
      const firstNonEmptyRow = rows.find(row => players[opponentIndex].field[row].length > 0);
      
      setSelectedRow(firstNonEmptyRow || "clubs");
      setDiceRolled(false);
      setDiceResults([]);
      setRollTotal(0);
      setSuccess(false);
    }
  }, [open, players, opponentIndex]);
  
  // Calculate the total value of cards in the selected row
  const calculateRowValue = (row: keyof Field): number => {
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
  
  // Check if a row is empty
  const isRowEmpty = (row: keyof Field): boolean => {
    return players[opponentIndex].field[row].length === 0;
  }
  
  // Check if all rows are empty
  const areAllRowsEmpty = (): boolean => {
    return isRowEmpty("clubs") && isRowEmpty("spades") && isRowEmpty("diamonds");
  }
  
  // Handle row selection
  const handleSelectRow = (row: keyof Field) => {
    // Don't allow selecting empty rows unless all rows are empty
    if (isRowEmpty(row) && !areAllRowsEmpty()) return;
    
    setSelectedRow(row);
    // Reset dice results when a new row is selected
    setDiceRolled(false);
    setDiceResults([]);
    setRollTotal(0);
    setSuccess(false);
  }
  
  // Handle dice roll completion
  const handleDiceRollComplete = (results: number[], total: number) => {
    // Only process the first roll
    if (diceRolled) return;
    
    setDiceResults(results);
    setRollTotal(total);
    setDiceRolled(true);
    
    // Calculate success - if dice roll > total row value
    const rowValue = calculateRowValue(selectedRow);
    const rollSucceeded = total > rowValue;
    setSuccess(rollSucceeded);
    
    // Get the current card count in the row for logging
    const currentCardCount = players[opponentIndex].field[selectedRow].length;
    
    console.log("Magician dice roll completed:", {
      results,
      total,
      rowValue,
      success: rollSucceeded,
      selectedRow,
      targetPlayerIndex: opponentIndex,
      cardsInRow: currentCardCount,
      cardsToDiscard: rollSucceeded ? currentCardCount : 0
    });
  }
  
  // Handle confirmation of effect after dice roll
  const handleConfirmEffect = () => {
    if (!selectedRow || !diceRolled) return;
    
    // Get the current card count in the row for logging
    const currentCardCount = players[opponentIndex].field[selectedRow].length;
    
    console.log(`Confirming Magician effect for row ${selectedRow} with ${currentCardCount} cards`);
    console.log(`Effect will ${success ? 'succeed' : 'fail'} with dice roll ${rollTotal}`);
    
    onComplete(opponentIndex, selectedRow, diceResults, success);
  }
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-xl">Magician Blight Card</DialogTitle>
          <DialogDescription className="text-sm">
            Target a row in your opponent's field. Roll 1D20, and if the roll exceeds the total value of cards in that row, destroy all cards in it.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2">
          {/* Step indicator */}
          <div className="flex items-center justify-center space-x-2 mb-1">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <div className="text-xs">Select Row</div>
            <div className="h-px w-8 bg-muted-foreground"></div>
            <div className={`h-2 w-2 rounded-full ${diceRolled ? 'bg-green-500' : 'bg-muted-foreground'}`}></div>
            <div className="text-xs">Roll Dice</div>
          </div>
          
          {/* Row Selection */}
          <div className="pb-2 border-b border-border">
            <div className="text-center text-sm font-medium mb-1">
              Step 1: Select an opponent's row to target
            </div>
            
            <Tabs 
              value={selectedRow} 
              onValueChange={(value) => handleSelectRow(value as keyof Field)}
              defaultValue={selectedRow}
            >
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger 
                  value="clubs" 
                  disabled={isRowEmpty("clubs") && !areAllRowsEmpty()}
                  className={isRowEmpty("clubs") && !areAllRowsEmpty() ? "opacity-50" : ""}
                >
                  Clubs
                </TabsTrigger>
                <TabsTrigger 
                  value="spades" 
                  disabled={isRowEmpty("spades") && !areAllRowsEmpty()}
                  className={isRowEmpty("spades") && !areAllRowsEmpty() ? "opacity-50" : ""}
                >
                  Spades
                </TabsTrigger>
                <TabsTrigger 
                  value="diamonds" 
                  disabled={isRowEmpty("diamonds") && !areAllRowsEmpty()}
                  className={isRowEmpty("diamonds") && !areAllRowsEmpty() ? "opacity-50" : ""}
                >
                  Diamonds
                </TabsTrigger>
              </TabsList>
              
              <div className="mt-2">
                <div className="bg-muted rounded-md p-2 ring-1 ring-primary">
                  <h3 className="font-medium text-sm">{getRowDisplayName(selectedRow)}</h3>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span>Cards in row: {players[opponentIndex].field[selectedRow].length}</span>
                    <span>Total value: {calculateRowValue(selectedRow)}</span>
                  </div>
                  
                  <div className="flex flex-wrap mt-2 gap-1">
                    {players[opponentIndex].field[selectedRow].map((card, idx) => (
                      <div 
                        key={idx} 
                        className="bg-card border border-border rounded-md p-1 text-xs"
                      >
                        {card.suit} {card.value} ({card.baseValue})
                      </div>
                    ))}
                    {players[opponentIndex].field[selectedRow].length === 0 && (
                      <div className="text-muted-foreground italic text-xs py-1">No cards in this row</div>
                    )}
                  </div>
                </div>
              </div>
            </Tabs>
          </div>
          
          {/* Dice Rolling Section */}
          <div className="pt-1">
            <div className="text-center text-sm font-medium mb-1">
              Step 2: Roll the dice to determine effect
            </div>
            
            <Card className="p-3">
              <div className="grid grid-cols-2 gap-2 text-sm mb-1">
                <div>
                  Target: <span className="font-bold">{getRowDisplayName(selectedRow).split(" ")[0]}</span>
                </div>
                <div className="text-right">
                  Value: <span className="font-bold">{calculateRowValue(selectedRow)}</span>
                </div>
              </div>
              
              <DiceRoller 
                sides={20} 
                count={1} 
                onRollComplete={handleDiceRollComplete}
                label="D20"
                disabled={diceRolled}
                key={`dice-roller-${selectedRow}`} // Force re-render when row changes
              />
              
              {diceRolled && (
                <div className="mt-2 p-2 rounded-md text-center text-sm font-medium" 
                     style={{ 
                       backgroundColor: success ? "rgba(0, 255, 0, 0.1)" : "rgba(255, 0, 0, 0.1)",
                       color: success ? "rgb(0, 180, 0)" : "rgb(180, 0, 0)"
                     }}>
                  {success 
                    ? `Success! ${rollTotal} > ${calculateRowValue(selectedRow)}. All cards will be destroyed.`
                    : `Failed! ${rollTotal} ≤ ${calculateRowValue(selectedRow)}. No effect.`
                  }
                </div>
              )}
            </Card>
          </div>
        </div>
        
        {/* Dialog footer */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onCancel} size="sm">
            Cancel
          </Button>
          
          <Button 
            onClick={handleConfirmEffect}
            variant={success ? "default" : "secondary"}
            disabled={!diceRolled}
            size="sm"
          >
            {diceRolled 
              ? (success ? "Destroy Cards" : "Confirm No Effect")
              : "Roll Dice First"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
