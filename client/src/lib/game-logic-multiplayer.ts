import { Card, Field, Player, GameState, WeatherEffects, PlayResult, BlightCard, BlightEffect } from "./types";
import { GwanGameLogic } from "./game-logic";

// Extend the base GwanGameLogic class with multiplayer-specific functionality
export class MultiplayerGameLogic extends GwanGameLogic {
  private lastActions: Map<number, { 
    cardIndex: number;
    card: Card;
    targetRow: string | null;
    previousState: GameState;
  }> = new Map();

  // Override the playCard method to store the previous state for undo functionality
  public playCard(playerIndex: number, cardIndex: number, targetRow: string | null): PlayResult {
    // Store the current state before making changes
    const previousState = JSON.parse(JSON.stringify(this.getGameState()));
    
    // Get the card being played
    const player = this.getGameState().players[playerIndex];
    const card = player.hand[cardIndex];
    
    // Store the action for potential undo
    this.lastActions.set(playerIndex, {
      cardIndex,
      card: JSON.parse(JSON.stringify(card)),
      targetRow,
      previousState
    });
    
    // Call the base class implementation
    return super.playCard(playerIndex, cardIndex, targetRow);
  }

  // Implement the undo action functionality
  public undoAction(playerIndex: number, cardIndex: number, targetRow: string | null): PlayResult {
    const lastAction = this.lastActions.get(playerIndex);
    
    if (!lastAction) {
      return {
        success: false,
        message: "No action to undo"
      };
    }
    
    // Check if it's the player's turn
    if (this.getGameState().currentPlayer !== playerIndex) {
      return {
        success: false,
        message: "Cannot undo after turn ended"
      };
    }
    
    // Restore the previous state
    this.setGameState(lastAction.previousState);
    
    // Clear the last action
    this.lastActions.delete(playerIndex);
    
    return {
      success: true,
      message: "Action undone successfully"
    };
  }

  // Implement blight card usage
  public useBlightCard(playerIndex: number, blightCardId: string): PlayResult {
    const gameState = this.getGameState();
    
    // Check if it's the player's turn
    if (gameState.currentPlayer !== playerIndex) {
      return {
        success: false,
        message: "Not your turn"
      };
    }
    
    // Find the blight card
    const player = gameState.players[playerIndex];
    const blightCardIndex = player.blightCards.findIndex(card => card.id === blightCardId);
    
    if (blightCardIndex === -1) {
      return {
        success: false,
        message: "Blight card not found"
      };
    }
    
    const blightCard = player.blightCards[blightCardIndex];
    
    // Check if the card has already been used
    if (blightCard.used) {
      return {
        success: false,
        message: "Blight card already used"
      };
    }
    
    // Apply the blight card effect
    const result = this.applyBlightEffect(playerIndex, blightCard);
    
    if (result.success) {
      // Mark the card as used
      player.blightCards[blightCardIndex].used = true;
    }
    
    return result;
  }

