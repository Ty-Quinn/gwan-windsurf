'use client'

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { GameState, Player, Card, Field, WeatherEffects, BlightCard } from "@/lib/types";
import GameBoard from "@/components/game-board";
import PlayerHand from "@/components/player-hand";
import GameHeader from "@/components/game-header";
import { makeAIDecision, AIDifficulty } from "@/lib/ai-logic";

// Sample initial game state function
function createInitialGameState(): GameState {
  // Create an empty field structure
  const createEmptyField = (): Field => ({
    melee: [],
    ranged: [],
    siege: []
  });

  // Initialize weather effects (all false)
  const initialWeatherEffects: WeatherEffects = {
    fog: false,
    frost: false,
    rain: false
  };

  // Create players
  const humanPlayer: Player = {
    name: "Player",
    hand: generateInitialHand(),
    field: createEmptyField(),
    score: 0,
    roundsWon: 0,
    pass: false,
    discardPile: [],
    blightCards: [],
    hasUsedBlightThisTurn: false,
    wheelOfFortuneBonus: 0
  };

  const aiPlayer: Player = {
    name: "AI Opponent",
    hand: generateInitialHand(),
    field: createEmptyField(),
    score: 0,
    roundsWon: 0,
    pass: false,
    discardPile: [],
    blightCards: [],
    hasUsedBlightThisTurn: false,
    wheelOfFortuneBonus: 0
  };

  // Initial game state
  return {
    players: [humanPlayer, aiPlayer],
    currentPlayer: 0, // Human player goes first
    currentRound: 1,
    deckCount: 54 - 20, // Assuming we've dealt 10 cards to each player
    weatherEffects: initialWeatherEffects,
    blightCardsSelected: false,
    availableBlightCards: [],
    isBlightCardBeingPlayed: false,
    isSuicideKingBeingPlayed: false
  };
}

// Function to generate a simple initial hand for testing
function generateInitialHand(): Card[] {
  // Sample cards for initial hand
  return [
    {
      suit: "hearts",
      value: 10,
      baseValue: 10,
      isCommander: true,
      isWeather: false,
      isSpy: false,
      isMedic: false
    },
    {
      suit: "clubs",
      value: 7,
      baseValue: 7,
      isCommander: false,
      isWeather: false,
      isSpy: false,
      isMedic: false
    },
    {
      suit: "spades",
      value: 8,
      baseValue: 8,
      isCommander: false,
      isWeather: false,
      isSpy: false,
      isMedic: false
    },
    {
      suit: "diamonds",
      value: 6,
      baseValue: 6,
      isCommander: false,
      isWeather: false,
      isSpy: true,
      isMedic: false
    },
    {
      suit: "hearts",
      value: 2,
      baseValue: 2,
      isCommander: false,
      isWeather: false,
      isSpy: false,
      isMedic: false,
      isRogue: true
    },
    {
      suit: "spades",
      value: 13,
      baseValue: 13,
      isCommander: false,
      isWeather: true,
      isSpy: false,
      isMedic: false
    },
    {
      suit: "hearts",
      value: 13,
      baseValue: 13,
      isCommander: false,
      isWeather: false,
      isSpy: false,
      isMedic: true
    },
    {
      suit: "joker",
      value: 0,
      baseValue: 0,
      isCommander: false,
      isWeather: false,
      isSpy: false,
      isMedic: false,
      isJoker: true
    }
  ];
}

