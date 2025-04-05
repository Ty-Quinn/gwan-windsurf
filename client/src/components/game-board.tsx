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
    // Check if this is an actual score change (not initial render)
    const isInitialRender = prevScore === 0 && currentPlayer.score > 0;
    
    if (currentPlayer.score !== prevScore) {
      // Calculate the change in score
      const change = currentPlayer.score - prevScore;
      
      // Only show animation if it's not the initial render and we're on the player's board
      if (!isInitialRender && !isOpponent && change !== 0) {
        setScoreChange(change);
        setShowScoreAnimation(true);
        
        const timer = setTimeout(() => {
          setShowScoreAnimation(false);
          setPrevScore(currentPlayer.score);
        }, 2000);
        
        return () => clearTimeout(timer);
      } else {
        // Just update the score without animation
        setPrevScore(currentPlayer.score);
      }
    }
  }, [currentPlayer.score, prevScore, isOpponent])

  // Track card additions to rows
  useEffect(() => {
    const rowKeys: FieldKey[] = ['clubs', 'spades', 'diamonds']
    let updatedRow: FieldKey | null = null
    
    // Try to detect which row received a new card
    for (const row of rowKeys) {
      const fieldKey = currentPlayer.field.hasOwnProperty("melee") ? 
        (row === "clubs" ? "melee" : row === "spades" ? "ranged" : "siege") : 
        row;
      
      if (currentPlayer.field[fieldKey] && currentPlayer.field[fieldKey].length > 0) {
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
  
  // Handle both field naming conventions (old: clubs/spades/diamonds, new: melee/ranged/siege)
  const fieldMap: Record<FieldKey, keyof Field> = {
    clubs: currentPlayer.field.hasOwnProperty("melee") ? "melee" : "clubs",
    spades: currentPlayer.field.hasOwnProperty("ranged") ? "ranged" : "spades",
    diamonds: currentPlayer.field.hasOwnProperty("siege") ? "siege" : "diamonds"
  }
  
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
  
  // Helper function to calculate card value with all effects applied
  function calculateCardValue(card: Card, rowName: FieldKey, weatherEffects: WeatherEffects): number {
    try {
      // If it's a weather-affected row and not a commander card, return 1
      if (weatherEffects[rowName] && !card.isCommander) {
        return 1;
      }

      // If it's a Rogue card with a dice value, return the dice value
      if (card.isRogue && card.diceValue !== undefined) {
        return card.diceValue;
      }

      // Return the base value (which includes any doubling from Lovers effect)
      return card.baseValue || parseInt(card.value) || 0;
    } catch (err) {
      console.error("Error calculating card value:", err);
      // Fallback to a safe value
      return card.baseValue || 0;
    }
  }
  
  // Helper function to get appropriate color for value indicator based on effect
  function getValueColor(card: Card, rowName: FieldKey, weatherEffects: WeatherEffects): string {
    try {
      const currentValue = calculateCardValue(card, rowName, weatherEffects);
      
      // Get original value before any special effects
      let originalValue = card.isRogue ? 2 : parseInt(card.value, 10);
      
      // Handle face cards
      if (isNaN(originalValue)) {
        if (card.value === 'J') originalValue = 11;
        else if (card.value === 'Q') originalValue = 12;
        else if (card.value === 'K') originalValue = 13;
        else if (card.value === 'A') originalValue = 14;
        else originalValue = 0; // Default for unknown values
      }
      
      // Compare current value to original value
      if (currentValue > originalValue) {
        return 'border-green-400'; // Boosted value
      } else if (currentValue < originalValue) {
        return 'border-red-400';   // Reduced value (e.g., weather effect)
      } else {
        return 'border-yellow-400'; // Unchanged value
      }
    } catch (err) {
      console.error("Error getting value color:", err);
      return 'border-white'; // Neutral fallback
    }
  }
  
  // Function to render opponent's hand as face-down cards
  const renderOpponentHand = () => {
    if (!isOpponent || currentPlayer.hand.length === 0) return null;
    
    return (
      <div className="mb-4 py-2 flex justify-center">
        <div className="flex items-center bg-stone-800/50 rounded-lg p-2 border border-amber-900/40">
          <span className="text-amber-200 mr-3 font-medieval text-sm">Opponent's Arsenal:</span>
          <div className="flex -space-x-3">
            {Array.from({ length: Math.min(currentPlayer.hand.length, 8) }).map((_, index) => (
              <div 
                key={`opponent-card-${index}`} 
                className={`w-10 h-14 rounded-md transform card-back relative ${index % 5 === 0 ? 'rotate--2' : index % 5 === 1 ? 'rotate--1' : index % 5 === 2 ? 'rotate-0' : index % 5 === 3 ? 'rotate-1' : 'rotate-2'}`}
              >
                {/* Card back design */}
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 to-amber-950/90 rounded-md border-2 border-amber-800/70 shadow-md flex items-center justify-center">
                  <div className="w-6 h-8 border-2 border-amber-700/50 rounded-sm flex items-center justify-center">
                    <div className="text-amber-600/80 text-xs font-medieval">G</div>
                  </div>
                </div>
              </div>
            ))}
            {currentPlayer.hand.length > 8 && (
              <div className="ml-1 flex items-center justify-center">
                <span className="text-amber-300/80 text-xs">+{currentPlayer.hand.length - 8} more</span>
              </div>
            )}
          </div>
          <div className="ml-3 text-xs text-amber-400/80 font-serif">
            Total: {currentPlayer.hand.length}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-8 relative overflow-visible gwan-board-container p-4 z-0">
      <div className="flex justify-between items-center mb-4 relative z-10">
        {isOpponent ? (
          <h2 className="text-xl font-semibold text-amber-200">
            Opponent's Field ({currentPlayer.name})
          </h2>
        ) : (
          <h2 className="text-xl font-semibold text-amber-200">Your Field</h2>
        )}
        
        <div className="flex items-center relative">
          <div className="relative">
            <span className="text-amber-400 mr-4 font-bold text-lg">
              Score: {currentPlayer.score}
            </span>
            
            {/* Score change animation */}
            <AnimatePresence>
              {showScoreAnimation && !isOpponent && (
                <motion.div
                  initial={{ opacity: 0, y: scoreChange > 0 ? 20 : -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "absolute -right-2 -top-16 px-3 py-2 rounded-md font-bold text-white z-[100]", // Increased z-index and moved higher
                    scoreChange > 0 ? "bg-green-600" : "bg-red-600"
                  )}
                  style={{ 
                    pointerEvents: "none", /* Ensures it doesn't block interactions */
                    filter: "drop-shadow(0 0 8px rgba(0,0,0,0.7))", /* Enhanced shadow */
                    fontSize: "1.1rem"
                  }}
                >
                  {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <span className="text-amber-300 mr-4 font-serif">Victories: {currentPlayer.roundsWon}</span>
          {currentPlayer.pass && <span className="text-red-400 mr-4 font-medieval">Passed</span>}
        </div>
      </div>
      
      {/* Opponent's hand display */}
      {renderOpponentHand()}
      
      {/* Game Rows */}
      <div className="space-y-4">
        {rowOrder.map((rowKey) => (
          <div key={`${isOpponent ? "op" : "pl"}-${rowKey}-row`} className="flex items-center">
            <div className="w-32 text-right pr-3 font-medieval">
              <div className="text-amber-200">{rowLabels[rowKey].name}</div>
              <div className="text-amber-400 font-serif">({rowLabels[rowKey].bonus})</div>
              <div className="text-xs text-amber-100/80">{rowLabels[rowKey].unitName}</div>
            </div>
            <motion.div 
              className={`game-row flex-1 h-20 flex items-center p-2 pt-5 rounded-lg relative
                ${gameState.weatherEffects[rowKey] ? "bg-gradient-to-r from-red-900/30 to-slate-800/20" : ""} 
                ${targetRowSelection ? "border-2 border-amber-400 cursor-pointer" : ""}`}
              onClick={() => targetRowSelection && handleRowSelect(rowKey)}
              initial={{ opacity: 1 }}
              animate={{ 
                boxShadow: recentRowUpdate === rowKey 
                  ? ["0px 0px 0px rgba(245, 158, 11, 0)", "0px 0px 15px rgba(245, 158, 11, 0.7)", "0px 0px 0px rgba(245, 158, 11, 0)"]
                  : "none"
              }}
              transition={{
                duration: 1.5,
                repeat: recentRowUpdate === rowKey ? 1 : 0,
              }}
            >
              {gameState.weatherEffects[rowKey] && (
                <div className="absolute -top-2 left-3 text-xs bg-gradient-to-r from-red-900 to-red-700 px-3 py-1 rounded-sm text-amber-100 shadow-md z-10 font-medieval border border-amber-900/50">
                  {weatherLabels[rowKey]} Magic
                </div>
              )}
              
              <AnimatePresence>
                {currentPlayer.field[fieldMap[rowKey]] && currentPlayer.field[fieldMap[rowKey]].length > 0 ? (
                  <motion.div 
                    className="flex flex-wrap"
                    layout
                  >
                    {currentPlayer.field[fieldMap[rowKey]].map((card, index) => (
                      <motion.div 
                        key={`${isOpponent ? "op" : "pl"}-${rowKey}-${index}`} 
                        className="mx-1 relative group"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="relative">
                          <CardComponent 
                            card={card}
                            compact={true}
                            disabled={true}
                          />
                          {/* Value badge overlay */}
                          <div 
                            className={`absolute -top-2 -right-2 bg-stone-900/90 text-amber-100 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border ${getValueColor(card, fieldMap[rowKey], gameState.weatherEffects)}`}
                            title={`Card Value: ${calculateCardValue(card, fieldMap[rowKey], gameState.weatherEffects)}`}
                          >
                            {calculateCardValue(card, fieldMap[rowKey], gameState.weatherEffects)}
                          </div>
                        </div>
                        {/* Tooltip displaying card details on hover */}
                        <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                          <div className="bg-stone-900/95 text-amber-100 p-3 rounded-md text-sm whitespace-nowrap border border-amber-900/60 font-serif">
                            <div className="font-bold text-amber-200">{card.value} of {card.suit}</div>
                            
                            {/* Current value after effects */}
                            <div className="text-green-400 font-semibold">
                              Current value: {calculateCardValue(card, rowKey, gameState.weatherEffects)}
                            </div>
                            
                            {/* Base value display */}
                            <div className="text-amber-100/70 text-xs">
                              Base value: {card.baseValue}
                            </div>
                            
                            {/* Specific card type info */}
                            {card.isRogue && card.diceValue && (
                              <div className="text-amber-400">Rogue dice value: {card.diceValue}</div>
                            )}
                            {card.isSniper && (
                              <div className="text-indigo-400">Sniper card</div>
                            )}
                            {card.isCommander && (
                              <div className="text-yellow-400">Commander card</div>
                            )}
                            {card.isSpy && (
                              <div className="text-blue-400">Spy card</div>
                            )}
                            {card.isWeather && (
                              <div className="text-sky-400">Weather card</div>
                            )}
                            {card.isMedic && (
                              <div className="text-green-400">Medic card</div>
                            )}
                            {card.isDecoy && (
                              <div className="text-orange-400">Decoy card</div>
                            )}
                          </div>
                          <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-stone-900/95 absolute left-1/2 top-full -translate-x-1/2"></div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-amber-100/50 font-serif italic">No cards deployed</div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  )
}
