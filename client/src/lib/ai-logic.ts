import { Card, Field, GameState, Player, WeatherEffects } from './types';
import { calculateCardValue, calculateRowValue, calculateTotalScore } from './game-logic';

// Define AI difficulty levels
export enum AIDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

// Define AI decision structure
export interface AIDecision {
  action: 'play' | 'pass' | 'blight';
  cardIndex?: number;
  targetRow?: keyof Field;
  blightCardIndex?: number;
  targetPlayer?: number;
  targetCardIndex?: number;
}

/**
 * Main function to make AI decisions based on game state and difficulty
 */
export function makeAIDecision(
  gameState: GameState,
  aiIndex: number,
  difficulty: AIDifficulty = AIDifficulty.MEDIUM
): AIDecision {
  const aiPlayer = gameState.players[aiIndex];
  const opponentIndex = aiIndex === 0 ? 1 : 0;
  const opponent = gameState.players[opponentIndex];
  
  // If AI has no cards, it must pass
  if (aiPlayer.hand.length === 0) {
    return { action: 'pass' };
  }
  
  // Check if AI should play a blight card based on difficulty
  if (
    !aiPlayer.hasUsedBlightThisTurn && 
    aiPlayer.blightCards.some(card => !card.used) &&
    shouldPlayBlightCard(aiPlayer, opponent, gameState, difficulty)
  ) {
    // Find the best blight card to play
    const bestBlightCard = findBestBlightCard(aiPlayer, opponent, gameState, difficulty);
    if (bestBlightCard !== -1) {
      return {
        action: 'blight',
        blightCardIndex: bestBlightCard
      };
    }
  }
  
  // Check if AI should pass based on difficulty and game state
  if (shouldPass(aiPlayer, opponent, gameState, difficulty)) {
    return { action: 'pass' };
  }
  
  // Find the best card to play
  const { cardIndex, targetRow } = findBestCardPlay(aiPlayer, gameState, difficulty);
  
  // If a valid play was found, return it
  if (cardIndex !== undefined && targetRow) {
    return {
      action: 'play',
      cardIndex,
      targetRow
    };
  }
  
  // Fallback to pass if no good move was found
  return { action: 'pass' };
}

/**
 * Determines if the AI should play a blight card based on the current game state
 */
function shouldPlayBlightCard(
  aiPlayer: Player,
  opponent: Player, 
  gameState: GameState, 
  difficulty: AIDifficulty
): boolean {
  // Easy AI rarely uses blight cards
  if (difficulty === AIDifficulty.EASY) {
    return Math.random() < 0.3;
  }
  
  // Medium AI uses blight cards at strategic moments
  if (difficulty === AIDifficulty.MEDIUM) {
    // Use blight cards more often when behind
    const aiScore = calculateTotalScore(aiPlayer, gameState.weatherEffects);
    const opponentScore = calculateTotalScore(opponent, gameState.weatherEffects);
    const scoreDifference = opponentScore - aiScore;
    
    if (scoreDifference > 10) {
      return Math.random() < 0.7; // 70% chance when significantly behind
    } else if (scoreDifference > 0) {
      return Math.random() < 0.5; // 50% chance when slightly behind
    } else {
      return Math.random() < 0.3; // 30% chance when ahead
    }
  }
  
  // Hard AI makes optimal decisions about blight cards
  if (difficulty === AIDifficulty.HARD) {
    // TODO: Implement more sophisticated logic for Hard difficulty
    // For now, use blight cards strategically similar to Medium
    const aiScore = calculateTotalScore(aiPlayer, gameState.weatherEffects);
    const opponentScore = calculateTotalScore(opponent, gameState.weatherEffects);
    
    // Use blight cards when they would be most effective
    if (opponentScore > aiScore) {
      return true; // Always use blight when behind
    } else if (opponentScore === aiScore) {
      return Math.random() < 0.7; // 70% chance when tied
    } else {
      return Math.random() < 0.4; // 40% chance when ahead
    }
  }
  
  return false;
}

/**
 * Finds the best blight card for the AI to play
 * Returns the index of the blight card to play, or -1 if none should be played
 */
function findBestBlightCard(
  aiPlayer: Player,
  opponent: Player,
  gameState: GameState,
  difficulty: AIDifficulty
): number {
  // Filter to only unused blight cards
  const availableBlightCards = aiPlayer.blightCards
    .map((card, index) => ({ card, index }))
    .filter(item => !item.card.used);
  
  if (availableBlightCards.length === 0) {
    return -1;
  }
  
  // For Easy difficulty, just pick a random card
  if (difficulty === AIDifficulty.EASY) {
    const randomIndex = Math.floor(Math.random() * availableBlightCards.length);
    return availableBlightCards[randomIndex].index;
  }
  
  // For Medium and Hard difficulties, be more strategic
  // TODO: Implement more sophisticated selection logic based on the specific blight effects
  // For now, just select a random card
  const randomIndex = Math.floor(Math.random() * availableBlightCards.length);
  return availableBlightCards[randomIndex].index;
}

/**
 * Determines if the AI should pass based on the current game state
 */
