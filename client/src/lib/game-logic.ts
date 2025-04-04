import { Card, Field, Player, GameState, WeatherEffects, PlayResult, BlightCard, BlightEffect } from "./types";

export class GwanGameLogic {
  private players: Player[];
  private deck: Card[];
  private currentPlayer: number;
  private currentRound: number;
  private weatherEffects: WeatherEffects;
  private gameEnded: boolean;
  private availableBlightCards: BlightCard[];
  private isBlightCardBeingPlayed: boolean;
  private isSuicideKingBeingPlayed: boolean;

  constructor() {
    this.players = [];
    this.deck = [];
    this.currentPlayer = 0;
    this.currentRound = 1;
    this.weatherEffects = {
      clubs: false,
      spades: false,
      diamonds: false,
    };
    this.gameEnded = false;
    this.availableBlightCards = [];
    this.isBlightCardBeingPlayed = false;
    this.isSuicideKingBeingPlayed = false;
  }

  // Initialize the game
  public initializeGame(): void {
    // Create players
    this.players = [
      {
        name: "Player 1",
        hand: [],
        field: { clubs: [], spades: [], diamonds: [] },
        score: 0,
        roundsWon: 0,
        pass: false,
        discardPile: [],
        blightCards: [],
        hasUsedBlightCard: false
      },
      {
        name: "Player 2",
        hand: [],
        field: { clubs: [], spades: [], diamonds: [] },
        score: 0,
        roundsWon: 0,
        pass: false,
        discardPile: [],
        blightCards: [],
        hasUsedBlightCard: false
      },
    ];

    // Create and shuffle the deck
    this.createDeck();
    this.shuffleDeck();

    // Set initial game state
    this.currentPlayer = 0;
    this.currentRound = 1;
    this.weatherEffects = {
      clubs: false,
      spades: false,
      diamonds: false,
    };
    this.gameEnded = false;
  }

  // Initialize a new round
  public initializeRound(): void {
    // Move cards from fields to discard piles
    for (const player of this.players) {
      // For each row in the field
      for (const row of ['clubs', 'spades', 'diamonds'] as const) {
        // Move cards from field to discard pile
        player.discardPile.push(...player.field[row]);
        // Clear the field
        player.field[row] = [];
      }

      // Reset score and pass status
      player.score = 0;
      player.pass = false;

      // Note: We don't clear the hand - players keep their unplayed cards
    }

    // Clear weather effects
    this.weatherEffects = {
      clubs: false,
      spades: false,
      diamonds: false,
    };

    // Deal additional cards to players
    this.dealCards();

    // Set starting player (loser of previous round goes first, or player 0 for first round)
    if (this.currentRound === 1) {
      this.currentPlayer = 0;
    } else {
      // Find the player with fewer rounds won
      const p0Wins = this.players[0].roundsWon;
      const p1Wins = this.players[1].roundsWon;
      this.currentPlayer = p0Wins <= p1Wins ? 0 : 1;
    }
  }

  // Create a standard deck of cards
  private createDeck(): void {
    const suits = ["clubs", "spades", "diamonds", "hearts"] as const;
    const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

    this.deck = [];

    // Add standard cards
    for (const suit of suits) {
      for (const value of values) {
        const baseValue = this.getCardBaseValue(value);

        // Determine special card properties
        const isRogue = value === "2" && suit !== "spades"; // 2's of hearts, clubs, diamonds are Rogues
        const isSniper = value === "2" && suit === "spades"; // 2 of spades is a Sniper
        const isSuicideKing = value === "K" && suit === "hearts"; // King of Hearts is the Suicide King

        const card: Card = {
          suit,
          value,
          // Decoy cards and Rogue cards have 0 base value; Sniper has 2 base value
          baseValue: value === "4" ? 0 : 
                      isRogue ? 0 : 
                      isSniper ? 2 : 
                      baseValue,
          isCommander: ["J", "Q", "K"].includes(value),
          isWeather: value === "A",
          isSpy: value === "5",
          isMedic: value === "3",
          isDecoy: value === "4",
          isRogue,
          isSniper,
          isSuicideKing
        };
        this.deck.push(card);
      }
    }

    // Add Joker cards (2 of them)
    for (let i = 0; i < 2; i++) {
      const jokerCard: Card = {
        suit: "joker",
        value: "Joker",
        baseValue: 5,  // Initially 5 like a spy card, will be modified to 1 when played
        isCommander: false,
        isWeather: false,
        isSpy: true,   // Jokers act as spy cards
        isMedic: false,
        isJoker: true,
        isDecoy: false,
        isRogue: false,
        isSniper: false,
        isSuicideKing: false
      };
      this.deck.push(jokerCard);
    }
  }

  // Get the base value of a card
  private getCardBaseValue(value: string): number {
    switch (value) {
      case "J":
        return 11;
      case "Q":
        return 12;
      case "K":
        return 13;
      case "A":
        return 15;
      default:
        return Number.parseInt(value);
    }
  }

  // Shuffle the deck
  private shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // Deal cards to players
  private dealCards(): void {
    if (this.currentRound === 1) {
      // First round - deal 10 cards to each player
      for (const player of this.players) {
        // Clear any existing cards
        player.hand = [];

        // Deal 10 cards to each player
        for (let i = 0; i < 10; i++) {
          if (this.deck.length > 0) {
            player.hand.push(this.deck.pop()!);
          }
        }
      }
    } else {
      // Subsequent rounds - each player draws exactly 1 new card
      for (const player of this.players) {
        // Draw 1 new card if the deck isn't empty
        if (this.deck.length > 0) {
          player.hand.push(this.deck.pop()!);
        }
      }
    }
  }

