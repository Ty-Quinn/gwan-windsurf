"use client"

import { useState, useEffect } from "react"
import { useSocketConnection, useSocketGame } from "@/hooks/useSocket"
import { GameState } from "@/lib/types"
import GameBoard from "./multiplayer/game-board"
import PlayerHand from "./multiplayer/player-hand"
import GameHeader from "./multiplayer/game-header"
import TargetRowModal from "./multiplayer/target-row-modal"
import RoundSummaryModal from "./multiplayer/round-summary-modal"
import GameEndModal from "./multiplayer/game-end-modal"
import GameRulesModal from "./game-rules-modal"
import MedicRevivalModal from "./multiplayer/medic-revival-modal"
import DecoyRetrievalModal from "./multiplayer/decoy-retrieval-modal"
import DiceRollModal from "./multiplayer/dice-roll-modal"
import BlightCardSelectionModal from "./multiplayer/blight-card-selection-modal"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

export default function MultiplayerGame() {
  // Socket connection state
  const { isConnected, username, register } = useSocketConnection()
  
  // Game state from socket
  const {
    gameId,
    playerIndex,
    gameState,
    opponent,
    isWaiting,
    queuePosition,
    gameError,
    roundWinner,
    roundTied,
    gameWinner,
    createGame,
    joinGame,
    playCard,
    endTurn,
    undoLastAction,
    selectBlightCard,
    submitDiceRoll,
    leaveGame,
    resetRoundState
  } = useSocketGame()

  // Local UI state
  const [message, setMessage] = useState<string>("Welcome to GWAN Multiplayer!")
  const [selectedCard, setSelectedCard] = useState<number | null>(null)
  const [targetRowSelection, setTargetRowSelection] = useState<boolean>(false)
  const [showRoundSummary, setShowRoundSummary] = useState<boolean>(false)
  const [showGameEnd, setShowGameEnd] = useState<boolean>(false)
  const [showRules, setShowRules] = useState<boolean>(false)
  const [rulesShownBefore, setRulesShownBefore] = useState<boolean>(
    localStorage.getItem('gwanRulesShown') === 'true'
  )
  const [showMedicRevival, setShowMedicRevival] = useState<boolean>(false)
  const [showDecoyRetrieval, setShowDecoyRetrieval] = useState<boolean>(false)
  const [showBlightCardSelection, setShowBlightCardSelection] = useState<boolean>(false)
  const [showDiceRoll, setShowDiceRoll] = useState<boolean>(false)
  const [registerName, setRegisterName] = useState<string>("")
  const [isRegistering, setIsRegistering] = useState<boolean>(false)
  const [isJoiningGame, setIsJoiningGame] = useState<boolean>(false)
  const [gameIdToJoin, setGameIdToJoin] = useState<string>("")
  const [isCreatingGame, setIsCreatingGame] = useState<boolean>(false)
  const [isFindingGame, setIsFindingGame] = useState<boolean>(false)

  // Handle round winner/tie effects
  useEffect(() => {
    if (roundWinner !== undefined || roundTied) {
      setShowRoundSummary(true)
    }
  }, [roundWinner, roundTied])

  // Handle game winner effect
  useEffect(() => {
    if (gameWinner !== undefined) {
      setShowGameEnd(true)
    }
  }, [gameWinner])

  // Show rules on first load
  useEffect(() => {
    if (!rulesShownBefore && gameState) {
      setShowRules(true)
      setRulesShownBefore(true)
      localStorage.setItem('gwanRulesShown', 'true')
    }
  }, [gameState, rulesShownBefore])

  // Handle playing a card
  const handlePlayCard = async (cardIndex: number, targetRow: string | null = null) => {
    if (!gameState) return

    // For hearts or Ace of Hearts, we need to select a target row
    const card = gameState.players[playerIndex].hand[cardIndex]

    // Check if it's a hearts card or Joker - both need special handling for targeting a row
    if (((card.suit as string) === "hearts" || card.isJoker) && !targetRow) {
      setSelectedCard(cardIndex)
      setTargetRowSelection(true)
      setMessage(card.isJoker ? "Select a row for this Joker card" : "Select a row for this card")
      return
    }

    // Play the card via socket
    const result = await playCard(cardIndex, targetRow || undefined)

    if (result.success) {
      setMessage(`Card played successfully`)
      setSelectedCard(null)
      setTargetRowSelection(false)
    } else {
      setMessage(result.error || "Failed to play card")
    }
  }

  // Handle passing turn
  const handlePass = async () => {
    if (!gameState) return

    const result = await endTurn()

    if (result.success) {
      setMessage("Turn passed")
    } else {
      setMessage(result.error || "Failed to pass turn")
    }
  }

  // Handle undo last card placement
  const handleUndo = async () => {
    if (!gameState) return

    const result = await undoLastAction()

    if (result.success) {
      setMessage("Card returned to your hand")
    } else {
      setMessage(result.error || "Cannot undo at this time")
    }
  }

  // Handle target row selection
  const handleTargetRowSelect = (row: string) => {
    if (selectedCard === null) return
    
    handlePlayCard(selectedCard, row)
    setTargetRowSelection(false)
  }

  // Handle dice roll completion
  const handleDiceRollComplete = async (firstPlayerIndex: number) => {
    setShowDiceRoll(false)
    setMessage(`Player ${firstPlayerIndex + 1} won the roll and goes first!`)
    
    // Submit dice roll result to server
    await submitDiceRoll(firstPlayerIndex)
  }

  // Handle registration
  const handleRegister = async () => {
    if (!registerName.trim()) {
      setMessage("Please enter a username")
      return
    }

    setIsRegistering(true)
    const result = await register(registerName)
    setIsRegistering(false)

    if (result.success) {
      setMessage(`Registered as ${registerName}`)
    } else {
      setMessage(result.error || "Failed to register")
    }
  }

  // Handle game creation
  const handleCreateGame = async () => {
    setIsCreatingGame(true)
    const result = await createGame()
    setIsCreatingGame(false)

    if (result.success) {
      setMessage(`Game created! ID: ${result.gameId}`)
    } else {
      setMessage(result.error || "Failed to create game")
    }
  }

  // Handle joining a specific game
  const handleJoinGame = async () => {
    if (!gameIdToJoin.trim()) {
      setMessage("Please enter a game ID")
      return
    }

    setIsJoiningGame(true)
    const result = await joinGame(gameIdToJoin)
    setIsJoiningGame(false)

    if (result.success) {
      setMessage(`Joined game ${gameIdToJoin}`)
    } else {
      setMessage(result.error || "Failed to join game")
    }
  }

  // Handle finding a game (matchmaking)
  const handleFindGame = async () => {
    setIsFindingGame(true)
    const result = await joinGame()
    setIsFindingGame(false)

    if (result.success) {
      setMessage("Looking for a game...")
    } else {
      setMessage(result.error || "Failed to find game")
    }
  }

  // Handle leaving a game
  const handleLeaveGame = async () => {
    const result = await leaveGame()
    if (result.success) {
      setMessage("Left the game")
    }
  }

  // Handle next round
  const handleNextRound = () => {
    setShowRoundSummary(false)
    resetRoundState()
  }

  // Render connection status
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a0f0b] to-[#2a1a14] text-amber-100">
        <div className="text-center p-8 bg-[#2a1a14] rounded-lg border border-amber-800 max-w-md w-full">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">Connecting to Server</h2>
          <div className="flex justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          </div>
          <p>Establishing connection to the game server...</p>
        </div>
      </div>
    )
  }

  // Render registration form if not registered
  if (!username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a0f0b] to-[#2a1a14] text-amber-100">
        <div className="text-center p-8 bg-[#2a1a14] rounded-lg border border-amber-800 max-w-md w-full">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">Welcome to GWAN</h2>
          <p className="mb-6">Enter your username to continue</p>
          
          <div className="mb-4">
            <input
              type="text"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              placeholder="Username"
              className="w-full p-2 bg-amber-900/50 border border-amber-700 rounded text-amber-100 placeholder:text-amber-400/50"
            />
          </div>
          
          <Button 
            onClick={handleRegister}
            disabled={isRegistering}
            className="w-full bg-amber-700 hover:bg-amber-600 text-amber-100"
          >
            {isRegistering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </Button>
          
          {message && (
            <p className="mt-4 text-amber-400">{message}</p>
          )}
        </div>
      </div>
    )
  }

  // Render game lobby if not in a game
  if (!gameId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a0f0b] to-[#2a1a14] text-amber-100">
        <div className="text-center p-8 bg-[#2a1a14] rounded-lg border border-amber-800 max-w-md w-full">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">GWAN Multiplayer</h2>
          <p className="mb-6">Welcome, {username}! Choose an option to play.</p>
          
          <div className="grid gap-4 mb-6">
            <Button 
              onClick={handleCreateGame}
              disabled={isCreatingGame}
              className="bg-amber-700 hover:bg-amber-600 text-amber-100"
            >
              {isCreatingGame ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Game...
                </>
              ) : (
                "Create New Game"
              )}
            </Button>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={gameIdToJoin}
                onChange={(e) => setGameIdToJoin(e.target.value)}
                placeholder="Game ID"
                className="flex-1 p-2 bg-amber-900/50 border border-amber-700 rounded text-amber-100 placeholder:text-amber-400/50"
              />
              <Button 
                onClick={handleJoinGame}
                disabled={isJoiningGame}
                className="bg-amber-700 hover:bg-amber-600 text-amber-100"
              >
                {isJoiningGame ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Join"
                )}
              </Button>
            </div>
            
            <Button 
              onClick={handleFindGame}
              disabled={isFindingGame}
              className="bg-amber-700 hover:bg-amber-600 text-amber-100"
            >
              {isFindingGame ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finding Game...
                </>
              ) : (
                "Find a Game"
              )}
            </Button>
          </div>
          
          {message && (
            <p className="text-amber-400">{message}</p>
          )}
          
          {isWaiting && (
            <div className="mt-4 p-4 bg-amber-900/30 rounded-lg">
              <p className="mb-2">Waiting for opponent...</p>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-amber-400" />
              </div>
              <p className="mt-2 text-sm">Position in queue: {queuePosition}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render waiting screen if in game but waiting for opponent
  if (gameState && gameState.players.length < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1a0f0b] to-[#2a1a14] text-amber-100">
        <div className="text-center p-8 bg-[#2a1a14] rounded-lg border border-amber-800 max-w-md w-full">
          <h2 className="text-2xl font-bold text-amber-400 mb-4">Waiting for Opponent</h2>
          <div className="flex justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          </div>
          <p className="mb-6">Share this game ID with a friend to play together:</p>
          <div className="p-3 bg-amber-900/50 rounded-lg mb-6 font-mono text-lg">
            {gameId}
          </div>
          <Button 
            onClick={handleLeaveGame}
            className="bg-amber-700 hover:bg-amber-600 text-amber-100"
          >
            Leave Game
          </Button>
        </div>
      </div>
    )
  }

  // Main game UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0b] to-[#2a1a14]">
      {gameError && (
        <Alert variant="destructive" className="m-4 bg-red-900/50 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{gameError}</AlertDescription>
        </Alert>
      )}
      
      {gameState && (
        <>
          <GameHeader 
            gameState={gameState} 
            playerView={playerIndex}
            opponent={opponent || "Opponent"}
            onShowRules={() => setShowRules(true)}
            onLeaveGame={handleLeaveGame}
          />
          
          <div className="p-4 text-amber-200 text-center mb-2">
            {message}
          </div>
          
          <GameBoard 
            gameState={gameState} 
            playerView={playerIndex} 
          />
          
          <PlayerHand 
            hand={gameState.players[playerIndex].hand} 
            onPlayCard={handlePlayCard} 
            onPass={handlePass}
            onUndo={handleUndo}
            canUndo={gameState.currentPlayer === playerIndex}
            isPlayerTurn={gameState.currentPlayer === playerIndex}
          />
          
          {/* Modals */}
          {targetRowSelection && (
            <TargetRowModal 
              onSelectRow={handleTargetRowSelect} 
              onCancel={() => setTargetRowSelection(false)} 
            />
          )}
          
          {showRoundSummary && (
            <RoundSummaryModal 
              winner={roundWinner} 
              tied={roundTied} 
              onClose={handleNextRound} 
              playerScores={[
                gameState.players[0].score,
                gameState.players[1].score
              ]}
            />
          )}
          
          {showGameEnd && (
            <GameEndModal 
              winner={gameWinner} 
              onClose={() => setShowGameEnd(false)} 
              onReturnToMenu={handleLeaveGame}
            />
          )}
          
          {showRules && (
            <GameRulesModal 
              onClose={() => setShowRules(false)} 
            />
          )}
          
          {showMedicRevival && (
            <MedicRevivalModal 
              discardPile={gameState.players[playerIndex].discardPile}
              onSelectCard={() => setShowMedicRevival(false)} 
              onCancel={() => setShowMedicRevival(false)}
            />
          )}
          
          {showDecoyRetrieval && (
            <DecoyRetrievalModal 
              discardPile={gameState.players[playerIndex].discardPile}
              onSelectCard={() => setShowDecoyRetrieval(false)} 
              onCancel={() => setShowDecoyRetrieval(false)}
            />
          )}
          
          {showBlightCardSelection && (
            <BlightCardSelectionModal 
              availableCards={gameState.availableBlightCards || []}
              onSelectCard={(cardId: string) => {
                selectBlightCard(cardId);
                setShowBlightCardSelection(false);
              }}
            />
          )}
          
          {showDiceRoll && (
            <DiceRollModal 
              open={showDiceRoll}
              onDiceRollComplete={handleDiceRollComplete} 
            />
          )}
        </>
      )}
    </div>
  )
}