function shouldPass(
  aiPlayer: Player,
  opponent: Player,
  gameState: GameState,
  difficulty: AIDifficulty
): boolean {
  // If opponent has passed and AI is winning, it should pass
  if (opponent.pass) {
    const aiScore = calculateTotalScore(aiPlayer, gameState.weatherEffects);
    const opponentScore = calculateTotalScore(opponent, gameState.weatherEffects);
    
    if (aiScore > opponentScore) {
      return true;
    }
  }
  
  // Easy AI passes more readily
  if (difficulty === AIDifficulty.EASY) {
    if (aiPlayer.hand.length <= 2) {
      return Math.random() < 0.7; // 70% chance to pass when few cards left
    }
    
    return Math.random() < 0.2; // 20% random chance to pass otherwise
  }
  
  // Medium AI makes more strategic decisions
  if (difficulty === AIDifficulty.MEDIUM) {
    const aiScore = calculateTotalScore(aiPlayer, gameState.weatherEffects);
    const opponentScore = calculateTotalScore(opponent, gameState.weatherEffects);
    
    // Pass if significantly ahead
    if (aiScore > opponentScore + 15 && aiPlayer.hand.length <= 3) {
      return true;
    }
    
    // Pass if slightly ahead and few cards left
    if (aiScore > opponentScore && aiPlayer.hand.length <= 2) {
      return Math.random() < 0.6;
    }
  }
  
  // Hard AI makes optimal decisions about passing
  if (difficulty === AIDifficulty.HARD) {
    const aiScore = calculateTotalScore(aiPlayer, gameState.weatherEffects);
    const opponentScore = calculateTotalScore(opponent, gameState.weatherEffects);
    
    // Calculate if any remaining cards could flip the score
    const maxPotentialGain = aiPlayer.hand.reduce((max, card) => {
      // Find the highest potential value for this card across all rows
      const potentialValues = Object.keys(aiPlayer.field).map(row => {
        return calculateCardValue(card, row as keyof Field, gameState.weatherEffects);
      });
      return Math.max(max, Math.max(...potentialValues));
    }, 0);
    
    // If even playing our best card wouldn't catch up, pass
    if (opponentScore > aiScore + maxPotentialGain && opponent.pass) {
      return true;
    }
    
    // If we're ahead and opponent has passed, pass as well
    if (aiScore > opponentScore && opponent.pass) {
      return true;
    }
  }
  
  return false;
}

/**
 * Finds the best card for the AI to play and the best row to play it in
 */
function findBestCardPlay(
  aiPlayer: Player,
  gameState: GameState,
  difficulty: AIDifficulty
): { cardIndex?: number; targetRow?: keyof Field } {
  // If no cards in hand, return undefined
  if (aiPlayer.hand.length === 0) {
    return { cardIndex: undefined, targetRow: undefined };
  }
  
  // For easy difficulty, make a somewhat random choice
  if (difficulty === AIDifficulty.EASY) {
    // 30% chance to pick a completely random card and row
    if (Math.random() < 0.3) {
      const randomCardIndex = Math.floor(Math.random() * aiPlayer.hand.length);
      const rows: (keyof Field)[] = ['melee', 'ranged', 'siege'];
      const randomRowIndex = Math.floor(Math.random() * rows.length);
      
      return {
        cardIndex: randomCardIndex,
        targetRow: rows[randomRowIndex]
      };
    }
  }
  
  // For all difficulties, evaluate each card and find the best play
  let bestPlay = { value: -1, cardIndex: 0, targetRow: 'melee' as keyof Field };
  
  // Evaluate each card in the hand
  aiPlayer.hand.forEach((card, cardIndex) => {
    // Determine the best row to play this card in
    Object.keys(aiPlayer.field).forEach(rowName => {
      const row = rowName as keyof Field;
      
      // Get the current value of this row
      const currentRowValue = calculateRowValue(aiPlayer.field[row], row, gameState.weatherEffects);
      
      // Calculate what the value would be with this card added
      const potentialRow = [...aiPlayer.field[row], card];
      const newRowValue = calculateRowValue(potentialRow, row, gameState.weatherEffects);
      
      // The improvement in value by playing this card here
      const improvement = newRowValue - currentRowValue;
      
      // For medium and hard difficulties, consider strategic factors
      let strategicValue = improvement;
      
      if (difficulty !== AIDifficulty.EASY) {
        // Prefer playing weather cards
        if (card.isWeather) {
          strategicValue += 2;
        }
        
        // Prefer playing commanders
        if (card.isCommander) {
          strategicValue += 3;
        }
        
        // Hard difficulty considers even more factors
        if (difficulty === AIDifficulty.HARD) {
          // Prefer playing spy cards
          if (card.isSpy) {
            strategicValue += 2;
          }
          
          // Prefer playing in rows that already have cards (synergy)
          if (aiPlayer.field[row].length > 0) {
            strategicValue += 1;
          }
          
          // TODO: Add more sophisticated strategic considerations
        }
      }
      
      // Update the best play if this is better
      if (strategicValue > bestPlay.value) {
        bestPlay = {
          value: strategicValue,
          cardIndex,
          targetRow: row
        };
      }
    });
  });
  
  return {
    cardIndex: bestPlay.cardIndex,
    targetRow: bestPlay.targetRow
  };
}