  // Play a card
  public playCard(playerIndex: number, cardIndex: number, targetRow: string | null = null): PlayResult {
    // Check if it's the player's turn
    if (playerIndex !== this.currentPlayer) {
      return { success: false, message: "It's not your turn" };
    }

    // Check if the player has already passed
    if (this.players[playerIndex].pass) {
      return { success: false, message: "You have already passed" };
    }

    // Check if the player has already played a card this turn
    if (this.players[playerIndex].hasPlayedCard) {
      return { success: false, message: "You've already played a card this turn. Click End Turn to continue." };
    }

    // Check if the card index is valid
    if (cardIndex < 0 || cardIndex >= this.players[playerIndex].hand.length) {
      return { success: false, message: "Invalid card index" };
    }

    const card = this.players[playerIndex].hand[cardIndex];

    // Handle hearts cards (need a target row)
    if (card.suit === "hearts" && !targetRow) {
      return { success: false, message: "You need to select a target row for hearts cards" };
    }

    // Handle Ace of Hearts (Clear Weather)
    if (card.isWeather && card.suit === "hearts") {
      if (!targetRow) {
        return { success: false, message: "You need to select a row to clear weather from" };
      }

      // Clear weather from the selected row
      if (targetRow === "clubs" || targetRow === "spades" || targetRow === "diamonds") {
        this.weatherEffects[targetRow] = false;
      }

      // Remove the card from hand
      this.players[playerIndex].hand.splice(cardIndex, 1);

      // Check if player has run out of cards after playing
      if (this.players[playerIndex].hand.length === 0) {
        // Calculate scores before deciding round winner
        this.calculateScores();

        // Determine the winner of the round
        let roundWinner: number | undefined;
        let roundTied = false;

        if (this.players[0].score > this.players[1].score) {
          roundWinner = 0;
          this.players[0].roundsWon++;
        } else if (this.players[1].score > this.players[0].score) {
          roundWinner = 1;
          this.players[1].roundsWon++;
        } else {
          roundTied = true;
        }

        // Check if the game has ended
        let gameEnded = false;

        if (this.players[0].roundsWon >= 2) {
          gameEnded = true;
        } else if (this.players[1].roundsWon >= 2) {
          gameEnded = true;
        } else {
          this.currentRound++;
        }

        // Construct result message
        let message = `Cleared weather from ${targetRow} row. You're out of cards! `;

        return {
          success: true,
          message,
          roundWinner,
          roundTied,
          gameEnded
        };
      }

      // If player still has cards, switch to the next player
      // Only switch if the other player hasn't passed
      if (!this.players[1 - playerIndex].pass) {
        this.currentPlayer = 1 - this.currentPlayer;
      }

      return { success: true, message: `Cleared weather from ${targetRow} row` };
    }

    // Handle other weather cards
    if (card.isWeather && card.suit !== "hearts") {
      // Apply weather effect
      if (card.suit === "clubs" || card.suit === "spades" || card.suit === "diamonds") {
        this.weatherEffects[card.suit] = true;
      }

      // Remove the card from hand
      this.players[playerIndex].hand.splice(cardIndex, 1);

      // Check if player has run out of cards after playing
      if (this.players[playerIndex].hand.length === 0) {
        // Calculate scores before deciding round winner
        this.calculateScores();

        // Determine the winner of the round
        let roundWinner: number | undefined;
        let roundTied = false;

        if (this.players[0].score > this.players[1].score) {
          roundWinner = 0;
          this.players[0].roundsWon++;
        } else if (this.players[1].score > this.players[0].score) {
          roundWinner = 1;
          this.players[1].roundsWon++;
        } else {
          roundTied = true;
        }

        // Check if the game has ended
        let gameEnded = false;

        if (this.players[0].roundsWon >= 2) {
          gameEnded = true;
        } else if (this.players[1].roundsWon >= 2) {
          gameEnded = true;
        } else {
          this.currentRound++;
        }

        // Construct result message
        let message = `Applied weather effect to ${card.suit} row. You're out of cards! `;

        return {
          success: true,
          message,
          roundWinner,
          roundTied,
          gameEnded
        };
      }

      // If player still has cards, switch to the next player
      // Only switch if the other player hasn't passed
      if (!this.players[1 - playerIndex].pass) {
        this.currentPlayer = 1 - this.currentPlayer;
      }

      return { success: true, message: `Applied weather effect to ${card.suit} row` };
    }

    // Handle spy cards (5s) and Joker cards
    if (card.isSpy) {
      const opponentIndex = 1 - playerIndex;

      // For Joker cards, the player needs to specify a target row
      if (card.isJoker && !targetRow) {
        return { success: false, message: "You need to select a target row for Joker cards" };
      }

      // Determine which row to play the card to
      const row = card.suit === "hearts" || card.isJoker
        ? (targetRow as keyof Field)
        : (card.suit as keyof Field);

      // Create a copy of the card with modified properties if it's a Joker
      // Joker cards only add 1 point to opponent's row instead of 5
      let cardToPlay: Card;
      if (card.isJoker) {
        cardToPlay = { ...card, baseValue: 1 };
      } else {
        cardToPlay = card;
      }

      // Add the card to the opponent's field
      this.players[opponentIndex].field[row].push(cardToPlay);

      // Draw 2 cards if available (for both spy cards and joker cards)
      for (let i = 0; i < 2; i++) {
        if (this.deck.length > 0) {
          this.players[playerIndex].hand.push(this.deck.pop()!);
        }
      }

      // Remove the card from hand
      this.players[playerIndex].hand.splice(cardIndex, 1);

      // Check if player has run out of cards after playing and drawing
      if (this.players[playerIndex].hand.length === 0) {
        // Calculate scores before deciding round winner
        this.calculateScores();

        // Determine the winner of the round
        let roundWinner: number | undefined;
        let roundTied = false;

        if (this.players[0].score > this.players[1].score) {
          roundWinner = 0;
          this.players[0].roundsWon++;
        } else if (this.players[1].score > this.players[0].score) {
          roundWinner = 1;
          this.players[1].roundsWon++;
        } else {
          roundTied = true;
        }

        // Check if the game has ended
        let gameEnded = false;

        if (this.players[0].roundsWon >= 2) {
          gameEnded = true;
        } else if (this.players[1].roundsWon >= 2) {
          gameEnded = true;
        } else {
          this.currentRound++;
        }

        // Construct result message
        let cardType = card.isJoker ? "Joker" : "spy card";
        let message = `Played ${cardType} to opponent's ${row} row. You're out of cards! `;

        return {
          success: true,
          message,
          roundWinner,
          roundTied,
          gameEnded
        };
      }

      // If player still has cards, switch to the next player
      // Only switch if the other player hasn't passed
      if (!this.players[1 - playerIndex].pass) {
        this.currentPlayer = 1 - this.currentPlayer;
      }

      // Success message
      let cardType = card.isJoker ? "Joker" : "spy card";
      return { success: true, message: `Played ${cardType} to opponent's ${row} row and drew 2 cards` };
    }

    // Handle medic cards (3s)
    if (card.isMedic) {
      // Check if player has any cards in their discard pile
      if (this.players[playerIndex].discardPile.length === 0) {
        return { success: false, message: "No cards in your discard pile to revive" };
      }

      // For medic cards, we handle the revival process in the UI component
      // We need to let the UI know this is a medic card so it can prompt user to select a card to revive
      // The actual card placement will be handled separately

      // Regular card placement logic for the medic card itself
      const row = card.suit === "hearts" ? (targetRow as keyof Field) : (card.suit as keyof Field);

      // Add the medic card to the player's field
      this.players[playerIndex].field[row].push(card);

      // Remove the medic card from hand
      this.players[playerIndex].hand.splice(cardIndex, 1);

      // Don't switch player yet, let the UI complete the revival process
      // This is different from other cards - we'll switch player after revival is complete

      return { 
        success: true, 
        message: "Choose a card to revive from your discard pile",
        isMedicRevival: true  // Signal to the UI that we need to show the revival modal
      };
    }

    // Handle decoy cards (4s)
    if (card.isDecoy) {
      // Check if the player has any cards on their field to retrieve
      let hasCardsOnField = false;
      const field = this.players[playerIndex].field;

      for (const row of Object.keys(field) as Array<keyof Field>) {
        if (field[row].length > 0) {
          hasCardsOnField = true;
          break;
        }
      }

      if (!hasCardsOnField) {
        return { success: false, message: "No cards on your field to retrieve" };
      }

      // For decoy cards, we handle the retrieval process in the UI component
      // We need to let the UI know this is a decoy card so it can prompt user to select a card to retrieve

      // Regular card placement logic for the decoy card itself
      const row = card.suit === "hearts" ? (targetRow as keyof Field) : (card.suit as keyof Field);

      // Add the decoy card to the player's field
      this.players[playerIndex].field[row].push(card);

      // Remove the decoy card from hand
      this.players[playerIndex].hand.splice(cardIndex, 1);

      // Don't switch player yet, let the UI complete the retrieval process

      return { 
        success: true, 
        message: "Choose a card to retrieve from your field",
        isDecoyRetrieval: true  // Signal to the UI that we need to show the retrieval modal
      };
    }

    // Handle Rogue cards (2s of hearts, clubs, diamonds)
    if (card.isRogue) {
      // Need to roll dice to determine the card's value before playing
      // We'll let the UI handle showing a dice roller and update the card value later

      // Don't remove card from hand yet, just indicate that we need a dice roll for this card
      return {
        success: true,
        message: "Roll 2d6 to determine this card's value",
        isRogueDiceRoll: true, // Signal to UI that we need to show dice roll for Rogue value
      };
    }

    // Handle Sniper card (2 of spades)
    if (card.isSniper) {
      // Need to roll dice to see if sniper effect activates
      // We'll let the UI handle showing a dice roller for this

      // Don't remove card from hand yet, just indicate that we need a dice roll for this card
      return {
        success: true,
        message: "Roll 2d6 for the Sniper. Doubles will eliminate opponent's highest card!",
        isSniperDiceRoll: true, // Signal to UI that we need to show dice roll for Sniper
      };
    }
    
    // Handle Suicide King (King of Hearts)
    if (card.isSuicideKing) {
      // Suicide King offers a choice between clearing all weather effects
      // or selecting a second Blight card. Card is removed entirely after use.
      // Set flag so UI can show choice dialog
      this.isSuicideKingBeingPlayed = true;
      
      // Store card index so we can remove it after choice is made
      // For now, just signal that we need to show the Suicide King choice dialog
      return {
        success: true,
        message: "The Suicide King grants you a powerful choice!",
        isSuicideKing: true, // Signal to UI that we need to show Suicide King choice dialog
      };
    }

    // Handle regular cards
    const row = card.suit === "hearts" ? (targetRow as keyof Field) : (card.suit as keyof Field);

    // Add the card to the player's field
    this.players[playerIndex].field[row].push(card);

    // Remove the card from hand
    this.players[playerIndex].hand.splice(cardIndex, 1);

    // Check if player has run out of cards after playing this card
    if (this.players[playerIndex].hand.length === 0) {
      // Calculate scores before deciding round winner
      this.calculateScores();

      // Determine the winner of the round
      let roundWinner: number | undefined;
      let roundTied = false;

      if (this.players[0].score > this.players[1].score) {
        roundWinner = 0;
        this.players[0].roundsWon++;
      } else if (this.players[1].score > this.players[0].score) {
        roundWinner = 1;
        this.players[1].roundsWon++;
      } else {
        roundTied = true;
      }

      // Check if the game has ended
      let gameEnded = false;

      if (this.players[0].roundsWon >= 2) {
        gameEnded = true;
      } else if (this.players[1].roundsWon >= 2) {
        gameEnded = true;
      } else {
        this.currentRound++;
      }

      // Construct result message
      let message = `Played ${card.value} of ${card.suit} to ${row} row. You're out of cards! `;

      return {
        success: true,
        message,
        roundWinner,
        roundTied,
        gameEnded
      };
    }

    // If player still has cards, switch to the next player
    // Only switch if the other player hasn't passed
    if (!this.players[1 - playerIndex].pass) {
      this.currentPlayer = 1 - this.currentPlayer;
    }

    return { success: true, message: `Played ${card.value} of ${card.suit} to ${row} row` };
  }

