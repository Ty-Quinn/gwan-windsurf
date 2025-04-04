"use client"

import { useState, useEffect } from "react"
import { GameState, Card, Field, BlightCard, BlightEffect } from "@/lib/types"
import { GwanGameLogic } from "@/lib/game-logic"
import GameBoard from "./game-board"
import PlayerHand from "./player-hand"
import GameHeader from "./game-header"
import TargetRowModal from "./target-row-modal"
import RoundSummaryModal from "./round-summary-modal"
import GameEndModal from "./game-end-modal"
import GameRulesModal from "./game-rules-modal"
import MedicRevivalModal from "./medic-revival-modal"
import DecoyRetrievalModal from "./decoy-retrieval-modal"
import DiceRollModal from "./dice-roll-modal"
import DiceRoller from "./dice-roller"
import RogueDiceModal from "./rogue-dice-modal"
import SniperDiceModal from "./sniper-dice-modal"
import BlightCardSelectionModal from "./blight-card-selection-modal"
import BlightCardPlayModal from "./blight-card-play-modal"
import BlightCardTargetModal from "./blight-card-target-modal"
import BlightDiceModal from "./blight-dice-modal"
import DevilRevivalModal from "./devil-revival-modal"
import MagicianEffectModal from "./magician-effect-modal"
import SuicideKingModal from "./suicide-king-modal"
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
  const [rulesShownBefore, setRulesShownBefore] = useState<boolean>(
    localStorage.getItem('gwanRulesShown') === 'true'
  )
  const [roundWinner, setRoundWinner] = useState<number | undefined>(undefined)
  const [roundTied, setRoundTied] = useState<boolean>(false)
  const [gameWinner, setGameWinner] = useState<number | undefined>(undefined)
  const [nextRoundPending, setNextRoundPending] = useState<boolean>(false)
  
  // Special card functionality
  const [showMedicRevival, setShowMedicRevival] = useState<boolean>(false)
  const [showDecoyRetrieval, setShowDecoyRetrieval] = useState<boolean>(false)
  const [showSuicideKingModal, setShowSuicideKingModal] = useState<boolean>(false)
  const [pendingSuicideKingCardIndex, setPendingSuicideKingCardIndex] = useState<number | null>(null)
  
  // Dice roll functionality
  const [showDiceRoll, setShowDiceRoll] = useState<boolean>(false)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  
  // Rogue and Sniper card states
  const [pendingRogueCardIndex, setPendingRogueCardIndex] = useState<number | null>(null)
  const [pendingSniperCardIndex, setPendingSniperCardIndex] = useState<number | null>(null)
  const [pendingCardTargetRow, setPendingCardTargetRow] = useState<string | null>(null)
  const [showRogueDiceRoll, setShowRogueDiceRoll] = useState<boolean>(false)
  const [showSniperDiceRoll, setShowSniperDiceRoll] = useState<boolean>(false)
  
  // Undo functionality
  const [lastAction, setLastAction] = useState<LastAction | null>(null)
  const [turnEnded, setTurnEnded] = useState<boolean>(false)
  const [prevGameState, setPrevGameState] = useState<GameState | null>(null)
  
  // Blight cards functionality
  const [showBlightCardSelection, setShowBlightCardSelection] = useState<boolean>(false)
  const [showBlightCardPlay, setShowBlightCardPlay] = useState<boolean>(false)
  const [showBlightCardTarget, setShowBlightCardTarget] = useState<boolean>(false)
  const [showBlightDiceRoll, setShowBlightDiceRoll] = useState<boolean>(false)
  const [showDevilRevival, setShowDevilRevival] = useState<boolean>(false)
  const [currentBlightEffect, setCurrentBlightEffect] = useState<BlightEffect | null>(null)
  const [blightTargetRow, setBlightTargetRow] = useState<keyof Field | undefined>(undefined)
  
  // Dedicated modal for Magician effect
  const [showMagicianEffect, setShowMagicianEffect] = useState<boolean>(false)
  
  // For second blight card selection
  const [isSecondBlightSelection, setIsSecondBlightSelection] = useState<boolean>(false)
  const [excludedBlightCardIds, setExcludedBlightCardIds] = useState<string[]>([])

  // Initialize the game
  useEffect(() => {
    const newGame = new GwanGameLogic()
    newGame.initializeGame()
    newGame.initializeRound()

    setGame(newGame)
    setGameState(newGame.getGameState())
    
    // Message about starting process - we'll show dice roll after Blight card selection
    setMessage("Choose your Blight card for this match")
  }, [])
  
  // Show dice roll only after both players have chosen their Blight cards
  useEffect(() => {
    if (gameState && 
        !gameStarted && 
        gameState.players[0].blightCards.length > 0 && 
        gameState.players[1].blightCards.length > 0) {
      
      // Both players have chosen Blight cards, now show dice roll
      setShowDiceRoll(true)
      setMessage("Roll to determine who goes first!")
      
      // Mark Blight cards as being selected for the game
      if (game) {
        const updatedState = {...gameState, blightCardsSelected: true}
        game.initializeGameFromState(updatedState)
        setGameState(updatedState)
      }
    }
  }, [gameState?.players[0]?.blightCards?.length, gameState?.players[1]?.blightCards?.length, gameStarted])
  
  // Show initial Blight card selection for Player 1 when the game is first loaded
  useEffect(() => {
    if (gameState && gameState.currentRound === 1 && !gameStarted && !gameState.blightCardsSelected) {
      // Player 1 selects first before any dice rolls
      setPlayerView(0); // Ensure we're showing Player 1's view
      setShowBlightCardSelection(true);
    }
  }, [gameState?.currentRound, gameStarted, gameState?.blightCardsSelected]);
  
  // Show Blight card selection for Player 2 after Player 1 has selected but before dice roll
  useEffect(() => {
    if (gameState && 
        gameState.currentRound === 1 && 
        !gameStarted && 
        !gameState.blightCardsSelected &&
        gameState.players[0].blightCards.length > 0 && 
        gameState.players[1].blightCards.length === 0) {
      // Player 2's turn to select after Player 1 has selected
      setPlayerView(1); // Switch to Player 2's view for selection
      setShowBlightCardSelection(true);
    }
  }, [gameStarted, gameState?.blightCardsSelected, 
      gameState?.players[0]?.blightCards?.length, 
      gameState?.players[1]?.blightCards?.length]);
  
  // Handle dice roll completion and set the first player
  const handleDiceRollComplete = (firstPlayerIndex: number) => {
    if (!game || !gameState) return
    
    // Update the game state with the first player determined by dice roll
    const updatedGameState = {...gameState, currentPlayer: firstPlayerIndex}
    
    // Get a new instance of the game and set the state
    const updatedGame = new GwanGameLogic()
    updatedGame.initializeGameFromState(updatedGameState)
    
    setGame(updatedGame)
    setGameState(updatedGameState)
    setPlayerView(firstPlayerIndex) // Set the view to the player who goes first
    setShowDiceRoll(false)
    setGameStarted(true)
    setMessage(`Player ${firstPlayerIndex + 1} won the roll and goes first! Play a card or pass.`)
  }
  
  // Show rules only on first load of the game if they haven't been shown before
  useEffect(() => {
    // Only show rules when the game is first initialized and not shown before in this session
    if (!rulesShownBefore && gameState && gameState.currentRound === 1 
        && gameState.players[0].field.clubs.length === 0 
        && gameState.players[0].field.spades.length === 0 
        && gameState.players[0].field.diamonds.length === 0
        && gameState.players[1].field.clubs.length === 0 
        && gameState.players[1].field.spades.length === 0 
        && gameState.players[1].field.diamonds.length === 0) {
      setShowRules(true)
      // Mark that rules have been shown in this session
      setRulesShownBefore(true)
      localStorage.setItem('gwanRulesShown', 'true')
    }
  }, [gameState, rulesShownBefore])

  // Handle playing a card
  const handlePlayCard = (cardIndex: number, targetRow: string | null = null) => {
    if (!game || !gameState) return

    // Save the current game state for potential undo
    // Always save the state before playing a card
    setPrevGameState(JSON.parse(JSON.stringify(gameState)))

    // For hearts or Ace of Hearts, we need to select a target row
    const card = gameState.players[playerView].hand[cardIndex]

    // Check if it's a hearts card or Joker - both need special handling for targeting a row
    // Using type assertion to handle the comparison properly
    if (((card.suit as string) === "hearts" || card.isJoker) && !targetRow) {
      setSelectedCard(cardIndex)
      setTargetRowSelection(true)
      setMessage(card.isJoker ? "Select a row for this Joker card" : "Select a row for this card")
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
      
      // If this is a medic card, show the revival modal
      if (result.isMedicRevival) {
        setShowMedicRevival(true)
      }
      
      // If this is a decoy card, show the retrieval modal
      if (result.isDecoyRetrieval) {
        setShowDecoyRetrieval(true)
      }
      
      // If this is a Rogue card, store the card details and show the dice roller
      if (result.isRogueDiceRoll) {
        setPendingRogueCardIndex(cardIndex)
        setPendingCardTargetRow(targetRow)
        setShowRogueDiceRoll(true)
        // No need to add the card to lastAction since it hasn't been played to the field yet
        setLastAction(null)
        setPrevGameState(null)
      }
      
      // If this is a Sniper card, store the card details and show the dice roller
      if (result.isSniperDiceRoll) {
        setPendingSniperCardIndex(cardIndex)
        setPendingCardTargetRow(targetRow)
        setShowSniperDiceRoll(true)
        // No need to add the card to lastAction since it hasn't been played to the field yet
        setLastAction(null)
        setPrevGameState(null)
      }
      
      // If this is a Suicide King, store the card index and show the modal
      if (result.isSuicideKing) {
        setPendingSuicideKingCardIndex(cardIndex)
        setShowSuicideKingModal(true)
        // No need to add the card to lastAction since it hasn't been played to the field yet
        setLastAction(null)
        setPrevGameState(null)
      }
      
      // Check for game end first (takes priority)
      if (result.gameEnded) {
        // If the game has ended, we need to set both the round winner and game winner
        setRoundWinner(result.roundWinner)
        setGameWinner(result.roundWinner)
        setShowGameEnd(true)
      }
      // Otherwise check for round end
      else if (result.roundWinner !== undefined || result.roundTied) {
        setRoundWinner(result.roundWinner)
        setRoundTied(result.roundTied || false)
        setShowRoundSummary(true)
        setNextRoundPending(true)
      }
      
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
    
    if (lastAction.card.suit === "hearts" || lastAction.card.isJoker) {
      // For hearts cards and Joker cards, we use the target row that was selected
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
      // Calculate and update scores before switching player view
      if (game) {
        game.calculateScores()
      }
      
      setGameState(game.getGameState())
      setMessage(result.message)
      setTurnEnded(true) // Can't undo after passing
      setPrevGameState(null)
      setLastAction(null)

      // Check for game end first (takes priority)
      if (result.gameEnded) {
        // If the game has ended, we need to set both the round winner and game winner
        setRoundWinner(result.roundWinner)
        setGameWinner(result.roundWinner)
        setShowGameEnd(true)
      }
      // Otherwise check for round end
      else if (result.roundWinner !== undefined || result.roundTied) {
        setRoundWinner(result.roundWinner)
        setRoundTied(result.roundTied || false)
        setShowRoundSummary(true)
        setNextRoundPending(true)
      }
      // If round isn't over, automatically switch to the other player
      else {
        setPlayerView(1 - playerView)
      }
    } else {
      setMessage(result.message)
    }
  }

  // Handle row selection for hearts cards or Joker cards
  const handleRowSelect = (row: string) => {
    if (selectedCard !== null) {
      handlePlayCard(selectedCard, row)
    }
  }

  // General handler to undo a card play in case of modal cancellation
  const handleUndoCardPlay = (cardToReturn: Card, rowName: keyof Field) => {
    if (!game || !gameState) return

    const result = game.undoLastCardPlayed(playerView, cardToReturn, rowName)
    
    if (result.success) {
      setGameState(game.getGameState())
      setMessage(result.message || "Card returned to your hand")
    } else {
      setMessage(result.message || "Failed to return card to hand")
    }
  }
  
  // Handle card selection from discard pile for medic revival
  const handleMedicRevival = (card: Card, discardIndex: number) => {
    if (!game || !gameState) return

    const result = game.completeMedicRevival(playerView, discardIndex)
    
    if (result.success) {
      setGameState(game.getGameState())
      setMessage(result.message || "Card revived from discard pile!")
      setShowMedicRevival(false)
      
      // Check for game end first (takes priority)
      if (result.gameEnded) {
        // If the game has ended, we need to set both the round winner and game winner
        setRoundWinner(result.roundWinner)
        setGameWinner(result.roundWinner)
        setShowGameEnd(true)
      }
      // Otherwise check for round end
      else if (result.roundWinner !== undefined || result.roundTied) {
        setRoundWinner(result.roundWinner)
        setRoundTied(result.roundTied || false)
        setShowRoundSummary(true)
        setNextRoundPending(true)
      }
    } else {
      setMessage(result.message || "Failed to revive card")
    }
  }
  
  // Handle card retrieval from field for decoy card
  const handleDecoyRetrieval = (row: keyof Field, cardIndex: number) => {
    if (!game || !gameState) return
    
    const result = game.completeDecoyRetrieval(playerView, row, cardIndex)
    
    if (result.success) {
      setGameState(game.getGameState())
      setMessage(result.message || "Card retrieved from the field!")
      setShowDecoyRetrieval(false)
      
      // Check for game end first (takes priority)
      if (result.gameEnded) {
        // If the game has ended, we need to set both the round winner and game winner
        setRoundWinner(result.roundWinner)
        setGameWinner(result.roundWinner)
        setShowGameEnd(true)
      }
      // Otherwise check for round end
      else if (result.roundWinner !== undefined || result.roundTied) {
        setRoundWinner(result.roundWinner)
        setRoundTied(result.roundTied || false)
        setShowRoundSummary(true)
        setNextRoundPending(true)
      }
    } else {
      setMessage(result.message || "Failed to retrieve card")
    }
  }
  
  // Handle Rogue dice roll completion (use dice total as card value)
  const handleRogueDiceRoll = (results: number[], total: number) => {
    if (!game || !gameState || pendingRogueCardIndex === null) return
    
    const result = game.completeRoguePlay(playerView, pendingRogueCardIndex, total, pendingCardTargetRow)
    
    if (result.success) {
      setGameState(game.getGameState())
      setMessage(result.message || `Played Rogue card with value ${total}`)
      setShowRogueDiceRoll(false)
      setPendingRogueCardIndex(null)
      setPendingCardTargetRow(null)
      
      // Check for game end first (takes priority)
      if (result.gameEnded) {
        // If the game has ended, we need to set both the round winner and game winner
        setRoundWinner(result.roundWinner)
        setGameWinner(result.roundWinner)
        setShowGameEnd(true)
      }
      // Otherwise check for round end
      else if (result.roundWinner !== undefined || result.roundTied) {
        setRoundWinner(result.roundWinner)
        setRoundTied(result.roundTied || false)
        setShowRoundSummary(true)
        setNextRoundPending(true)
      }
    } else {
      setMessage(result.message || "Failed to play Rogue card")
    }
  }
  
  // Handle Sniper dice roll completion (check for doubles)
  const handleSniperDiceRoll = (results: number[], total: number, isDoubles?: boolean) => {
    if (!game || !gameState || pendingSniperCardIndex === null) return
    
    // Use the provided isDoubles if available, otherwise calculate it
    const hasDoubles = isDoubles !== undefined ? isDoubles : (results.length === 2 && results[0] === results[1])
    
    const result = game.completeSniperPlay(playerView, pendingSniperCardIndex, results, hasDoubles, pendingCardTargetRow)
    
    if (result.success) {
      setGameState(game.getGameState())
      setMessage(result.message || `Played Sniper card${isDoubles ? " and eliminated opponent's highest card!" : ""}`)
      setShowSniperDiceRoll(false)
      setPendingSniperCardIndex(null)
      setPendingCardTargetRow(null)
      
      // Check for game end first (takes priority)
      if (result.gameEnded) {
        // If the game has ended, we need to set both the round winner and game winner
        setRoundWinner(result.roundWinner)
        setGameWinner(result.roundWinner)
        setShowGameEnd(true)
      }
      // Otherwise check for round end
      else if (result.roundWinner !== undefined || result.roundTied) {
        setRoundWinner(result.roundWinner)
        setRoundTied(result.roundTied || false)
        setShowRoundSummary(true)
        setNextRoundPending(true)
      }
    } else {
      setMessage(result.message || "Failed to play Sniper card")
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
    const newState = game.getGameState()
    setGameState(newState)
    
    // Set player view to match the starting player (loser of previous round goes first)
    setPlayerView(newState.currentPlayer)
    
    setMessage(`Round ${newState.currentRound} starting!`)
  }
  
  // Blight Card Handling Functions
  
  // Handle selecting a blight card at the start of a match
  const handleBlightCardSelection = (playerIndex: number, blightCard: BlightCard) => {
    if (!game || !gameState) return
    
    const result = game.setBlightCard(playerIndex, blightCard)
    
    if (result.success) {
      setGameState(game.getGameState())
      setShowBlightCardSelection(false)
      
      // Reset the second selection state if this was a second selection
      if (isSecondBlightSelection) {
        setIsSecondBlightSelection(false)
        setExcludedBlightCardIds([])
        setMessage(`You've selected a second Blight card: ${blightCard.name}`)
      } else {
        setMessage(result.message || `Player ${playerIndex + 1} selected a Blight card`)
      }
    } else {
      setMessage(result.message || "Failed to select Blight card")
    }
  }
  
  // Handle playing a blight card
  const handlePlayBlightCard = (blightCardIndex: number = 0) => {
    if (!game || !gameState) return
    
    // Get the selected blight card and check if it's the Magician
    if (gameState.players[playerView].blightCards.length === 0) {
      setMessage("You don't have any blight cards to play");
      return;
    }
    
    const blightCard = gameState.players[playerView].blightCards[blightCardIndex];
    
    // If it's the Magician, use our dedicated modal
    if (blightCard && blightCard.effect === BlightEffect.MAGICIAN) {
      setShowBlightCardPlay(false);
      setCurrentBlightEffect(BlightEffect.MAGICIAN);
      setShowMagicianEffect(true);
      setMessage("Select a row to target with the Magician's effect");
      return;
    }
    
    // For all other blight cards, use the regular flow
    const result = game.playBlightCard(playerView, blightCardIndex)
    
    if (result.success) {
      setGameState(game.getGameState())
      setShowBlightCardPlay(false)
      
      // Handle specific blight card effects that need further user input
      if (result.requiresBlightSelection) {
        setCurrentBlightEffect(result.blightEffect || null)
        setShowBlightCardTarget(true)
        setMessage("Select a target for your Blight card effect")
      } else if (result.requiresBlightDiceRoll) {
        setCurrentBlightEffect(result.blightEffect || null)
        setShowBlightDiceRoll(true)
        setMessage("Roll the dice for your Blight card effect")
      } else {
        setMessage(result.message || "Blight card effect completed")
      }
    } else {
      setMessage(result.message || "Failed to play Blight card")
    }
  }
  
  // Handle selecting a target for blight card effect
  const handleBlightTargetSelection = (
    effect: BlightEffect, 
    targetPlayerIndex: number, 
    targetRowName?: keyof Field, 
    targetCardIndex?: number,
    diceResults?: number[],
    success?: boolean
  ) => {
    if (!game || !gameState || !currentBlightEffect) return
    
    console.log("BlightTargetSelection called with:", {
      effect,
      targetPlayerIndex,
      targetRowName,
      targetCardIndex,
      diceResults: diceResults ? diceResults.join(",") : "none", 
      success
    });
    
    // Store the target row for later use in dice rolls (especially for Magician effect)
    if (targetRowName) {
      setBlightTargetRow(targetRowName);
    }
    
    // Special handling for Magician effect when dice roll happened in the target modal
    if (effect === BlightEffect.MAGICIAN && diceResults && success !== undefined && targetRowName) {
      console.log("Calling handleBlightDiceRoll directly for Magician effect");
      // If we already have dice results from the modal, call the dice roll handler directly
      handleBlightDiceRoll(effect, diceResults, success);
      return;
    }
    
    // When passing to game-logic, we send the current effect from state
    const result = game.completeBlightCardTarget(
      playerView,
      currentBlightEffect, 
      targetPlayerIndex, 
      targetRowName, 
      targetCardIndex
    )
    
    if (result.success) {
      // Get updated state immediately
      const freshState = game.getGameState();
      console.log("Target selection succeeded, updating game state");
      
      setGameState(freshState);
      setShowBlightCardTarget(false);
      
      // Don't clear currentBlightEffect if we're going to show a dice roll next
      if (!result.requiresBlightDiceRoll) {
        setCurrentBlightEffect(null);
        setBlightTargetRow(undefined);
      }
      
      setMessage(result.message || "Blight card effect applied successfully")
    } else {
      setMessage(result.message || "Failed to apply Blight card effect")
    }
  }
  
  // Handle dice roll for blight card effect
  const handleBlightDiceRoll = (
    effect: BlightEffect, 
    diceResults: number[], 
    success: boolean
  ) => {
    if (!game || !gameState || !currentBlightEffect) {
      console.error("Missing required states for handleBlightDiceRoll:", 
        { game: !!game, gameState: !!gameState, currentBlightEffect });
      return;
    }
    
    // Get target row for the Magician effect from state
    const targetRow = blightTargetRow;
    
    // Extra validation for Magician effect
    if (effect === BlightEffect.MAGICIAN && !targetRow) {
      console.error("Missing target row for Magician effect");
      setMessage("Error: No target row selected for Magician effect");
      return;
    }
    
    console.log("Processing blight dice roll:", { 
      effect, 
      diceResults, 
      success, 
      targetRow,
      opponentCards: targetRow ? gameState.players[1-playerView].field[targetRow] : 'none'
    });
    
    // Apply the effect in the game logic
    const result = game.completeBlightCardDiceRoll(
      playerView,
      currentBlightEffect, 
      diceResults, 
      success,
      targetRow
    )
    
    if (result.success) {
      // Update state with the latest data
      setGameState(game.getGameState());
      setShowBlightDiceRoll(false);
      
      // Special handling for Devil card effect if successful
      if (effect === BlightEffect.DEVIL && success) {
        setShowDevilRevival(true);
        setMessage("Select a card to revive from any discard pile");
      } else {
        setCurrentBlightEffect(null);
        setBlightTargetRow(undefined); // Clear the target row state
        setMessage(result.message || "Blight card effect completed");
      }
    } else {
      setMessage(result.message || "Failed to complete Blight card effect");
    }
  }
  
  // Handle reviving a card from any discard pile (Devil effect)
  const handleDevilRevival = (playerIndex: number, cardIndex: number) => {
    if (!game || !gameState) return
    
    const result = game.reviveCardFromDiscard(playerView, playerIndex, cardIndex)
    
    if (result.success) {
      setGameState(game.getGameState())
      setShowDevilRevival(false)
      setCurrentBlightEffect(null)
      setMessage(result.message || "Card revived from discard pile!")
    } else {
      setMessage(result.message || "Failed to revive card")
    }
  }
  
  // Start a new game
  const startNewGame = () => {
    const newGame = new GwanGameLogic()
    newGame.initializeGame()
    newGame.initializeRound()

    setGame(newGame)
    setGameState(newGame.getGameState())
    setShowGameEnd(false)
    setRoundWinner(undefined)
    setRoundTied(false)
    setGameWinner(undefined)
    setTurnEnded(false)
    setLastAction(null)
    setPrevGameState(null)
    setGameStarted(false)
    
    // Show dice roll to determine who goes first
    setShowDiceRoll(true)
    setMessage("Roll to determine who goes first!")
    
    // Log for debugging
    console.log("New game started, players:", newGame.getGameState().players)
  }
  
  // Start a completely new match
  const startNewMatch = () => {
    // Reset everything, similar to startNewGame
    const newGame = new GwanGameLogic()
    newGame.initializeGame()
    newGame.initializeRound()

    setGame(newGame)
    setGameState(newGame.getGameState())
    setShowGameEnd(false)
    setRoundWinner(undefined)
    setRoundTied(false)
    setGameWinner(undefined)
    setTurnEnded(false)
    setLastAction(null)
    setPrevGameState(null)
    setGameStarted(false)
    
    // Show dice roll to determine who goes first
    setShowDiceRoll(true)
    setMessage("Roll to determine who goes first!")
    
    // Log for debugging
    console.log("New match started, players:", newGame.getGameState().players)
  }

  if (!game || !gameState) {
    return <div className="flex items-center justify-center h-screen">Loading game...</div>
  }

  const currentPlayer = gameState.players[playerView]
  const opponent = gameState.players[1 - playerView]
  const isCurrentTurn = gameState.currentPlayer === playerView

  // Handle Suicide King effects
  const handleSuicideKingClearWeather = () => {
    if (!game || !gameState || pendingSuicideKingCardIndex === null) return
    
    const result = game.completeSuicideKingClearWeather(playerView, pendingSuicideKingCardIndex)
    
    if (result.success) {
      setGameState(game.getGameState())
      setShowSuicideKingModal(false)
      setPendingSuicideKingCardIndex(null)
      setMessage(result.message || "The Suicide King cleared all weather effects!")
      
      // Check for game end first (takes priority)
      if (result.gameEnded) {
        // If the game has ended, we need to set both the round winner and game winner
        setRoundWinner(result.roundWinner)
        setGameWinner(result.roundWinner)
        setShowGameEnd(true)
      }
      // Otherwise check for round end
      else if (result.roundWinner !== undefined || result.roundTied) {
        setRoundWinner(result.roundWinner)
        setRoundTied(result.roundTied || false)
        setShowRoundSummary(true)
        setNextRoundPending(true)
      }
    } else {
      setMessage(result.message || "Failed to clear weather effects")
    }
  }
  
  // Using the state variables declared at the top of the component
  
  const handleSuicideKingSelectBlight = () => {
    if (!game || !gameState || pendingSuicideKingCardIndex === null) return
    
    const result = game.completeSuicideKingSelectBlight(playerView, pendingSuicideKingCardIndex)
    
    if (result.success) {
      setGameState(game.getGameState())
      setShowSuicideKingModal(false)
      setPendingSuicideKingCardIndex(null)
      
      // Get currently selected blight card IDs to exclude them from selection
      const currentPlayerBlightCardIds = gameState.players[playerView].blightCards.map(card => card.id)
      setExcludedBlightCardIds(currentPlayerBlightCardIds)
      
      // Show blight card selection modal with second selection flag
      setIsSecondBlightSelection(true)
      setShowBlightCardSelection(true)
      setMessage(result.message || "The Suicide King grants you a new Blight card selection!")
      
      // Check for game end first (takes priority)
      if (result.gameEnded) {
        // If the game has ended, we need to set both the round winner and game winner
        setRoundWinner(result.roundWinner)
        setGameWinner(result.roundWinner)
        setShowGameEnd(true)
      }
      // Otherwise check for round end
      else if (result.roundWinner !== undefined || result.roundTied) {
        setRoundWinner(result.roundWinner)
        setRoundTied(result.roundTied || false)
        setShowRoundSummary(true)
        setNextRoundPending(true)
      }
    } else {
      setMessage(result.message || "Failed to grant second Blight card")
    }
  }

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <GameHeader 
        gameState={gameState} 
        playerView={playerView} 
        switchPlayerView={switchPlayerView} 
        message={message}
        showRules={() => {
          setShowRules(true)
          setRulesShownBefore(true)
          localStorage.setItem('gwanRulesShown', 'true')
        }}
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
        showBlightCard={() => setShowBlightCardPlay(true)}
      />

      {targetRowSelection && (
        <TargetRowModal
          handleRowSelect={handleRowSelect}
          onCancel={() => {
            // No need to undo here because the card hasn't been played yet
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
          onNewMatch={startNewMatch}
        />
      )}
      
      {showRules && (
        <GameRulesModal
          onClose={() => setShowRules(false)}
        />
      )}
      
      {showMedicRevival && (
        <MedicRevivalModal
          player={currentPlayer}
          onSelectCard={handleMedicRevival}
          onCancel={() => {
            // Find the medic card that's in play
            // We know it's a 3 card and will be in one of the player's fields
            let medicCard: Card | null = null;
            let medicRow: keyof Field | null = null;
            
            for (const row of ["clubs", "spades", "diamonds"] as const) {
              const cardIndex = currentPlayer.field[row].findIndex((c: Card) => c.isMedic);
              if (cardIndex !== -1) {
                medicCard = currentPlayer.field[row][cardIndex];
                medicRow = row;
                break;
              }
            }

            if (medicCard && medicRow) {
              // Undo the medic card play
              handleUndoCardPlay(medicCard, medicRow);
            }
            
            setShowMedicRevival(false);
            setMessage("Medic card play cancelled and card returned to your hand");
          }}
        />
      )}
      
      {showDecoyRetrieval && (
        <DecoyRetrievalModal
          player={currentPlayer}
          onSelectCard={handleDecoyRetrieval}
          onCancel={() => {
            // Find the decoy card that's in play
            // We know it's a 4 card and will be in one of the player's fields
            let decoyCard: Card | null = null;
            let decoyRow: keyof Field | null = null;
            
            // Process only rows that exist in Field type
            for (const row of ["clubs", "spades", "diamonds"] as const) {
              const cardIndex = currentPlayer.field[row].findIndex((c: Card) => c.isDecoy);
              if (cardIndex !== -1) {
                decoyCard = currentPlayer.field[row][cardIndex];
                decoyRow = row;
                break;
              }
            }

            if (decoyCard && decoyRow) {
              // Undo the decoy card play
              handleUndoCardPlay(decoyCard, decoyRow);
            }
            
            setShowDecoyRetrieval(false);
            setMessage("Decoy card play cancelled and card returned to your hand");
          }}
        />
      )}
      
      {/* Dice roll modal to determine first player */}
      <DiceRollModal 
        open={showDiceRoll}
        onDiceRollComplete={handleDiceRollComplete}
      />
      
      {/* Dice roll for Rogue card value determination */}
      {showRogueDiceRoll && pendingRogueCardIndex !== null && gameState && (
        <RogueDiceModal
          open={showRogueDiceRoll}
          card={gameState.players[playerView].hand[pendingRogueCardIndex]}
          onComplete={(diceValue) => {
            handleRogueDiceRoll([0, 0], diceValue); // We're only interested in the total
            setShowRogueDiceRoll(false);
            setPendingRogueCardIndex(null);
            setPendingCardTargetRow(null);
          }}
          onCancel={() => {
            setShowRogueDiceRoll(false);
            setPendingRogueCardIndex(null);
            setPendingCardTargetRow(null);
            setMessage("Card play cancelled");
          }}
        />
      )}
      
      {/* Dice roll for Sniper card effect */}
      {showSniperDiceRoll && pendingSniperCardIndex !== null && gameState && (
        <SniperDiceModal
          open={showSniperDiceRoll}
          card={gameState.players[playerView].hand[pendingSniperCardIndex]}
          onComplete={(diceValues, isDoubles) => {
            handleSniperDiceRoll(diceValues, diceValues.reduce((a, b) => a + b, 0), isDoubles);
            // The dice roll modal handles its own state
          }}
          onCancel={() => {
            setShowSniperDiceRoll(false);
            setPendingSniperCardIndex(null);
            setPendingCardTargetRow(null);
            setMessage("Card play cancelled");
          }}
        />
      )}
      
      {/* Blight Card Selection Modal */}
      {showBlightCardSelection && gameState && (
        <BlightCardSelectionModal
          open={showBlightCardSelection}
          playerIndex={playerView}
          onSelectCard={handleBlightCardSelection}
          onClose={() => {
            setShowBlightCardSelection(false)
            setIsSecondBlightSelection(false)
            setExcludedBlightCardIds([])
          }}
          excludedCardIds={excludedBlightCardIds}
          isSecondSelection={isSecondBlightSelection}
        />
      )}
      
      {/* Blight Card Play Modal */}
      {showBlightCardPlay && gameState && currentPlayer.blightCards.length > 0 && !currentPlayer.hasUsedBlightCard && (
        <BlightCardPlayModal
          open={showBlightCardPlay}
          player={currentPlayer}
          onPlayBlightCard={(index) => handlePlayBlightCard(index)}
          onCancel={() => setShowBlightCardPlay(false)}
        />
      )}
      
      {/* Blight Card Target Selection Modal */}
      {showBlightCardTarget && gameState && currentBlightEffect && (
        <BlightCardTargetModal
          open={showBlightCardTarget}
          effect={currentBlightEffect}
          playerView={playerView}
          players={gameState.players}
          onSelectTarget={handleBlightTargetSelection}
          onCancel={() => {
            setShowBlightCardTarget(false);
            setCurrentBlightEffect(null);
            setMessage("Blight card effect cancelled");
          }}
        />
      )}
      
      {/* Blight Dice Roll Modal */}
      {showBlightDiceRoll && gameState && currentBlightEffect && (
        <BlightDiceModal
          open={showBlightDiceRoll}
          effect={currentBlightEffect}
          blightCard={currentPlayer.blightCards.length > 0 ? currentPlayer.blightCards.find(card => card.effect === currentBlightEffect) || null : null}
          onComplete={handleBlightDiceRoll}
          onCancel={() => {
            setShowBlightDiceRoll(false);
            setCurrentBlightEffect(null);
            setBlightTargetRow(undefined); // Clear the target row state on cancel
            setMessage("Blight card effect cancelled");
          }}
        />
      )}
      
      {/* Devil Card Revival Modal */}
      {showDevilRevival && gameState && (
        <DevilRevivalModal
          players={gameState.players}
          playerView={playerView}
          onSelectCard={handleDevilRevival}
          onCancel={() => {
            setShowDevilRevival(false);
            setCurrentBlightEffect(null);
            setMessage("Card revival cancelled");
          }}
        />
      )}
      
      {/* Magician Effect Modal - Special handling for Magician blight card */}
      {showMagicianEffect && gameState && (
        <MagicianEffectModal
          open={showMagicianEffect}
          playerView={playerView}
          players={gameState.players}
          onComplete={(targetPlayerIndex, targetRowName, diceResults, success) => {
            console.log("Magician effect completed with:", {
              targetPlayerIndex,
              targetRowName,
              diceResults,
              success
            });
            
            // This is critically important - store the target row name
            setBlightTargetRow(targetRowName);
            
            // Double-check we have the necessary data
            if (!game || !currentBlightEffect) {
              console.error("Missing game or currentBlightEffect in Magician effect");
              return;
            }
            
            // Directly apply the effect in game logic to avoid the row information being lost
            const result = game.completeBlightCardDiceRoll(
              playerView,
              BlightEffect.MAGICIAN,
              diceResults,
              success,
              targetRowName  // Use targetRowName directly here
            );
            
            if (result.success) {
              // Update game state
              setGameState(game.getGameState());
              setCurrentBlightEffect(null);
              setMessage(result.message || "Magician effect completed");
            } else {
              setMessage(result.message || "Failed to apply Magician effect");
            }
            
            // Close the modal
            setShowMagicianEffect(false);
          }}
          onCancel={() => {
            setShowMagicianEffect(false);
            setCurrentBlightEffect(null);
            setMessage("Magician effect cancelled");
          }}
        />
      )}
      
      {/* Suicide King Modal */}
      {showSuicideKingModal && gameState && pendingSuicideKingCardIndex !== null && (
        <SuicideKingModal
          open={showSuicideKingModal}
          card={currentPlayer.hand[pendingSuicideKingCardIndex] || null}
          onClearWeather={handleSuicideKingClearWeather}
          onSelectSecondBlight={handleSuicideKingSelectBlight}
          onCancel={() => {
            setShowSuicideKingModal(false);
            setPendingSuicideKingCardIndex(null);
            setMessage("Suicide King ability cancelled");
          }}
        />
      )}
    </div>
  )
}
