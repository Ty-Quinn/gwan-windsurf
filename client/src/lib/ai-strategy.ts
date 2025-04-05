import { Card, Field, Player, GameState, BlightCard, WeatherEffects, AIDifficulty } from "./types";

// Card evaluation scores by type and context
interface CardScore {
  card: Card;
  score: number;
  targetRow?: keyof Field;
}

// AI decision interface
export interface AIDecision {
  action: 'play' | 'pass' | 'use-blight';
  cardIndex?: number;
  targetRow?: keyof Field;
  blightCardIndex?: number;
}

/**
 * Main AI Strategy class that handles all decision-making logic
 */
export class AIStrategy {
  private difficulty: AIDifficulty;
  
  constructor(difficulty: AIDifficulty = AIDifficulty.Medium) {
    this.difficulty = difficulty;
  }
  
  /**
   * Make a decision for the AI's turn
   */
  public makeDecision(gameState: GameState, playerIndex: number): AIDecision {
    const player = gameState.players[playerIndex];
    const opponentIndex = 1 - playerIndex;
    const opponent = gameState.players[opponentIndex];
    
    // If player has no cards, they must pass
    if (player.hand.length === 0) {
      return { action: 'pass' };
    }
    
    // Check if we should use a blight card
    const blightDecision = this.evaluateBlightUse(gameState, playerIndex);
    if (blightDecision) {
      return blightDecision;
    }
    
    // Check if we should pass
    if (this.shouldPass(gameState, playerIndex)) {
      return { action: 'pass' };
    }
    
    // Default to playing a card
    const cardDecision = this.selectBestCard(gameState, playerIndex);
    return cardDecision;
  }
  
  /**
   * Evaluate whether to use a blight card
   */
  private evaluateBlightUse(gameState: GameState, playerIndex: number): AIDecision | null {
    const player = gameState.players[playerIndex];
    
    // Don't use blight if already used this turn
    if (player.hasUsedBlightThisTurn) {
      return null;
    }
    
    // Don't use blight if no blight cards available
    if (!player.blightCards || player.blightCards.length === 0) {
      return null;
    }
    
    // Find unused blight cards
    const unusedBlightCards = player.blightCards.filter(card => !card.used);
    if (unusedBlightCards.length === 0) {
      return null;
    }
    
    // Chance to use blight card based on difficulty
    const useBlightChance = this.getBlightUseChance();
    if (Math.random() > useBlightChance) {
      return null;
    }
    
    // Select the best blight card to use
    const blightIndex = this.selectBestBlightCard(gameState, player.blightCards, playerIndex);
    if (blightIndex === -1) {
      return null;
    }
    
    return {
      action: 'use-blight',
      blightCardIndex: blightIndex
    };
  }
  
  /**
   * Get chance of using blight card based on difficulty
   */
  private getBlightUseChance(): number {
    switch (this.difficulty) {
      case AIDifficulty.Easy:
        return 0.3; // 30% chance
      case AIDifficulty.Medium:
        return 0.6; // 60% chance
      case AIDifficulty.Hard:
        return 0.85; // 85% chance
      default:
        return 0.5;
    }
  }
  
  /**
   * Choose the best blight card to use
   */
  private selectBestBlightCard(gameState: GameState, blightCards: BlightCard[], playerIndex: number): number {
    const unusedCards = blightCards
      .map((card, index) => ({ card, index }))
      .filter(item => !item.card.used);
    
    if (unusedCards.length === 0) {
      return -1;
    }
    
    // Simply choose the first one for now; will add more sophisticated logic later
    // Can be enhanced to prioritize certain effects based on game state
    return unusedCards[0].index;
  }
  