  // Pass turn
  public pass(playerIndex: number): PlayResult {
    // Check if it's the player's turn
    if (playerIndex !== this.currentPlayer) {
      return { success: false, message: "It's not your turn" };
    }

    // Check if the player has already passed
    if (this.players[playerIndex].pass) {
      return { success: false, message: "You have already passed" };
    }

    // Mark the player as passed
    this.players[playerIndex].pass = true;

    // Calculate scores
    this.calculateScores();

    // Check if both players have passed
    if (this.players[0].pass && this.players[1].pass) {
      // Determine the winner of the round
      let roundWinner: number | undefined;
      let roundTied = false;

      if (this.players[0].score > this.players[1].score) {
        roundWinner = 0;
        this.players[0].roundsWon++;
      } else if (this.players[1].score > this.players[0].score) {
        roundWinner = 1;
        this.players[1].roundsWon++;
      } else {
        roundTied = true;
      }

      // Check if the game has ended
      let gameEnded = false;
      let gameWinner: number | undefined;

      if (this.players[0].roundsWon >= 2) {
        gameEnded = true;
        gameWinner = 0;
      } else if (this.players[1].roundsWon >= 2) {
        gameEnded = true;
        gameWinner = 1;
      } else {
        // Prepare for the next round
        this.currentRound++;
      }

      // Construct the result message
      let message = "You passed. ";

      if (roundWinner !== undefined) {
        message += `Player ${roundWinner + 1} won the round! `;
      } else if (roundTied) {
        message += "The round ended in a tie! ";
      }

      if (gameEnded && gameWinner !== undefined) {
        message += `Player ${gameWinner + 1} won the game!`;
        this.gameEnded = true;
      }

      return {
        success: true,
        message,
        roundWinner,
        roundTied,
        gameEnded,
      };
    }

    // Switch to the next player if they haven't passed yet
    if (!this.players[1 - playerIndex].pass) {
      this.currentPlayer = 1 - playerIndex;
    }

    return { success: true, message: "You passed" };
  }

  // Initialize game from a saved state (for undo functionality)
  public initializeGameFromState(state: GameState): void {
    this.players = JSON.parse(JSON.stringify(state.players));
    this.currentPlayer = state.currentPlayer;
    this.currentRound = state.currentRound;
    this.weatherEffects = JSON.parse(JSON.stringify(state.weatherEffects));
    this.availableBlightCards = state.availableBlightCards ? [...state.availableBlightCards] : [];
    this.isBlightCardBeingPlayed = state.isBlightCardBeingPlayed || false;
    this.isSuicideKingBeingPlayed = state.isSuicideKingBeingPlayed || false;
    
    // Check if we need to initialize the deck
    if (state.deckCount === undefined || state.deckCount === 0 || this.deck.length === 0) {
      // Only create a new deck at the beginning of the game
      if (this.currentRound === 1 && !this.players.some(p => p.discardPile.length > 0 || p.field.clubs.length > 0 || p.field.diamonds.length > 0 || p.field.spades.length > 0)) {
        this.createDeck();
        this.shuffleDeck();
      }
    }
    
    this.gameEnded = false;
  }

