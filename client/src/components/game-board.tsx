"use client"

import { useState, useEffect } from 'react'
import type { GameState, Player, Card, Field, WeatherEffects } from "@/lib/types"
import CardComponent from "./card"
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"

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
  const [prevScore, setPrevScore] = useState(currentPlayer.score)
  const [scoreChange, setScoreChange] = useState(0)
  const [showScoreAnimation, setShowScoreAnimation] = useState(false)
  const [recentRowUpdate, setRecentRowUpdate] = useState<FieldKey | null>(null)

  // Track score changes
  useEffect(() => {
    if (currentPlayer.score !== prevScore) {
      const change = currentPlayer.score - prevScore
      setScoreChange(change)
      setShowScoreAnimation(true)
      
      const timer = setTimeout(() => {
        setShowScoreAnimation(false)
        setPrevScore(currentPlayer.score)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [currentPlayer.score, prevScore])

  // Track card additions to rows
  useEffect(() => {
    const rowKeys: FieldKey[] = ['clubs', 'spades', 'diamonds']
    let updatedRow: FieldKey | null = null
    
    // Try to detect which row received a new card
    for (const row of rowKeys) {
      const currentCount = currentPlayer.field[row].length
      // Simple assumption: if a row has cards, it might be the recently updated one
      if (currentCount > 0) {
        updatedRow = row
        break
      }
    }
    
    if (updatedRow) {
      setRecentRowUpdate(updatedRow)
      
      // Reset the animation state after a delay
      const timer = setTimeout(() => {
        setRecentRowUpdate(null)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [currentPlayer.field])
  
  // Determine the order to display rows based on whether this is opponent or player board
  // For opponent: Long Range (top) -> Mid Range -> Close Range (bottom)
  // For player: Close Range (top) -> Mid Range -> Long Range (bottom)
  // This creates a logical battlefield with long range rows furthest apart from each other
  const rowOrder: FieldKey[] = isOpponent 
    ? ["diamonds", "spades", "clubs"] // Long -> Mid -> Close
    : ["clubs", "spades", "diamonds"] // Close -> Mid -> Long
  
  const rowLabels: Record<FieldKey, { name: string; bonus: string; unitName: string }> = {
    clubs: { name: "Close Range", bonus: "+2", unitName: "Infantry" },
    spades: { name: "Mid Range", bonus: "+3", unitName: "Archer" },
    diamonds: { name: "Long Range", bonus: "+5", unitName: "Ballista" }
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
        
        <div className="flex items-center relative">
          <div className="relative">
            <span className="text-yellow-400 mr-4 font-bold text-lg">
              Score: {currentPlayer.score}
            </span>
            
            {/* Score change animation */}
            <AnimatePresence>
              {showScoreAnimation && (
                <motion.div
                  initial={{ opacity: 0, y: scoreChange > 0 ? 20 : -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "absolute -right-2 -top-8 px-2 py-1 rounded-md font-bold text-white",
                    scoreChange > 0 ? "bg-green-500" : "bg-red-500"
                  )}
                >
                  {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <span className="text-primary mr-4">Rounds won: {currentPlayer.roundsWon}</span>
          {currentPlayer.pass && <span className="text-red-500 mr-4">Passed</span>}
        </div>
      </div>
      
      {/* Game Rows */}
      <div className="space-y-3">
        {rowOrder.map((rowKey) => (
          <div key={`${isOpponent ? "op" : "pl"}-${rowKey}-row`} className="flex items-center">
            <div className="w-32 text-right pr-3 font-semibold">
              <div className="text-sm">{rowLabels[rowKey].name}</div>
              <div className="text-yellow-400">({rowLabels[rowKey].bonus})</div>
              <div className="text-xs text-muted-foreground">{rowLabels[rowKey].unitName}</div>
            </div>
            <motion.div 
              className={`flex-1 h-20 flex items-center p-2 pt-5 rounded-lg ${gameState.weatherEffects[rowKey] ? "bg-red-900/20" : "bg-card"} relative
                ${targetRowSelection ? "border-2 border-yellow-400 cursor-pointer" : ""}`}
              onClick={() => targetRowSelection && handleRowSelect(rowKey)}
              initial={{ opacity: 1 }}
              animate={{ 
                boxShadow: recentRowUpdate === rowKey 
                  ? ["0px 0px 0px rgba(255, 215, 0, 0)", "0px 0px 15px rgba(255, 215, 0, 0.7)", "0px 0px 0px rgba(255, 215, 0, 0)"]
                  : "none"
              }}
              transition={{
                duration: 1.5,
                repeat: recentRowUpdate === rowKey ? 1 : 0,
              }}
            >
              {gameState.weatherEffects[rowKey] && (
                <div className="absolute -top-2 left-3 text-xs bg-destructive px-2 py-0.5 rounded text-white shadow-md z-10">
                  {weatherLabels[rowKey]} Effect
                </div>
              )}
              
              <AnimatePresence>
                {currentPlayer.field[rowKey].length > 0 ? (
                  <motion.div 
                    className="flex flex-wrap"
                    layout
                  >
                    {currentPlayer.field[rowKey].map((card, index) => (
                      <motion.div 
                        key={`${isOpponent ? "op" : "pl"}-${rowKey}-${index}`} 
                        className="mx-1 relative group"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardComponent 
                          card={card}
                          compact={true}
                          disabled={true}
                        />
                        {/* Tooltip displaying card details on hover */}
                        <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                          <div className="bg-black/90 text-white p-2 rounded text-sm whitespace-nowrap">
                            <div className="font-bold">{card.value} of {card.suit}</div>
                            {card.isRogue && card.diceValue && (
                              <div className="text-amber-400">Rogue value: {card.diceValue}</div>
                            )}
                            {card.isSniper && (
                              <div className="text-indigo-400">Sniper value: 2</div>
                            )}
                            {card.isCommander && (
                              <div className="text-yellow-400">Commander value: {card.baseValue}</div>
                            )}
                          </div>
                          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black/90 absolute left-1/2 top-full -translate-x-1/2"></div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-muted-foreground">No cards</div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}