  /**
   * Decide if the AI should pass its turn
   */
  private shouldPass(gameState: GameState, playerIndex: number): boolean {
    const player = gameState.players[playerIndex];
    const opponent = gameState.players[1 - playerIndex];
    
    // If opponent has passed and we're ahead in score, pass
    if (opponent.pass && player.score > opponent.score) {
      return true;
    }
    
    // If we have very few cards left and a significant score advantage, consider passing
    const scoreAdvantage = player.score - opponent.score;
    if (player.hand.length <= 2 && scoreAdvantage > 10) {
      return true;
    }
    
    // Random chance to pass based on difficulty (only when it might make sense)
    if (player.hand.length <= 3 && scoreAdvantage > 0) {
      const passChance = this.difficulty === AIDifficulty.Easy ? 0.4 : 
                         this.difficulty === AIDifficulty.Medium ? 0.2 : 0.1;
      if (Math.random() < passChance) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Select the best card to play
   */
  private selectBestCard(gameState: GameState, playerIndex: number): AIDecision {
    const player = gameState.players[playerIndex];
    
    // Evaluate each card's potential value
    const cardScores = this.evaluateHand(gameState, playerIndex);
    
    // Add randomization based on difficulty
    const finalScores = this.applyDifficultyBias(cardScores);
    
    // Choose the highest-scoring card
    finalScores.sort((a, b) => b.score - a.score);
    
    // If no good plays, pass
    if (finalScores.length === 0 || finalScores[0].score <= 0) {
      return { action: 'pass' };
    }
    
    // Get the best card and its index in the player's hand
    const bestOption = finalScores[0];
    const cardIndex = player.hand.findIndex(c => 
      c.suit === bestOption.card.suit && c.value === bestOption.card.value
    );
    
    return {
      action: 'play',
      cardIndex: cardIndex,
      targetRow: bestOption.targetRow
    };
  }
  
  /**
   * Apply difficulty-based randomization to card scores
   */
  private applyDifficultyBias(cardScores: CardScore[]): CardScore[] {
    // Clone the array to avoid modifying original
    const adjustedScores = [...cardScores];
    
    // Apply random adjustments based on difficulty
    for (let i = 0; i < adjustedScores.length; i++) {
      let randomFactor = 0;
      
      switch (this.difficulty) {
        case AIDifficulty.Easy:
          // More randomization for easy difficulty (± 40%)
          randomFactor = (Math.random() * 0.8) - 0.4;
          break;
        case AIDifficulty.Medium:
          // Moderate randomization (± 20%)
          randomFactor = (Math.random() * 0.4) - 0.2;
          break;
        case AIDifficulty.Hard:
          // Minimal randomization (± 10%)
          randomFactor = (Math.random() * 0.2) - 0.1;
          break;
      }
      
      // Apply the random adjustment
      adjustedScores[i].score *= (1 + randomFactor);
    }
    
    return adjustedScores;
  }
  
  /**
   * Evaluate all cards in hand and score them
   */
  private evaluateHand(gameState: GameState, playerIndex: number): CardScore[] {
    const player = gameState.players[playerIndex];
    const opponent = gameState.players[1 - playerIndex];
    const weatherEffects = gameState.weatherEffects;
    
    const result: CardScore[] = [];
    
    // Evaluate each card in hand
    for (let i = 0; i < player.hand.length; i++) {
      const card = player.hand[i];
      
      // Handle different card types
      if (card.isWeather) {
        result.push(...this.evaluateWeatherCard(card, gameState, playerIndex));
      } else if (card.isSpy || card.isJoker) {
        result.push(...this.evaluateSpyCard(card, gameState, playerIndex));
      } else if (card.isMedic) {
        result.push(...this.evaluateMedicCard(card, gameState, playerIndex));
      } else if (card.isDecoy) {
        result.push(...this.evaluateDecoyCard(card, gameState, playerIndex));
      } else if (card.isRogue) {
        result.push(...this.evaluateRogueCard(card, gameState, playerIndex));
      } else if (card.isSniper) {
        result.push(...this.evaluateSniperCard(card, gameState, playerIndex));
      } else if (card.isSuicideKing) {
        result.push(...this.evaluateSuicideKingCard(card, gameState, playerIndex));
      } else {
        // Regular card
        result.push(...this.evaluateRegularCard(card, gameState, playerIndex));
      }
    }
    
    return result;
  }
  
  /**
   * Evaluate weather cards (Aces)
   */
  private evaluateWeatherCard(card: Card, gameState: GameState, playerIndex: number): CardScore[] {
    const weatherEffects = gameState.weatherEffects;
    const player = gameState.players[playerIndex];
    const opponent = gameState.players[1 - playerIndex];
    
    // If it's Ace of Hearts (Clear Weather)
    if (card.suit === "hearts") {
      const scores: CardScore[] = [];
      
      // Evaluate clearing weather from each row
      for (const row of ["clubs", "spades", "diamonds"] as const) {
        if (weatherEffects[row]) {
          // Calculate value of clearing weather
          // Higher score if we have many cards in that row
          const playerRowCount = player.field[row].length;
          const opponentRowCount = opponent.field[row].length;
          
          // Value clearing more if it benefits us more than opponent
          let score = (playerRowCount - opponentRowCount) * 5;
          
          // Also value it more if we have high-value cards in that row
          let playerRowValue = player.field[row].reduce((sum, c) => 
            sum + (c.isCommander ? c.baseValue : 1), 0);
          
          score += playerRowValue;
          
          // Add to scores with appropriate target row
          scores.push({
            card,
            score,
            targetRow: row
          });
        }
      }
      
      return scores;
    } 
    // Other weather cards (set weather effect)
    else if (["clubs", "spades", "diamonds"].includes(card.suit)) {
      const row = card.suit as keyof Field;
      
      // Don't play if this weather is already active
      if (weatherEffects[row]) {
        return [{
          card,
          score: -10 // Strongly discourage playing redundant weather
        }];
      }
      
      // Calculate effect of applying weather to this row
      const playerRowCount = player.field[row].length;
      const opponentRowCount = opponent.field[row].length;
      const playerNonCommanderCount = player.field[row].filter(c => !c.isCommander).length;
      const opponentNonCommanderCount = opponent.field[row].filter(c => !c.isCommander).length;
      
      // Score based on how much it hurts opponent vs us
      const score = (opponentNonCommanderCount - playerNonCommanderCount) * 7;
      
      return [{
        card,
        score
      }];
    }
    
    return [{ card, score: 0 }];
  }
  
  /**
   * Evaluate spy cards (5s) and jokers
   */
  private evaluateSpyCard(card: Card, gameState: GameState, playerIndex: number): CardScore[] {
    // Spy cards have high value because they let you draw 2 cards
    let baseScore = 10;
    
    // Jokers are more flexible with where they can be played
    if (card.isJoker) {
      const scores: CardScore[] = [];
      
      // Evaluate playing joker to each possible row
      for (const row of ["clubs", "spades", "diamonds"] as const) {
        // Calculate how good it is to play to this row
        const opponentRowStrength = this.calculateRowStrength(
          gameState.players[1 - playerIndex].field[row],
          row,
          gameState.weatherEffects
        );
        
        // Higher score for rows where opponent is strong
        // (since joker adds only 1 to their score)
        let rowScore = baseScore - (opponentRowStrength / 10);
        
        scores.push({
          card,
          score: rowScore,
          targetRow: row
        });
      }
      
      return scores;
    } 
    // Regular spy card
    else {
      const row = card.suit === "hearts" ? 
        this.selectBestRowForHeartsCard(gameState, playerIndex) : 
        card.suit as keyof Field;
      
      return [{
        card,
        score: baseScore,
        targetRow: row
      }];
    }
  }
  
  /**
   * Evaluate medic cards (3s)
   */
  private evaluateMedicCard(card: Card, gameState: GameState, playerIndex: number): CardScore[] {
    const player = gameState.players[playerIndex];
    
    // If no cards in discard pile, medic has little value
    if (player.discardPile.length === 0) {
      return [{ card, score: -5 }];
    }
    
    // Calculate base score for the card
    let baseScore = 7; // Default score
    
    // Get target row
    const row = card.suit === "hearts" ? 
      this.selectBestRowForHeartsCard(gameState, playerIndex) : 
      card.suit as keyof Field;
    
    // Find best card in discard pile that could be revived
    const bestDiscardCard = this.findBestDiscardCard(player.discardPile);
    
    // Increase score based on the value of the best card we could revive
    if (bestDiscardCard) {
      baseScore += bestDiscardCard.baseValue;
      
      // Extra value for special cards
      if (bestDiscardCard.isCommander) baseScore += 5;
      if (bestDiscardCard.isWeather) baseScore += 7;
    }
    
    return [{
      card,
      score: baseScore,
      targetRow: row
    }];
  }
  
  /**
   * Find the best card in discard pile
   */
  private findBestDiscardCard(discardPile: Card[]): Card | null {
    if (discardPile.length === 0) return null;
    
    // Prioritize by card type
    // First look for commanders
    const commanders = discardPile.filter(c => c.isCommander);
    if (commanders.length > 0) {
      // Find highest value commander
      return commanders.reduce((best, card) => 
        card.baseValue > best.baseValue ? card : best, commanders[0]);
    }
    
    // Then weather cards
    const weather = discardPile.filter(c => c.isWeather);
    if (weather.length > 0) return weather[0];
    
    // Then anything else with high value
    return discardPile.reduce((best, card) => 
      card.baseValue > best.baseValue ? card : best, discardPile[0]);
  }
  
  /**
   * Evaluate decoy cards (4s)
   */
  private evaluateDecoyCard(card: Card, gameState: GameState, playerIndex: number): CardScore[] {
    const player = gameState.players[playerIndex];
    
    // If no cards on field, decoy has little value
    let hasCardsOnField = false;
    for (const row of ['clubs', 'spades', 'diamonds'] as const) {
      if (player.field[row].length > 0) {
        hasCardsOnField = true;
        break;
      }
    }
    
    if (!hasCardsOnField) {
      return [{ card, score: -5 }];
    }
    
    // Calculate base score for the card
    let baseScore = 6; // Default score
    
    // Get target row
    const row = card.suit === "hearts" ? 
      this.selectBestRowForHeartsCard(gameState, playerIndex) : 
      card.suit as keyof Field;
    
    // Find best card that could be retrieved
    let bestFieldCard: Card | null = null;
    let bestFieldValue = 0;
    
    for (const rowName of ['clubs', 'spades', 'diamonds'] as const) {
      for (const fieldCard of player.field[rowName]) {
        // Skip if it's another decoy
        if (fieldCard.isDecoy) continue;
        
        // Calculate value of retrieving this card
        let cardValue = fieldCard.baseValue;
        
        // Higher value for weather-affected cards
        if (gameState.weatherEffects[rowName] && !fieldCard.isCommander) {
          cardValue = 15; // High value to retrieve non-commander cards from weather
        }
        
        if (cardValue > bestFieldValue) {
          bestFieldValue = cardValue;
          bestFieldCard = fieldCard;
        }
      }
    }
    
    // Adjust score based on potential retrieval value
    if (bestFieldCard) {
      baseScore += bestFieldValue / 2;
    }
    
    return [{
      card,
      score: baseScore,
      targetRow: row
    }];
  }
  
  /**
   * Evaluate rogue cards (2s except spades)
   */
  private evaluateRogueCard(card: Card, gameState: GameState, playerIndex: number): CardScore[] {
    // Rogue cards can get random values, so medium base value
    let baseScore = 5;
    
    // Get target row
    const row = card.suit === "hearts" ? 
      this.selectBestRowForHeartsCard(gameState, playerIndex) : 
      card.suit as keyof Field;
    
    // Consider current state of row
    const rowState = gameState.players[playerIndex].field[row];
    const rowHasCards = rowState.length > 0;
    
    // Weather affects rogue value
    if (gameState.weatherEffects[row]) {
      baseScore -= 2; // Less valuable in bad weather
    } else {
      // More valuable in rows with row bonuses
      if (row === "clubs") baseScore += 1;  // +2 row bonus
      if (row === "spades") baseScore += 2;  // +3 row bonus
      if (row === "diamonds") baseScore += 3; // +5 row bonus
    }
    
    return [{
      card,
      score: baseScore,
      targetRow: row
    }];
  }
  
  /**
   * Evaluate sniper cards (2 of spades)
   */
  private evaluateSniperCard(card: Card, gameState: GameState, playerIndex: number): CardScore[] {
    const opponent = gameState.players[1 - playerIndex];
    
    // Check if opponent has any high-value cards to target
    let hasHighValueTargets = false;
    for (const row of ['clubs', 'spades', 'diamonds'] as const) {
      if (opponent.field[row].some(c => c.baseValue >= 10 || c.isCommander)) {
        hasHighValueTargets = true;
        break;
      }
    }
    
    // Base score depends on opponent's field
    let baseScore = hasHighValueTargets ? 12 : 6;
    
    // Get target row
    const row = card.suit === "hearts" ? 
      this.selectBestRowForHeartsCard(gameState, playerIndex) : 
      card.suit as keyof Field;
    
    return [{
      card,
      score: baseScore,
      targetRow: row
    }];
  }
  
  /**
   * Evaluate Suicide King (King of Hearts)
   */
  private evaluateSuicideKingCard(card: Card, gameState: GameState, playerIndex: number): CardScore[] {
    const player = gameState.players[playerIndex];
    
    // Value clears based on how many weather effects are active
    const activeWeatherCount = Object.values(gameState.weatherEffects).filter(Boolean).length;
    
    // Calculate value for clearing all weather
    let clearWeatherScore = activeWeatherCount * 7;
    
    // If we have unused blight cards, consider getting a second one
    const unusedBlightCards = player.blightCards.filter(card => !card.used).length;
    let secondBlightScore = unusedBlightCards === 0 ? 15 : 5;
    
    // Get target row (only needed for actual play, not for special effect)
    const row = this.selectBestRowForHeartsCard(gameState, playerIndex);
    
    // Return both options with appropriate scores
    return [
      {
        card,
        score: Math.max(clearWeatherScore, secondBlightScore),
        targetRow: row
      }
    ];
  }
  
  /**
   * Evaluate regular cards
   */
  private evaluateRegularCard(card: Card, gameState: GameState, playerIndex: number): CardScore[] {
    const weatherEffects = gameState.weatherEffects;
    
    // Get target row
    const row = card.suit === "hearts" ? 
      this.selectBestRowForHeartsCard(gameState, playerIndex) : 
      card.suit as keyof Field;
    
    // Base value is the card's value
    let score = card.baseValue;
    
    // Adjust for weather effects
    if (weatherEffects[row] && !card.isCommander) {
      score = 1; // Non-commanders reduced to 1 in bad weather
    }
    
    // Commanders have higher strategic value
    if (card.isCommander) {
      score += 2;
    }
    
    // Adjust for row bonuses if no weather
    if (!weatherEffects[row]) {
      if (row === "clubs") score += 1;  // +2 row bonus
      if (row === "spades") score += 1.5;  // +3 row bonus
      if (row === "diamonds") score += 2.5; // +5 row bonus
    }
    
    return [{
      card,
      score,
      targetRow: row
    }];
  }
  
  /**
   * Select best row for hearts cards
   */
  private selectBestRowForHeartsCard(gameState: GameState, playerIndex: number): keyof Field {
    const player = gameState.players[playerIndex];
    const weatherEffects = gameState.weatherEffects;
    
    // Calculate score for each row
    const rowScores: Record<keyof Field, number> = {
      clubs: 0,
      spades: 0,
      diamonds: 0
    };
    
    // Prefer rows with no weather effects
    for (const row of ['clubs', 'spades', 'diamonds'] as const) {
      if (!weatherEffects[row]) {
        rowScores[row] += 5;
      }
      
      // Prefer rows with more of our cards
      rowScores[row] += player.field[row].length * 2;
      
      // Consider row bonuses
      if (!weatherEffects[row]) {
        if (row === "clubs") rowScores[row] += 2;
        if (row === "spades") rowScores[row] += 3;
        if (row === "diamonds") rowScores[row] += 5;
      }
    }
    
    // Find row with highest score
    let bestRow: keyof Field = "clubs";
    for (const row of ['spades', 'diamonds'] as const) {
      if (rowScores[row] > rowScores[bestRow]) {
        bestRow = row;
      }
    }
    
    return bestRow;
  }
  
  /**
   * Calculate row strength for a given row
   */
  private calculateRowStrength(row: Card[], rowName: keyof Field, weatherEffects: WeatherEffects): number {
    let strength = 0;
    
    for (const card of row) {
      // Use base value or adjusted for weather
      if (weatherEffects[rowName] && !card.isCommander) {
        strength += 1;
      } else if (card.isRogue && card.diceValue) {
        strength += card.diceValue;
      } else {
        strength += card.baseValue;
      }
    }
    
    // Add row bonus if no weather
    if (!weatherEffects[rowName]) {
      if (rowName === "clubs") strength += 2;
      if (rowName === "spades") strength += 3;
      if (rowName === "diamonds") strength += 5;
    }
    
    return strength;
  }
}