  // Apply the effect of a blight card
  private applyBlightEffect(playerIndex: number, blightCard: BlightCard): PlayResult {
    const gameState = this.getGameState();
    const player = gameState.players[playerIndex];
    const opponentIndex = playerIndex === 0 ? 1 : 0;
    const opponent = gameState.players[opponentIndex];
    
    switch (blightCard.effect) {
      case BlightEffect.FOOL:
        // Convert opponent's Commander to your side
        // Find a commander in opponent's field
        for (const rowKey of ['clubs', 'spades', 'diamonds'] as const) {
          const commanderIndex = opponent.field[rowKey].findIndex(card => card.isCommander);
          if (commanderIndex !== -1) {
            // Remove from opponent's field
            const commander = opponent.field[rowKey].splice(commanderIndex, 1)[0];
            // Add to player's field in the same row
            player.field[rowKey].push(commander);
            // Recalculate scores
            this.calculateScores();
            return {
              success: true,
              message: "Converted opponent's commander to your side"
            };
          }
        }
        return {
          success: false,
          message: "No commander found in opponent's field"
        };
        
      case BlightEffect.MAGICIAN:
        // Roll 1D20 vs opponent's row, if roll exceeds value, destroy all cards in that row
        // This will be handled by the client-side dice roll
        return {
          success: true,
          message: "Magician effect activated, waiting for dice roll"
        };
        
      case BlightEffect.LOVERS:
        // Doubles the value of target card (cannot target Commanders)
        // This requires additional input from the player to select the target card
        return {
          success: true,
          message: "Lovers effect activated, select a card to double its value"
        };
        
      case BlightEffect.DEATH:
        // Discard your hand and draw equal number of new cards
        const handSize = player.hand.length;
        // Move current hand to discard pile
        player.discardPile.push(...player.hand);
        // Clear hand
        player.hand = [];
        // Draw new cards
        for (let i = 0; i < handSize; i++) {
          if (this.getDeck().length > 0) {
            player.hand.push(this.getDeck().pop()!);
          }
        }
        return {
          success: true,
          message: `Discarded hand and drew ${player.hand.length} new cards`
        };
        
      case BlightEffect.WHEEL:
        // Roll 1D10 and add result to your total score
        // This will be handled by the client-side dice roll
        return {
          success: true,
          message: "Wheel of Fortune activated, waiting for dice roll"
        };
        
      case BlightEffect.HANGED_MAN:
        // Destroys a spy card on opponent's field
        for (const rowKey of ['clubs', 'spades', 'diamonds'] as const) {
          const spyIndex = opponent.field[rowKey].findIndex(card => card.isSpy);
          if (spyIndex !== -1) {
            // Remove from opponent's field
            const spy = opponent.field[rowKey].splice(spyIndex, 1)[0];
            // Add to discard pile
            opponent.discardPile.push(spy);
            // Recalculate scores
            this.calculateScores();
            return {
              success: true,
              message: "Destroyed opponent's spy card"
            };
          }
        }
        return {
          success: false,
          message: "No spy card found in opponent's field"
        };
        
      case BlightEffect.EMPEROR:
        // Returns one of your spy cards from opponent's field to your hand
        for (const rowKey of ['clubs', 'spades', 'diamonds'] as const) {
          const spyIndex = opponent.field[rowKey].findIndex(card => card.isSpy);
          if (spyIndex !== -1) {
            // Remove from opponent's field
            const spy = opponent.field[rowKey].splice(spyIndex, 1)[0];
            // Add to player's hand
            player.hand.push(spy);
            // Recalculate scores
            this.calculateScores();
            return {
              success: true,
              message: "Retrieved your spy card from opponent's field"
            };
          }
        }
        return {
          success: false,
          message: "No spy card found in opponent's field"
        };
        
      case BlightEffect.DEVIL:
        // Roll 3D6, continue rolling with dice that didn't show 6
        // This will be handled by the client-side dice roll
        return {
          success: true,
          message: "Devil effect activated, waiting for dice roll"
        };
        
      default:
        return {
          success: false,
          message: "Unknown blight effect"
        };
    }
  }

  // Process dice roll results
  public processDiceRoll(playerIndex: number, result: number): PlayResult {
    const gameState = this.getGameState();
    const player = gameState.players[playerIndex];
    
    // Check if it's the player's turn
    if (gameState.currentPlayer !== playerIndex) {
      return {
        success: false,
        message: "Not your turn"
      };
    }
    
    // Handle different dice roll scenarios based on context
    if (player.wheelOfFortuneBonus > 0) {
      // This is a Wheel of Fortune roll
      player.score += result;
      player.wheelOfFortuneBonus = 0;
      
      return {
        success: true,
        message: `Added ${result} to your score from Wheel of Fortune`
      };
    }
    
    // For Rogue cards (2 of hearts, clubs, diamonds)
    // Find a played Rogue card without a dice value
    for (const rowKey of ['clubs', 'spades', 'diamonds'] as const) {
      const rogueIndex = player.field[rowKey].findIndex(card => 
        card.isRogue && card.diceValue === undefined
      );
      
      if (rogueIndex !== -1) {
        // Set the dice value for the Rogue card
        player.field[rowKey][rogueIndex].diceValue = result;
        // Recalculate scores
        this.calculateScores();
        
        return {
          success: true,
          message: `Set Rogue card value to ${result}`
        };
      }
    }
    
    return {
      success: false,
      message: "No active dice roll context found"
    };
  }

  // Get the current deck
  private getDeck(): Card[] {
    return (this as any).deck;
  }

  // Set the game state (for undo functionality)
  private setGameState(state: GameState): void {
    const { players, currentPlayer, currentRound, weatherEffects } = state;
    
    // Update players
    for (let i = 0; i < players.length; i++) {
      (this as any).players[i] = JSON.parse(JSON.stringify(players[i]));
    }
    
    // Update game state properties
    (this as any).currentPlayer = currentPlayer;
    (this as any).currentRound = currentRound;
    (this as any).weatherEffects = JSON.parse(JSON.stringify(weatherEffects));
  }

  // Recalculate scores for both players
  private calculateScores(): void {
    for (let i = 0; i < (this as any).players.length; i++) {
      this.calculatePlayerScore(i);
    }
  }
}
