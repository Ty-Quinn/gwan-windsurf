import { Card, Player, Field, WeatherEffects, GameState, BlightCard, BlightEffect } from "./types";

// Calculate the value of a single card in a specific row
export function calculateCardValue(card: Card, rowName: keyof Field, weatherEffects: WeatherEffects): number {
  let value = card.value;
  
  // Apply weather effects if applicable
  if (rowName === "ranged" && weatherEffects.fog) {
    value = 1; // Fog reduces ranged cards to 1
  }
  
  if (rowName === "melee" && weatherEffects.frost) {
    value = 1; // Frost reduces melee cards to 1
  }
  
  if (rowName === "siege" && weatherEffects.rain) {
    value = 1; // Rain reduces siege cards to 1
  }
  
  // Apply special card modifiers
  if (card.isCommander) {
    // Commanders boost other cards of the same suit in this row
    // This would be calculated in calculateRowValue
  }
  
  return value;
}

// Calculate the total value of a row
export function calculateRowValue(cards: Card[], rowName: keyof Field, weatherEffects: WeatherEffects): number {
  if (cards.length === 0) return 0;
  
  let rowValue = 0;
  
  // First get base values for all cards
  cards.forEach(card => {
    rowValue += calculateCardValue(card, rowName, weatherEffects);
  });
  
  // Then apply commander effects if any
  const commanders = cards.filter(card => card.isCommander);
  commanders.forEach(commander => {
    const sameSuitCards = cards.filter(card => card.suit === commander.suit && !card.isCommander);
    // Commander doubles the value of cards with same suit
    sameSuitCards.forEach(card => {
      // Add the base value again (doubling effect)
      rowValue += calculateCardValue(card, rowName, weatherEffects);
    });
  });
  
  // Apply any other row-specific effects here
  
  return rowValue;
}

// Calculate total score for a player
export function calculateTotalScore(player: Player, gameWeatherEffects: WeatherEffects): number {
  let total = 0;
  
  Object.entries(player.field).forEach(([rowName, cards]) => {
    const row = rowName as keyof Field;
    // Use the player's weatherEffects if available, otherwise use the game's weather effects
    const weatherEffects = player.weatherEffects !== undefined ? player.weatherEffects : gameWeatherEffects;
    total += calculateRowValue(cards, row, weatherEffects);
  });
  
  // Add wheel of fortune bonus if it exists
  if (player.wheelOfFortuneBonus) {
    total += player.wheelOfFortuneBonus;
  }
  
  return total;
}

// GwanGameLogic class to manage game state
export class GwanGameLogic {
  private gameState: GameState;
  
  constructor() {
    // Initialize with a default game state
    this.gameState = {
      players: [],
      currentPlayer: 0,
      currentRound: 1,
      deckCount: 54, // Standard deck + jokers
      weatherEffects: {
        fog: false,
        frost: false,
        rain: false
      },
      blightCardsSelected: false,
      availableBlightCards: [],
      isBlightCardBeingPlayed: false,
      isSuicideKingBeingPlayed: false
    };
  }
  
  // Initialize a new game
  initializeGame(): void {
    // Create players
    const player1: Player = {
      name: "Player 1",
      hand: [],
      field: {
        melee: [],
        ranged: [],
        siege: []
      },
      score: 0,
      roundsWon: 0,
      pass: false,
      discardPile: [],
      blightCards: [],
      hasUsedBlightThisTurn: false,
      wheelOfFortuneBonus: 0
    };
    
    const player2: Player = {
      name: "Player 2",
      hand: [],
      field: {
        melee: [],
        ranged: [],
        siege: []
      },
      score: 0,
      roundsWon: 0,
      pass: false,
      discardPile: [],
      blightCards: [],
      hasUsedBlightThisTurn: false,
      wheelOfFortuneBonus: 0
    };
    
    this.gameState.players = [player1, player2];
    this.generateBlightCards();
  }
  
  // Initialize from an existing game state (useful when restoring from a saved state)
  initializeGameFromState(state: GameState): void {
    this.gameState = {...state};
  }
  
  // Initialize a round - deal cards, reset pass status, etc.
  initializeRound(): void {
    // Reset fields and pass status
    this.gameState.players.forEach(player => {
      player.field = {
        melee: [],
        ranged: [],
        siege: []
      };
      player.pass = false;
      player.hasUsedBlightThisTurn = false;
    });
    
    // Reset weather effects
    this.gameState.weatherEffects = {
      fog: false,
      frost: false,
      rain: false
    };
    
    // Deal cards to players (10 cards each for initial hand)
    this.dealCards(0, 10);
    this.dealCards(1, 10);
  }
  
  // Deal cards to a player
  dealCards(playerIndex: number, count: number): void {
    const player = this.gameState.players[playerIndex];
    
    for (let i = 0; i < count; i++) {
      if (this.gameState.deckCount > 0) {
        // In a real implementation, pull from a shuffled deck
        const newCard = this.generateRandomCard();
        player.hand.push(newCard);
        this.gameState.deckCount--;
      }
    }
  }
  