  // Undo the last card played - used when canceling modals
  public undoLastCardPlayed(playerIndex: number, cardToReturn: Card, rowName: keyof Field): PlayResult {
    // Make sure it's the player's turn
    if (playerIndex !== this.currentPlayer) {
      return { success: false, message: "It's not your turn" };
    }
    
    // Find the card in the specified row
    const rowCards = this.players[playerIndex].field[rowName];
    const cardIndex = rowCards.findIndex(c => 
      c.suit === cardToReturn.suit && c.value === cardToReturn.value
    );
    
    if (cardIndex === -1) {
      return { success: false, message: "Card not found" };
    }
    
    // Remove the card from the field
    const removedCard = rowCards.splice(cardIndex, 1)[0];
    
    // Return the card to the player's hand
    this.players[playerIndex].hand.push(removedCard);
    
    // If it's a weather card, remove its effect
    if (removedCard.isWeather) {
      // For weather cards other than Ace of Hearts, clear the weather effect
      if (removedCard.suit === "clubs" || removedCard.suit === "spades" || removedCard.suit === "diamonds") {
        this.weatherEffects[removedCard.suit] = false;
      }
      // For Ace of Hearts, we can't restore the previous weather effect,
      // but at least the card is back in hand
    }
    
    return {
      success: true,
      message: "Card returned to your hand"
    };
  }
  
