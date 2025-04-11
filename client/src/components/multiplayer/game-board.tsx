"use client"

import { useState, useEffect, useContext } from 'react'
import type { GameState, Card, Field, WeatherEffects } from "../../lib/types"
import CardComponent from "./card"
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "../../lib/utils"
import { TurnIndicator } from "./turn-indicator"
import { SocketContext } from "../../contexts/socket-context"

// Define type for field keys
type FieldKey = keyof Field;

interface MultiplayerGameBoardProps {
  gameState: GameState
  playerView: number
}

export default function MultiplayerGameBoard({
  gameState,
  playerView,
}: MultiplayerGameBoardProps) {
  const [prevScores, setPrevScores] = useState([0, 0])
  const [scoreChanges, setScoreChanges] = useState([0, 0])
  const [showScoreAnimation, setShowScoreAnimation] = useState(false)
  const [recentRowUpdate, setRecentRowUpdate] = useState<FieldKey | null>(null)
  
  // Track previous field state to detect changes
  const [prevPlayerFields, setPrevPlayerFields] = useState<Field[]>([
    { clubs: [], spades: [], diamonds: [] },
    { clubs: [], spades: [], diamonds: [] }
  ])

  // Update score animation when scores change
  useEffect(() => {
    if (gameState && gameState.players.length === 2) {
      const newScores = [gameState.players[0].score, gameState.players[1].score]
      
      // Calculate score changes
      const changes = [
        newScores[0] - prevScores[0],
        newScores[1] - prevScores[1]
      ]
      
      // Only show animation if there was a change
      if (changes[0] !== 0 || changes[1] !== 0) {
        setScoreChanges(changes)
        setShowScoreAnimation(true)
        
        // Hide animation after a delay
        setTimeout(() => {
          setShowScoreAnimation(false)
        }, 2000)
      }
      
      setPrevScores(newScores)
    }
  }, [gameState?.players[0]?.score, gameState?.players[1]?.score])

  // Track field changes to highlight recently updated rows
  useEffect(() => {
    if (!gameState || gameState.players.length !== 2) return
    
    // Check each row for each player to see if cards were added
    const fieldKeys: FieldKey[] = ['clubs', 'spades', 'diamonds']
    
    for (let playerIdx = 0; playerIdx < 2; playerIdx++) {
      for (const key of fieldKeys) {
        const prevLength = prevPlayerFields[playerIdx][key].length
        const currentLength = gameState.players[playerIdx].field[key].length
        
        if (currentLength > prevLength) {
          setRecentRowUpdate(key)
          
          // Clear highlight after a delay
          setTimeout(() => {
            setRecentRowUpdate(null)
          }, 2000)
          
          break
        }
      }
    }
    
    // Update previous field state
    setPrevPlayerFields([
      { ...gameState.players[0].field },
      { ...gameState.players[1].field }
    ])
  }, [
    gameState?.players[0]?.field.clubs.length,
    gameState?.players[0]?.field.spades.length,
    gameState?.players[0]?.field.diamonds.length,
    gameState?.players[1]?.field.clubs.length,
    gameState?.players[1]?.field.spades.length,
    gameState?.players[1]?.field.diamonds.length
  ])

  // If game state is not available yet
  if (!gameState || gameState.players.length !== 2) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-center p-8 text-amber-200">Loading game board...</div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  const opponentIndex = 1 - playerView
  const weatherEffects = gameState.weatherEffects
  const socketClient = useContext(SocketContext)
  
  // Player names (default if not available)
  const playerNames = [
    gameState.players[0].name || `Player 1`,
    gameState.players[1].name || `Player 2`
  ]

  return (
    <div className="relative mx-auto max-w-6xl px-4">
      {/* Turn Indicator */}
      <TurnIndicator 
        currentPlayer={gameState.currentPlayer} 
        playerIndex={playerView}
        playerNames={playerNames}
      />
      
      {/* Game Status */}
      <div className="mb-4 text-center">
        <div className="text-sm text-amber-300">
          {gameState.currentRound > 0 && (
            <span>Round {gameState.currentRound} | </span>
          )}
          <span>Your Score: {gameState.players[playerView].score} | </span>
          <span>Opponent Score: {gameState.players[opponentIndex].score}</span>
        </div>
      </div>
      {/* Opponent's Field */}
      <div className="mb-8">
        <div className="text-center mb-2">
          <h3 className="text-xl font-semibold text-amber-200">Opponent's Field</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {/* Clubs (Infantry) Row */}
          <FieldRow
            cards={gameState.players[opponentIndex].field.clubs}
            label="Infantry"
            weatherActive={weatherEffects.clubs}
            isHighlighted={recentRowUpdate === 'clubs' && gameState.currentPlayer === opponentIndex}
          />
          
          {/* Spades (Archer) Row */}
          <FieldRow
            cards={gameState.players[opponentIndex].field.spades}
            label="Archer"
            weatherActive={weatherEffects.spades}
            isHighlighted={recentRowUpdate === 'spades' && gameState.currentPlayer === opponentIndex}
          />
          
          {/* Diamonds (Ballista) Row */}
          <FieldRow
            cards={gameState.players[opponentIndex].field.diamonds}
            label="Ballista"
            weatherActive={weatherEffects.diamonds}
            isHighlighted={recentRowUpdate === 'diamonds' && gameState.currentPlayer === opponentIndex}
          />
        </div>
      </div>
      
      {/* Middle Section - Weather Effects */}
      <div className="my-4 flex justify-center space-x-4">
        {Object.entries(weatherEffects).map(([key, active]) => (
          <div 
            key={key}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              active 
                ? "bg-amber-900/70 text-amber-100 border border-amber-500" 
                : "bg-black/20 text-amber-400/50 border border-amber-800/30"
            )}
          >
            {key === 'clubs' && 'Infantry'}
            {key === 'spades' && 'Archer'}
            {key === 'diamonds' && 'Ballista'}
            {active ? ' Weather Active' : ' Weather Clear'}
          </div>
        ))}
      </div>
      
      {/* Player's Field */}
      <div className="mt-8">
        <div className="text-center mb-2">
          <h3 className="text-xl font-semibold text-amber-200">Your Field</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {/* Clubs (Infantry) Row */}
          <FieldRow
            cards={gameState.players[playerView].field.clubs}
            label="Infantry"
            weatherActive={weatherEffects.clubs}
            isHighlighted={recentRowUpdate === 'clubs' && gameState.currentPlayer === playerView}
          />
          
          {/* Spades (Archer) Row */}
          <FieldRow
            cards={gameState.players[playerView].field.spades}
            label="Archer"
            weatherActive={weatherEffects.spades}
            isHighlighted={recentRowUpdate === 'spades' && gameState.currentPlayer === playerView}
          />
          
          {/* Diamonds (Ballista) Row */}
          <FieldRow
            cards={gameState.players[playerView].field.diamonds}
            label="Ballista"
            weatherActive={weatherEffects.diamonds}
            isHighlighted={recentRowUpdate === 'diamonds' && gameState.currentPlayer === playerView}
          />
        </div>
      </div>
      
      {/* Score Change Animation */}
      <AnimatePresence>
        {showScoreAnimation && (
          <div className="absolute inset-0 pointer-events-none flex justify-center items-center">
            <div className="flex space-x-12">
              {scoreChanges.map((change, idx) => (
                change !== 0 && (
                  <motion.div
                    key={`score-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      "text-4xl font-bold",
                      change > 0 ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {change > 0 ? `+${change}` : change}
                  </motion.div>
                )
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Field Row Component
interface FieldRowProps {
  cards: Card[]
  label: string
  weatherActive: boolean
  isHighlighted: boolean
}

function FieldRow({ cards, label, weatherActive, isHighlighted }: FieldRowProps) {
  return (
    <div 
      className={cn(
        "relative p-3 rounded-lg transition-all",
        weatherActive ? "bg-amber-900/40 border border-amber-700" : "bg-black/30 border border-amber-900/30",
        isHighlighted && "ring-2 ring-amber-400 ring-opacity-70"
      )}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-amber-200">{label}</span>
        <span className="text-sm font-medium text-amber-400">{cards.length} cards</span>
      </div>
      
      <div className="min-h-28 flex flex-wrap gap-1 justify-center">
        {cards.map((card, index) => (
          <div key={`${card.suit}-${card.value}-${index}`} className="w-12 h-16 transform transition-all">
            <CardComponent card={card} small />
          </div>
        ))}
      </div>
    </div>
  )
}
