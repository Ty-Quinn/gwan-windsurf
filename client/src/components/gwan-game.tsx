"use client"

import { useState, useEffect } from "react"
import type { GameState } from "@/lib/types"
import { GwanGameLogic } from "@/lib/game-logic"
import GameBoard from "./game-board"
import PlayerHand from "./player-hand"
import GameHeader from "./game-header"
import TargetRowModal from "./target-row-modal"
import RoundSummaryModal from "./round-summary-modal"
import GameEndModal from "./game-end-modal"
import GameRulesModal from "./game-rules-modal"

export default function GwanGame() {
  // Game state
  const [game, setGame] = useState<GwanGameLogic | null>(null)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerView, setPlayerView] = useState<number>(0)
  const [message, setMessage] = useState<string>("Welcome to GWAN!")
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [targetRowSelection, setTargetRowSelection] = useState<boolean>(false)
  const [showRoundSummary, setShowRoundSummary] = useState<boolean>(false)
  const [showGameEnd, setShowGameEnd] = useState<boolean>(false)
  const [showRules, setShowRules] = useState<boolean>(false)
  const [roundWinner, setRoundWinner] = useState<number | undefined>(undefined)
  const [roundTied, setRoundTied] = useState<boolean>(false)
  const [gameWinner, setGameWinner] = useState<number | undefined>(undefined)
  const [nextRoundPending, setNextRoundPending] = useState<boolean>(false)

  // Initialize the game
  useEffect(() => {
    const newGame = new GwanGameLogic()
    newGame.initializeGame()
    newGame.initializeRound()

    setGame(newGame)
    setGameState(newGame.getGameState())
    setMessage("Game started! Play a card or pass.")
  }, [])
  
  // Show rules only on first load of the game
  useEffect(() => {
    // Only show rules when the game is first initialized
    if (gameState && gameState.currentRound === 1 && gameState.players[0].field.clubs.length === 0 
        && gameState.players[0].field.spades.length === 0 && gameState.players[0].field.diamonds.length === 0
        && gameState.players[1].field.clubs.length === 0 && gameState.players[1].field.spades.length === 0 
        && gameState.players[1].field.diamonds.length === 0) {
      setShowRules(true)
    }
  }, [gameState])

  // Handle playing a card
  const handlePlayCard = (cardIndex: number, targetRow: string | null = null) => {
    if (!game || !gameState) return

    // For hearts or Ace of Hearts, we need to select a target row
    const card = gameState.players[playerView].hand[cardIndex]

    // Check if it's a hearts card - needs special handling for targeting a row
    // Using type assertion to handle the comparison properly
    if ((card.suit as string) === "hearts" && !targetRow) {
      setSelectedCard(cardIndex)
      setTargetRowSelection(true)
      setMessage("Select a row for this card")
      return
    }

    const result = game.playCard(playerView, cardIndex, targetRow)

    if (result.success) {
      setGameState(game.getGameState())
      setMessage(result.message)
      setSelectedCard(null)
      setTargetRowSelection(false)
    } else {
      setMessage(result.message)
    }
  }

  // Handle passing turn
  const handlePass = () => {
    if (!game || !gameState) return

    const result = game.pass(playerView)

    if (result.success) {
      setGameState(game.getGameState())
      setMessage(result.message)

      // Check for round end
      if (result.roundWinner !== undefined || result.roundTied) {
        setRoundWinner(result.roundWinner)
        setRoundTied(result.roundTied || false)
        setShowRoundSummary(true)
        setNextRoundPending(true)
      }

      // Check for game end
      if (result.gameEnded) {
        setGameWinner(result.roundWinner)
        setShowGameEnd(true)
      }
    } else {
      setMessage(result.message)
    }
  }

  // Handle row selection for hearts cards
  const handleRowSelect = (row: string) => {
    if (selectedCard !== null) {
      handlePlayCard(selectedCard, row)
    }
  }

  // Switch player view
  const switchPlayerView = () => {
    setPlayerView(1 - playerView)
  }
  
  // Start a new round
  const startNextRound = () => {
    if (!game) return
    
    setShowRoundSummary(false)
    setNextRoundPending(false)
    
    game.initializeRound()
    setGameState(game.getGameState())
    setMessage(`Round ${gameState?.currentRound! + 1} starting!`)
  }
  
  // Start a new game
  const startNewGame = () => {
    const newGame = new GwanGameLogic()
    newGame.initializeGame()
    newGame.initializeRound()

    setGame(newGame)
    setGameState(newGame.getGameState())
    setMessage("New game started! Play a card or pass.")
    setShowGameEnd(false)
    setRoundWinner(undefined)
    setRoundTied(false)
    setGameWinner(undefined)
  }

  if (!game || !gameState) {
    return <div className="flex items-center justify-center h-screen">Loading game...</div>
  }

  const currentPlayer = gameState.players[playerView]
  const opponent = gameState.players[1 - playerView]
  const isCurrentTurn = gameState.currentPlayer === playerView

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <GameHeader 
        gameState={gameState} 
        playerView={playerView} 
        switchPlayerView={switchPlayerView} 
        message={message}
        showRules={() => setShowRules(true)}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-3 rounded-lg text-center flex flex-col">
          <span className="text-sm text-muted-foreground">Player 1</span>
          <span className="text-2xl font-bold text-primary">{gameState.players[0].score}</span>
          <span className="text-xs text-muted-foreground mt-1">Total Score</span>
        </div>
        
        <div className="bg-card p-3 rounded-lg text-center flex flex-col">
          <span className="text-sm text-muted-foreground">Player 2</span>
          <span className="text-2xl font-bold text-primary">{gameState.players[1].score}</span>
          <span className="text-xs text-muted-foreground mt-1">Total Score</span>
        </div>
        
        <div className="bg-card p-3 rounded-lg text-center flex flex-col">
          <span className="text-sm text-muted-foreground">Rounds Won</span>
          <div className="flex justify-center mt-1 space-x-4">
            <div>
              <span className="text-xs text-muted-foreground">P1</span>
              <span className="block text-lg font-bold text-yellow-400">{gameState.players[0].roundsWon}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">P2</span>
              <span className="block text-lg font-bold text-yellow-400">{gameState.players[1].roundsWon}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-card p-3 rounded-lg text-center flex items-center justify-center">
          {isCurrentTurn ? (
            <>
              <span className="text-md font-medium text-green-500 mr-2">Your Turn</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-green-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </>
          ) : (
            <>
              <span className="text-md font-medium text-red-500 mr-2">Opponent's Turn</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-red-500"><circle cx="12" cy="12" r="10"/><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </>
          )}
        </div>
      </div>

      {/* Remove any debug or hidden text that might be showing */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <GameBoard
          gameState={gameState}
          currentPlayer={opponent}
          isOpponent={true}
          targetRowSelection={false}
          handleRowSelect={() => {}}
        />
      </div>

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        <GameBoard
          gameState={gameState}
          currentPlayer={currentPlayer}
          isOpponent={false}
          targetRowSelection={targetRowSelection}
          handleRowSelect={handleRowSelect}
        />
      </div>

      <PlayerHand
        currentPlayer={currentPlayer}
        isCurrentTurn={isCurrentTurn}
        selectedCard={selectedCard}
        handlePlayCard={handlePlayCard}
        handlePass={handlePass}
      />

      {targetRowSelection && (
        <TargetRowModal
          handleRowSelect={handleRowSelect}
          onCancel={() => {
            setSelectedCard(null)
            setTargetRowSelection(false)
          }}
        />
      )}
      
      {showRoundSummary && (
        <RoundSummaryModal
          players={gameState.players}
          roundWinner={roundWinner}
          roundTied={roundTied}
          onContinue={startNextRound}
        />
      )}
      
      {showGameEnd && (
        <GameEndModal
          players={gameState.players}
          gameWinner={gameWinner}
          onPlayAgain={startNewGame}
        />
      )}
      
      {showRules && (
        <GameRulesModal
          onClose={() => setShowRules(false)}
        />
      )}
    </div>
  )
}
