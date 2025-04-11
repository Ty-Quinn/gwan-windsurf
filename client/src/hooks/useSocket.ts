import { useState, useEffect, useCallback } from 'react';
import { socketClient, type EventHandler } from '@/lib/socket-client';
import { GameState } from '@/lib/types';

// Hook for managing socket connection
export function useSocketConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Connect to socket server
    socketClient.connect();

    // Set up event listeners
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleError = (data: { message: string }) => {
      setError(data.message);
    };

    const handleConnectionEstablished = (data: { userId: string }) => {
      setUserId(data.userId);
    };

    // Register event listeners
    socketClient.on('connect', handleConnect);
    socketClient.on('disconnect', handleDisconnect);
    socketClient.on('error', handleError);
    socketClient.on('connection:established', handleConnectionEstablished);

    // Clean up on unmount
    return () => {
      socketClient.off('connect', handleConnect);
      socketClient.off('disconnect', handleDisconnect);
      socketClient.off('error', handleError);
      socketClient.off('connection:established', handleConnectionEstablished);
    };
  }, []);

  // Register user
  const register = useCallback(async (name: string) => {
    try {
      const response = await socketClient.register(name);
      if (response.success) {
        setUsername(name);
      }
      return response;
    } catch (err) {
      setError('Failed to register');
      return { success: false, error: 'Failed to register' };
    }
  }, []);

  // Disconnect
  const disconnect = useCallback(() => {
    socketClient.disconnect();
  }, []);

  return {
    isConnected,
    userId,
    username,
    error,
    register,
    disconnect
  };
}

// Hook for managing game state
export function useSocketGame() {
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number>(-1);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [queuePosition, setQueuePosition] = useState(0);
  const [gameError, setGameError] = useState<string | null>(null);
  const [roundWinner, setRoundWinner] = useState<number | undefined>(undefined);
  const [roundTied, setRoundTied] = useState(false);
  const [gameWinner, setGameWinner] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Set up event listeners
    const handleGameJoined = (data: { gameId: string; playerIndex: number }) => {
      setGameId(data.gameId);
      setPlayerIndex(data.playerIndex);
      setIsWaiting(false);
    };

    const handleGameState = (state: GameState) => {
      setGameState(state);
    };

    const handleOpponentJoined = (data: { username: string }) => {
      setOpponent(data.username);
    };

    const handleOpponentLeft = () => {
      setOpponent(null);
    };

    const handleGameError = (data: { message: string }) => {
      setGameError(data.message);
    };

    const handleMatchmakingWaiting = (data: { position: number }) => {
      setIsWaiting(true);
      setQueuePosition(data.position);
    };

    const handleMatchmakingFound = (data: { gameId: string; opponent: string; playerIndex: number }) => {
      setGameId(data.gameId);
      setPlayerIndex(data.playerIndex);
      setOpponent(data.opponent);
      setIsWaiting(false);
    };

    const handleRoundEnded = (data: { winner?: number; tied: boolean }) => {
      setRoundWinner(data.winner);
      setRoundTied(data.tied);
    };

    const handleGameEnded = (data: { winner: number }) => {
      setGameWinner(data.winner);
    };

    // Register event listeners
    socketClient.on('game:joined', handleGameJoined);
    socketClient.on('game:state', handleGameState);
    socketClient.on('game:opponentJoined', handleOpponentJoined);
    socketClient.on('game:opponentLeft', handleOpponentLeft);
    socketClient.on('game:error', handleGameError);
    socketClient.on('matchmaking:waiting', handleMatchmakingWaiting);
    socketClient.on('matchmaking:found', handleMatchmakingFound);
    socketClient.on('game:roundEnded', handleRoundEnded);
    socketClient.on('game:ended', handleGameEnded);

    // Clean up on unmount
    return () => {
      socketClient.off('game:joined', handleGameJoined);
      socketClient.off('game:state', handleGameState);
      socketClient.off('game:opponentJoined', handleOpponentJoined);
      socketClient.off('game:opponentLeft', handleOpponentLeft);
      socketClient.off('game:error', handleGameError);
      socketClient.off('matchmaking:waiting', handleMatchmakingWaiting);
      socketClient.off('matchmaking:found', handleMatchmakingFound);
      socketClient.off('game:roundEnded', handleRoundEnded);
      socketClient.off('game:ended', handleGameEnded);
    };
  }, []);

  // Create game
  const createGame = useCallback(async () => {
    try {
      const response = await socketClient.createGame();
      if (response.success && response.gameId) {
        setGameId(response.gameId);
        setPlayerIndex(0);
      }
      return response;
    } catch (err) {
      setGameError('Failed to create game');
      return { success: false, error: 'Failed to create game' };
    }
  }, []);

  // Join game
  const joinGame = useCallback(async (id?: string) => {
    try {
      const response = await socketClient.joinGame(id);
      return response;
    } catch (err) {
      setGameError('Failed to join game');
      return { success: false, error: 'Failed to join game' };
    }
  }, []);

  // Play card
  const playCard = useCallback(async (cardIndex: number, targetRow?: string) => {
    try {
      return await socketClient.playCard(cardIndex, targetRow);
    } catch (err) {
      setGameError('Failed to play card');
      return { success: false, error: 'Failed to play card' };
    }
  }, []);

  // End turn
  const endTurn = useCallback(async () => {
    try {
      return await socketClient.endTurn();
    } catch (err) {
      setGameError('Failed to end turn');
      return { success: false, error: 'Failed to end turn' };
    }
  }, []);

  // Undo last action
  const undoLastAction = useCallback(async () => {
    try {
      return await socketClient.undoLastAction();
    } catch (err) {
      setGameError('Failed to undo action');
      return { success: false, error: 'Failed to undo action' };
    }
  }, []);

  // Select blight card
  const selectBlightCard = useCallback(async (blightCardId: string) => {
    try {
      return await socketClient.selectBlightCard(blightCardId);
    } catch (err) {
      setGameError('Failed to select blight card');
      return { success: false, error: 'Failed to select blight card' };
    }
  }, []);

  // Submit dice roll
  const submitDiceRoll = useCallback(async (result: number) => {
    try {
      return await socketClient.submitDiceRoll(result);
    } catch (err) {
      setGameError('Failed to submit dice roll');
      return { success: false, error: 'Failed to submit dice roll' };
    }
  }, []);

  // Leave game
  const leaveGame = useCallback(async () => {
    try {
      const response = await socketClient.leaveGame();
      if (response.success) {
        setGameId(null);
        setPlayerIndex(-1);
        setOpponent(null);
        setGameState(null);
        setRoundWinner(undefined);
        setRoundTied(false);
        setGameWinner(undefined);
      }
      return response;
    } catch (err) {
      setGameError('Failed to leave game');
      return { success: false };
    }
  }, []);

  // Reset round state
  const resetRoundState = useCallback(() => {
    setRoundWinner(undefined);
    setRoundTied(false);
  }, []);

  return {
    gameId,
    playerIndex,
    gameState,
    opponent,
    isWaiting,
    queuePosition,
    gameError,
    roundWinner,
    roundTied,
    gameWinner,
    createGame,
    joinGame,
    playCard,
    endTurn,
    undoLastAction,
    selectBlightCard,
    submitDiceRoll,
    leaveGame,
    resetRoundState
  };
}

// Hook for subscribing to socket events
export function useSocketEvent<T = any>(event: string, handler: EventHandler<T>) {
  useEffect(() => {
    socketClient.on(event, handler);
    return () => {
      socketClient.off(event, handler);
    };
  }, [event, handler]);
}
