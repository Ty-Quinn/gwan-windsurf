"use client"

import type { GameState, Player, Card } from "@/lib/types"
import CardComponent from "./card"

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
        {/* Long Range Row */}
        <div className="flex items-center">
          <div className="w-28 text-right pr-3 font-semibold">
            <div className="text-sm">Long Range</div>
            <div className="text-yellow-400">(+5)</div>
          </div>
          <div 
            className={`flex-1 h-20 flex items-center p-2 rounded-lg ${gameState.weatherEffects.diamonds ? "bg-red-900/20" : "bg-card"} relative
              ${targetRowSelection ? "border-2 border-yellow-400 cursor-pointer" : ""}`}
            onClick={() => targetRowSelection && handleRowSelect("diamonds")}
          >
            {gameState.weatherEffects.diamonds && (
              <div className="absolute -top-3 left-4 text-xs bg-destructive px-2 py-1 rounded-full">Weather: Fog</div>
            )}
            
            {currentPlayer.field.diamonds.length > 0 ? (
              currentPlayer.field.diamonds.map((card, index) => (
                <div key={`${isOpponent ? "op" : "pl"}-dia-${index}`} className="mx-1">
                  <CardComponent 
                    card={card}
                    compact={true}
                    disabled={true}
                  />
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">No cards</div>
            )}
          </div>
        </div>
        
        {/* Mid Range Row */}
        <div className="flex items-center">
          <div className="w-28 text-right pr-3 font-semibold">
            <div className="text-sm">Mid Range</div>
            <div className="text-yellow-400">(+3)</div>
          </div>
          <div 
            className={`flex-1 h-20 flex items-center p-2 rounded-lg ${gameState.weatherEffects.spades ? "bg-red-900/20" : "bg-card"} relative
              ${targetRowSelection ? "border-2 border-yellow-400 cursor-pointer" : ""}`}
            onClick={() => targetRowSelection && handleRowSelect("spades")}
          >
            {gameState.weatherEffects.spades && (
              <div className="absolute -top-3 left-4 text-xs bg-destructive px-2 py-1 rounded-full">Weather: Rain</div>
            )}
            
            {currentPlayer.field.spades.length > 0 ? (
              currentPlayer.field.spades.map((card, index) => (
                <div key={`${isOpponent ? "op" : "pl"}-spa-${index}`} className="mx-1">
                  <CardComponent 
                    card={card}
                    compact={true}
                    disabled={true}
                  />
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">No cards</div>
            )}
          </div>
        </div>
        
        {/* Close Range Row */}
        <div className="flex items-center">
          <div className="w-28 text-right pr-3 font-semibold">
            <div className="text-sm">Close Range</div>
            <div className="text-yellow-400">(+2)</div>
          </div>
          <div 
            className={`flex-1 h-20 flex items-center p-2 rounded-lg ${gameState.weatherEffects.clubs ? "bg-red-900/20" : "bg-card"} relative
              ${targetRowSelection ? "border-2 border-yellow-400 cursor-pointer" : ""}`}
            onClick={() => targetRowSelection && handleRowSelect("clubs")}
          >
            {gameState.weatherEffects.clubs && (
              <div className="absolute -top-3 left-4 text-xs bg-destructive px-2 py-1 rounded-full">Weather: Tundra</div>
            )}
            
            {currentPlayer.field.clubs.length > 0 ? (
              currentPlayer.field.clubs.map((card, index) => (
                <div key={`${isOpponent ? "op" : "pl"}-clu-${index}`} className="mx-1">
                  <CardComponent 
                    card={card}
                    compact={true}
                    disabled={true}
                  />
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">No cards</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
