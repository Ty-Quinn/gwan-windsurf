
import { Player, Card, GameState, Field } from "@/lib/types";

export enum AIDifficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard"
}

interface AIDecision {
  action: "play" | "pass";
  cardIndex?: number; 
  targetRow?: keyof Field | null; // For hearts cards or jokers
}

export class AIStrategy {
  private difficulty: AIDifficulty;
  
  constructor(difficulty: AIDifficulty = AIDifficulty.MEDIUM) {
    this.difficulty = difficulty;
  }
  
  /**
   * Makes a decision for the AI player
   */
  public makeDecision(gameState: GameState, aiPlayerIndex: number): AIDecision {
    const aiPlayer = gameState.players[aiPlayerIndex];
    
    // If no cards in hand, must pass
    if (aiPlayer.hand.length === 0) {
      return { action: "pass" };
    }
    
    // Decide whether to pass based on difficulty and game state
    if (this.shouldPass(gameState, aiPlayerIndex)) {
      return { action: "pass" };
    }
    
    // Choose a card to play
    const cardDecision = this.chooseCardToPlay(gameState, aiPlayerIndex);
    return cardDecision;
  }
  
  /**
   * Decides whether the AI should pass this turn
   */
  private shouldPass(gameState: GameState, aiPlayerIndex: number): boolean {
    const aiPlayer = gameState.players[aiPlayerIndex];
    const humanPlayer = gameState.players[1 - aiPlayerIndex];
    
    // If opponent has passed, calculate if we're ahead
    if (humanPlayer.pass) {
      // The decision varies by difficulty
      switch (this.difficulty) {
        case AIDifficulty.EASY:
          // Easy AI passes 70% of the time when ahead
          return aiPlayer.score > humanPlayer.score && Math.random() < 0.7;
          
        case AIDifficulty.MEDIUM:
          // Medium AI makes a more strategic decision
          // If significantly ahead, more likely to pass
          const scoreDifference = aiPlayer.score - humanPlayer.score;
          return scoreDifference > 10 || (scoreDifference > 0 && Math.random() < 0.5);
          
        case AIDifficulty.HARD:
          // Hard AI considers how many cards it has left vs how much it's ahead
          const cardsRemaining = aiPlayer.hand.length;
          // If ahead and has fewer cards than the lead amount, pass to preserve advantage
          return aiPlayer.score > humanPlayer.score && cardsRemaining < (aiPlayer.score - humanPlayer.score);
      }
    }
    
    // If AI has few cards left, be more strategic about passing
    if (aiPlayer.hand.length <= 2) {
      // Consider passing if score is significantly ahead
      if (aiPlayer.score > humanPlayer.score + 15) {
        return true;
      }
    }
    
    // Default: don't pass
    return false;
  }
  
  /**
   * Chooses a card for the AI to play
   */
  private chooseCardToPlay(gameState: GameState, aiPlayerIndex: number): AIDecision {
    const aiPlayer = gameState.players[aiPlayerIndex];
    const humanPlayer = gameState.players[1 - aiPlayerIndex];
    
    // Get playable cards
    const playableCards = aiPlayer.hand.map((card, index) => ({ card, index }));
    
    // If no playable cards, pass
    if (playableCards.length === 0) {
      return { action: "pass" };
    }

    // Determine best card to play based on difficulty
    switch (this.difficulty) {
      case AIDifficulty.EASY: 
        return this.easyAICardSelection(playableCards, gameState, aiPlayerIndex);
      
      case AIDifficulty.MEDIUM: 
        return this.mediumAICardSelection(playableCards, gameState, aiPlayerIndex);
      
      case AIDifficulty.HARD: 
        return this.hardAICardSelection(playableCards, gameState, aiPlayerIndex);
      
      default:
        // Fallback to random card selection
        const randomIndex = Math.floor(Math.random() * playableCards.length);
        const { card, index } = playableCards[randomIndex];
        
        // For hearts cards or jokers, we need to select a target row
        if (card.suit === "hearts" || card.isJoker) {
          const targetRow = this.chooseTargetRow(gameState, card, aiPlayerIndex);
          return { action: "play", cardIndex: index, targetRow };
        }
        
        return { action: "play", cardIndex: index };
    }
  }
  
  /**
   * Easy AI just plays random cards
   */
  private easyAICardSelection(playableCards: {card: Card, index: number}[], gameState: GameState, aiPlayerIndex: number): AIDecision {
    // Play cards randomly
    const randomIndex = Math.floor(Math.random() * playableCards.length);
    const { card, index } = playableCards[randomIndex];
    
    // For hearts cards or jokers, choose a random row
    if (card.suit === "hearts" || card.isJoker) {
      const rows: (keyof Field)[] = ["clubs", "spades", "diamonds"];
      const randomRow = rows[Math.floor(Math.random() * rows.length)];
      return { action: "play", cardIndex: index, targetRow: randomRow };
    }
    
    return { action: "play", cardIndex: index };
  }
  
