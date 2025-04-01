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
  // For opponent: Close Range (top) -> Mid Range -> Long Range (bottom)
  // For player: Long Range (top) -> Mid Range -> Close Range (bottom)
  // This creates a logical battlefield with long range rows furthest apart from each other
  const rowOrder: FieldKey[] = isOpponent 
    ? ["clubs", "spades", "diamonds"] // Close -> Mid -> Long
    : ["diamonds", "spades", "clubs"] // Long -> Mid -> Close
  
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
  
  return (
    <div className="mb-8">
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
              className={`flex-1 h-20 flex items-center p-2 rounded-lg ${gameState.weatherEffects[rowKey] ? "bg-red-900/20" : "bg-card"} relative
                ${targetRowSelection ? "border-2 border-yellow-400 cursor-pointer" : ""}`}
              onClick={() => targetRowSelection && handleRowSelect(rowKey)}
            >
              {gameState.weatherEffects[rowKey] && (
                <div className="absolute -top-3 left-4 text-xs bg-destructive px-2 py-1 rounded-full">
                  Weather: {weatherLabels[rowKey]}
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
