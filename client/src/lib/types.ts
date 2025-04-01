export interface Card {
  suit: "clubs" | "spades" | "diamonds" | "hearts";
  value: string;
  baseValue: number;
  isCommander: boolean;
  isWeather: boolean;
  isSpy: boolean;
  isMedic: boolean;
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
}