  /**
   * Medium AI plays with some strategy
   */
  private mediumAICardSelection(playableCards: {card: Card, index: number}[], gameState: GameState, aiPlayerIndex: number): AIDecision {
    // Sort cards by value (highest to lowest)
    const sortedCards = [...playableCards].sort((a, b) => b.card.baseValue - a.card.baseValue);
    
    // 70% of the time play a high value card, 30% play a low value card
    const playHighValueCard = Math.random() < 0.7;
    
    const selectedCard = playHighValueCard 
      ? sortedCards[0] // Play highest value card
      : sortedCards[sortedCards.length - 1]; // Play lowest value card
    
    // For hearts cards or jokers, choose target row more strategically
    if (selectedCard.card.suit === "hearts" || selectedCard.card.isJoker) {
      const targetRow = this.chooseTargetRow(gameState, selectedCard.card, aiPlayerIndex);
      return { action: "play", cardIndex: selectedCard.index, targetRow };
    }
    
    return { action: "play", cardIndex: selectedCard.index };
  }
  
  /**
   * Hard AI plays with advanced strategy
   */
  private hardAICardSelection(playableCards: {card: Card, index: number}[], gameState: GameState, aiPlayerIndex: number): AIDecision {
    const aiPlayer = gameState.players[aiPlayerIndex];
    const humanPlayer = gameState.players[1 - aiPlayerIndex];
    
    // Calculate score difference
    const scoreDifference = aiPlayer.score - humanPlayer.score;
    
    // If behind, play a high value card
    if (scoreDifference < 0) {
      // Sort by value (highest to lowest)
      const sortedCards = [...playableCards].sort((a, b) => b.card.baseValue - a.card.baseValue);
      const selectedCard = sortedCards[0]; // Play highest value card
      
      // For hearts cards or jokers, choose target row strategically
      if (selectedCard.card.suit === "hearts" || selectedCard.card.isJoker) {
        const targetRow = this.chooseTargetRow(gameState, selectedCard.card, aiPlayerIndex);
        return { action: "play", cardIndex: selectedCard.index, targetRow };
      }
      
      return { action: "play", cardIndex: selectedCard.index };
    }
    
    // If ahead, play more strategically
    // Prioritize special cards like Spies, Commanders, or Weather cards
    const specialCards = playableCards.filter(({ card }) => 
      card.isCommander || card.isSpy || card.isWeather || card.isMedic
    );
    
    if (specialCards.length > 0) {
      const selectedCard = specialCards[0];
      
      // For hearts cards or jokers, choose target row strategically
      if (selectedCard.card.suit === "hearts" || selectedCard.card.isJoker) {
        const targetRow = this.chooseTargetRow(gameState, selectedCard.card, aiPlayerIndex);
        return { action: "play", cardIndex: selectedCard.index, targetRow };
      }
      
      return { action: "play", cardIndex: selectedCard.index };
    }
    
    // Otherwise play a mid-range value card
    const sortedCards = [...playableCards].sort((a, b) => b.card.baseValue - a.card.baseValue);
    const middleIndex = Math.floor(sortedCards.length / 2);
    const selectedCard = sortedCards[middleIndex]; // Play a mid-range card
    
    // For hearts cards or jokers, choose target row strategically
    if (selectedCard.card.suit === "hearts" || selectedCard.card.isJoker) {
      const targetRow = this.chooseTargetRow(gameState, selectedCard.card, aiPlayerIndex);
      return { action: "play", cardIndex: selectedCard.index, targetRow };
    }
    
    return { action: "play", cardIndex: selectedCard.index };
  }
  
  /**
   * Chooses a target row for hearts cards or jokers
   */
  private chooseTargetRow(gameState: GameState, card: Card, aiPlayerIndex: number): keyof Field {
    const aiPlayer = gameState.players[aiPlayerIndex];
    
    // Default rows
    const rows: (keyof Field)[] = ["clubs", "spades", "diamonds"];
    
    // For weather cards, check if there's a weather effect to clear
    if (card.isWeather && card.value === 'A' && card.suit === 'hearts') {
      // Check which rows have weather effects
      const weatherRows = rows.filter(row => gameState.weatherEffects[row]);
      if (weatherRows.length > 0) {
        // Randomly select one of the affected rows to clear
        return weatherRows[Math.floor(Math.random() * weatherRows.length)];
      }
    }
    
    // For hearts cards other than Ace, put it in the row with highest total value
    let bestRow: keyof Field = "clubs";
    let highestValue = 0;
    
    for (const row of rows) {
      const rowValue = aiPlayer.field[row].reduce((sum, c) => sum + c.baseValue, 0);
      if (rowValue > highestValue) {
        highestValue = rowValue;
        bestRow = row;
      }
    }
    
    return bestRow;
  }
  
  /**
   * Makes a decision about which Blight card to use
   */
  public chooseBlightCard(gameState: GameState, aiPlayerIndex: number): number {
    const aiPlayer = gameState.players[aiPlayerIndex];
    
    // If no blight cards available, return -1
    if (!aiPlayer.blightCards || aiPlayer.blightCards.length === 0 || 
        aiPlayer.blightCards.every(card => card.used)) {
      return -1;
    }
    
    // Find the first available blight card
    const availableBlight = aiPlayer.blightCards.findIndex(card => !card.used);
    
    return availableBlight;
  }
}
