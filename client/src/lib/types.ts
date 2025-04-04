export interface Card {
  suit: "clubs" | "spades" | "diamonds" | "hearts" | "joker";
  value: string;
  baseValue: number;
  isCommander: boolean;
  isWeather: boolean;
  isSpy: boolean;
  isMedic: boolean;
  isJoker?: boolean;
  isDecoy?: boolean;
  isRogue?: boolean;      // 2 of hearts, clubs, diamonds - dice roll determines value
  isSniper?: boolean;     // 2 of spades - can remove opponent's highest card on doubles
  isSuicideKing?: boolean; // King of Hearts - removes weather or grants a second Blight card
  diceValue?: number;     // Value determined by dice roll for Rogue cards
}

export interface BlightCard {
  id: string;
  name: string;
  description: string;
  effect: BlightEffect;
  used: boolean;
  icon: string;
}

export enum BlightEffect {
  FOOL = "fool",           // Converts opponent's Commander to your side
  MAGICIAN = "magician",   // Roll 1D20 vs opponent's row, if roll exceeds value, destroy all cards in that row
  LOVERS = "lovers",       // Doubles the value of target card (cannot target Commanders)
  DEATH = "death",         // Discard your hand and draw equal number of new cards
  WHEEL = "wheel",         // Roll 1D10 and add result to your total score
  HANGED_MAN = "hangedMan", // Destroys a spy card on opponent's field
  EMPEROR = "emperor",     // Returns one of your spy cards from opponent's field to your hand
  DEVIL = "devil"          // Roll 3D6, continue rolling with dice that didn't show 6, if you get three 6's in 6 rolls, revive one card from either discard pile
}

export interface Field {
  clubs: Card[];
  spades: Card[];
  diamonds: Card[];
}

export interface Player {
  name: string;
  hand: Card[];
  field: Field;
  score: number;
  roundsWon: number;
  pass: boolean;
  discardPile: Card[];
  blightCards: BlightCard[];
  hasUsedBlightCard: boolean;
}

export interface WeatherEffects {
  clubs: boolean;
  spades: boolean;
  diamonds: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayer: number;
  currentRound: number;
  deckCount: number;
  weatherEffects: WeatherEffects;
  blightCardsSelected: boolean;
  availableBlightCards: BlightCard[];
  isBlightCardBeingPlayed: boolean;
  isSuicideKingBeingPlayed: boolean;
}

export interface PlayResult {
  success: boolean;
  message: string;
  roundWinner?: number;
  roundTied?: boolean;
  gameEnded?: boolean;
  isMedicRevival?: boolean;
  isDecoyRetrieval?: boolean;
  isRogueDiceRoll?: boolean;     // Needs to roll dice for Rogue card value
  isSniperDiceRoll?: boolean;    // Needs to roll dice for Sniper card effect
  sniperDoubles?: boolean;       // Indicates if Sniper rolled doubles (success)
  isBlightCard?: boolean;        // Indicates if a Blight card was played
  blightEffect?: BlightEffect;   // The specific Blight effect that was played
  requiresBlightSelection?: boolean; // Indicates if user needs to select a target for the Blight card
  requiresBlightDiceRoll?: boolean;  // Indicates if a dice roll is needed for the Blight effect
  isSuicideKing?: boolean;       // Indicates if a Suicide King (King of Hearts) was played
}
