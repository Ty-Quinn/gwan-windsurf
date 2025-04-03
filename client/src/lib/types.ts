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
  isRogue?: boolean;    // 2 of hearts, clubs, diamonds - dice roll determines value
  isSniper?: boolean;   // 2 of spades - can remove opponent's highest card on doubles
  diceValue?: number;   // Value determined by dice roll for Rogue cards
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
}
