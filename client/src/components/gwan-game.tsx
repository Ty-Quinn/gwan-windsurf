"use client"

import { useState, useEffect } from "react"
import type { GameState, Card } from "@/lib/types"
import { GwanGameLogic } from "@/lib/game-logic"
import GameBoard from "./game-board"
import PlayerHand from "./player-hand"
import GameHeader from "./game-header"
import TargetRowModal from "./target-row-modal"
import RoundSummaryModal from "./round-summary-modal"
import GameEndModal from "./game-end-modal"
import GameRulesModal from "./game-rules-modal"
import { Button } from "@/components/ui/button"

// Interface for tracking last played card action for undo functionality
interface LastAction {
  playerIndex: number;
  cardIndex: number;
  card: Card;
  targetRow: string | null;
}

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
  
  // Undo functionality
  const [lastAction, setLastAction] = useState<LastAction | null>(null)
  const [turnEnded, setTurnEnded] = useState<boolean>(false)
  const [prevGameState, setPrevGameState] = useState<GameState | null>(null)

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

    // Save the current game state for potential undo
    // Always save the state before playing a card
    setPrevGameState(JSON.parse(JSON.stringify(gameState)))

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
      // Store the action for undo
      setLastAction({
        playerIndex: playerView,
        cardIndex,
        card: JSON.parse(JSON.stringify(card)), // Deep copy the card
        targetRow
      })
      
      // Always keep turnEnded false when a card is played so undo is available
      setTurnEnded(false)
      setGameState(game.getGameState())
      setMessage(result.message)
      setSelectedCard(null)
      setTargetRowSelection(false)
      
      // Log for debugging
      console.log("Card played, undo available:", !turnEnded && !!lastAction)
    } else {
      setMessage(result.message)
    }
  }

  // Handle undo last card placement - returning the exact card to hand
  const handleUndo = () => {
    if (!game || !lastAction || turnEnded || !prevGameState) return
    
    // Get the current game state
    const currentState = game.getGameState();
    
    // Find where the card was played (player field or opponent field for spy cards)
    const playerIndex = lastAction.playerIndex;
    const opponentIndex = 1 - playerIndex;
    
    // We need to figure out which row the card was played in
    let rowKey: "clubs" | "spades" | "diamonds";
    
    if (lastAction.card.suit === "hearts") {
      // For hearts cards, we use the target row that was selected
      if (lastAction.targetRow === "clubs" || lastAction.targetRow === "spades" || lastAction.targetRow === "diamonds") {
        rowKey = lastAction.targetRow;
      } else {
        // If for some reason the target row is invalid, default to clubs
        rowKey = "clubs";
      }
    } else if (lastAction.card.suit === "clubs" || lastAction.card.suit === "spades" || lastAction.card.suit === "diamonds") {
      // For other cards, the suit is the row
      rowKey = lastAction.card.suit;
    } else {
      // Default fallback, should never happen
      rowKey = "clubs";
    }
    
    // Create a modified game state
    const modifiedState = JSON.parse(JSON.stringify(currentState)) as GameState;
    
    // For spy cards that get played on opponent's field
    if (lastAction.card.isSpy) {
      // Find and remove the spy card from opponent's field
      const cardIndex = modifiedState.players[opponentIndex].field[rowKey]
        .findIndex((c: Card) => c.suit === lastAction.card.suit && c.value === lastAction.card.value);
      
      if (cardIndex !== -1) {
        // Remove the card from opponent's field
        modifiedState.players[opponentIndex].field[rowKey].splice(cardIndex, 1);
        
        // Remove the 2 cards that were drawn (if any), by truncating hand back to original size
        if (modifiedState.players[playerIndex].hand.length > prevGameState.players[playerIndex].hand.length) {
          const originalHandSize = prevGameState.players[playerIndex].hand.length;
          modifiedState.players[playerIndex].hand = modifiedState.players[playerIndex].hand.slice(0, originalHandSize);
        }
      }
    } else {
      // For regular cards on player's own field
      const cardIndex = modifiedState.players[playerIndex].field[rowKey]
        .findIndex((c: Card) => c.suit === lastAction.card.suit && c.value === lastAction.card.value);
      
      if (cardIndex !== -1) {
        // Remove the card from field
        modifiedState.players[playerIndex].field[rowKey].splice(cardIndex, 1);
      }
    }
    
    // Return the card to player's hand
    modifiedState.players[playerIndex].hand.push(lastAction.card);
    
    // For weather cards, handle the weather effect
    if (lastAction.card.isWeather) {
      if (lastAction.card.suit === "hearts" && lastAction.targetRow) {
        // For Ace of Hearts, revert the weather clear effect
        if (lastAction.targetRow === "clubs" || lastAction.targetRow === "spades" || lastAction.targetRow === "diamonds") {
          modifiedState.weatherEffects[lastAction.targetRow] = prevGameState.weatherEffects[lastAction.targetRow];
        }
      } else if (lastAction.card.suit === "clubs" || lastAction.card.suit === "spades" || lastAction.card.suit === "diamonds") {
        // For other weather cards, remove the weather effect
        modifiedState.weatherEffects[lastAction.card.suit] = false;
      }
    }
    
    // Restore turn to the current player
    modifiedState.currentPlayer = playerIndex;
    
    // Apply the modified state
    const newGame = new GwanGameLogic();
    newGame.initializeGameFromState(modifiedState);
    
    setGame(newGame);
    setGameState(modifiedState);
    setLastAction(null);
    setPrevGameState(null);
    setMessage("Card returned to your hand. Play again.");
  }

  // Handle passing turn
  const handlePass = () => {
    if (!game || !gameState) return

    const result = game.pass(playerView)

    if (result.success) {
      setGameState(game.getGameState())
      setMessage(result.message)
      setTurnEnded(true) // Can't undo after passing
      setPrevGameState(null)

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

  // Switch player view and update scores at end of turn
  const switchPlayerView = () => {
    // This is called when End Turn button is clicked
    setTurnEnded(true) // Can't undo after ending turn
    setPrevGameState(null)
    setLastAction(null)
    
    // Calculate and update scores at end of turn
    if (game) {
      game.calculateScores()
      setGameState(game.getGameState())
    }
    
    setPlayerView(1 - playerView)
  }
  
  // Start a new round
  const startNextRound = () => {
    if (!game) return
    
    setShowRoundSummary(false)
    setNextRoundPending(false)
    setTurnEnded(false)
    setLastAction(null)
    setPrevGameState(null)
    
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
    setTurnEnded(false)
    setLastAction(null)
    setPrevGameState(null)
    
    // Log for debugging
    console.log("New game started, players:", newGame.getGameState().players)
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

      {/* Remove any debug or hidden text that might be showing with our overlay patch */}
      <div className="gwan-board-container">
        <GameBoard
          gameState={gameState}
          currentPlayer={opponent}
          isOpponent={true}
          targetRowSelection={false}
          handleRowSelect={() => {}}
        />
      </div>

      <div className="gwan-board-container">
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
        switchPlayerView={switchPlayerView}
        handleUndo={handleUndo}
        canUndo={!!lastAction && !turnEnded}
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