  // Generate a random card (simplified for now)
  private generateRandomCard(): Card {
    const suits = ["hearts", "clubs", "diamonds", "spades", "joker"] as const;
    const suit = suits[Math.floor(Math.random() * 4)] as "hearts" | "clubs" | "diamonds" | "spades" | "joker";
    const value = suit === "joker" ? 0 : Math.floor(Math.random() * 13) + 1; // 1-13 for regular cards, 0 for jokers
    
    // Determine special card types
    const isCommander = value >= 10; // 10, J, Q, K are commanders
    const isWeather = value === 13 && (suit === "hearts" || suit === "spades" || suit === "diamonds");
    const isSpy = value === 1; // Aces are spies
    const isMedic = value === 5; // 5's are medics
    
    // Additional special types
    const isJoker = suit === "joker";
    const isDecoy = value === 4; // 4's are decoys
    const isRogue = value === 2 && (suit === "hearts" || suit === "clubs" || suit === "diamonds");
    const isSniper = value === 2 && suit === "spades";
    const isSuicideKing = value === 13 && suit === "hearts"; // King of Hearts is the Suicide King
    
    return {
      suit,
      value,
      baseValue: value,
      isCommander,
      isWeather,
      isSpy,
      isMedic,
      ...(isJoker && { isJoker }),
      ...(isDecoy && { isDecoy }),
      ...(isRogue && { isRogue }),
      ...(isSniper && { isSniper }),
      ...(isSuicideKing && { isSuicideKing })
    };
  }
  
  // Generate Blight cards for the game
  private generateBlightCards(): void {
    const blightCards: BlightCard[] = [
      {
        id: "fool",
        name: "The Fool",
        description: "Converts opponent's Commander to your side",
        effect: BlightEffect.FOOL,
        used: false,
        icon: "crown"
      },
      {
        id: "magician",
        name: "The Magician",
        description: "Roll 1D20 vs opponent's row, if roll exceeds value, destroy all cards in that row",
        effect: BlightEffect.MAGICIAN,
        used: false,
        icon: "wand"
      },
      {
        id: "lovers",
        name: "The Lovers",
        description: "Doubles the value of target card (cannot target Commanders)",
        effect: BlightEffect.LOVERS,
        used: false,
        icon: "heart"
      },
      {
        id: "death",
        name: "Death",
        description: "Discard your hand and draw equal number of new cards",
        effect: BlightEffect.DEATH,
        used: false,
        icon: "skull"
      },
      {
        id: "wheel",
        name: "Wheel of Fortune",
        description: "Roll 1D10 and add result to your total score",
        effect: BlightEffect.WHEEL,
        used: false,
        icon: "wheel"
      },
      {
        id: "hangedMan",
        name: "The Hanged Man",
        description: "Destroys a spy card on opponent's field",
        effect: BlightEffect.HANGED_MAN,
        used: false,
        icon: "spy"
      },
      {
        id: "emperor",
        name: "The Emperor",
        description: "Returns one of your spy cards from opponent's field to your hand",
        effect: BlightEffect.EMPEROR,
        used: false,
        icon: "crown"
      },
      {
        id: "devil",
        name: "The Devil",
        description: "Roll 3D6, continue rolling with dice that didn't show 6, if you get three 6's in 6 rolls, revive one card from either discard pile",
        effect: BlightEffect.DEVIL,
        used: false,
        icon: "devil"
      }
    ];
    
    this.gameState.availableBlightCards = blightCards;
  }
  
  // Get a copy of the current game state
  getGameState(): GameState {
    return JSON.parse(JSON.stringify(this.gameState));
  }
  
  // Set a blight card for a player
  setBlightCard(playerIndex: number, blightCard: BlightCard): { success: boolean, message: string } {
    if (playerIndex < 0 || playerIndex >= this.gameState.players.length) {
      return { success: false, message: "Invalid player index" };
    }
    
    // Mark the blight card as part of this player's hand
    this.gameState.players[playerIndex].blightCards.push({...blightCard});
    
    // Remove this card from the available blight cards if it's a first selection
    if (!this.gameState.blightCardsSelected) {
      this.gameState.availableBlightCards = this.gameState.availableBlightCards.filter(
        card => card.id !== blightCard.id
      );
    }
    
    // If both players have chosen their initial blight cards, mark selection as complete
    if (this.gameState.players[0].blightCards.length > 0 && 
        this.gameState.players[1].blightCards.length > 0 && 
        !this.gameState.blightCardsSelected) {
      this.gameState.blightCardsSelected = true;
    }
    
    return { success: true, message: "Blight card selected successfully" };
  }
  
  // Various game actions would be implemented here
  // playCard, passRound, etc.
  
  // Calculate the current score for a player
  calculatePlayerScore(playerIndex: number): number {
    const player = this.gameState.players[playerIndex];
    return calculateTotalScore(player, this.gameState.weatherEffects);
  }
  
  // Check if a round is over (both players passed)
  isRoundOver(): boolean {
    return this.gameState.players.every(player => player.pass);
  }
  
  // Determine the winner of the current round
  determineRoundWinner(): number | undefined {
    if (!this.isRoundOver()) return undefined;
    
    const scores = this.gameState.players.map((player, index) => ({
      playerIndex: index,
      score: this.calculatePlayerScore(index)
    }));
    
    // Sort by score (descending)
    scores.sort((a, b) => b.score - a.score);
    
    // If scores are equal, it's a tie (return undefined)
    if (scores[0].score === scores[1].score) {
      return undefined;
    }
    
    return scores[0].playerIndex;
  }
  
  // End the current round and update round wins
  endRound(): number | undefined {
    const roundWinner = this.determineRoundWinner();
    
    if (roundWinner !== undefined) {
      this.gameState.players[roundWinner].roundsWon++;
    }
    
    this.gameState.currentRound++;
    
    return roundWinner;
  }
  
  // Check if the game is over (a player has won 2 rounds)
  isGameOver(): boolean {
    return this.gameState.players.some(player => player.roundsWon >= 2);
  }
  
  // Determine the winner of the game
  determineGameWinner(): number | undefined {
    const playerWithTwoWins = this.gameState.players.findIndex(player => player.roundsWon >= 2);
    return playerWithTwoWins !== -1 ? playerWithTwoWins : undefined;
  }
}