export default function AIGamePage() {
  const [, setLocation] = useLocation();
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("Your turn. Play a card or pass.");
  const [showRules, setShowRules] = useState<boolean>(false);
  const [targetRowSelection, setTargetRowSelection] = useState<boolean>(false);
  const [aiDifficulty] = useState<AIDifficulty>(AIDifficulty.MEDIUM);
  const [playerView, setPlayerView] = useState<number>(0); // 0 for human player view
  
  // Function to check if the game is in an AI turn state
  const isAITurn = useCallback(() => {
    return gameState.currentPlayer === 1; // AI is player 1
  }, [gameState.currentPlayer]);

  // Handle AI turn logic
  useEffect(() => {
    if (isAITurn()) {
      // Add a small delay to simulate AI "thinking"
      const aiThinkingTimeout = setTimeout(() => {
        // Make AI decision
        const aiDecision = makeAIDecision(gameState, 1, aiDifficulty);
        
        if (aiDecision.action === "pass") {
          // AI passes its turn
          handleAIPass();
        } else if (aiDecision.action === "play" && aiDecision.cardIndex !== undefined && aiDecision.targetRow) {
          // AI plays a card
          handleAICardPlay(aiDecision.cardIndex, aiDecision.targetRow);
        }
      }, 1000); // 1 second delay for AI thinking
      
      return () => clearTimeout(aiThinkingTimeout);
    }
  }, [gameState, isAITurn, aiDifficulty]);

  // Handle AI passing its turn
  const handleAIPass = () => {
    setMessage("AI has passed its turn.");
    
    // Update the game state with the AI's pass action
    setGameState(prevState => {
      const updatedPlayers = [...prevState.players];
      updatedPlayers[1].pass = true;
      
      // Check if both players have passed
      if (updatedPlayers[0].pass && updatedPlayers[1].pass) {
        // Both players have passed, end the round
        return {
          ...prevState,
          players: updatedPlayers,
          currentPlayer: 0, // Reset to human player for next round
        };
      }
      
      return {
        ...prevState,
        players: updatedPlayers,
        currentPlayer: 0, // Back to human player
      };
    });
  };

  // Handle AI playing a card
  const handleAICardPlay = (cardIndex: number, targetRow: keyof Field) => {
    setGameState(prevState => {
      const updatedPlayers = [...prevState.players];
      const aiPlayer = updatedPlayers[1];
      
      // Get the card the AI wants to play
      const cardToPlay = aiPlayer.hand[cardIndex];
      
      // Remove the card from the AI's hand
      aiPlayer.hand = aiPlayer.hand.filter((_, index) => index !== cardIndex);
      
      // Add the card to the specified row
      aiPlayer.field[targetRow] = [...aiPlayer.field[targetRow], cardToPlay];
      
      // Card specific logic would go here (special abilities, etc.)
      
      setMessage(`AI plays ${cardToPlay.value} of ${cardToPlay.suit} in the ${targetRow} row.`);
      
      return {
        ...prevState,
        players: updatedPlayers,
        currentPlayer: 0, // Back to human player
      };
    });
  };

  // Human player card play handler
  const handlePlayCard = (cardIndex: number) => {
    if (targetRowSelection) {
      // If we're selecting a target row, ignore card selection attempts
      return;
    }
    
    setSelectedCard(cardIndex);
    setTargetRowSelection(true);
    setMessage("Select a row to place your card.");
  };

  // Handle selecting a row for card placement
  const handleRowSelect = (row: string) => {
    if (selectedCard === null) {
      // No card selected, ignore row selection
      return;
    }
    
    setGameState(prevState => {
      const updatedPlayers = [...prevState.players];
      const humanPlayer = updatedPlayers[0];
      
      // Get the card the human wants to play
      const cardToPlay = humanPlayer.hand[selectedCard];
      
      // Remove the card from the human's hand
      humanPlayer.hand = humanPlayer.hand.filter((_, index) => index !== selectedCard);
      
      // Add the card to the specified row
      humanPlayer.field[row as keyof Field] = [...humanPlayer.field[row as keyof Field], cardToPlay];
      
      // Card specific logic would go here (special abilities, etc.)
      
      setMessage(`You play ${cardToPlay.value} of ${cardToPlay.suit} in the ${row} row.`);
      
      return {
        ...prevState,
        players: updatedPlayers,
        currentPlayer: 1, // Switch to AI player
      };
    });
    
    // Reset selection state
    setSelectedCard(null);
    setSelectedRow(null);
    setTargetRowSelection(false);
  };

  // Handle the human player passing their turn
  const handlePass = () => {
    setGameState(prevState => {
      const updatedPlayers = [...prevState.players];
      updatedPlayers[0].pass = true;
      
      // Check if both players have passed
      if (updatedPlayers[0].pass && updatedPlayers[1].pass) {
        // Both players have passed, end the round
        return {
          ...prevState,
          players: updatedPlayers,
          // Extra round-end logic would go here
        };
      }
      
      return {
        ...prevState,
        players: updatedPlayers,
        currentPlayer: 1, // Switch to AI player
      };
    });
    
    setMessage("You pass your turn.");
  };

  // Switch between game views (for debugging/testing)
  const switchPlayerView = () => {
    setPlayerView(prevView => (prevView === 0 ? 1 : 0));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f0b] to-[#2a1a14]">
      <div className="p-4">
        <Button
          variant="outline"
          className="mb-4 border-amber-500/50 text-amber-200 hover:bg-amber-900/30 hover:text-amber-100"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Menu
        </Button>
      </div>
      
      <div className="perspective-container">
        <div className={`board-3d gwan-board-container max-w-6xl mx-auto my-4 p-4 rounded-xl relative perspective-container`}>
          <GameHeader 
            gameState={gameState}
            playerView={playerView}
            switchPlayerView={switchPlayerView}
            message={message}
            showRules={() => setShowRules(true)}
          />
          
          <div className="opponent-area">
            <GameBoard
              gameState={gameState}
              currentPlayer={gameState.players[1]}
              isOpponent={playerView === 0}
              targetRowSelection={false}
              handleRowSelect={() => {}}
            />
          </div>
          
          <div className="player-area">
            <GameBoard
              gameState={gameState}
              currentPlayer={gameState.players[0]}
              isOpponent={playerView === 1}
              targetRowSelection={targetRowSelection}
              handleRowSelect={handleRowSelect}
            />
          </div>
          
          <div className="hand-container">
            <PlayerHand
              currentPlayer={gameState.players[playerView]}
              isCurrentTurn={gameState.currentPlayer === playerView}
              selectedCard={selectedCard}
              handlePlayCard={handlePlayCard}
              handlePass={handlePass}
              switchPlayerView={switchPlayerView}
              canUndo={false}
              handleUndo={() => {}}
              showBlightCard={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}