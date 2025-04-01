"use client"

import type { GameState, Player, Card, Field, WeatherEffects } from "@/lib/types"
import CardComponent from "./card"

// Define type for field keys
type FieldKey = keyof Field;

interface GameBoardProps {
  gameState: GameState
  currentPlayer: Player
  isOpponent: boolean
  targetRowSelection: boolean
  handleRowSelect: (row: string) => void
}

export default function GameBoard({
  gameState,
  currentPlayer,
  isOpponent,
  targetRowSelection,
  handleRowSelect,
}: GameBoardProps) {
  // Determine the order to display rows based on whether this is opponent or player board
  // For opponent: Long Range (top) -> Mid Range -> Close Range (bottom)
  // For player: Close Range (top) -> Mid Range -> Long Range (bottom)
  // This creates a logical battlefield with long range rows furthest apart from each other
  const rowOrder: FieldKey[] = isOpponent 
    ? ["diamonds", "spades", "clubs"] // Long -> Mid -> Close
    : ["clubs", "spades", "diamonds"] // Close -> Mid -> Long
  
  const rowLabels: Record<FieldKey, { name: string; bonus: string }> = {
    clubs: { name: "Close Range", bonus: "+2" },
    spades: { name: "Mid Range", bonus: "+3" },
    diamonds: { name: "Long Range", bonus: "+5" }
  }
  
  const weatherLabels: Record<FieldKey, string> = {
    clubs: "Tundra",
    spades: "Rain",
    diamonds: "Fog"
  }
  
  // Debug the possible source of overlapping text labels
  console.log("Rendering game board", isOpponent ? "opponent" : "player")
  
  return (
    <div className="mb-8 relative overflow-visible">
      <div className="flex justify-between items-center mb-2">
        {isOpponent ? (
          <h2 className="text-xl font-semibold">
            Opponent ({currentPlayer.name})
          </h2>
        ) : (
          <h2 className="text-xl font-semibold">Your Board</h2>
        )}
        
        <div className="flex items-center">
          <span className="text-yellow-400 mr-4">Score: {currentPlayer.score}</span>
          <span className="text-primary mr-4">Rounds won: {currentPlayer.roundsWon}</span>
          {currentPlayer.pass && <span className="text-red-500 mr-4">Passed</span>}
        </div>
      </div>
      
      {/* Game Rows */}
      <div className="space-y-3">
        {rowOrder.map((rowKey) => (
          <div key={`${isOpponent ? "op" : "pl"}-${rowKey}-row`} className="flex items-center">
            <div className="w-28 text-right pr-3 font-semibold">
              <div className="text-sm">{rowLabels[rowKey].name}</div>
              <div className="text-yellow-400">({rowLabels[rowKey].bonus})</div>
            </div>
            <div 
              className={`flex-1 h-20 flex items-center p-2 pt-5 rounded-lg ${gameState.weatherEffects[rowKey] ? "bg-red-900/20" : "bg-card"} relative
                ${targetRowSelection ? "border-2 border-yellow-400 cursor-pointer" : ""}`}
              onClick={() => targetRowSelection && handleRowSelect(rowKey)}
            >
              {gameState.weatherEffects[rowKey] && (
                <div className="absolute -top-2 left-3 text-xs bg-destructive px-2 py-0.5 rounded text-white shadow-md z-10">
                  {weatherLabels[rowKey]} Effect
                </div>
              )}
              
              {currentPlayer.field[rowKey].length > 0 ? (
                <div className="flex flex-wrap">
                  {currentPlayer.field[rowKey].map((card, index) => (
                    <div key={`${isOpponent ? "op" : "pl"}-${rowKey}-${index}`} className="mx-1">
                      <CardComponent 
                        card={card}
                        compact={true}
                        disabled={true}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No cards</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