  // Calculate scores for both players - made public for end-of-turn score updates
  public calculateScores(): void {
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      let totalScore = 0;

      // Calculate score for each row
      for (const row of ["clubs", "spades", "diamonds"] as const) {
        let rowScore = 0;

        // Add up the values of all cards in the row
        for (const card of player.field[row]) {
          // Use the helper method to get the correct value considering
          // weather effects, commander status, and Rogue dice values
          rowScore += this.calculateCardValue(card, row);
        }

        // Add row bonus if there are cards in the row and no weather effect
        if (player.field[row].length > 0 && !this.weatherEffects[row]) {
          switch (row) {
            case "clubs":
              rowScore += 2;
              break;
            case "spades":
              rowScore += 3;
              break;
            case "diamonds":
              rowScore += 5;
              break;
          }
        }

        totalScore += rowScore;
      }

      player.score = totalScore;
    }
  }

  // Special function to complete medic revival (called from UI after user selects card)
  public completeMedicRevival(playerIndex: number, discardIndex: number): PlayResult {
    // Make sure it's the player's turn
    if (playerIndex !== this.currentPlayer) {
      return { success: false, message: "It's not your turn" };
    }

    // Check if the discard index is valid
    if (discardIndex < 0 || discardIndex >= this.players[playerIndex].discardPile.length) {
      return { success: false, message: "Invalid discard card index" };
    }

    // Get the selected card from the discard pile
    const revivedCard = this.players[playerIndex].discardPile[discardIndex];

    // Remove the card from the discard pile
    this.players[playerIndex].discardPile.splice(discardIndex, 1);

    // Add the card to player's hand
    this.players[playerIndex].hand.push(revivedCard);

    // Check if player has no cards left after playing the medic
    // Even though they just added a card, if they had 0 before, they might have 0 again after playing
    if (this.players[playerIndex].hand.length === 0) {
      // Calculate scores before deciding round winner
      this.calculateScores();

      // Determine the winner of the round
      let roundWinner: number | undefined;
      let roundTied = false;

      if (this.players[0].score > this.players[1].score) {
        roundWinner = 0;
        this.players[0].roundsWon++;
      } else if (this.players[1].score > this.players[0].score) {
        roundWinner = 1;
        this.players[1].roundsWon++;
      } else {
        roundTied = true;
      }

      // Check if the game has ended
      let gameEnded = false;

      if (this.players[0].roundsWon >= 2) {
        gameEnded = true;
      } else if (this.players[1].roundsWon >= 2) {
        gameEnded = true;
      } else {
        this.currentRound++;
      }

      // Construct result message
      let message = `Medic revived ${revivedCard.value} of ${revivedCard.suit} from your discard pile. You're out of cards! `;

      return {
        success: true,
        message,
        roundWinner,
        roundTied,
        gameEnded
      };
    }

    // If player still has cards, switch to the next player
    // Only switch if the other player hasn't passed
    if (!this.players[1 - playerIndex].pass) {
      this.currentPlayer = 1 - this.currentPlayer;
    }

    return { 
      success: true, 
      message: `Medic revived ${revivedCard.value} of ${revivedCard.suit} from your discard pile`
    };
  }

  // Special function to complete decoy card retrieval (called from UI after user selects card)
  public completeDecoyRetrieval(playerIndex: number, rowName: keyof Field, cardIndex: number): PlayResult {
    // Make sure it's the player's turn
    if (playerIndex !== this.currentPlayer) {
      return { success: false, message: "It's not your turn" };
    }

    // Check if the row and card index are valid
    if (!this.players[playerIndex].field[rowName] || 
        cardIndex < 0 || 
        cardIndex >= this.players[playerIndex].field[rowName].length) {
      return { success: false, message: "Invalid field card selection" };
    }

    // Get the selected card from the field
    const retrievedCard = this.players[playerIndex].field[rowName][cardIndex];

    // Remove the card from the field
    this.players[playerIndex].field[rowName].splice(cardIndex, 1);

    // Add the card to player's hand
    this.players[playerIndex].hand.push(retrievedCard);

    // Check if player has no cards left after playing the decoy
    // Even though they just added a card, if they had 0 before, they might have 0 again after playing
    if (this.players[playerIndex].hand.length === 0) {
      // Calculate scores before deciding round winner
      this.calculateScores();

      // Determine the winner of the round
      let roundWinner: number | undefined;
      let roundTied = false;

      if (this.players[0].score > this.players[1].score) {
        roundWinner = 0;
        this.players[0].roundsWon++;
      } else if (this.players[1].score > this.players[0].score) {
        roundWinner = 1;
        this.players[1].roundsWon++;
      } else {
        roundTied = true;
      }

      // Check if the game has ended
      let gameEnded = false;

      if (this.players[0].roundsWon >= 2) {
        gameEnded = true;
      } else if (this.players[1].roundsWon >= 2) {
        gameEnded = true;
      } else {
        this.currentRound++;
      }

      // Construct result message
      let message = `Decoy retrieved ${retrievedCard.value} of ${retrievedCard.suit} from the ${rowName} row. You're out of cards! `;

      return {
        success: true,
        message,
        roundWinner,
        roundTied,
        gameEnded
      };
    }

    // If player still has cards, switch to the next player
    // Only switch if the other player hasn't passed
    if (!this.players[1 - playerIndex].pass) {
      this.currentPlayer = 1 - this.currentPlayer;
    }

    return { 
      success: true, 
      message: `Decoy retrieved ${retrievedCard.value} of ${retrievedCard.suit} from the ${rowName} row`
    };
  }

  // Get the current game state
  // Special function to complete Rogue card dice roll (called from UI after user rolls 2d6)
  public completeRoguePlay(playerIndex: number, cardIndex: number, diceValue: number, targetRow: string | null = null): PlayResult {
    // Make sure it's the player's turn
    if (playerIndex !== this.currentPlayer) {
      return { success: false, message: "It's not your turn" };
    }

    // Check if the card index is valid
    if (cardIndex < 0 || cardIndex >= this.players[playerIndex].hand.length) {
      return { success: false, message: "Invalid card index" };
    }

    const card = this.players[playerIndex].hand[cardIndex];

    // Make sure this is actually a Rogue card
    if (!card.isRogue) {
      return { success: false, message: "This is not a Rogue card" };
    }

    // For hearts cards, we need a target row
    if (card.suit === "hearts" && !targetRow) {
      return { success: false, message: "You need to select a target row for hearts cards" };
    }

    // Create a copy of thecard with the dice value
    const cardToPlay: Card = {
      ...card,
      diceValue: diceValue // Store the dice roll value
    };

    // Determine which row to play to
    const row = card.suit === "hearts" ? (targetRow as keyof Field) : (card.suit as keyof Field);

    // Add the card to the player's field
    this.players[playerIndex].field[row].push(cardToPlay);

    // Remove the original card from hand
    this.players[playerIndex].hand.splice(cardIndex, 1);

    // Check if player has run out of cards after playing this card
    if (this.players[playerIndex].hand.length === 0) {
      // Calculate scores before deciding round winner
      this.calculateScores();

      // Determine the winner of the round
      let roundWinner: number | undefined;
      let roundTied = false;

      if (this.players[0].score > this.players[1].score) {
        roundWinner = 0;
        this.players[0].roundsWon++;
      } else if (this.players[1].score > this.players[0].score) {
        roundWinner = 1;
        this.players[1].roundsWon++;
      } else {
        roundTied = true;
      }

      // Check if the game has ended
      let gameEnded = false;

      if (this.players[0].roundsWon >= 2) {
        gameEnded = true;
      } else if (this.players[1].roundsWon >= 2) {
        gameEnded = true;
      } else {
        this.currentRound++;
      }

      // Construct result message
      let message = `Played Rogue (${card.value} of ${card.suit}) with value ${diceValue} to ${row} row. You're out of cards! `;

      return {
        success: true,
        message,
        roundWinner,
        roundTied,
        gameEnded
      };
    }

    // If player still has cards, switch to the next player
    // Only switch if the other player hasn't passed
    if (!this.players[1 - playerIndex].pass) {
      this.currentPlayer = 1 - this.currentPlayer;
    }

    return { 
      success: true, 
      message: `Played Rogue (${card.value} of ${card.suit}) with value ${diceValue} to ${row} row` 
    };
  }

  // Special function to complete Sniper card dice roll (called from UI after user rolls 2d6)
  public completeSniperPlay(playerIndex: number, cardIndex: number, diceValues: number[], isDoubles: boolean, targetRow: string | null = null): PlayResult {
    // Make sure it's the player's turn
    if (playerIndex !== this.currentPlayer) {
      return { success: false, message: "It's not your turn" };
    }

    // Check if the card index is valid
    if (cardIndex < 0 || cardIndex >= this.players[playerIndex].hand.length) {
      return { success: false, message: "Invalid card index" };
    }

    const card = this.players[playerIndex].hand[cardIndex];

    // Make sure this is actually a Sniper card
    if (!card.isSniper) {
      return { success: false, message: "This is not a Sniper card" };
    }

    // For hearts cards, we need a target row
    if (card.suit === "hearts" && !targetRow) {
      return { success: false, message: "You need to select a target row for hearts cards" };
    }

    // Calculate the total dice value
    const totalDiceValue = diceValues.reduce((sum, val) => sum + val, 0);

    // If doubles were rolled, remove the highest card from opponent's field
    const opponentIndex = 1 - playerIndex;
    let removedCard: Card | null = null;

    if (isDoubles) {
      // Find the highest card on the opponent's field
      let highestCard: Card | null = null;
      let highestCardRow: keyof Field | null = null;
      let highestCardIndex = -1;
      let highestValue = -1;

      for (const row of ["clubs", "spades", "diamonds"] as const) {
        for (let i = 0; i < this.players[opponentIndex].field[row].length; i++) {
          const fieldCard = this.players[opponentIndex].field[row][i];

          // Calculate the effective value of the card with weather effects
          let effectiveValue = this.weatherEffects[row] && !fieldCard.isCommander ? 1 : fieldCard.baseValue;

          // For Rogue cards, use their dice value
          if (fieldCard.isRogue && fieldCard.diceValue) {
            effectiveValue = fieldCard.diceValue;
          }

          if (effectiveValue > highestValue) {
            highestValue = effectiveValue;
            highestCard = fieldCard;
            highestCardRow = row;
            highestCardIndex = i;
          }
        }
      }

      // If a highest card was found, remove it and add to opponent's discard pile
      if (highestCard && highestCardRow !== null && highestCardIndex !== -1) {
        removedCard = this.players[opponentIndex].field[highestCardRow][highestCardIndex];
        this.players[opponentIndex].field[highestCardRow].splice(highestCardIndex, 1);
        this.players[opponentIndex].discardPile.push(removedCard);
      }
    }

    // Determine which row to play the Sniper card to
    const row = card.suit === "hearts" ? (targetRow as keyof Field) : (card.suit as keyof Field);

    // Add the Sniper card to the player's field
    this.players[playerIndex].field[row].push(card);

    // Remove the card from hand
    this.players[playerIndex].hand.splice(cardIndex, 1);

    // Check if player has run out of cards after playing this card
    if (this.players[playerIndex].hand.length === 0) {
      // Calculate scores before deciding round winner
      this.calculateScores();

      // Determine the winner of the round
      let roundWinner: number | undefined;
      let roundTied = false;

      if (this.players[0].score > this.players[1].score) {
        roundWinner = 0;
        this.players[0].roundsWon++;
      } else if (this.players[1].score > this.players[0].score) {
        roundWinner = 1;
        this.players[1].roundsWon++;
      } else {
        roundTied = true;
      }

      // Check if the game has ended
      let gameEnded = false;

      if (this.players[0].roundsWon >= 2) {
        gameEnded = true;
      } else if (this.players[1].roundsWon >= 2) {
        gameEnded = true;
      } else {
        this.currentRound++;
      }

      // Construct result message
      let message = `Played Sniper (${card.value} of ${card.suit}) to ${row} row. `;
      if (removedCard) {
        message += `Sniper eliminated opponent's ${removedCard.value} of ${removedCard.suit}! `;
      }
      message += `You're out of cards! `;

      return {
        success: true,
        message,
        roundWinner,
        roundTied,
        gameEnded
      };
    }

    // If player still has cards, switch to the next player
    // Only switch if the other player hasn't passed
    if (!this.players[1 - playerIndex].pass) {
      this.currentPlayer = 1 - this.currentPlayer;
    }

    // Construct success message
    let message = `Played Sniper (${card.value} of ${card.suit}) to ${row} row. `;
    if (removedCard) {
      message += `Rolled doubles (${diceValues.join(', ')})! Sniper eliminated opponent's ${removedCard.value} of ${removedCard.suit}!`;
    } else {
      message += `Rolled (${diceValues.join(', ')}). No doubles, no target eliminated.`;
    }

    return { 
      success: true, 
      message,
      sniperDoubles: isDoubles 
    };
  }

  // Calculate score with weather effects and Rogue card dice values taken into account
  private calculateCardValue(card: Card, rowName: keyof Field): number {
    // If it's a weather-affected row and not a commander card, return 1
    if (this.weatherEffects[rowName] && !card.isCommander) {
      return 1;
    }

    // If it's a Rogue card with a dice value, return the dice value
    if (card.isRogue && card.diceValue !== undefined) {
      return card.diceValue;
    }

    // Otherwise return the base value
    return card.baseValue;
  }

  public getGameState(): GameState {
    return {
      players: this.players.map((player) => ({ ...player })),
      currentPlayer: this.currentPlayer,
      currentRound: this.currentRound,
      deckCount: this.deck.length,
      weatherEffects: { ...this.weatherEffects },
      blightCardsSelected: this.players.every(player => player.blightCards.length > 0),
      availableBlightCards: this.availableBlightCards,
      isBlightCardBeingPlayed: this.isBlightCardBeingPlayed,
      isSuicideKingBeingPlayed: this.isSuicideKingBeingPlayed
    };
  }

  // Blight Cards Logic

  // Set a player's blight card
  public setBlightCard(playerIndex: number, blightCard: BlightCard): PlayResult {
    if (playerIndex < 0 || playerIndex >= this.players.length) {
      return { success: false, message: "Invalid player index" };
    }

    // In case of Suicide King selecting a second blight card, we don't need to check
    // Add the blight card to the player's blight cards array
    this.players[playerIndex].blightCards.push({ ...blightCard });

    return { 
      success: true, 
      message: `Selected ${blightCard.name} blight card for Player ${playerIndex + 1}`
    };
  }

  // Play a blight card
  public playBlightCard(playerIndex: number, blightCardIndex: number = 0): PlayResult {
    // Make sure it's the player's turn
    if (playerIndex !== this.currentPlayer) {
      return { success: false, message: "It's not your turn" };
    }

    // Check if the player has already passed
    if (this.players[playerIndex].pass) {
      return { success: false, message: "You have already passed" };
    }

    // Check if the player has any blight cards
    if (this.players[playerIndex].blightCards.length === 0) {
      return { success: false, message: "You don't have any blight cards" };
    }

    // Check if the blight card index is valid
    if (blightCardIndex < 0 || blightCardIndex >= this.players[playerIndex].blightCards.length) {
      return { success: false, message: "Invalid blight card index" };
    }

    // Check if the player has already used their blight card
    if (this.players[playerIndex].hasUsedBlightCard) {
      return { success: false, message: "You've already used your blight card in this match" };
    }

    const blightCard = this.players[playerIndex].blightCards[blightCardIndex];
    this.isBlightCardBeingPlayed = true;

    // Determine if the blight effect requires target selection or dice roll
    let requiresSelection = false;
    let requiresDiceRoll = false;

    switch (blightCard.effect) {
      case BlightEffect.FOOL:
      case BlightEffect.EMPEROR:
      case BlightEffect.HANGED_MAN:
        // These effects require a valid target on the opponent's field
        requiresSelection = true;
        break;

      case BlightEffect.MAGICIAN:
      case BlightEffect.LOVERS:
        // These effects require user to select a target
        requiresSelection = true;
        break;

      case BlightEffect.WHEEL:
      case BlightEffect.DEVIL:
        // These effects require dice rolls
        requiresDiceRoll = true;
        break;

      case BlightEffect.DEATH:
        // Death effect can be processed immediately (discard hand, draw new cards)
        // Mark the blight card as used
        this.players[playerIndex].hasUsedBlightCard = true;
        this.isBlightCardBeingPlayed = false;

        // Save the current hand size
        const handSize = this.players[playerIndex].hand.length;

        // Move all cards from hand to discard pile
        this.players[playerIndex].discardPile.push(...this.players[playerIndex].hand);

        // Clear the hand
        this.players[playerIndex].hand = [];

        // Draw an equal number of new cards
        for (let i = 0; i < handSize; i++) {
          if (this.deck.length > 0) {
            this.players[playerIndex].hand.push(this.deck.pop()!);
          }
        }

        return {
          success: true,
          message: `Played ${blightCard.name} - Discarded your hand and drew ${this.players[playerIndex].hand.length} new cards`,
          isBlightCard: true,
          blightEffect: BlightEffect.DEATH
        };

      default:
        break;
    }

    return {
      success: true,
      message: "Playing blight card...",
      isBlightCard: true,
      blightEffect: blightCard.effect,
      requiresBlightSelection: requiresSelection,
      requiresBlightDiceRoll: requiresDiceRoll
    };
  }

  // Handle blight card target selection
  public completeBlightCardTarget(
    playerIndex: number, 
    effect: BlightEffect,
    targetPlayerIndex: number,
    targetRowName?: keyof Field,
    targetCardIndex?: number
  ): PlayResult {
    // Make sure it's the player's turn
    if (playerIndex !== this.currentPlayer) {
      return { success: false, message: "It's not your turn" };
    }

    // Check if the player has already passed
    if (this.players[playerIndex].pass) {
      return { success: false, message: "You have already passed" };
    }

    // Check if the player has any blight cards
    if (this.players[playerIndex].blightCards.length === 0) {
      return { success: false, message: "You don't have any blight cards" };
    }

    // Check if the player has already used their blight card
    if (this.players[playerIndex].hasUsedBlightCard) {
      return { success: false, message: "You've already used your blight card" };
    }

    // Make sure we're in the process of playing a blight card
    if (!this.isBlightCardBeingPlayed) {
      return { success: false, message: "No blight card is being played" };
    }

    // Get the currently playing blight card by effect
    // Note: We don't need the actual card object for this function, just the effect
    const opponentIndex = 1 - playerIndex;

    // Mark the blight card as used
    this.players[playerIndex].hasUsedBlightCard = true;
    this.isBlightCardBeingPlayed = false;

    let message = "";

    switch (effect) {
      case BlightEffect.FOOL:
        // Convert opponent's highest commander to player's side
        if (!targetRowName || targetCardIndex === undefined) {
          return { success: false, message: "Invalid target for The Fool effect" };
        }

        const opponentRow = this.players[opponentIndex].field[targetRowName];
        if (targetCardIndex < 0 || targetCardIndex >= opponentRow.length) {
          return { success: false, message: "Invalid target card index" };
        }

        const commanderCard = opponentRow[targetCardIndex];
        if (!commanderCard.isCommander) {
          return { success: false, message: "Target card is not a commander" };
        }

        // Remove the card from opponent's field
        opponentRow.splice(targetCardIndex, 1);

        // Add to player's field in the same row
        this.players[playerIndex].field[targetRowName].push(commanderCard);

        message = `Used The Fool to convert opponent's ${commanderCard.value} of ${commanderCard.suit} to your side!`;
        break;

      case BlightEffect.LOVERS:
        // Double the value of target card (cannot target commanders)
        if (!targetRowName || targetCardIndex === undefined) {
          return { success: false, message: "Invalid target for The Lovers effect" };
        }
        
        // Ensure we can only target the current player's cards
        if (targetPlayerIndex !== playerIndex) {
          return { success: false, message: "The Lovers can only target your own cards" };
        }

        const targetRow = this.players[targetPlayerIndex].field[targetRowName];
        if (targetCardIndex < 0 || targetCardIndex >= targetRow.length) {
          return { success: false, message: "Invalid target card index" };
        }

        const targetCard = targetRow[targetCardIndex];
        if (targetCard.isCommander) {
          return { success: false, message: "Cannot target commander cards with The Lovers" };
        }

        // Double the baseValue of the card
        targetCard.baseValue *= 2;
        console.log(`Lovers effect applied: ${targetCard.value} of ${targetCard.suit} doubled from ${targetCard.baseValue/2} to ${targetCard.baseValue}`);

        message = `Used The Lovers to double the value of ${targetCard.value} of ${targetCard.suit}!`;
        break;

      case BlightEffect.MAGICIAN:
        // The actual effect will be completed after dice roll, just validate the target row
        if (!targetRowName) {
          return { success: false, message: "You must select a row for The Magician effect" };
        }

        // Return to let the UI show the dice roll modal
        return {
          success: true,
          message: "Select a row to target with The Magician",
          isBlightCard: true,
          blightEffect: BlightEffect.MAGICIAN,
          requiresBlightDiceRoll: true
        };

      case BlightEffect.HANGED_MAN:
        // Destroy a spy card on opponent's field
        if (!targetRowName || targetCardIndex === undefined) {
          return { success: false, message: "Invalid target for The Hanged Man effect" };
        }

        const opponentSpyRow = this.players[opponentIndex].field[targetRowName];
        if (targetCardIndex < 0 || targetCardIndex >= opponentSpyRow.length) {
          return { success: false, message: "Invalid target card index" };
        }

        const spyCard = opponentSpyRow[targetCardIndex];
        if (!spyCard.isSpy) {
          return { success: false, message: "Target card is not a spy" };
        }

        // Remove the spy card from opponent's field and add to discard pile
        const removedSpy = opponentSpyRow.splice(targetCardIndex, 1)[0];
        this.players[opponentIndex].discardPile.push(removedSpy);

        message = `Used The Hanged Man to destroy a spy card on opponent's ${targetRowName} row!`;
        break;

      case BlightEffect.EMPEROR:
        // Return one of your spy cards from opponent's field to your hand
        if (!targetRowName || targetCardIndex === undefined) {
          return { success: false, message: "Invalid target for The Emperor effect" };
        }

        const opponentField = this.players[opponentIndex].field[targetRowName];
        if (targetCardIndex < 0 || targetCardIndex >= opponentField.length) {
          return { success: false, message: "Invalid target card index" };
        }

        const potentialSpy = opponentField[targetCardIndex];
        if (!potentialSpy.isSpy) {
          return { success: false, message: "Target card is not a spy" };
        }

        // Remove the spy card from opponent's field
        const removedCard = opponentField.splice(targetCardIndex, 1)[0];

        // Add to player's hand
        this.players[playerIndex].hand.push(removedCard);

        message = `Used The Emperor to return a spy card from opponent's ${targetRowName} row to your hand!`;
        break;

      default:
        return { success: false, message: "Unsupported blight effect for target selection" };
    }

    return {
      success: true,
      message,
      isBlightCard: true,
      blightEffect: effect
    };
  }

  // Handle blight card dice roll completion
  public completeBlightCardDiceRoll(
    playerIndex: number,
    effect: BlightEffect,
    diceResults: number[],
    success: boolean,
    targetRowName?: keyof Field
  ): PlayResult {
    // Make sure it's the player's turn
    if (playerIndex !== this.currentPlayer) {
      return { success: false, message: "It's not your turn" };
    }

    // Check if the player has already passed
    if (this.players[playerIndex].pass) {
      return { success: false, message: "You have already passed" };
    }

    // Check if the player has any blight cards
    if (this.players[playerIndex].blightCards.length === 0) {
      return { success: false, message: "You don't have any blight cards" };
    }

    // Get the currently playing blight card by effect (not needed for this function)
    const opponentIndex = 1 - playerIndex;

    // Mark the blight card as used
    this.players[playerIndex].hasUsedBlightCard = true;
    this.isBlightCardBeingPlayed = false;

    let message = "";
    const diceTotal = diceResults.reduce((sum, val) => sum + val, 0);

    switch (effect) {
      case BlightEffect.MAGICIAN:
        console.log("MAGICIAN effect processing with params:", {
          targetRowName,
          diceTotal,
          success
        });

        if (!targetRowName) {
          return { success: false, message: "No target row specified for The Magician effect" };
        }

        // Get the target row
        const targetField = this.players[opponentIndex].field;
        const targetRow = targetField[targetRowName];

        console.log("Target row before effect:", targetRowName, "cards:", [...targetRow]);

        // Calculate total value of the row
        const rowValue = targetRow.reduce((sum, card) => sum + card.baseValue, 0);

        // Check if the dice roll succeeded
        if (success) {
          // Success - move cards to discard pile and clear the row
          if (targetRow.length > 0) {
            console.log(`Before operation: ${targetRowName} row has ${targetRow.length} cards`);
            
            // Step 1: Create a deep copy of all cards in the row BEFORE modifying it
            // Use JSON parse/stringify for a true deep copy to ensure no references remain
            const cardsToDiscard = JSON.parse(JSON.stringify(targetRow));
            
            console.log(`Created a deep copy of ${cardsToDiscard.length} cards to discard`);
            
            // Step 2: Add copied cards to discard pile
            this.players[opponentIndex].discardPile.push(...cardsToDiscard);
            
            console.log(`Added ${cardsToDiscard.length} cards to player ${opponentIndex}'s discard pile. New pile size: ${this.players[opponentIndex].discardPile.length}`);
            
            // Step 3: Clear the row AFTER copying and adding to discard pile
            // Using splice instead of length = 0 for more reliable reactivity
            const countBefore = targetField[targetRowName].length;
            targetField[targetRowName].splice(0, countBefore);
            
            // Double-check that the row is now empty
            console.log(`Row ${targetRowName} cleared: was ${countBefore}, now ${targetField[targetRowName].length}`);
          }

          message = `Used The Magician - Rolled ${diceTotal}, exceeding the ${targetRowName} row's combined value of ${rowValue}. All cards in that row were discarded!`;
        } else {
          message = `Used The Magician - Rolled ${diceTotal}, but failed to exceed the ${targetRowName} row's combined value of ${rowValue}. No effect.`;
        }
        break;

      case BlightEffect.WHEEL:
        // Add dice roll to player's score
        this.players[playerIndex].score += diceTotal;

        message = `Used Wheel of Fortune - Rolled ${diceTotal} and added it to your score!`;
        break;

      case BlightEffect.DEVIL:
        // If successful (three 6's in 6 rolls), allow revival from discard pile
        if (success) {
          message = "Used The Devil - Successfully rolled three 6's! You can now revive a card from either discard pile.";

          // Return a result that indicates the player should select a card to revive
          return {
            success: true,
            message,
            isBlightCard: true,
            blightEffect: effect,
            // Signal to the UI that we need to show a special revival modal
            requiresBlightSelection: true 
          };
        } else {
          message = `Used The Devil - Failed to roll three 6's in six attempts.`;
        }
        break;

      default:
        return { success: false, message: "Unsupported blight effect for dice roll" };
    }

    return {
      success: true,
      message,
      isBlightCard: true,
      blightEffect: effect
    };
  }

  // Handle Suicide King effect to clear all weather
  public completeSuicideKingClearWeather(playerIndex: number, cardIndex: number): PlayResult {
    // Make sure it's the player's turn
    if (playerIndex !== this.currentPlayer) {
      return { success: false, message: "It's not your turn" };
    }

    // Check if the card index is valid
    if (cardIndex < 0 || cardIndex >= this.players[playerIndex].hand.length) {
      return { success: false, message: "Invalid card index" };
    }

    const card = this.players[playerIndex].hand[cardIndex];

    // Make sure this is actually a Suicide King card
    if (!card.isSuicideKing) {
      return { success: false, message: "This is not a Suicide King card" };
    }

    // Make sure we're in the process of playing a Suicide King
    if (!this.isSuicideKingBeingPlayed) {
      return { success: false, message: "No Suicide King is being played" };
    }

    // Clear ALL weather effects
    this.weatherEffects = {
      clubs: false,
      spades: false,
      diamonds: false
    };

    // Remove the Suicide King card from hand (it's removed entirely, not added to discard)
    this.players[playerIndex].hand.splice(cardIndex, 1);

    // Reset the flag
    this.isSuicideKingBeingPlayed = false;

    // Set hasPlayedCard flag to prevent further card plays this turn
    this.players[playerIndex].hasPlayedCard = true;

    return { 
      success: true, 
      message: "The Suicide King clears ALL weather effects from the field and disappears forever! Click End Turn to continue."
    };
  }

  // Handle Suicide King effect to select a second Blight card
  public completeSuicideKingSelectBlight(playerIndex: number, cardIndex: number): PlayResult {
    // Make sure it's the player's turn
    if (playerIndex !== this.currentPlayer) {
      return { success: false, message: "It's not your turn" };
    }

    // Check if the card index is valid
    if (cardIndex < 0 || cardIndex >= this.players[playerIndex].hand.length) {
      return { success: false, message: "Invalid card index" };
    }

    const card = this.players[playerIndex].hand[cardIndex];

    // Make sure this is actually a Suicide King card
    if (!card.isSuicideKing) {
      return { success: false, message: "This is not a Suicide King card" };
    }

    // Make sure we're in the process of playing a Suicide King
    if (!this.isSuicideKingBeingPlayed) {
      return { success: false, message: "No Suicide King is being played" };
    }

    // Check if there are any available Blight cards left
    if (this.availableBlightCards.length === 0) {
      return { success: false, message: "No Blight cards are available" };
    }

    // Remove the Suicide King card from hand (it's removed entirely, not added to discard)
    this.players[playerIndex].hand.splice(cardIndex, 1);

    // Reset the flag
    this.isSuicideKingBeingPlayed = false;
    
    // Reset player's Blight card status so they can select a new one
    // We don't need to clear existing blight cards, just mark the player as able to use another one
    this.players[playerIndex].hasUsedBlightCard = false;

    // If player has no cards left after the Suicide King removal, end the round
    if (this.players[playerIndex].hand.length === 0) {
      // Calculate scores before deciding round winner
      this.calculateScores();

      // Determine the winner of the round
      let roundWinner: number | undefined;
      let roundTied = false;

      if (this.players[0].score > this.players[1].score) {
        roundWinner = 0;
        this.players[0].roundsWon++;
      } else if (this.players[1].score > this.players[0].score) {
        roundWinner = 1;
        this.players[1].roundsWon++;
      } else {
        roundTied = true;
      }

      // Check if the game has ended
      let gameEnded = false;

      if (this.players[0].roundsWon >= 2) {
        gameEnded = true;
      } else if (this.players[1].roundsWon >= 2) {
        gameEnded = true;
      } else {
        this.currentRound++;
      }

      return {
        success: true,
        message: "The Suicide King grants you a new Blight card selection. You're out of cards!",
        roundWinner,
        roundTied,
        gameEnded
      };
    }

    // Switch to the next player if they haven't passed
    if (!this.players[1 - playerIndex].pass) {
      this.currentPlayer = 1 - this.currentPlayer;
    }

    return { 
      success: true, 
      message: "The Suicide King vanishes, granting you a new Blight card selection!"
    };
  }

  // Handle The Devil blight card revival
  public reviveCardFromDiscard(
    playerIndex: number,
    sourcePlayerIndex: number,
    discardCardIndex: number
  ): PlayResult {
    // Make sure it's the player's turn
    if (playerIndex !== this.currentPlayer) {
      return { success: false, message: "It's not your turn" };
    }

    // Check if the player has already passed
    if (this.players[playerIndex].pass) {
      return { success: false, message: "You have already passed" };
    }

    // Validate discard index
    const sourcePlayer = this.players[sourcePlayerIndex];
    if (discardCardIndex < 0 || discardCardIndex >= sourcePlayer.discardPile.length) {
      return { success: false, message: "Invalid discard card index" };
    }

    // Get the card to revive
    const cardToRevive = sourcePlayer.discardPile[discardCardIndex];

    // Determine which row to place the card in
    const row = cardToRevive.suit === "hearts" ? "diamonds" : (cardToRevive.suit as keyof Field);

    // Remove from discard pile
    sourcePlayer.discardPile.splice(discardCardIndex, 1);

    // Add to player's field
    this.players[playerIndex].field[row].push(cardToRevive);

    return {
      success: true,
      message: `Revived ${cardToRevive.value} of ${cardToRevive.suit} from ${sourcePlayerIndex === playerIndex ? 'your' : 'opponent\'s'} discard pile!`,
      isBlightCard: true,
      blightEffect: BlightEffect.DEVIL
    };
  }
}